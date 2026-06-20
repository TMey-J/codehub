from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.core.helpers import is_text_file
from app.domain.entities.user import User
from app.infrastructure.services.ai_service import AIService
from app.infrastructure.storage.local_storage import LocalStorageService


class OptimizationUseCase:
    def __init__(
        self,
        file_repository: IFileRepository,
        repository_repository: IRepositoryRepository,
        storage_service: LocalStorageService,
        ai_service: AIService,
        user=User

    ):
        self.file_repository = file_repository
        self.repository_repository = repository_repository
        self.storage_service = storage_service
        self.ai_service = ai_service
        self.user = user

    async def execute(
        self,
        file_id: int
    ):
        file = await self.file_repository.get_by_id(
            file_id
        )

        if file is None:
            raise ValueError("File not found")

        is_user_owner=await self.repository_repository.exists_by_id(
            repository_id=file.repository_id,owner_id=self.user.id)

        if not is_user_owner:
            raise ValueError(
                "File not found"
            )
        if not is_text_file(
                file.relative_path
        ):
            raise ValueError("File must be a text file")

        content = await self.storage_service.read_file(
            file.file_path
        )

        return await self.ai_service.optimization(
            content.decode("utf-8",errors="ignore")
        )