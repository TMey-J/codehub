import re
from sambanova import SambaNova
from app.core.settings import settings


class AIService:
    def __init__(self):
        self.client = SambaNova(
            api_key=settings.Samba_Nova_API_KEY,
            base_url="https://api.sambanova.ai/v1",
        )
        self.model = "gpt-oss-120b"

    def _clean_json_output(self, text: str) -> str:
        """
        Strips away conversational greetings (like 'Hello!') and markdown backticks,
        isolating only the raw JSON structure.
        """
        # 1. Find the first occurrence of '{' and the last occurrence of '}'
        start_idx = text.find('{')
        end_idx = text.rfind('}')

        # 2. If valid JSON brackets are found, slice the text to extract ONLY the JSON
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            return text[start_idx:end_idx + 1].strip()

        # Fallback to standard cleaning if brackets aren't found
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", text.strip())
        cleaned = re.sub(r"\n```$", "", cleaned)
        return cleaned.strip()

    def _clean_markdown(self, text: str) -> str:
        """Helper to remove markdown code block wrappers for optimization code."""
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", text.strip())
        cleaned = re.sub(r"\n```$", "", cleaned)
        return cleaned.strip()

    def vulnerability(self, code_snippet: str) -> str:
        system_prompt = (
            "You are an expert DevSecOps analyzer. Your sole purpose is to analyze the provided code "
            "and return a STRICT JSON object representing its quality and security. "
            "DO NOT include markdown backticks, conversational filler, or explanations outside the JSON. "
            "The JSON must strictly follow this schema:\n"
            "{\n"
            '  "scores": {\n'
            '    "readability": <int 1-10>,\n'
            '    "security": <int 1-10>,\n'
            '    "performance": <int 1-10>,\n'
            '    "maintainability": <int 1-10>\n'
            "  },\n"
            '  "overall_rating": "<must be one of: very bad, bad, Normal, good, very good>",\n'
            '  "critical_vulnerabilities": ["<list of potential security risks>"],\n'
            '  "actionable_feedback": "<string of actionable advice>"\n'
            "}"
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": code_snippet}
            ],
            temperature=0.1,
            top_p=0.1
        )

        raw_output = response.choices[0].message.content
        # Use the updated JSON extraction cleaner here
        return self._clean_json_output(raw_output)

    def optimization(self, code_snippet: str) -> str:
        system_prompt = (
            "You are an elite software architect. Your task is to refactor and optimize the provided code snippet. "
            "CRITICAL: Output absolutely NOTHING but the optimized code. "
            "Do NOT wrap it in markdown backticks. Do NOT provide any greetings or explanations. "
            "Start immediately with the first line of code and end with the last line."
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": code_snippet}
            ],
            temperature=0.1,
            top_p=0.1
        )

        raw_output = response.choices[0].message.content
        return self._clean_markdown(raw_output)

    def readme(self, project_info: str) -> str:
        system_prompt = (
            "You are an expert technical writer and developer advocate. "
            "Based on the provided code block or project description, generate a comprehensive, professional GitHub README.md file. "
            "Ensure the output is strictly formatted in Markdown. "
            "Do not include conversational filler; output only the Markdown content."
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": project_info}
            ],
            temperature=0.3,
            top_p=0.8
        )

        return response.choices[0].message.content.strip()

    def readme_persian(self, project_info: str) -> str:
        system_prompt = (
            "You are an expert technical writer and developer advocate. "
            "Based on the provided code block or project description, generate a comprehensive, professional GitHub README.md file in Persian (Farsi). "
            "Ensure the output is strictly formatted in Markdown. "
            "Do not include conversational filler; output only the Markdown content."
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": project_info}
            ],
            temperature=0.3,
            top_p=0.8
        )

        return response.choices[0].message.content.strip()