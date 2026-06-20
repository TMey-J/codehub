from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.file.delete_file import DeleteFileUseCase
from app.application.use_cases.file.download_file import DownloadFileUseCase
from app.application.use_cases.file.download_repository import DownloadRepositoryUseCase
from app.application.use_cases.file.get_file_content import GetFileContentUseCase
from app.application.use_cases.file.get_files import GetFilesUseCase
from app.application.use_cases.file.import_zip import ImportZipUseCase
from app.application.use_cases.file.optimization_file import OptimizationUseCase
from app.application.use_cases.file.replace_content import ReplaceContentUseCase
from app.application.use_cases.file.upload_file import UploadFileUseCase
from app.application.use_cases.file.vulnerability_file import VulnerabilityUseCase
from app.application.use_cases.repository.create_repository import CreateRepositoryUseCase
from app.application.use_cases.repository.delete_repository import DeleteRepositoryUseCase
from app.application.use_cases.repository.generate_readme import GenerateReadmeUseCase
from app.application.use_cases.repository.get_all_repositories import GetAllRepositoriesUseCase
from app.application.use_cases.repository.get_repository import GetRepositoryUseCase
from app.application.use_cases.repository.search_repositories import SearchRepositoriesUseCase
from app.application.use_cases.repository.toggle_star import ToggleRepositoryStarUseCase
from app.application.use_cases.repository.update_repository import UpdateRepositoryUseCase
from app.domain.entities.user import User
from app.infrastructure.repositories.file_repository import FileRepository
from app.infrastructure.repositories.repository_repository import RepositoryRepository
from app.infrastructure.repositories.star_repository import RepositoryStarRepository
from app.infrastructure.repositories.user_repository import UserRepository
from app.application.use_cases.auth.register_user import RegisterUserUseCase
from app.application.use_cases.auth.login_user import LoginUserUseCase
from app.infrastructure.services.ai_service import AIService
from app.infrastructure.storage.local_storage import LocalStorageService


# async def get_user_repository(db: AsyncSession):
#     return UserRepository(db)

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

async def get_get_all_repositories_use_case(db: AsyncSession,current_user: User|None):
    repo = RepositoryRepository(db)
    return GetAllRepositoriesUseCase(repo, current_user)

async def get_get_repository_use_case(db: AsyncSession):
    repo = RepositoryRepository(db)
    return GetRepositoryUseCase(repo)

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

async def get_get_files_use_case(
    db: AsyncSession
):
    return GetFilesUseCase(
        repository_repository=RepositoryRepository(db),
        file_repository=FileRepository(db)
    )

async def get_file_content_use_case(
    db: AsyncSession
):
    return GetFileContentUseCase(
        repository_repository=RepositoryRepository(db),
        file_repository=FileRepository(db),
    )

async def get_download_file_use_case(
    db: AsyncSession
):
    return DownloadFileUseCase(
        repository_repository=RepositoryRepository(db),
        file_repository=FileRepository(db)
    )

async def get_delete_file_use_case(
    db: AsyncSession,
    current_user: User
):

    return DeleteFileUseCase(
        repository_repository=RepositoryRepository(db),
        file_repository=FileRepository(db),
        storage_service=LocalStorageService(),
        current_user=current_user
    )

async def get_download_repository_use_case(
    db: AsyncSession
):

    return DownloadRepositoryUseCase(
        repository_repository=RepositoryRepository(
            db
        )
    )

async def get_search_repositories_use_case(
    db: AsyncSession
):

    return SearchRepositoriesUseCase(
        repository_repository=
            RepositoryRepository(db),

        ai_service=
            AIService()
    )

async def get_vulnerability_use_case(
    db: AsyncSession,
    current_user: User
):

    return VulnerabilityUseCase(
        file_repository=FileRepository(db),
        storage_service=LocalStorageService(),
        ai_service=AIService(),
        repository_repository = RepositoryRepository(db),
        user = current_user
    )

async def get_optimization_use_case(
    db: AsyncSession,
    current_user: User
):

    return OptimizationUseCase(
        file_repository=FileRepository(db),
        storage_service=LocalStorageService(),
        ai_service=AIService(),
        repository_repository = RepositoryRepository(db),
        user=current_user
    )

async def get_generate_readme_use_case(
    db: AsyncSession,
    current_user: User
):

    return GenerateReadmeUseCase(
        repository_repository=RepositoryRepository(db),
        file_repository=FileRepository(db),
        storage_service=LocalStorageService(),
        ai_service=AIService(),
        user=current_user
    )

async def get_change_file_content_use_case(
    db: AsyncSession,
    current_user: User
):

    return ReplaceContentUseCase(
        file_repository=FileRepository(db),
        storage_service=LocalStorageService(),
        user=current_user,
        repository_repository=RepositoryRepository(db)
    )

async def get_toggle_repository_star_use_case(
    db: AsyncSession,
    user: User
):
    return ToggleRepositoryStarUseCase(
        repository_repository=
            RepositoryRepository(db),

        repository_star_repository=
            RepositoryStarRepository(db),

        user=user
    )