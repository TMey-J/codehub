import mimetypes
import os

from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.core.helpers import is_text_file
from app.domain.entities.user import User


class GetFileContentUseCase:

    def __init__(
        self,
        repository_repository: IRepositoryRepository,
        file_repository: IFileRepository
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

        try:
            if not is_text_file(file.file_name):
                return {
                    "id": file.id,
                    "file_name": file.file_name,
                    "relative_path": file.relative_path,
                    "content": None,
                    "file_size": file.file_size,
                    "is_binary": True,
                    "download_url": f"/api/v1/files/{file.id}/download"
                }
            with open(
                file.file_path,
                "r",
                encoding="utf-8"
            ) as f:

                content = f.read()

            return {
                "id": file.id,
                "file_name": file.file_name,
                "relative_path": file.relative_path,
                "content": content,
                "file_size": file.file_size,
                "is_binary": False,
                "download_url": f"/api/v1/files/{file.id}/download"
            }

        except UnicodeDecodeError:

            raise ValueError(
                "Binary files are not supported"
            )

