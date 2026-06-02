from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional

class RepositoryVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"

@dataclass
class Repository:
    name: str
    owner_id: int
    visibility: RepositoryVisibility=RepositoryVisibility.PUBLIC
    description: Optional[str] = None
    id: Optional[int] = None
    language: str = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "owner_id": self.owner_id,
            "visibility": self.visibility.value,
            "description": self.description,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }