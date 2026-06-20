from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from app.domain.entities.repository import RepositoryVisibility
import re


class RepositoryRequestBase(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
        pattern=r'^[a-zA-Z0-9_-]+$',
        description="1–100 characters. Only letters, numbers, hyphen (-), and underscore (_)."
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Optional description, max 500 characters."
    )
    visibility: RepositoryVisibility = Field(
        default=RepositoryVisibility.PUBLIC,
        description="Repository visibility: public or private."
    )
    language: str = Field(
        min_length=1,
        max_length=50,
        pattern=r'^[a-zA-Z0-9+#\s-]+$',
        description="Programming language name (e.g., Python, JavaScript, C++, C#)."
    )

    @field_validator('name')
    def validate_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Repository name can only contain letters, numbers, hyphens, and underscores')
        if v.startswith('-') or v.startswith('_'):
            raise ValueError('Repository name cannot start with hyphen or underscore')
        if v.endswith('-') or v.endswith('_'):
            raise ValueError('Repository name cannot end with hyphen or underscore')
        return v

    @field_validator('language')
    def validate_language(cls, v):
        if not re.match(r'^[a-zA-Z0-9+#\s-]+$', v):
            raise ValueError('Language name contains invalid characters')
        return v.strip()


class CreateRepositoryCommand(RepositoryRequestBase):
    pass

class UpdateRepositoryCommand(RepositoryRequestBase):
    id: int

class RepositoryUpdate(BaseModel):
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        pattern=r'^[a-zA-Z0-9_-]+$',
        description="1–100 characters. Only letters, numbers, hyphen (-), and underscore (_)."
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional description, max 500 characters."
    )
    visibility: Optional[RepositoryVisibility] = Field(
        None,
        description="Repository visibility: public or private."
    )
    language: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        pattern=r'^[a-zA-Z0-9+#\s-]+$',
        description="Programming language name."
    )

    @field_validator('name')
    def validate_name(cls, v):
        if v is None:
            return v
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Repository name can only contain letters, numbers, hyphens, and underscores')
        if v.startswith('-') or v.startswith('_'):
            raise ValueError('Repository name cannot start with hyphen or underscore')
        if v.endswith('-') or v.endswith('_'):
            raise ValueError('Repository name cannot end with hyphen or underscore')
        return v

    @field_validator('language')
    def validate_language(cls, v):
        if v is None:
            return v
        if not re.match(r'^[a-zA-Z0-9+#\s-]+$', v):
            raise ValueError('Language name contains invalid characters')
        return v.strip()


class RepositoryResponse(RepositoryRequestBase):
    id: int
    owner_id: int
    owner_name: str
    created_at: str
    updated_at: str
    stars_count: int

    class Config:
        from_attributes = True

class DeleteRepositoryCommand(BaseModel):
    id: int = Field()

class SearchRepositoryRequest(BaseModel):
    query: str

class GenerateReadmeRequest(BaseModel):
    repository_id: int
    en_response:bool

class GenerateReadmeResponse(BaseModel):
    content: str | None
    file_path:str | None

class ToggleStarResponse(BaseModel):
    starred: bool
    stars_count: int