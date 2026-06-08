import os
from typing import List

from fastapi import UploadFile

from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.file import File
from app.domain.entities.user import User
from app.infrastructure.storage.local_storage import LocalStorageService


class UploadFileUseCase:

    def __init__(
        self,
        repository_repository:IRepositoryRepository,
        file_repository:IFileRepository,
        storage_service:LocalStorageService,
        current_user:User
    ):
        self.repository_repository = repository_repository
        self.file_repository = file_repository
        self.storage_service = storage_service
        self.current_user = current_user

    async def execute(
            self,
            repository_id: int,
            files: list[UploadFile],
            paths: list[str]
    ):

        repository = await self.repository_repository.get_by_id(
            repository_id,self.current_user.id
        )

        if repository is None:
            raise ValueError(
                "Repository not found"
            )


        for upload_file, relative_path in zip(
                files,
                paths
        ):
            content = await upload_file.read()

            stored_name, file_path = (
                await self.storage_service.save_file(
                    repository_id=repository_id,
                    relative_path=relative_path,
                    content=content
                )
            )

            file_entity = File(
                repository_id=repository_id,

                file_name=upload_file.filename,

                relative_path=relative_path,

                stored_name=stored_name,

                file_path=file_path,

                file_size=len(content)
            )

            await self.file_repository.create(
                file_entity
            )
