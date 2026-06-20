from src.domain.ports import LLMClientPort
from src.domain.value_objects import RelevanceGrade
from src.domain.entities import Document
from typing import List

class GraderAgent:
    def __init__(self, llm: LLMClientPort):
        self.llm = llm

    async def grade(self, query: str, documents: List[Document]) -> RelevanceGrade:
        if not documents:
            return RelevanceGrade(score=0.0, feedback="No documents retrieved.")
        # Truncate long content
        docs_text = "\n".join([f"- {doc.content[:300]}..." for doc in documents[:5]])
        prompt = f"""
        Query: "{query}"
        Retrieved documents:
        {docs_text}
        Rate the overall relevance on a scale 0.0–1.0 and give brief feedback.
        Output format: Score: <score>, Feedback: <feedback>
        """
        response = await self.llm.generate(prompt)
        try:
            score_part = response.split("Score:")[1].split(",")[0].strip()
            score = float(score_part)
            feedback = response.split("Feedback:")[1].strip()
        except:
            score = 0.5
            feedback = "Could not parse grade."
        return RelevanceGrade(score=max(0.0, min(1.0, score)), feedback=feedback)
