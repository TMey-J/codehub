from sentence_transformers import CrossEncoder
from src.domain.ports import RerankerPort
from src.domain.entities import Document
from typing import List

class BGECrossEncoder(RerankerPort):
    def __init__(self, model_name: str = "BAAI/bge-reranker-large"):
        self.model = CrossEncoder(model_name)

    async def rerank(self, query: str, docs: List[Document], top_n: int) -> List[Document]:
        if not docs:
            return []
        pairs = [(query, doc.content) for doc in docs]
        scores = self.model.predict(pairs, batch_size=32)
        paired = list(zip(docs, scores))
        paired.sort(key=lambda x: x[1], reverse=True)
        return [
            Document(id=doc.id, content=doc.content, metadata=doc.metadata, score=score)
            for doc, score in paired[:top_n]
        ]
