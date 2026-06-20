import os
from datetime import datetime, timezone
from typing import List

from fastapi import UploadFile

from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.file import File
from app.domain.entities.user import User
from app.infrastructure.database.models.file import FileModel
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
            filename_from_path = os.path.basename(
                relative_path
            )
            if upload_file.filename != filename_from_path.split("/")[-1]:
                raise ValueError(
                    f"Filename mismatch: {upload_file.filename} != {relative_path}"
                )
            content = await upload_file.read()

            stored_name, file_path = (
                await self.storage_service.save_file(
                    repository_id=repository_id,
                    relative_path=relative_path,
                    content=content
                )
            )
            normalized_path = os.path.normpath(
                relative_path
            )

            if normalized_path.startswith(".."):
                raise ValueError(
                    "Invalid path"
                )
            existing_file:FileModel = await self.file_repository.get_by_path(
                repository_id,
                normalized_path
            )
            file_entity = File(
                repository_id=repository_id,

                file_name=upload_file.filename,

                relative_path=normalized_path,

                stored_name=stored_name,

                file_path=file_path,

                file_size=len(content)
            )

            if existing_file:
                file_entity.id = existing_file.id
                await self.file_repository.update(file_entity)
            else:
                await self.file_repository.create(
                    file_entity
                )
