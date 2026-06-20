from elasticsearch import AsyncElasticsearch
from src.domain.ports import SparseRetrieverPort
from src.domain.entities import Document
from src.config import settings
from typing import List, Dict, Any

class ElasticsearchAdapter(SparseRetrieverPort):
    def __init__(self):
        self.client = AsyncElasticsearch(
            hosts=[f"{settings.elasticsearch_host}:{settings.elasticsearch_port}"],
            retry_on_timeout=True,
        )
        self.index = settings.elasticsearch_index
        # Create index if not exists (optional)

    async def bm25_search(self, query: str, top_k: int,
                           filters: Dict[str, Any]) -> List[Document]:
        must_queries = [{"match": {"content": query}}]
        filter_list = []
        for key, value in filters.items():
            filter_list.append({"term": {f"metadata.{key}": value}})
        body = {
            "size": top_k,
            "query": {
                "bool": {
                    "must": must_queries,
                    "filter": filter_list,
                }
            }
        }
        resp = await self.client.search(index=self.index, body=body)
        docs = []
        for hit in resp["hits"]["hits"]:
            docs.append(
                Document(
                    id=hit["_id"],
                    content=hit["_source"]["content"],
                    metadata=hit["_source"].get("metadata", {}),
                    score=hit["_score"],
                )
            )
        return docs

    async def index_document(self, doc_id: str, content: str, metadata: Dict[str, Any]) -> None:
        await self.client.index(
            index=self.index,
            id=doc_id,
            document={"content": content, "metadata": metadata}
        )
