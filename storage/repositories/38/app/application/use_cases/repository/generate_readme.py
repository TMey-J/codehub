from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.core.helpers import is_text_file
from app.domain.entities.file import File
from app.domain.entities.user import User
from app.infrastructure.database.models.file import FileModel
from app.infrastructure.repositories.ai_request_repository import AIRequestRepository
from app.infrastructure.services.ai_service import AIService
from app.infrastructure.storage.local_storage import LocalStorageService


class GenerateReadmeUseCase:

    def __init__(
        self,
        repository_repository: IRepositoryRepository,
        file_repository: IFileRepository,
        storage_service: LocalStorageService,
        ai_service: AIService,
        ai_request_repository: AIRequestRepository,
        user: User
    ):
        self.repository_repository = repository_repository
        self.file_repository = file_repository
        self.storage_service = storage_service
        self.ai_service = ai_service
        self.ai_request_repository = ai_request_repository
        self.user = user

    async def execute(
        self,
        repository_id: int,
        is_en: bool
    ):

        repository = await self.repository_repository.get_by_id(
            repository_id,
            self.user.id
        )

        if repository is None:
            raise ValueError("Repository not found")

        readme_file_model: FileModel = await self.file_repository.get_by_path(
            repository_id,
            "README.md"
        )

        if (
            readme_file_model and
            readme_file_model.uploaded_at >= repository.updated_at
        ):
            raise ValueError("Repository files not changed")

        files = await self.file_repository.get_all(repository_id)

        candidate_files = []
        file_cache = {}

        for file in files:

            if not is_text_file(file.relative_path):
                continue

            if file.relative_path.lower() == "readme.md":
                continue

            if file.file_size > 50000:
                continue

            try:

                content = await self.storage_service.read_file(
                    file.file_path
                )

                text = content.decode(
                    "utf-8",
                    errors="ignore"
                )

                file_cache[file.relative_path] = text

                candidate_files.append(
                    {
                        "path": file.relative_path,
                        "lines": len(text.splitlines())
                    }
                )

            except Exception:
                continue

        if not candidate_files:
            raise ValueError(
                "No readable source files found."
            )

        selected_paths = await self.ai_service.select_readme_files(
            candidate_files
        )

        prompt_parts = []

        for path in selected_paths:

            if path not in file_cache:
                continue

            prompt_parts.append(
                f"""
PATH:
{path}

CONTENT:
{file_cache[path]}
"""
            )

        project_info = "\n\n".join(prompt_parts)

        if is_en:
            readme_content = await self.ai_service.readme(
                project_info
            )
        else:
            readme_content = await self.ai_service.readme_persian(
                project_info
            )
        await self.ai_request_repository.create(
            user_id=self.user.id,
            service="readme"
        )
        stored_name, file_path = await self.storage_service.save_readme(
            repository_id,
            readme_content
        )

        if readme_file_model:

            readme_file_model.file_size = len(
                readme_content.encode("utf-8")
            )

            await self.file_repository.update(
                readme_file_model
            )

        else:

            await self.file_repository.create(
                File(
                    repository_id=repository_id,
                    file_name="README.md",
                    relative_path="README.md",
                    stored_name=stored_name,
                    file_path=file_path,
                    file_size=len(
                        readme_content.encode("utf-8")
                    )
                )
            )

        return {
            "content": readme_content,
            "file_path": file_path
        }