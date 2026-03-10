#!/usr/bin/env python3
"""
Run phone_numbers schema migration: add origination_uri, drop organization_id.
Use from backend dir with env loaded, e.g.:
  cd backend && ENV=production python scripts/run_migrate_phone_numbers.py
Or: python -m scripts.run_migrate_phone_numbers (after setting DATABASE_URL)
"""
import asyncio
import os
import sys

# Load backend env when running on host (Docker injects env via env_file)
if not os.environ.get("DATABASE_URL"):
    if os.path.exists(".env.production") and os.environ.get("ENV") == "production":
        from dotenv import load_dotenv
        load_dotenv(".env.production")
    if os.path.exists(".env"):
        from dotenv import load_dotenv
        load_dotenv(".env")

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
if not DATABASE_URL:
    print("DATABASE_URL not set. Set ENV=production and run from backend/ or set DATABASE_URL.", file=sys.stderr)
    sys.exit(1)

# Use postgres:// for asyncpg
conn_str = DATABASE_URL.replace("postgresql+asyncpg://", "postgres://", 1)


async def main():
    try:
        import asyncpg
    except ImportError:
        print("asyncpg not installed. pip install asyncpg", file=sys.stderr)
        sys.exit(1)
    conn = await asyncpg.connect(conn_str)
    try:
        # Add origination_uri (Twilio SIP origination URI)
        await conn.execute("""
            ALTER TABLE phone_numbers
            ADD COLUMN IF NOT EXISTS origination_uri VARCHAR NULL;
        """)
        print("OK: phone_numbers.origination_uri ensured.")
        # Drop legacy organization_id if present
        await conn.execute("""
            ALTER TABLE phone_numbers
            DROP COLUMN IF EXISTS organization_id;
        """)
        print("OK: phone_numbers.organization_id dropped if present.")
        # Drop organizations table if present
        await conn.execute("DROP TABLE IF EXISTS organizations;")
        print("OK: organizations table dropped if present.")
    finally:
        await conn.close()
    print("Migration done.")


if __name__ == "__main__":
    asyncio.run(main())
