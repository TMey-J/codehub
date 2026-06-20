import asyncio
from sentence_transformers import SentenceTransformer
from src.domain.ports import EmbedderPort
from typing import List

class BGE_M3_Embedder(EmbedderPort):
    def __init__(self, model_name: str = "BAAI/bge-m3"):
        self.model = SentenceTransformer(model_name)

    async def embed(self, text: str) -> List[float]:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self.model.encode, text, {"normalize_embeddings": True}
        )

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self.model.encode, texts, {"normalize_embeddings": True}
        )
