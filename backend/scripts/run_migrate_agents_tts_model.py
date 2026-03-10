#!/usr/bin/env python3
"""
Add tts_model column to agents table.
Run from backend dir with env loaded, e.g.:
  cd backend && python scripts/run_migrate_agents_tts_model.py
"""
import asyncio
import os
import sys

if not os.environ.get("DATABASE_URL"):
    for env_file in (".env.production", ".env"):
        if os.path.exists(env_file):
            from dotenv import load_dotenv
            load_dotenv(env_file)
            break

DATABASE_URL = (os.environ.get("DATABASE_URL") or "").strip()
if not DATABASE_URL:
    print("DATABASE_URL not set. Run from backend/ with .env or set DATABASE_URL.", file=sys.stderr)
    sys.exit(1)

conn_str = DATABASE_URL.replace("postgresql+asyncpg://", "postgres://", 1)


async def main():
    try:
        import asyncpg
    except ImportError:
        print("asyncpg not installed. pip install asyncpg", file=sys.stderr)
        sys.exit(1)
    conn = await asyncpg.connect(conn_str)
    try:
        await conn.execute("""
            ALTER TABLE agents
            ADD COLUMN IF NOT EXISTS tts_model VARCHAR NULL;
        """)
        print("OK: agents.tts_model column ensured.")
    finally:
        await conn.close()
    print("Migration done.")


if __name__ == "__main__":
    asyncio.run(main())
