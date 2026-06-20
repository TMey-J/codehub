import os

from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.user import User
from app.infrastructure.storage.local_storage import LocalStorageService


class DeleteFileUseCase:

    def __init__(
        self,
        repository_repository: IRepositoryRepository,
        file_repository: IFileRepository,
        storage_service: LocalStorageService,
        current_user: User
    ):
        self.repository_repository = repository_repository
        self.file_repository = file_repository
        self.storage_service = storage_service
        self.current_user = current_user

    async def execute(
        self,
        repository_id: int,
        file_id: int
    ):

        repository = await self.repository_repository.get_by_id(
            repository_id,
            self.current_user.id
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

        await self.storage_service.delete_file(
            file.file_path
        )

        await self.file_repository.remove(
            file.id
        )

        return True