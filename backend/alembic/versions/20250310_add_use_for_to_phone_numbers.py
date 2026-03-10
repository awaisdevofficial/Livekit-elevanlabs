"""Add use_for column to phone_numbers table

Revision ID: 20250310_use_for
Revises: 20250310_transfer
Create Date: 2025-03-10

"""
from alembic import op
import sqlalchemy as sa


revision = "20250310_use_for"
down_revision = "20250310_transfer"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "phone_numbers",
        sa.Column("use_for", sa.String(20), nullable=False, server_default="both"),
    )


def downgrade() -> None:
    op.drop_column("phone_numbers", "use_for")
