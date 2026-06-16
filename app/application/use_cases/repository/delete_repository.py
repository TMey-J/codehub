import shutil
from pathlib import Path

from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.user import User
from app.schemas.repository import DeleteRepositoryCommand


class DeleteRepositoryUseCase:
    def __init__(self, repository_repository: IRepositoryRepository,user:User):
        self.repository_repository = repository_repository
        self.user = user

    async def execute(self, command: DeleteRepositoryCommand):
        repository = await self.repository_repository.get_model_by_id(command.id,self.user.id)
        if repository is None:
            raise ValueError("repository not found exists")
        extract_path = Path(
            f"storage/repositories/{repository.id}"
        )

        if extract_path.exists():
            shutil.rmtree(extract_path)

        await self.repository_repository.remove(repository)

