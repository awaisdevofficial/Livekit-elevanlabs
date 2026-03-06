"""
Telephony onboarding: run Twilio trunk setup + LiveKit SIP setup and persist
UserTelephonyConfig. On partial failure (LiveKit steps), save config with is_active=False.
"""
import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.telephony import UserTelephonyConfig, encrypt_value
from app.services.livekit_setup import LiveKitSetupService
from app.services.twilio_setup import TwilioSetupService

logger = logging.getLogger(__name__)


async def onboard_user_telephony(
    user_id: str,
    twilio_account_sid: str,
    twilio_auth_token: str,
    phone_number: str,
    db: AsyncSession,
    sip_server_ip: str | None = None,
) -> UserTelephonyConfig:
    """
    Full onboarding: Twilio trunk + LiveKit inbound/dispatch/outbound.
    Raises HTTPException 400 if user already has active config or Twilio step fails.
    On LiveKit failure, saves partial config with is_active=False.
    """
    user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
    sip_server_ip = sip_server_ip or settings.SIP_SERVER_IP

    # 1. Check existing config
    result = await db.execute(
        select(UserTelephonyConfig).where(UserTelephonyConfig.user_id == user_uuid)
    )
    existing = result.scalar_one_or_none()
    if existing and existing.is_active:
        raise HTTPException(
            status_code=400,
            detail="Telephony is already connected. Disconnect first to reconfigure.",
        )

    # If existing inactive config, we'll replace it by creating new and deleting old, or update
    if existing:
        await db.delete(existing)
        await db.commit()

    # 2. Twilio setup (fail fast)
    try:
        twilio_svc = TwilioSetupService(
            account_sid=twilio_account_sid,
            auth_token=twilio_auth_token,
            phone_number=phone_number,
            sip_server_ip=sip_server_ip,
        )
        twilio_result = await twilio_svc.setup_trunk()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Twilio setup failed for user %s: %s", user_id[:8], e)
        raise HTTPException(
            status_code=400,
            detail=f"Twilio setup failed: {getattr(e, 'msg', str(e))}",
        )

    trunk_sid = twilio_result["trunk_sid"]
    sip_username = twilio_result["sip_username"]
    sip_password = twilio_result["sip_password"]
    logger.info("Step 2 done: Twilio trunk %s for user %s", trunk_sid, user_id[:8])

    # 3–5. LiveKit (best effort; save partial on failure)
    lk_svc = LiveKitSetupService()
    inbound_trunk_id: str | None = None
    dispatch_rule_id: str | None = None
    outbound_trunk_id: str | None = None
    livekit_ok = True

    try:
        inbound_trunk_id = await lk_svc.create_inbound_trunk(phone_number, user_id)
        logger.info("Step 3 done: LiveKit inbound trunk %s", inbound_trunk_id)
    except Exception as e:
        logger.exception("LiveKit create_inbound_trunk failed: %s", e)
        livekit_ok = False

    if livekit_ok:
        try:
            dispatch_rule_id = await lk_svc.create_dispatch_rule(inbound_trunk_id, user_id)
            logger.info("Step 4 done: LiveKit dispatch rule %s", dispatch_rule_id)
        except Exception as e:
            logger.exception("LiveKit create_dispatch_rule failed: %s", e)
            livekit_ok = False

    if livekit_ok:
        try:
            outbound_trunk_id = await lk_svc.create_outbound_trunk(
                phone_number, trunk_sid, sip_username, sip_password
            )
            logger.info("Step 5 done: LiveKit outbound trunk %s", outbound_trunk_id)
        except Exception as e:
            logger.exception("LiveKit create_outbound_trunk failed: %s", e)
            livekit_ok = False

    # 6. Save config (encrypted fields)
    config = UserTelephonyConfig(
        user_id=user_uuid,
        twilio_account_sid=encrypt_value(twilio_account_sid),
        twilio_auth_token=encrypt_value(twilio_auth_token),
        twilio_phone_number=phone_number,
        twilio_trunk_sid=trunk_sid,
        twilio_sip_username=sip_username,
        twilio_sip_password=encrypt_value(sip_password),
        livekit_inbound_trunk_id=inbound_trunk_id,
        livekit_outbound_trunk_id=outbound_trunk_id,
        livekit_dispatch_rule_id=dispatch_rule_id,
        is_active=livekit_ok,
    )
    db.add(config)
    await db.commit()
    await db.refresh(config)
    logger.info("Step 6 done: saved UserTelephonyConfig for user %s (is_active=%s)", user_id[:8], livekit_ok)

    return config
