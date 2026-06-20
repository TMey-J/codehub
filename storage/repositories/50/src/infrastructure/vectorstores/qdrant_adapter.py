from qdrant_client import QdrantClient, models
from qdrant_client.http import models as qdrant_models
from src.domain.ports import VectorStorePort
from src.domain.entities import Document
from src.config import settings
from typing import List, Dict, Any

class QdrantAdapter(VectorStorePort):
    def __init__(self):
        self.client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
        self.collection = settings.qdrant_collection
        self._init_collection()

    def _init_collection(self):
        try:
            self.client.get_collection(self.collection)
        except Exception:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=models.VectorParams(
                    size=1024,
                    distance=models.Distance.COSINE,
                    on_disk=True,
                    quantization_config=models.ScalarQuantization(
                        scalar=models.ScalarQuantizationConfig(
                            type=models.ScalarType.INT8,
                            quantile=0.99,
                            always_ram=True,
                        ),
                    ),
                ),
                hnsw_config=models.HnswConfigDiff(
                    m=16,
                    ef_construct=200,
                    full_scan_threshold=10000,
                ),
            )
            self.client.create_payload_index(
                collection_name=self.collection,
                field_name="metadata.group",
                field_type=qdrant_models.PayloadFieldType.KEYWORD,
            )

    async def similarity_search(self, vector: List[float], top_k: int,
                                filters: Dict[str, Any]) -> List[Document]:
        q_filter = None
        if filters:
            conditions = []
            for key, value in filters.items():
                conditions.append(
                    models.FieldCondition(
                        key=f"metadata.{key}",
                        match=models.MatchValue(value=value),
                    )
                )
            q_filter = models.Filter(must=conditions)
        response = self.client.search(
            collection_name=self.collection,
            query_vector=vector,
            limit=top_k,
            query_filter=q_filter,
        )
        return [
            Document(
                id=hit.id,
                content=hit.payload.get("content", ""),
                metadata=hit.payload.get("metadata", {}),
                score=hit.score,
            )
            for hit in response
        ]

    async def upsert(self, doc_id: str, vector: List[float], payload: Dict[str, Any]) -> None:
        self.client.upsert(
            collection_name=self.collection,
            points=[models.PointStruct(id=doc_id, vector=vector, payload=payload)]
        )
