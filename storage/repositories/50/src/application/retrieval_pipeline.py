import asyncio
from typing import List, Dict, Any, Optional
from src.domain.ports import *
from src.domain.entities import Document, Query, Answer
from src.application.agents.grader import GraderAgent
from src.application.agents.rewriter import RewriterAgent
from src.application.agents.generator import GeneratorAgent

class RetrievalPipeline:
    def __init__(
        self,
        vector_store: VectorStorePort,
        sparse: SparseRetrieverPort,
        graph: GraphStorePort,
        reranker: RerankerPort,
        llm: LLMClientPort,
        embedder: EmbedderPort,
        web_search: Optional[WebSearchPort] = None,
    ):
        self.vector = vector_store
        self.sparse = sparse
        self.graph = graph
        self.reranker = reranker
        self.llm = llm
        self.embedder = embedder
        self.web_search = web_search
        self.grader = GraderAgent(llm)
        self.rewriter = RewriterAgent(llm)
        self.generator = GeneratorAgent(llm)

    async def execute(self, query_text: str, filters: Dict[str, Any]) -> Answer:
        # 1. Query expansion (HyDE + multi-query)
        expanded_queries = await self._expand_query(query_text)
        # 2. Retrieve initial set (top 100 from each)
        all_docs = await self._retrieve(query_text, filters, expanded_queries)
        # 3. Rerank to top 10
        reranked = await self.reranker.rerank(query_text, all_docs, top_n=10)
        # 4. Grade relevance
        grade = await self.grader.grade(query_text, reranked)
        # 5. Corrective step if low relevance and web search available
        if grade.score < 0.7 and self.web_search:
            new_query = await self.rewriter.rewrite(query_text, grade.feedback)
            web_docs = await self.web_search.search(new_query, top_k=5)
            # Combine and re-rerank
            combined = reranked + web_docs
            reranked = await self.reranker.rerank(new_query, combined, top_n=10)
            grade = await self.grader.grade(new_query, reranked)  # re-grade
        # 6. Compress context (simple: take top 5)
        compressed = reranked[:5]
        # 7. Generate answer with citations
        answer_text = await self.generator.generate(query_text, compressed)
        # 8. Return
        return Answer(text=answer_text, citations=compressed, confidence=grade.score)

    async def _expand_query(self, query: str) -> List[str]:
        # Generate hypothetical answer (HyDE)
        hyde_prompt = f"Write a short paragraph that answers the following question: {query}"
        hyde = await self.llm.generate(hyde_prompt)
        # Generate 2 variations
        var_prompt = f"Generate 2 alternative phrasings for the query: {query}. Return each on a new line."
        variations_raw = await self.llm.generate(var_prompt)
        variations = [v.strip() for v in variations_raw.split("\n") if v.strip()]
        return [query, hyde] + variations[:2]

    async def _retrieve(self, query: str, filters: Dict[str, Any], expanded: List[str]) -> List[Document]:
        tasks = []
        # Dense: embed each expanded query and search
        for q in expanded:
            vec = await self.embedder.embed(q)
            tasks.append(self.vector.similarity_search(vec, 100, filters))
        # Sparse BM25
        tasks.append(self.sparse.bm25_search(query, 100, filters))
        # Graph if entities found
        entities = self._extract_entities(query)
        if entities:
            tasks.append(self.graph.traverse(entities, depth=2))
        # Run all in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_docs = []
        for res in results:
            if isinstance(res, list):
                all_docs.extend(res)
        # Reciprocal Rank Fusion
        return self._rrf_fusion(all_docs)

    def _rrf_fusion(self, docs: List[Document]) -> List[Document]:
        scores = {}
        for rank, doc in enumerate(docs):
            if doc.id not in scores:
                scores[doc.id] = {"doc": doc, "rrf": 0}
            scores[doc.id]["rrf"] += 1 / (60 + rank + 1)
        sorted_items = sorted(scores.values(), key=lambda x: x["rrf"], reverse=True)
        return [item["doc"] for item in sorted_items]

    def _extract_entities(self, text: str) -> List[str]:
        # Simple NER using spaCy (lazy import)
        try:
            import spacy
            nlp = spacy.load("en_core_web_sm")
            doc = nlp(text)
            entities = [ent.text for ent in doc.ents if ent.label_ in ["PERSON", "ORG", "GPE", "PRODUCT"]]
            return list(set(entities))
        except ImportError:
            return []
        except OSError:
            return []
