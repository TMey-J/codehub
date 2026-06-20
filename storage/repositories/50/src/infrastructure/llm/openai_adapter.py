from openai import AsyncOpenAI
from src.domain.ports import LLMClientPort
from src.config import settings
from typing import Optional

class OpenAIAdapter(LLMClientPort):
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    async def generate(self, prompt: str, system: Optional[str] = None) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        resp = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.1,
        )
        return resp.choices[0].message.content
