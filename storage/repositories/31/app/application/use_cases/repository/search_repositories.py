from app.application.interfaces.repository_repository import (
    IRepositoryRepository
)

from app.application.interfaces.repository_search_service import (
    IRepositorySearchService
)


class SearchRepositoriesUseCase:

    def __init__(
        self,
        repository_repository: IRepositoryRepository,
        search_service: IRepositorySearchService
    ):
        self.repository_repository = repository_repository
        self.search_service = search_service

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

        repository_ids = (
            await self.search_service.search(
                query=query,
                repositories=repositories_data
            )
        )

        return [
            repo
            for repo in repositories
            if repo.id in repository_ids
        ]