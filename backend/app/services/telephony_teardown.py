"""
Telephony teardown: delete LiveKit SIP resources and Twilio trunk, then remove
UserTelephonyConfig from the database.
"""
import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.telephony import UserTelephonyConfig
from app.services.livekit_setup import LiveKitSetupService
from app.services.twilio_setup import TwilioSetupService

logger = logging.getLogger(__name__)


async def teardown_user_telephony(user_id: str, db: AsyncSession) -> bool:
    """
    Remove all telephony resources for the user:
    1. Load UserTelephonyConfig
    2. Delete LiveKit dispatch rule, inbound trunk, outbound trunk
    3. Delete Twilio trunk (using decrypted credentials)
    4. Delete UserTelephonyConfig from DB
    """
    user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id

    result = await db.execute(
        select(UserTelephonyConfig).where(UserTelephonyConfig.user_id == user_uuid)
    )
    config = result.scalar_one_or_none()
    if not config:
        logger.info("No telephony config for user %s; nothing to teardown", user_id[:8])
        return True

    lk_svc = LiveKitSetupService()

    # 2. Delete LiveKit dispatch rule first (references trunk)
    if config.livekit_dispatch_rule_id:
        await lk_svc.delete_dispatch_rule(config.livekit_dispatch_rule_id)

    # 3. Delete LiveKit inbound trunk
    if config.livekit_inbound_trunk_id:
        await lk_svc.delete_inbound_trunk(config.livekit_inbound_trunk_id)

    # 4. Delete LiveKit outbound trunk
    if config.livekit_outbound_trunk_id:
        await lk_svc.delete_outbound_trunk(config.livekit_outbound_trunk_id)

    # 5. Delete Twilio trunk (needs decrypted credentials)
    if config.twilio_trunk_sid:
        account_sid = config.get_decrypted("twilio_account_sid")
        auth_token = config.get_decrypted("twilio_auth_token")
        if account_sid and auth_token:
            twilio_svc = TwilioSetupService(
                account_sid=account_sid,
                auth_token=auth_token,
                phone_number=config.twilio_phone_number or "",
                sip_server_ip="0.0.0.0",  # unused for delete
            )
            await twilio_svc.delete_trunk(config.twilio_trunk_sid)
        else:
            logger.warning("Cannot delete Twilio trunk: missing decrypted credentials")

    # 6. Delete config from DB
    await db.delete(config)
    await db.commit()
    logger.info("Teardown complete for user %s", user_id[:8])
    return True
