from src.domain.ports import LLMClientPort

class RewriterAgent:
    def __init__(self, llm: LLMClientPort):
        self.llm = llm

    async def rewrite(self, query: str, feedback: str = "") -> str:
        prompt = f"""
        The user asked: "{query}"
        {feedback if feedback else "Rewrite this query to improve retrieval."}
        Provide a single, rewritten query.
        """
        return await self.llm.generate(prompt)
