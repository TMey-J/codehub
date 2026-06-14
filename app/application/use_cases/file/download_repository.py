import os
import zipfile

from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.user import User


class DownloadRepositoryUseCase:

    def __init__(
        self,
        repository_repository: IRepositoryRepository
    ):
        self.repository_repository = repository_repository

    async def execute(
        self,
        repository_id: int
    ):

        repository = await self.repository_repository.get_by_id(
            repository_id
        )

        if repository is None:
            raise ValueError(
                "Repository not found"
            )

        repo_path = os.path.join(
            "storage",
            "repositories",
            str(repository_id)
        )

        if not os.path.exists(repo_path):
            raise ValueError(
                "Repository files not found"
            )

        os.makedirs(
            "tmp",
            exist_ok=True
        )

        zip_path = os.path.join(
            "tmp",
            f"repo_{repository.name}.zip"
        )

        with zipfile.ZipFile(
            zip_path,
            "w",
            zipfile.ZIP_DEFLATED
        ) as zip_file:

            for root, dirs, files in os.walk(
                repo_path
            ):

                for file_name in files:

                    full_path = os.path.join(
                        root,
                        file_name
                    )

                    relative_path = os.path.relpath(
                        full_path,
                        repo_path
                    )

                    zip_file.write(
                        full_path,
                        relative_path
                    )

        return zip_path