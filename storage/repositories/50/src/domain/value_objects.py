from pydantic import BaseModel

class RelevanceGrade(BaseModel):
    score: float  # 0.0 to 1.0
    feedback: str

class ChunkingStrategy:
    SEMANTIC = "semantic"
    RECURSIVE = "recursive"
