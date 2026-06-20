from datetime import datetime, timezone

from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.user import User
from app.infrastructure.storage.local_storage import LocalStorageService


class ReplaceContentUseCase:

    def __init__(
        self,
        file_repository: IFileRepository,
        repository_repository: IRepositoryRepository,
        storage_service: LocalStorageService,
        user=User
    ):
        self.file_repository = file_repository
        self.repository_repository = repository_repository
        self.storage_service = storage_service
        self.user = user

    async def execute(
        self,
        file_id: int,
        content: str

    ):

        file = await self.file_repository.get_by_id(file_id)
        if file is None:
            raise ValueError(
                "File not found"
            )

        is_user_owner=await self.repository_repository.exists_by_id(
            repository_id=file.repository_id,owner_id=self.user.id)

        if not is_user_owner:
            raise ValueError(
                "File not found"
            )

        await self.storage_service.write_file(file.file_path, content)
        file.file_size=len(content)
        file.uploaded_at = datetime.now(timezone.utc)
        await self.file_repository.update(file)
