"""
Live call monitoring: SSE stream, human takeover, handback, and transfer.
"""
import json
import logging
from datetime import datetime

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.middleware.auth import get_current_user, verify_internal_secret
from app.models.call import Call
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/live-calls", tags=["live-calls"])
internal_router = APIRouter()


@router.get("/{room_id}/stream")
async def stream_call(
    room_id: str,
    current_user: User = Depends(get_current_user),
):
    """SSE stream of live call events (transcript, state, transfer) for the given room."""
    async def event_generator():
        r = aioredis.from_url(settings.REDIS_URL)
        pubsub = r.pubsub()
        await pubsub.subscribe(f"call:{room_id}")
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"]
                    if isinstance(data, bytes):
                        data = data.decode("utf-8")
                    yield f"data: {data}\n\n"
        finally:
            await pubsub.unsubscribe(f"call:{room_id}")
            await r.aclose()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/{room_id}/takeover")
async def takeover_call(
    room_id: str,
    current_user: User = Depends(get_current_user),
):
    """Mute the agent's audio and return a LiveKit token for the supervisor to join the room."""
    from livekit import api
    from livekit.protocol.room import ListParticipantsRequest, MuteRoomTrackRequest

    lk = api.LiveKitAPI(
        url=settings.LIVEKIT_API_URL,
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )
    try:
        resp = await lk.room.list_participants(
            ListParticipantsRequest(room=room_id)
        )
        for p in resp.participants:
            if p.identity.startswith("agent"):
                for track in p.tracks:
                    if track.type == 0:  # AUDIO
                        await lk.room.mute_published_track(
                            MuteRoomTrackRequest(
                                room=room_id,
                                identity=p.identity,
                                track_sid=track.sid,
                                muted=True,
                            )
                        )
        token = (
            api.AccessToken(
                settings.LIVEKIT_API_KEY,
                settings.LIVEKIT_API_SECRET,
            )
            .with_identity(f"supervisor-{current_user.id}")
            .with_name("Supervisor")
            .with_grants(api.VideoGrants(room_join=True, room=room_id))
        )
        return {
            "token": token.to_jwt(),
            "room": room_id,
            "livekit_url": settings.LIVEKIT_URL,
        }
    finally:
        await lk.aclose()


@router.post("/{room_id}/handback")
async def handback_call(
    room_id: str,
    current_user: User = Depends(get_current_user),
):
    """Unmute the agent so the AI takes over again."""
    from livekit import api
    from livekit.protocol.room import ListParticipantsRequest, MuteRoomTrackRequest

    lk = api.LiveKitAPI(
        url=settings.LIVEKIT_API_URL,
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )
    try:
        resp = await lk.room.list_participants(
            ListParticipantsRequest(room=room_id)
        )
        for p in resp.participants:
            if p.identity.startswith("agent"):
                for track in p.tracks:
                    if track.type == 0:
                        await lk.room.mute_published_track(
                            MuteRoomTrackRequest(
                                room=room_id,
                                identity=p.identity,
                                track_sid=track.sid,
                                muted=False,
                            )
                        )
        return {"status": "handed back to agent"}
    finally:
        await lk.aclose()


@router.post("/{room_id}/transfer")
async def transfer_call(
    room_id: str,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Transfer the call to an external number via Twilio (supervisor-initiated)."""
    to_number = body.get("to_number")
    if not to_number:
        raise HTTPException(status_code=400, detail="to_number required")

    result = await db.execute(
        select(Call).where(
            Call.livekit_room == room_id,
            Call.user_id == current_user.id,
        )
    )
    call = result.scalar_one_or_none()
    call_sid = None
    if call and getattr(call, "twilio_sid", None):
        call_sid = call.twilio_sid
    if not call_sid:
        r = aioredis.from_url(settings.REDIS_URL)
        try:
            raw = await r.get(f"call_sid:{room_id}")
            if raw:
                call_sid = raw.decode() if isinstance(raw, bytes) else raw
        finally:
            await r.aclose()

    if call_sid:
        try:
            from app.services.twilio_client import get_twilio_client
            client = await get_twilio_client(current_user, db)
            client.calls(call_sid).update(
                twiml=f'<Response><Dial>{to_number}</Dial></Response>'
            )
        except ValueError:
            pass

    r = aioredis.from_url(settings.REDIS_URL)
    try:
        await r.publish(
            f"call:{room_id}",
            json.dumps({
                "type": "transfer",
                "to_number": to_number,
                "timestamp": datetime.utcnow().isoformat(),
            }),
        )
    finally:
        await r.aclose()

    return {"status": "transferring", "to": to_number}


@router.post("/{room_id}/end")
async def end_call_by_room(
    room_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End the call by room ID (for live monitor UI)."""
    result = await db.execute(
        select(Call).where(
            Call.livekit_room == room_id,
            Call.user_id == current_user.id,
        )
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    if call.twilio_sid:
        try:
            from app.services.twilio_client import get_twilio_client
            client = await get_twilio_client(current_user, db)
            client.calls(call.twilio_sid).update(status="completed")
        except ValueError:
            pass
    call.status = "completed"
    call.ended_at = datetime.utcnow()
    await db.commit()
    return {"status": "ok"}


# ----- Internal (agent worker) -----


@internal_router.post("/transfer")
async def internal_transfer(
    body: dict,
    _: None = Depends(verify_internal_secret),
    db: AsyncSession = Depends(get_db),
):
    """Perform Twilio transfer when the agent invokes the transfer tool. Called by agent_worker."""
    room_id = body.get("room_id")
    to_number = body.get("to_number")
    if not room_id or not to_number:
        raise HTTPException(status_code=400, detail="room_id and to_number required")

    result = await db.execute(
        select(Call).where(Call.livekit_room == room_id)
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    call_sid = getattr(call, "twilio_sid", None)
    if not call_sid:
        r = aioredis.from_url(settings.REDIS_URL)
        try:
            raw = await r.get(f"call_sid:{room_id}")
            if raw:
                call_sid = raw.decode() if isinstance(raw, bytes) else raw
        finally:
            await r.aclose()
    if not call_sid:
        logger.warning("No Twilio SID for room %s; cannot transfer", room_id)
        return {"status": "no_twilio_sid", "message": "Call has no Twilio SID"}

    user_id = call.user_id
    result_user = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result_user.scalar_one_or_none()
    if not user:
        return {"status": "error", "message": "User not found"}
    try:
        from app.services.twilio_client import get_twilio_client
        client = await get_twilio_client(user, db)
    except ValueError:
        logger.warning("No Twilio credentials for user %s", user_id)
        return {"status": "error", "message": "Twilio not configured"}

    client.calls(call_sid).update(
        twiml=f'<Response><Dial>{to_number}</Dial></Response>'
    )

    r = aioredis.from_url(settings.REDIS_URL)
    try:
        await r.publish(
            f"call:{room_id}",
            json.dumps({
                "type": "transfer",
                "to_number": to_number,
                "timestamp": datetime.utcnow().isoformat(),
            }),
        )
    finally:
        await r.aclose()

    return {"status": "transferring", "to": to_number}
