from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class Document(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any] = {}
    score: float = 0.0

class Chunk(Document):
    parent_id: Optional[str] = None
    chunk_index: int = 0

class Query(BaseModel):
    text: str
    filters: Dict[str, Any] = {}
    user_groups: List[str] = []

class Answer(BaseModel):
    text: str
    citations: List[Document]
    confidence: float = 0.0
