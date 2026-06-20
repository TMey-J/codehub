from sqlalchemy import (
    Column,
    Integer,
    String,
    BigInteger,
    ForeignKey,
    DateTime,
    Text
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class FileModel(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)

    repository_id = Column(
        Integer,
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    file_name = Column(String(255), nullable=False)

    stored_name = Column(String(255), nullable=False)

    file_path = Column(Text, nullable=False)

    file_size = Column(BigInteger, nullable=False)

    relative_path = Column(
        Text,
        nullable=False
    )
    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),onupdate=func.now()
    )

    repository = relationship("RepositoryModel")