from dataclasses import dataclass
import re

@dataclass(frozen=True)
class Email:
    value: str

    def __post_init__(self):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', self.value):
            raise ValueError("Invalid email format")

@dataclass(frozen=True)
class Username:
    value: str

    def __post_init__(self):
        if not 3 <= len(self.value) <= 30:
            raise ValueError("Username must be 3-30 characters")
        if not re.match(r'^[a-zA-Z0-9_-]+$', self.value):
            raise ValueError("Username can only contain letters, numbers, hyphens, and underscores")

@dataclass(frozen=True)
class Password:
    value: str

    def __post_init__(self):
        if len(self.value) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', self.value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', self.value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', self.value):
            raise ValueError("Password must contain at least one digit")
