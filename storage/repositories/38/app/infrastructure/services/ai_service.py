import asyncio
import json
import re

from sambanova import SambaNova

from app.core.settings import settings


class AIService:

    def __init__(self):
        self.api_keys = settings.sambanova_api_keys

        if not self.api_keys:
            raise RuntimeError("No SambaNova API Keys found.")

        self.current_key = 0
        self.model = "gpt-oss-120b"

        self.client = self._create_client()

    # ----------------------------------

    def _create_client(self):
        return SambaNova(
            api_key=self.api_keys[self.current_key],
            base_url="https://api.sambanova.ai/v1",
        )

    # ----------------------------------

    def _next_key(self):
        self.current_key = (self.current_key + 1) % len(self.api_keys)
        self.client = self._create_client()

    # ----------------------------------

    async def _chat(
            self,
            *,
            messages,
            temperature=0.1,
            top_p=0.1,
    ) -> str:

        start_key = self.current_key

        while True:
            try:
                print(f"keyyyyyyyyy:{self.current_key}")
                response = await asyncio.to_thread(
                    self.client.chat.completions.create,
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    top_p=top_p,
                )

                return response.choices[0].message.content

            except Exception as e:

                error = str(e).lower()

                if (
                        "429" in error
                        or "rate_limit_daily" in error
                        or "1-day token limit" in error
                ):

                    self._next_key()

                    # اگر دوباره به کلید اولیه رسیدیم یعنی
                    # تمام کلیدها امتحان شده‌اند.
                    if self.current_key == start_key:
                        raise RuntimeError(
                            "All SambaNova API Keys have reached their daily limit."
                        )

                    continue

                raise

    # ----------------------------------

    def _clean_json_output(self, text: str) -> str:

        start = text.find("{")
        end = text.rfind("}")

        if start != -1 and end != -1:
            return text[start:end + 1]

        text = re.sub(r"^```[a-zA-Z]*\n", "", text)
        text = re.sub(r"\n```$", "", text)

        return text.strip()

    # ----------------------------------

    def _clean_markdown(self, text: str) ->str:

        text = re.sub(r"^```[a-zA-Z]*\n", "", text)
        text = re.sub(r"\n```$", "", text)

        return text.strip()

    # =======================================================
    # Vulnerability
    # =======================================================

    async def vulnerability(self, code: str):

        system_prompt = """
You are an expert DevSecOps analyzer.

Return ONLY valid JSON.

{
"scores":{
"readability":1,
"security":1,
"performance":1,
"maintainability":1
},
"overall_rating":"",
"critical_vulnerabilities":[],
"actionable_feedback":""
}
"""

        result = await self._chat(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": code
                }
            ]
        )

        return self._clean_json_output(result)

    # =======================================================
    # Vulnerability Persian
    # =======================================================

    async def vulnerability_persian(self, code: str):

        system_prompt = """
You are an expert DevSecOps analyzer.

Return ONLY valid JSON in Persian.

{
"scores":{
"readability":1,
"security":1,
"performance":1,
"maintainability":1
},
"overall_rating":"",
"critical_vulnerabilities":[],
"actionable_feedback":""
}
"""

        result = await self._chat(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": code
                }
            ]
        )

        return self._clean_json_output(result)

    # =======================================================
    # Optimization
    # =======================================================

    async def optimization(self, code: str):

        system_prompt = """
You are an elite software architect.

Return ONLY optimized code.

No markdown.
No explanations.
"""

        result = await self._chat(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": code
                }
            ]
        )

        return self._clean_markdown(result)

    # =======================================================
    # README
    # =======================================================

    async def readme(self, project_info: str):

        system_prompt = """
Generate a professional README.md.

Return ONLY markdown.
"""

        result = await self._chat(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": project_info
                }
            ],
            temperature=0.3,
            top_p=0.8
        )

        return result.strip()

    # =======================================================
    # README Persian
    # =======================================================

    async def readme_persian(self, project_info: str):

        system_prompt = """
Generate a professional README.md in Persian.

Return ONLY markdown.
"""

        result = await self._chat(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": project_info
                }
            ],
            temperature=0.3,
            top_p=0.8
        )

        return result.strip()

    # =======================================================
    # Select README files
    # =======================================================

    async def select_readme_files(
            self,
            files: list[dict]
    ) -> list[str]:

        prompt = "\n".join(
            f"{x['path']} ({x['lines']} lines)"
            for x in files
        )

        system_prompt = """
Choose only important files.

Return JSON only.

{
"files":[]
}
"""

        result = await self._chat(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        result = self._clean_json_output(result)

        return json.loads(result)["files"]

    # =======================================================
    # Search
    # =======================================================

    async def search(
            self,
            query: str,
            repositories: list[dict]
    ) -> list[int]:

        repositories_json = json.dumps(
            repositories,
            ensure_ascii=False
        )

        prompt = f"""
User Query:

{query}

Repositories:

{repositories_json}

Return ONLY JSON

{{
"repository_ids":[]
}}
"""

        result = await self._chat(
            messages=[
                {
                    "role": "system",
                    "content": """
You are a repository search engine.

Return only JSON.
"""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        result = self._clean_json_output(result)

        return json.loads(result)["repository_ids"]