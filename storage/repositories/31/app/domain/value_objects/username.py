import re
from dataclasses import dataclass


@dataclass(frozen=True)
class Username:
    value: str

    def __post_init__(self):
        if not self._is_valid(self.value):
            raise ValueError(
                "Username must be 3-30 characters, alphanumeric with underscores/hyphens"
            )

    @staticmethod
    def _is_valid(username: str) -> bool:
        if not 3 <= len(username) <= 30:
            return False
        pattern = r'^[a-zA-Z0-9_-]+$'
        return re.match(pattern, username) is not None

    def __str__(self) -> str:
        return self.value
