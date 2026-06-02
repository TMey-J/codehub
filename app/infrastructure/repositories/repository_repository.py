from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from app.domain.entities.repository import Repository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.infrastructure.database.models.repository import RepositoryModel


class RepositoryRepository(IRepositoryRepository):
    async def get_all(self,owner_id: Optional[int] = None) -> List[Repository]:

        stmt=select(RepositoryModel)
        if owner_id is not None:
            stmt = stmt.where(RepositoryModel.owner_id == owner_id)
        result = await self.session.execute(stmt)
        repositories = result.scalars().all()

        return [
            self._map_to_domain(repository)
            for repository in repositories
        ]

    async def create(self, repository: Repository) -> Repository:
        repository_model=RepositoryModel(
            name=repository.name,
            description=repository.description,
            visibility=repository.visibility,
            owner_id=repository.owner_id,
            language=repository.language
        )
        repository_model.name=repository.name
        self.session.add(repository_model)
        await self.session.commit()
        await self.session.refresh(repository_model)

        return self._map_to_domain(repository_model)

    async def get_by_id(self, repository_id: int) -> Optional[Repository]:
        result=await self.session.execute(
            select(RepositoryModel).where(RepositoryModel.id == repository_id)
        )
        repository=result.scalar_one_or_none()

        if repository is None:
            return None
        return self._map_to_domain(repository)

    async def get_by_name(self, repository_name: str,owner_id: Optional[int] = None) -> Optional[Repository]:
        stmt=select(RepositoryModel).where(RepositoryModel.name == repository_name)
        if owner_id is not None:
            stmt = stmt.where(RepositoryModel.owner_id == owner_id)
        result = await self.session.execute(stmt)
        repository = result.scalar_one_or_none()

        if repository is None:
            return None

        return self._map_to_domain(repository)

    async def exists_by_name(self, repository_name: str) -> bool:
        result = await self.session.execute(
            select(RepositoryModel)
            .where(RepositoryModel.name == repository_name)
            .exists()
        )

        return result.scalar()

    def __init__(self, session: AsyncSession):
        self.session = session


