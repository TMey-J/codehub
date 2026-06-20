import os

from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.user import User


class DownloadFileUseCase:

    def __init__(
        self,
        repository_repository: IRepositoryRepository,
        file_repository: IFileRepository,
    ):
        self.repository_repository = repository_repository
        self.file_repository = file_repository

    async def execute(
        self,
        repository_id: int,
        file_id: int
    ):

        repository = await self.repository_repository.get_by_id(
            repository_id
        )

        if repository is None:
            raise ValueError(
                "Repository not found"
            )

        file = await self.file_repository.get_by_id(
            file_id
        )

        if file is None:
            raise ValueError(
                "File not found"
            )

        if file.repository_id != repository_id:
            raise ValueError(
                "File does not belong to repository"
            )

        if not os.path.exists(file.file_path):
            raise ValueError(
                "Physical file not found"
            )

        return file