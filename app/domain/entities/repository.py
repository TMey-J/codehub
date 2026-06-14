from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional

from app.core.helpers import format_dt


class RepositoryVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"

@dataclass
class Repository:
    name: str
    owner_id: int
    owner_name: str
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
            "owner_name": self.owner_name,
            "visibility": self.visibility.value,
            "description": self.description,
            "language": self.language,
            "created_at":format_dt(self.created_at),
            "updated_at": format_dt(self.updated_at),
        }