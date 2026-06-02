from typing import List

from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.repository import Repository
from app.domain.entities.user import User


class GetRepositoryUseCase:
    def __init__(self, repository_repository: IRepositoryRepository,user:User):
        self.repository_repository = repository_repository
        self.user = user

    async def execute(self,repo_name) -> List[Repository]:
        repository:Repository = await self.repository_repository.get_by_name(repo_name,self.user.id)
        if not repository:
            raise ValueError("you don't have repository with this name")
        return repository
