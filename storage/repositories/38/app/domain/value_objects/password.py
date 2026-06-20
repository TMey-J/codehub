from dataclasses import dataclass


@dataclass(frozen=True)
class Password:
    value: str

    def __post_init__(self):
        if not self._is_valid(self.value):
            raise ValueError(
                "Password must be at least 8 characters with uppercase, lowercase, and number"
            )

    @staticmethod
    def _is_valid(password: str) -> bool:
        if len(password) < 8:
            return False
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        return has_upper and has_lower and has_digit

    def __str__(self) -> str:
        return self.value
