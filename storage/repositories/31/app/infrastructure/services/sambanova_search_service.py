import json

from sambanova import SambaNova

from app.application.interfaces.repository_search_service import (
    IRepositorySearchService
)
from app.core.settings import settings


class SambaNovaSearchService(
    IRepositorySearchService
):

    def __init__(self):

        self.client = SambaNova(
            api_key=settings.SAMBANOVA_API_KEY,
            base_url="https://api.sambanova.ai/v1"
        )

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
            
            Return only valid json.
            
            Example:
            
            {{
                "repository_ids":[1,5,10]
            }}
            """
        response = (
            self.client.chat.completions.create(
                model="gpt-oss-120b",
                temperature=0,
                messages=[
                    {
                        "role":"system",
                        "content":
                        """
                            You are repository search engine.
                            
                            Analyze repositories and
                            return most relevant ids.
                            
                            Return JSON only.
                        """
                    },
                    {
                        "role":"user",
                        "content":prompt
                    }
                ]
            )
        )
        content = (
            response
            .choices[0]
            .message
            .content
        )

        result = json.loads(content)

        return result["repository_ids"]