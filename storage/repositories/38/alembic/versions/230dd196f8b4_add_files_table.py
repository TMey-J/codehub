"""add files table

Revision ID: 230dd196f8b4
Revises: 03695a52b814
Create Date: 2026-06-08 14:20:32.720484

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '230dd196f8b4'
down_revision: Union[str, Sequence[str], None] = '03695a52b814'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "files",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True
        ),

        sa.Column(
            "repository_id",
            sa.Integer(),
            sa.ForeignKey(
                "repositories.id",
                ondelete="CASCADE"
            ),
            nullable=False
        ),

        sa.Column(
            "file_name",
            sa.String(255),
            nullable=False
        ),

        sa.Column(
            "stored_name",
            sa.String(255),
            nullable=False
        ),

        sa.Column(
            "file_path",
            sa.Text(),
            nullable=False
        ),

        sa.Column(
            "file_size",
            sa.BigInteger(),
            nullable=False
        ),

        sa.Column(
            "uploaded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()")
        )
    )

    op.create_index(
        "ix_files_repository_id",
        "files",
        ["repository_id"]
    )


def downgrade() -> None:
    op.drop_index(
        "ix_files_repository_id",
        table_name="files"
    )

    op.drop_table("files")
