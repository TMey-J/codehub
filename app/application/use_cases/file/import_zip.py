import asyncio
import shutil
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile
from fastapi import UploadFile

from app.application.interfaces.file_repository import IFileRepository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.file import File
from app.domain.entities.user import User
from app.infrastructure.storage.local_storage import LocalStorageService


class ImportZipUseCase:

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
        zip_file: UploadFile
    ):

        repository = await self.repository_repository.get_by_id(
            repository_id,self.current_user.id
        )

        if repository is None:
            raise ValueError(
                "Repository not found"
            )

        if not zip_file.filename.endswith(".zip"):
            raise ValueError(
                "Only zip file allowed"
            )

        content = await zip_file.read()

        temp_zip = Path(
            f"temp_{repository_id}.zip"
        )

        temp_zip.write_bytes(content)

        extract_path = Path(
            f"storage/repositories/{repository_id}"
        )

        if extract_path.exists():
            shutil.rmtree(extract_path)
            await self.file_repository.remove_all_by_repository_id(repository_id)

        extract_path.mkdir(
            parents=True,
            exist_ok=True
        )

        with ZipFile(temp_zip, "r") as zip_ref:

            await asyncio.to_thread(zip_ref.extractall, extract_path)

            for file_info in zip_ref.infolist():

                if file_info.is_dir():
                    continue

                relative_path = file_info.filename

                file_name = Path(
                    relative_path
                ).name

                physical_path = (
                    extract_path / relative_path
                )

                entity = File(
                    repository_id=repository_id,
                    file_name=file_name,
                    relative_path=relative_path,
                    stored_name=file_name,
                    file_path=str(
                        physical_path
                    ),
                    file_size=file_info.file_size
                )

                await self.file_repository.create(
                    entity
                )

        temp_zip.unlink(
            missing_ok=True
        )
        repository.updated_at = datetime.now(timezone.utc)
        await self.repository_repository.update(repository)