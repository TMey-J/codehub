from app.application.interfaces.repository_repository import IRepositoryRepository
from app.application.interfaces.star_repository import IRepositoryStarRepository
from app.domain.entities.repository import Repository
from app.domain.entities.user import User


class ToggleRepositoryStarUseCase:

    def __init__(
        self,
        repository_repository:IRepositoryRepository,
        repository_star_repository:IRepositoryStarRepository,
        user: User
    ):
        self.repository_repository = (
            repository_repository
        )

        self.repository_star_repository = (
            repository_star_repository
        )

        self.user = user

    async def execute(
        self,
        repository_id: int
    ):

        repository = (
            await self.repository_repository
            .get_by_id(repository_id)
        )

        if repository is None:
            raise ValueError(
                "Repository not found"
            )

        exists = (
            await self.repository_star_repository
            .exists(
                repository_id,
                self.user.id
            )
        )

        if exists:

            await self.repository_star_repository.remove(
                repository_id,
                self.user.id
            )

            return {
                "starred": False,
                "stars_count": repository.stars_count-1
            }

        if repository.owner_id==self.user.id:
            raise ValueError(
                "Cannot add star to your repository"
            )
        await self.repository_star_repository.add(
            repository_id,
            self.user.id
        )


        return {
            "starred": True,
            "stars_count": repository.stars_count+1
        }