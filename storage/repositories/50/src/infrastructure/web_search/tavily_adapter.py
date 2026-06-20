from tavily import AsyncTavilyClient
from src.domain.ports import WebSearchPort
from src.domain.entities import Document
from src.config import settings
from typing import List

class TavilyAdapter(WebSearchPort):
    def __init__(self):
        self.client = AsyncTavilyClient(api_key=settings.tavily_api_key)

    async def search(self, query: str, top_k: int = 5) -> List[Document]:
        response = await self.client.search(query, max_results=top_k)
        docs = []
        for result in response.get("results", []):
            docs.append(
                Document(
                    id=result.get("url", ""),
                    content=result.get("content", ""),
                    metadata={"source": result.get("url", ""), "title": result.get("title", "")},
                    score=1.0,
                )
            )
        return docs
