from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator, Field
import re

class RegisterRequest(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=30,
        pattern=r'^[a-zA-Z0-9_-]+$',
        description="3–30 characters. Only letters, numbers, hyphen (-), and underscore (_)."
    )
    email: EmailStr = Field(
        description="Must be a valid email address."
    )
    password: str = Field(
        min_length=8,
        description="At least 8 characters, must include uppercase, lowercase, and digit."
    )

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v

class LoginRequest(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=30,
        pattern=r'^[a-zA-Z0-9_-]+$',
        description="3–30 characters. Only letters, numbers, hyphen (-), and underscore (_)."
    )
    password: str = Field(
        min_length=8,
        description="At least 8 characters, must include uppercase, lowercase, and digit."
    )

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    updated_at: datetime
