from app.application.interfaces.repository_repository import IRepositoryRepository
from app.domain.entities.repository import Repository
from app.domain.entities.user import User
from app.schemas.repository import UpdateRepositoryCommand


class UpdateRepositoryUseCase:
    def __init__(self, repository_repository: IRepositoryRepository,user:User):
        self.repository_repository = repository_repository
        self.user = user

    async def execute(self, command: UpdateRepositoryCommand) -> Repository | None:
        repository = await self.repository_repository.get_by_name(command.name,self.user.id)
        if repository:
            raise ValueError("you already have one repository with this name")
        repository=Repository(
            id=command.id,
            name=command.name,
            owner_id=self.user.id,
            language=command.language,
            visibility=command.visibility,
            description=command.description
        )
        return await self.repository_repository.update(repository)
