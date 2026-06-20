from functools import lru_cache
from src.config import settings
from src.infrastructure.vectorstores.qdrant_adapter import QdrantAdapter
from src.infrastructure.sparse.elasticsearch_adapter import ElasticsearchAdapter
from src.infrastructure.graph.neo4j_adapter import Neo4jAdapter
from src.infrastructure.rerankers.bge_cross_encoder import BGECrossEncoder
from src.infrastructure.llm.openai_adapter import OpenAIAdapter
from src.infrastructure.embeddings.bge_m3 import BGE_M3_Embedder
from src.infrastructure.web_search.tavily_adapter import TavilyAdapter
from src.application.retrieval_pipeline import RetrievalPipeline
from src.domain.ports import VectorStorePort, SparseRetrieverPort, GraphStorePort, RerankerPort, LLMClientPort, EmbedderPort, WebSearchPort

@lru_cache()
def get_vector_store() -> VectorStorePort:
    return QdrantAdapter()

@lru_cache()
def get_sparse_retriever() -> SparseRetrieverPort:
    return ElasticsearchAdapter()

@lru_cache()
def get_graph_store() -> GraphStorePort:
    return Neo4jAdapter()

@lru_cache()
def get_reranker() -> RerankerPort:
    return BGECrossEncoder()

@lru_cache()
def get_llm() -> LLMClientPort:
    return OpenAIAdapter()

@lru_cache()
def get_embedder() -> EmbedderPort:
    return BGE_M3_Embedder()

@lru_cache()
def get_web_search() -> WebSearchPort:
    if settings.tavily_api_key:
        return TavilyAdapter()
    return None

@lru_cache()
def get_pipeline() -> RetrievalPipeline:
    return RetrievalPipeline(
        vector_store=get_vector_store(),
        sparse=get_sparse_retriever(),
        graph=get_graph_store(),
        reranker=get_reranker(),
        llm=get_llm(),
        embedder=get_embedder(),
        web_search=get_web_search(),
    )
