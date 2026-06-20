from typing import List

from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.repository import Repository


class GetRepositoryUseCase:
    def __init__(self, repository_repository: IRepositoryRepository):
        self.repository_repository = repository_repository

    async def execute(self,owner_name,repo_name) -> List[Repository]:
        repository:Repository = await self.repository_repository.get_by_name(repo_name,None,owner_name=owner_name)
        if not repository:
            raise ValueError("repository not found")
        return repository
