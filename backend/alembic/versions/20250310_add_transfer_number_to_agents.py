"""Add transfer_number column to agents table

Revision ID: 20250310_transfer
Revises: 20250310_tts_model
Create Date: 2025-03-10

"""
from alembic import op
import sqlalchemy as sa


revision = "20250310_transfer"
down_revision = "20250310_tts_model"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "agents",
        sa.Column("transfer_number", sa.String(20), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("agents", "transfer_number")
