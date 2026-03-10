"""
Single source for Twilio client: User (legacy) or UserTelephonyConfig (Settings connect).
Use this everywhere so connecting once in Settings works for import, calls, etc.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.rest import Client as TwilioClient

from app.models.telephony import UserTelephonyConfig
from app.models.user import User


async def get_twilio_client(user: User, db: AsyncSession) -> TwilioClient:
    """
    Return a Twilio client for the user.
    Uses User.twilio_* if set; otherwise UserTelephonyConfig (Settings → Connect).
    """
    if user.twilio_account_sid and user.twilio_auth_token:
        return TwilioClient(user.twilio_account_sid, user.twilio_auth_token)
    result = await db.execute(
        select(UserTelephonyConfig).where(UserTelephonyConfig.user_id == user.id)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise ValueError(
            "Twilio credentials not configured. Connect your phone in Settings → Integrations."
        )
    account_sid = config.get_decrypted("twilio_account_sid")
    auth_token = config.get_decrypted("twilio_auth_token")
    if not account_sid or not auth_token:
        raise ValueError(
            "Twilio credentials not configured. Connect your phone in Settings → Integrations."
        )
    return TwilioClient(account_sid, auth_token)


def get_twilio_client_sync_from_config(config: UserTelephonyConfig) -> TwilioClient:
    """Build Twilio client from an already-loaded UserTelephonyConfig (e.g. in webhooks)."""
    account_sid = config.get_decrypted("twilio_account_sid")
    auth_token = config.get_decrypted("twilio_auth_token")
    if not account_sid or not auth_token:
        raise ValueError("Twilio credentials missing on config.")
    return TwilioClient(account_sid, auth_token)
