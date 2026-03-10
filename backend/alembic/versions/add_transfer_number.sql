-- Optional: run in Supabase SQL editor if not using Alembic
-- Adds transfer_number column to agents for call transfer to human.
ALTER TABLE agents ADD COLUMN IF NOT EXISTS transfer_number VARCHAR(20);
