from typing import List

from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.repository import Repository
from app.domain.entities.user import User


class GetAllRepositoriesUseCase:
    def __init__(self, repository_repository: IRepositoryRepository,user:User | None):
        self.repository_repository = repository_repository
        self.current_user = user

    async def execute(
            self,
            page: int = 1,
            take: int = 20,
            search: str | None = None
    ):
        return await self.repository_repository.get_all_with_pagination(
            owner_id=self.current_user.id
            if self.current_user
            else None,
            page=page,
            take=take,
            search=search
        )
