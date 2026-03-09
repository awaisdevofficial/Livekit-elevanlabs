from typing import Any, List

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.constants import DEFAULT_CARTESIA_VOICE_ID, DEFAULT_PIPER_VOICE, _is_cartesia_voice_id
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.voice_profile import VoiceProfile


router = APIRouter()


def _piper_base_url() -> str:
    """Base URL for Piper API including /v1 (e.g. http://host:8880/v1)."""
    url = (settings.PIPER_TTS_URL or settings.KOKORO_TTS_URL or "").strip().rstrip("/")
    if not url:
        return ""
    for suffix in ["/v1/audio/speech", "/audio/speech"]:
        if url.endswith(suffix):
            url = url[: -len(suffix)].rstrip("/")
            break
    if not url.endswith("/v1"):
        url = url + "/v1"
    return url


PIPER_VOICES_FALLBACK: list[tuple[str, str, str]] = [
    ("en_US-amy-medium", "Amy", "female"),
    ("en_US-joe-medium", "Joe", "male"),
    ("en_US-ryan-medium", "Ryan", "male"),
    ("en_GB-alan-medium", "Alan", "male"),
    ("en_US-kathleen-low", "Kathleen", "female"),
]


class Voice(BaseModel):
    id: str
    name: str
    provider: str
    gender: str | None = None
    description: str | None = None
    preview_url: str | None = None
    is_custom: bool = False
    language: str | None = None
    language_code: str | None = None
    country: str | None = None
    quality: str | None = None


class VoicePreviewRequest(BaseModel):
    voice_id: str
    provider: str
    text: str


async def _get_user_voice_profiles(
    user: User,
    db: AsyncSession,
) -> list[Voice]:
    result = await db.execute(
        select(VoiceProfile).where(VoiceProfile.user_id == user.id)
    )
    profiles = result.scalars().all()
    voices: list[Voice] = []
    for profile in profiles:
        voices.append(
            Voice(
                id=profile.provider_voice_id,
                name=profile.name,
                provider=profile.provider,
                gender=profile.gender,
                description=profile.description,
                preview_url=(profile.metadata_json or {}).get("preview_url") if profile.metadata_json else None,
                is_custom=True,
                language="Unknown",
                language_code="",
            )
        )
    return voices


async def _fetch_piper_voices() -> list[Voice]:
    """Fetch available voices from Piper server (GET /v1/voices). Returns fallback list on failure."""
    base = _piper_base_url()
    if base:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{base}/voices")
                if resp.status_code == 200:
                    data = resp.json()
                    voices = []
                    for v in data if isinstance(data, list) else []:
                        voices.append(
                            Voice(
                                id=v.get("id", ""),
                                name=v.get("name", ""),
                                provider="piper",
                                gender=v.get("gender", "neutral"),
                                description=v.get("description", ""),
                            )
                        )
                    if voices:
                        return voices
        except Exception:
            pass
    return [
        Voice(id=v[0], name=v[1], provider="piper", gender=v[2], description=f"Piper TTS — {v[2]}")
        for v in PIPER_VOICES_FALLBACK
    ]


def _cartesia_voices() -> list[Voice]:
    return [
        Voice(id=DEFAULT_CARTESIA_VOICE_ID, name="Katie", gender="female", provider="cartesia", description="Stable, natural – recommended for agents", language="English", language_code="en"),
        Voice(id="228fca29-3a0a-435c-8728-5cb483251068", name="Kiefer", gender="male", provider="cartesia", description="Stable, clear", language="English", language_code="en"),
        Voice(id="6ccbfb76-1fc6-48f7-b71d-91ac6298247b", name="Tessa", gender="female", provider="cartesia", description="Emotive and expressive", language="English", language_code="en"),
        Voice(id="c961b81c-a935-4c17-bfb3-ba2239de8c2f", name="Kyle", gender="male", provider="cartesia", description="Emotive and expressive", language="English", language_code="en"),
    ]


def _piper_voice_to_voice(item: dict[str, Any]) -> Voice:
    """Convert Piper API voice dict to our Voice model."""
    return Voice(
        id=item.get("id", ""),
        name=item.get("name", ""),
        provider=item.get("provider", "piper"),
        gender=item.get("gender"),
        description=item.get("description"),
        language=item.get("language"),
        language_code=item.get("language_code"),
        country=item.get("country"),
        quality=item.get("quality"),
    )


@router.get("", response_model=List[Voice])
async def get_voices(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return available voices: Piper (from PIPER_TTS_URL), Cartesia (when CARTESIA_API_KEY set), and custom profiles.
    """
    voices: list[Voice] = []
    base = _piper_base_url()

    if base:
        voices.extend(await _fetch_piper_voices())

    if settings.CARTESIA_API_KEY:
        voices.extend(_cartesia_voices())

    custom_voices = await _get_user_voice_profiles(user, db)
    for v in custom_voices:
        if (v.provider or "").lower() != "deepgram":
            voices.append(v)

    if base:
        voices = [v for v in voices if (v.provider or "").lower() != "deepgram"]

    return voices


@router.post("/preview")
async def preview_voice(body: VoicePreviewRequest, user: User = Depends(get_current_user)):  # noqa: ARG001
    """Generate a short audio preview. Supports provider: piper, kokoro, cartesia."""
    provider = (body.provider or "").lower() or "piper"
    text = body.text.strip() or "Hi, I am your AI voice assistant, ready to help you on every call."

    if provider in ("piper", "kokoro"):
        base = _piper_base_url()
        if not base:
            raise HTTPException(status_code=400, detail="Piper TTS not configured (set PIPER_TTS_URL)")
        voice = (body.voice_id or "").strip() or (settings.PIPER_TTS_VOICE or settings.KOKORO_TTS_VOICE or "en_US-amy-medium").strip()
        model = (settings.PIPER_TTS_MODEL or settings.KOKORO_TTS_MODEL or "tts-1").strip()
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{base}/audio/speech",
                headers={"Content-Type": "application/json"},
                json={"model": model, "voice": voice, "input": text},
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Piper TTS preview failed: {resp.text}")
        return StreamingResponse(iter([resp.content]), media_type="audio/wav")

    if provider == "cartesia":
        if not settings.CARTESIA_API_KEY:
            raise HTTPException(status_code=400, detail="Cartesia API key not configured")
        voice_id = body.voice_id if _is_cartesia_voice_id(body.voice_id or "") else DEFAULT_CARTESIA_VOICE_ID
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.cartesia.ai/tts/bytes",
                headers={
                    "Cartesia-Version": "2024-11-13",
                    "X-API-Key": settings.CARTESIA_API_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "model_id": "sonic-3",
                    "transcript": text,
                    "voice": {"mode": "id", "id": voice_id},
                    "output_format": {"container": "mp3", "sample_rate": 24000, "bit_rate": 128000},
                },
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Cartesia TTS failed")
        return StreamingResponse(iter([resp.content]), media_type="audio/mpeg")

    raise HTTPException(status_code=400, detail="Use provider 'piper', 'kokoro', or 'cartesia'.")
