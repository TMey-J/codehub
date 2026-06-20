from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from src.domain.entities import Document, Query, Answer

class VectorStorePort(ABC):
    @abstractmethod
    async def similarity_search(self, vector: List[float], top_k: int, 
                                filters: Dict[str, Any]) -> List[Document]: ...

    @abstractmethod
    async def upsert(self, doc_id: str, vector: List[float], payload: Dict[str, Any]) -> None: ...

class SparseRetrieverPort(ABC):
    @abstractmethod
    async def bm25_search(self, query: str, top_k: int, 
                           filters: Dict[str, Any]) -> List[Document]: ...

    @abstractmethod
    async def index_document(self, doc_id: str, content: str, metadata: Dict[str, Any]) -> None: ...

class GraphStorePort(ABC):
    @abstractmethod
    async def traverse(self, entities: List[str], depth: int) -> List[Document]: ...

    @abstractmethod
    async def upsert_entity(self, entity_name: str, entity_type: str, metadata: Dict[str, Any]) -> None: ...

    @abstractmethod
    async def link_entity_to_document(self, entity_name: str, doc_id: str) -> None: ...

class RerankerPort(ABC):
    @abstractmethod
    async def rerank(self, query: str, docs: List[Document], top_n: int) -> List[Document]: ...

class LLMClientPort(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system: Optional[str] = None) -> str: ...

class EmbedderPort(ABC):
    @abstractmethod
    async def embed(self, text: str) -> List[float]: ...

    @abstractmethod
    async def embed_batch(self, texts: List[str]) -> List[List[float]]: ...

class ChunkerPort(ABC):
    @abstractmethod
    def chunk(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]: ...

class WebSearchPort(ABC):
    @abstractmethod
    async def search(self, query: str, top_k: int = 5) -> List[Document]: ...
