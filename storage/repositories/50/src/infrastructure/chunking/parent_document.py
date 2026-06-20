from src.domain.entities import Document, Chunk
from typing import List

class ParentDocumentRetriever:
    def __init__(self, chunker: SemanticChunker):
        self.chunker = chunker

    def chunk_document(self, doc: Document) -> List[Chunk]:
        chunks = self.chunker.chunk(doc.content, doc.metadata)
        return [
            Chunk(
                id=f"{doc.id}_{chunk['index']}",
                content=chunk["content"],
                metadata=chunk["metadata"],
                parent_id=doc.id,
                chunk_index=chunk["index"],
            )
            for chunk in chunks
        ]

    # For retrieval, we might retrieve child chunks and then fetch parent content
    async def enrich_with_parent(self, child_docs: List[Chunk], parent_store) -> List[Document]:
        # In practice, we'd fetch parent from a store (e.g., another collection)
        # For simplicity, we return the child docs
        return child_docs
