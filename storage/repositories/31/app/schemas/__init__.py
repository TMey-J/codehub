from typing import Optional, List,TypeVar,Generic
from pydantic import BaseModel

T = TypeVar("T")
class ApiResponse(BaseModel, Generic[T]):
    is_success: bool
    errors: Optional[List[str]] = None
    response: Optional[T] = None