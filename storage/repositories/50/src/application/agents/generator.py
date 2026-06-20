from src.domain.ports import LLMClientPort
from src.domain.entities import Document
from typing import List

class GeneratorAgent:
    def __init__(self, llm: LLMClientPort):
        self.llm = llm

    async def generate(self, query: str, docs: List[Document]) -> str:
        context = "\n\n".join([f"[{i+1}] {doc.content}" for i, doc in enumerate(docs)])
        prompt = f"""
        Answer the question based on the provided context.
        Question: {query}
        Context:
        {context}
        Cite sources using [number] at the end of each sentence if applicable.
        """
        return await self.llm.generate(prompt, system="You are a helpful assistant that answers accurately and cites sources.")
