"""
App-wide defaults. TTS = Piper, STT = Whisper.cpp (self-hosted only).
"""

DEFAULT_PIPER_VOICE = "en_US-amy-medium"

# Sent in LiveKit room/token metadata so server accepts the room (worker uses Piper)
LIVEKIT_TTS_PROVIDER = "deepgram"


def get_tts_provider_and_voice_id(tts_provider: str | None, tts_voice_id: str | None) -> tuple[str, str]:
    """Return (provider, voice_id). Only Piper is supported; voice_id is Piper voice id."""
    vid = (tts_voice_id or "").strip() or DEFAULT_PIPER_VOICE
    return "piper", vid
