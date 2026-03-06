"""
UserTelephonyConfig: per-user Twilio + LiveKit SIP configuration.
Sensitive fields are encrypted at rest using Fernet (SECRET_KEY).
"""
import base64
import hashlib
import uuid
from datetime import datetime

from cryptography.fernet import Fernet
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from app.config import settings
from app.database import Base


def _get_fernet() -> Fernet:
    """Derive a valid Fernet key from SECRET_KEY (32 bytes, base64url)."""
    key_material = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key_material))


def _encrypt(value: str | None) -> str | None:
    if value is None or value == "":
        return None
    return _get_fernet().encrypt(value.encode()).decode()


def _decrypt(value: str | None) -> str | None:
    if value is None or value == "":
        return None
    try:
        return _get_fernet().decrypt(value.encode()).decode()
    except Exception:
        return None


class UserTelephonyConfig(Base):
    __tablename__ = "user_telephony_config"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Twilio (encrypted at rest)
    twilio_account_sid = Column(String, nullable=True)  # stored encrypted
    twilio_auth_token = Column(String, nullable=True)  # stored encrypted
    twilio_phone_number = Column(String, nullable=True)  # E.164, not encrypted
    twilio_trunk_sid = Column(String, nullable=True)
    twilio_sip_username = Column(String, nullable=True)
    twilio_sip_password = Column(String, nullable=True)  # stored encrypted

    # LiveKit SIP
    livekit_inbound_trunk_id = Column(String, nullable=True)
    livekit_outbound_trunk_id = Column(String, nullable=True)
    livekit_dispatch_rule_id = Column(String, nullable=True)

    assigned_agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True,
    )

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_encrypted(self, field: str, value: str | None) -> None:
        """Set a plaintext value and store it encrypted on the model."""
        setattr(self, field, _encrypt(value))

    def get_decrypted(self, field: str) -> str | None:
        """Return decrypted value for an encrypted field."""
        raw = getattr(self, field, None)
        return _decrypt(raw) if raw else None

    @property
    def decrypted_twilio_account_sid(self) -> str | None:
        return self.get_decrypted("twilio_account_sid")

    @property
    def decrypted_twilio_auth_token(self) -> str | None:
        return self.get_decrypted("twilio_auth_token")

    @property
    def decrypted_twilio_sip_password(self) -> str | None:
        return self.get_decrypted("twilio_sip_password")


def encrypt_value(value: str | None) -> str | None:
    """Module-level helper for encrypting before save."""
    return _encrypt(value)


def decrypt_value(value: str | None) -> str | None:
    """Module-level helper for decrypting after load."""
    return _decrypt(value)
