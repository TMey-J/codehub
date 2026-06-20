"""make question mulitple or text

Revision ID: 8966be0d7d59
Revises: c7c02b3916c8
Create Date: 2026-05-18 11:45:36.962917

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql # اضافه شد

# revision identifiers, used by Alembic.
revision: str = '8966be0d7d59'
down_revision: Union[str, Sequence[str], None] = 'c7c02b3916c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. تعریف و ایجاد ENUM در دیتابیس
    question_type_enum = postgresql.ENUM('MULTIPLE_CHOICE', 'DESCRIPTIVE', name='questiontype')
    question_type_enum.create(op.get_bind(), checkfirst=True)

    # 2. اضافه کردن ستون با استفاده از Enum ایجاد شده
    # نکته: چون جدول سوالات از قبل داده دارد، server_default برای ردیف‌های قبلی لازم است
    op.add_column('questions', sa.Column('question_type', question_type_enum, nullable=False, server_default='MULTIPLE_CHOICE'))

    # 3. تغییرات جدول پاسخ‌ها
    op.alter_column('answers', 'selected_option_id', existing_type=sa.INTEGER(), nullable=True)
    op.add_column('answers', sa.Column('answer_text', sa.Text(), nullable=True))

    # 4. اضافه کردن CheckConstraint برای اطمینان از اینکه فقط یکی از فیلدها پر باشد
    op.create_check_constraint(
        'chk_answer_type',
        'answers',
        sa.or_(
            sa.and_(sa.column('selected_option_id').is_not(None), sa.column('answer_text').is_(None)),
            sa.and_(sa.column('selected_option_id').is_(None), sa.column('answer_text').is_not(None))
        )
    )


def downgrade() -> None:
    # حذف CheckConstraint
    op.drop_constraint('chk_answer_type', 'answers', type_='check')

    # حذف ستون‌ها
    op.drop_column('answers', 'answer_text')
    op.alter_column('answers', 'selected_option_id', existing_type=sa.INTEGER(), nullable=False)

    op.drop_column('questions', 'question_type')

    # حذف ENUM از دیتابیس
    question_type_enum = postgresql.ENUM('MULTIPLE_CHOICE', 'DESCRIPTIVE', name='questiontype')
    question_type_enum.drop(op.get_bind(), checkfirst=True)
