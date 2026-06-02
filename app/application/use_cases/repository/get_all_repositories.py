from typing import List

from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.repository import Repository
from app.domain.entities.user import User


class GetAllRepositoriesUseCase:
    def __init__(self, repository_repository: IRepositoryRepository,user:User):
        self.repository_repository = repository_repository
        self.user = user

    async def execute(self) -> List[Repository]:
        repositories:List[Repository] = await self.repository_repository.get_all(self.user.id)
        return repositories
