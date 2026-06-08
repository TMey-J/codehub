from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.file.import_zip import ImportZipUseCase
from app.application.use_cases.file.upload_file import UploadFileUseCase
from app.application.use_cases.repository.create_repository import CreateRepositoryUseCase
from app.application.use_cases.repository.delete_repository import DeleteRepositoryUseCase
from app.application.use_cases.repository.get_all_repositories import GetAllRepositoriesUseCase
from app.application.use_cases.repository.get_repository import GetRepositoryUseCase
from app.application.use_cases.repository.update_repository import UpdateRepositoryUseCase
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.file_repository import FileRepository
from app.infrastructure.repositories.repository_repository import RepositoryRepository
from app.infrastructure.repositories.user_repository import UserRepository
from app.application.use_cases.auth.register_user import RegisterUserUseCase
from app.application.use_cases.auth.login_user import LoginUserUseCase
from app.infrastructure.storage.local_storage import LocalStorageService


async def get_user_repository(db: AsyncSession = None):
    if db is None:
        async for session in get_db():
            db = session
            break
    return UserRepository(db)

async def get_register_use_case(db: AsyncSession):
    repo = UserRepository(db)
    return RegisterUserUseCase(repo)

async def get_login_use_case(db: AsyncSession):
    repo = UserRepository(db)
    return LoginUserUseCase(repo)

async def get_create_repository_use_case(db: AsyncSession,current_user: User):
    repo = RepositoryRepository(db)
    return CreateRepositoryUseCase(repo,current_user)

async def get_update_repository_use_case(db: AsyncSession,current_user: User):
    repo = RepositoryRepository(db)
    return UpdateRepositoryUseCase(repo,current_user)

async def get_delete_repository_use_case(db: AsyncSession,current_user: User):
    repo = RepositoryRepository(db)
    return DeleteRepositoryUseCase(repo,current_user)

async def get_get_all_repositories_use_case(db: AsyncSession,current_user: User):
    repo = RepositoryRepository(db)
    return GetAllRepositoriesUseCase(repo, current_user)

async def get_get_repository_use_case(db: AsyncSession,current_user: User):
    repo = RepositoryRepository(db)
    return GetRepositoryUseCase(repo, current_user)

async def get_upload_file_use_case(
    db: AsyncSession,
    current_user: User
):

    return UploadFileUseCase(
        repository_repository=RepositoryRepository(db),
        file_repository=FileRepository(db),
        storage_service=LocalStorageService(),
        current_user=current_user
    )

async def get_import_zip_use_case(
    db: AsyncSession,
    current_user: User
):
    return ImportZipUseCase(
        repository_repository=RepositoryRepository(db),
        file_repository=FileRepository(db),
        storage_service=LocalStorageService(),
        current_user=current_user
    )