from app.application.interfaces.star_repository import IRepositoryStarRepository
from app.domain.entities.user import User


class CheckStarUseCase:

    def __init__(
        self,
        repository_star_repository:IRepositoryStarRepository,
        user: User
    ):
        self.repository_star_repository = repository_star_repository
        self.user = user

    async def execute(
        self,
        repository_id: int
    ):
        is_starred = await self.repository_star_repository.exists(
                repository_id,
                self.user.id)

        return is_starred