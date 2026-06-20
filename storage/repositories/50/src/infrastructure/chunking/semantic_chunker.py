import re
import asyncio
from sentence_transformers import SentenceTransformer
import numpy as np
from src.domain.ports import ChunkerPort
from typing import List, Dict, Any
import uuid

class SemanticChunker(ChunkerPort):
    def __init__(self, model_name: str = "BAAI/bge-m3", threshold: float = 0.7):
        self.model = SentenceTransformer(model_name)
        self.threshold = threshold

    def chunk(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Since this runs synchronously in an async context, we call it via to_thread
        sentences = self._split_sentences(text)
        if len(sentences) <= 1:
            return [{"id": str(uuid.uuid4()), "content": text, "metadata": metadata, "index": 0}]
        embeddings = self.model.encode(sentences)
        chunks = []
        current = [sentences[0]]
        for i in range(1, len(sentences)):
            sim = np.dot(embeddings[i-1], embeddings[i]) / (np.linalg.norm(embeddings[i-1]) * np.linalg.norm(embeddings[i]))
            if sim >= self.threshold:
                current.append(sentences[i])
            else:
                chunks.append(" ".join(current))
                current = [sentences[i]]
        if current:
            chunks.append(" ".join(current))
        # Add overlap
        overlapped = []
        for i, chunk_text in enumerate(chunks):
            if i > 0:
                prev_sentences = chunks[i-1].split(". ")
                overlap = prev_sentences[-1] if prev_sentences else ""
                if overlap:
                    chunk_text = overlap + ". " + chunk_text
            overlapped.append({
                "id": str(uuid.uuid4()),
                "content": chunk_text,
                "metadata": metadata,
                "index": i,
            })
        return overlapped

    def _split_sentences(self, text: str) -> List[str]:
        # Simple sentence split
        return re.split(r'(?<=[.!?]) +', text)
