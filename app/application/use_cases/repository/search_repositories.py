from app.application.interfaces.repository_repository import (
    IRepositoryRepository
)

from app.infrastructure.repositories.ai_request_repository import AIRequestRepository
from app.infrastructure.services.ai_service import AIService


class SearchRepositoriesUseCase:

    def __init__(
        self,
        repository_repository: IRepositoryRepository,
        ai_service: AIService,
        ai_request_repository: AIRequestRepository,
    ):
        self.repository_repository = repository_repository
        self.ai_service = ai_service
        self.ai_request_repository = ai_request_repository

    async def execute(
        self,
        query: str
    ):

        repositories = (
            await self.repository_repository.get_all()
        )

        repositories_data = [
            {
                "id": repo.id,
                "name": repo.name,
                "description": repo.description,
                "language": repo.language,
                "owner": repo.owner_name
            }
            for repo in repositories
        ]
        await self.ai_request_repository.create(
            user_id=None,
            service="repository_search"
        )
        repository_ids = (
            await self.ai_service.search(
                query=query,
                repositories=repositories_data
            )
        )

        return [
            repo
            for repo in repositories
            if repo.id in repository_ids
        ]