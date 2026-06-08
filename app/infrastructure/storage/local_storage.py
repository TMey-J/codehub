import os
import uuid


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