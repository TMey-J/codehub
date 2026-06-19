#
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.infrastructure.database.base import Base
from app.domain.entities.repository import RepositoryVisibility


class RepositoryModel(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    visibility = Column(SQLEnum(RepositoryVisibility), nullable=False, default=RepositoryVisibility.PUBLIC, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language=Column(String(255), nullable=False)
    search_text = Column(Text, nullable=True,default='')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    stars_count = Column(
        Integer,
        nullable=False,
        default=0
    )

    # Relationships
    owner = relationship("UserModel", back_populates="repositories")
    files = relationship(
        "FileModel",
        cascade="all, delete-orphan"
    )
    stars = relationship(
        "RepositoryStarModel",
        back_populates="repository",
        cascade="all, delete-orphan"
    )
