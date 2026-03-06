from uuid import UUID, uuid4

from livekit import api
from livekit.protocol.sip import CreateSIPParticipantRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.rest import Client

from app.config import settings
from app.models.telephony import UserTelephonyConfig


async def make_outbound_call(
    user_id: str,
    to_phone_number: str,
    db: AsyncSession,
    room_name: str | None = None,
) -> dict:
    """
    Initiate outbound SIP call via LiveKit using the user's outbound trunk.
    Loads UserTelephonyConfig; returns room_name, participant_id, and status.
    """
    user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
    result = await db.execute(
        select(UserTelephonyConfig).where(
            UserTelephonyConfig.user_id == user_uuid,
            UserTelephonyConfig.is_active.is_(True),
        )
    )
    config = result.scalar_one_or_none()
    if not config or not config.livekit_outbound_trunk_id:
        raise ValueError(
            "Telephony not configured or inactive. Connect Twilio in Settings first."
        )

    outbound_trunk_id = config.livekit_outbound_trunk_id
    if not room_name:
        room_name = f"call-{str(user_id)[:8]}-{uuid4().hex[:8]}"

    participant_identity = f"sip-{str(user_id)[:8]}"

    lk = api.LiveKitAPI(
        url=settings.LIVEKIT_API_URL,
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )
    try:
        participant = await lk.sip.create_sip_participant(
            CreateSIPParticipantRequest(
                sip_trunk_id=outbound_trunk_id,
                sip_call_to=to_phone_number,
                room_name=room_name,
                participant_identity=participant_identity,
                participant_name="Resona Agent",
                krisp_enabled=True,
                wait_until_answered=True,
                play_dialtone=True,
            )
        )
        return {
            "room_name": room_name,
            "participant_id": participant.participant_identity,
            "call_status": "ringing",
        }
    finally:
        await lk.aclose()


async def initiate_outbound_call(agent, user, to_number: str, call_id: str) -> str:
    """Use the user's Twilio credentials from the database to make the call."""
    account_sid = getattr(user, "twilio_account_sid", None)
    auth_token = getattr(user, "twilio_auth_token", None)
    from_number = getattr(user, "twilio_from_number", None)
    if not account_sid or not auth_token:
        raise ValueError(
            "Twilio credentials not configured. Add your Twilio Account SID and Auth Token in Settings → Phone."
        )
    if not from_number:
        raise ValueError(
            "Twilio from number not set. Configure your phone number in Settings → Phone."
        )
    client = Client(account_sid, auth_token)

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="{from_number}" timeout="90" answerOnBridge="true">
    <Sip>{settings.LIVEKIT_SIP_URI}</Sip>
  </Dial>
</Response>"""

    call = client.calls.create(
        to=to_number,
        from_=from_number,
        twiml=twiml,
        status_callback=f"{settings.API_BASE_URL}/twilio/status",
        status_callback_method="POST",
    )
    return call.sid

