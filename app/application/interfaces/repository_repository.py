from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.entities.repository import Repository
from app.infrastructure.database.models.repository import RepositoryModel


class IRepositoryRepository(ABC):
    @abstractmethod
    async def create(self, repository: Repository) -> Repository:
        pass

    @abstractmethod
    async def update(self, repository: Repository) -> Repository | None:
        pass

    @abstractmethod
    async def remove(self, repository:RepositoryModel):
        pass

    @abstractmethod
    async def get_by_id(self, repository_id: int,owner_id: Optional[int] = None) -> Optional[Repository]:
        pass

    @abstractmethod
    async def get_model_by_id(self, repository_id: int,owner_id: Optional[int] = None) -> Optional[RepositoryModel]:
        pass

    @abstractmethod
    async def get_by_name(self, repository_name: str,owner_id: Optional[int] = None,owner_name: Optional[str] = None) -> Optional[Repository]:
        pass

    @abstractmethod
    async def exists_by_name(self, repository_name: str) -> bool:
        pass

    @abstractmethod
    async def get_all(self, owner_id: Optional[int] = None) -> List[Repository]:
        pass
    @abstractmethod
    async def get_all_with_pagination(
            self,
            owner_id: Optional[int] = None,
            page: int = 1,
            take: int = 20,
            search: Optional[str] = None
    ) -> List[Repository]:
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
            updated_at=repository_model.updated_at
        )
