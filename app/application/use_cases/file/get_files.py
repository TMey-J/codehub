from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.user import User


class GetFilesUseCase:

    def __init__(
        self,
        repository_repository: IRepositoryRepository,
        file_repository: IFileRepository
    ):
        self.repository_repository = repository_repository
        self.file_repository = file_repository

    async def execute(
        self,
        repository_id: int
    ):

        repository = await (
            self.repository_repository.get_by_id(
                repository_id
            )
        )

        if repository is None:
            raise ValueError(
                "Repository not found"
            )

        return await self.file_repository.get_all(
            repository_id
        )