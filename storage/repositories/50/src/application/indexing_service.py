import asyncio
import uuid
from typing import Dict, Any, List
from src.domain.ports import VectorStorePort, SparseRetrieverPort, GraphStorePort, EmbedderPort
from src.infrastructure.chunking.semantic_chunker import SemanticChunker
from src.domain.entities import Document

class IndexingService:
    def __init__(self, vector: VectorStorePort, sparse: SparseRetrieverPort,
                 graph: GraphStorePort, embedder: EmbedderPort):
        self.vector = vector
        self.sparse = sparse
        self.graph = graph
        self.embedder = embedder
        self.chunker = SemanticChunker()

    async def index_document(self, text: str, metadata: Dict[str, Any]):
        doc_id = str(uuid.uuid4())
        doc = Document(id=doc_id, content=text, metadata=metadata)
        # 1. Chunk
        chunks = self.chunker.chunk(text, metadata)
        # 2. Embed each chunk and store in vector store
        for chunk in chunks:
            vec = await self.embedder.embed(chunk["content"])
            payload = {
                "content": chunk["content"],
                "metadata": chunk["metadata"],
                "parent_id": doc_id,
            }
            await self.vector.upsert(chunk["id"], vec, payload)
        # 3. Index in Elasticsearch (sparse)
        await self.sparse.index_document(doc_id, text, metadata)
        # 4. Extract entities and store in graph
        entities = self._extract_entities(text)
        for entity in entities:
            await self.graph.upsert_entity(entity, "UNKNOWN", {})
            await self.graph.link_entity_to_document(entity, doc_id)

    def _extract_entities(self, text: str) -> List[str]:
        try:
            import spacy
            nlp = spacy.load("en_core_web_sm")
            doc = nlp(text)
            return list(set(ent.text for ent in doc.ents if ent.label_ in ["PERSON", "ORG", "GPE", "PRODUCT"]))
        except:
            return []
