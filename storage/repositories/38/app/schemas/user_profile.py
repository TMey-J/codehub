from datetime import datetime

from pydantic import BaseModel

from app.schemas.Pagination import PagedResponse
from app.schemas.repository import RepositoryResponse


class UserProfileRepositoryResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    stars_count: int
    files_count: int
    created_at: datetime
    updated_at: datetime


class UserProfileResponse(BaseModel):
    username: str
    created_at: str

    repositories_count: int
    files_count: int
    received_stars: int

    repositories: PagedResponse[RepositoryResponse]