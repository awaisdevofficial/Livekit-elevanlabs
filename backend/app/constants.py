"""
App-wide defaults. Voice agent uses Deepgram STT, Groq LLM, Cartesia TTS.
"""

# ElevenLabs default voice ID (Rachel). Used by /voices and any remaining ElevenLabs usage.
DEFAULT_ELEVENLABS_VOICE_ID = "bIHbv24MWmeRgasZH58o"

# Cartesia default voice ID. Used when agent has no tts_voice_id (voice agent stack).
DEFAULT_CARTESIA_VOICE_ID = "a0e99841-438c-4a64-b679-ae501e7d6091"
