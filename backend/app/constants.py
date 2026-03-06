"""
App-wide defaults: STT = Deepgram, TTS = Cartesia.
Voice IDs are provider-specific (Cartesia UUIDs vs Deepgram model names).
"""

DEFAULT_STT_PROVIDER = "deepgram"
DEFAULT_TTS_PROVIDER = "cartesia"

# Cartesia Sonic voices (UUIDs)
DEFAULT_CARTESIA_VOICE_ID = "f786b574-daa5-4673-aa0c-cbe3e8534c02"  # Katie – stable, recommended for agents
DEFAULT_DEEPGRAM_VOICE_ID = "aura-2-andromeda-en"


def get_tts_provider_and_voice_id(tts_provider: str | None, tts_voice_id: str | None) -> tuple[str, str]:
    """Return (tts_provider, voice_id) with correct defaults per provider."""
    provider = (tts_provider or DEFAULT_TTS_PROVIDER).lower()
    if provider == "cartesia":
        # If voice_id looks like Deepgram (aura-*) or is empty, use Cartesia default
        vid = (tts_voice_id or "").strip()
        voice_id = vid if vid and not vid.startswith("aura") else DEFAULT_CARTESIA_VOICE_ID
    else:
        voice_id = tts_voice_id or DEFAULT_DEEPGRAM_VOICE_ID
    return provider, voice_id
