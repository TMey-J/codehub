"""add ai request

Revision ID: 774ed30535a5
Revises: 35407b410ce1
Create Date: 2026-06-19 14:31:09.429965

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '774ed30535a5'
down_revision: Union[str, Sequence[str], None] = '35407b410ce1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():

    op.create_table(
        "ai_requests",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True
        ),

        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=True
        ),

        sa.Column(
            "service",
            sa.String(30),
            nullable=False
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"]
        )
    )

    op.create_index(
        "ix_ai_requests_user_id",
        "ai_requests",
        ["user_id"]
    )

    op.create_index(
        "ix_ai_requests_service",
        "ai_requests",
        ["service"]
    )
