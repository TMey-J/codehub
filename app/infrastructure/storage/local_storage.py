import os
import uuid
from pathlib import Path


class LocalStorageService:

    ROOT_PATH = "storage/repositories"

    async def save_file(
        self,
        repository_id: int,
        relative_path: str,
        content: bytes
    ):
        repo_dir = os.path.join(
            self.ROOT_PATH,
            str(repository_id)
        )

        full_path = os.path.join(
            repo_dir,
            relative_path
        )

        directory = os.path.dirname(
            full_path
        )

        os.makedirs(
            directory,
            exist_ok=True
        )

        with open(full_path, "wb") as f:
            f.write(content)

        stored_name = str(uuid.uuid4())

        return stored_name, full_path

    async def delete_file(self, path: str):

        if os.path.exists(path):
            os.remove(path)


    async def read_file(
            self,
            file_path: str
    ) -> bytes:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        return path.read_bytes()

    async def write_file(
            self,
            file_path: str,
            content: str
    ):
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )
        with open(file_path, "w") as f:
            f.write(content)


    async def save_readme(
            self,
            repository_id: int,
            content: str
    ) -> tuple[str, str]:

        repository_path = (
                Path(self.ROOT_PATH)
                / str(repository_id)
        )

        repository_path.mkdir(
            parents=True,
            exist_ok=True
        )

        readme_path = repository_path / "README.md"

        readme_path.write_text(
            content,
            encoding="utf-8"
        )

        return (
            "README.md",
            str(readme_path)
        )