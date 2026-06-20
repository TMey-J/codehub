from abc import ABC, abstractmethod
from typing import Optional

from app.domain.entities.repository import Repository
from app.domain.entities.user import User
from app.infrastructure.database.models.repository import RepositoryModel
from app.schemas.user_profile import UserProfileResponse


class IUserRepository(ABC):
    @abstractmethod
    async def create(self, user: User) -> User:
        pass

    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        pass

    @abstractmethod
    async def exists_by_email(self, email: str) -> bool:
        pass

    @abstractmethod
    async def exists_by_username(self, username: str) -> bool:
        pass
    @abstractmethod
    async def get_profile(
        self,
        username: str,
        page: int = 1,
        take: int = 20
    ) -> UserProfileResponse | None:
        pass

    @staticmethod
    def _map_to_domain(repository_model: RepositoryModel) -> Repository:

        return Repository(
            name=repository_model.name,
            owner_id=repository_model.owner_id,
            owner_name=repository_model.owner.username,
            id=repository_model.id,
            description=repository_model.description,
            language=repository_model.language,
            visibility=repository_model.visibility,
            created_at=repository_model.created_at,
            updated_at=repository_model.updated_at,
            stars_count = repository_model.stars_count
        )
