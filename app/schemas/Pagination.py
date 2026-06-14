from typing import Generic, List, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PagedResponse(BaseModel, Generic[T]):
    items: List[T]
    total_count: int
    page: int
    take: int
    total_pages: int