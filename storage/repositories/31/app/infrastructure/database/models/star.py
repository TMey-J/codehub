from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class RepositoryStarModel(Base):
    __tablename__ = "repository_stars"

    repository_id = Column(
        Integer,
        ForeignKey(
            "repositories.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    repository = relationship(
        "RepositoryModel",
        back_populates="stars"
    )

    user = relationship(
        "UserModel",
        back_populates="stars"
    )