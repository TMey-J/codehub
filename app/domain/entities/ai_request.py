from dataclasses import dataclass
from datetime import datetime


@dataclass
class AIRequest:

    id: int | None = None

    user_id: int | None = None

    service: str = ""

    created_at: datetime | None = None