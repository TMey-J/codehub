from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from app.core.helpers import format_dt


@dataclass
class File:
    repository_id: int
    file_name: str
    stored_name: str
    file_path: str
    file_size: int
    relative_path: str

    id: Optional[int] = None
    uploaded_at: Optional[datetime] = None

    def to_dict(self):
        return {
            "id": self.id,
            "repository_id": self.repository_id,
            "file_name": self.file_name,
            "file_size": self.file_size,
            "relative_path": self.relative_path,
            "uploaded_at": format_dt(self.uploaded_at)
        }