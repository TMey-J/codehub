from sqlalchemy.ext.asyncio import AsyncSession
from app.application.use_cases.repository.create_repository import CreateRepositoryUseCase
from app.application.use_cases.repository.get_all_repositories import GetAllRepositoriesUseCase
from app.application.use_cases.repository.get_repository import GetRepositoryUseCase
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.repository_repository import RepositoryRepository
from app.infrastructure.repositories.user_repository import UserRepository
from app.application.use_cases.auth.register_user import RegisterUserUseCase
from app.application.use_cases.auth.login_user import LoginUserUseCase

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

async def get_get_all_repositories_use_case(db: AsyncSession,current_user: User):
    repo = RepositoryRepository(db)
    return GetAllRepositoriesUseCase(repo, current_user)

async def get_get_repository_use_case(db: AsyncSession,current_user: User):
    repo = RepositoryRepository(db)
    return GetRepositoryUseCase(repo, current_user)