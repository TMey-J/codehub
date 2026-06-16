from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, false, func
from typing import Optional, List

from sqlalchemy.orm import selectinload

from app.domain.entities.repository import Repository
from app.application.interfaces.repository_repository import IRepositoryRepository
from app.infrastructure.database.models.repository import RepositoryModel
from app.infrastructure.database.models.user import UserModel


class RepositoryRepository(IRepositoryRepository):
    async def remove(self, repository:RepositoryModel):
        await self.session.delete(repository)
        await self.session.commit()

    async def update(self, repository: Repository) -> Repository | None:
        stmt = (
            select(RepositoryModel).where(RepositoryModel.id == repository.id)
            .options(
                selectinload(
                    RepositoryModel.owner
                )
            )
        )
        result = await self.session.execute(stmt)
        repository_model:RepositoryModel = result.scalar_one_or_none()
        if repository_model is None:
            return None
        repository_model.name = repository.name
        repository_model.visibility = repository.visibility
        repository_model.language = repository.language
        repository_model.description = repository.description
        repository_model.updated_at=datetime.now(timezone.utc)
        repository_model.created_at=repository.created_at
        search_text = f"""
        Name:
        {repository.name}

        Description:
        {repository.description or ''}

        Language:
        {repository.language or ''}

        README:
        {''}
        """
        repository_model.search_text=search_text
        await self.session.commit()

        return self._map_to_domain(repository_model)

    async def get_all_with_pagination(
            self,
            owner_id: Optional[int] = None,
            page: int = 1,
            take: int = 20,
            search: Optional[str] = None
    ) -> List[Repository]:

        stmt = (
            select(RepositoryModel)
            .options(
                selectinload(
                    RepositoryModel.owner
                )
            )
        )
        count_stmt = select(func.count()).select_from(
            RepositoryModel
        )
        if owner_id is not None:
            stmt = stmt.where(
                RepositoryModel.owner_id == owner_id
            )
            count_stmt = count_stmt.where(
                RepositoryModel.owner_id == owner_id
            )


        if search:
            stmt = stmt.where(
                RepositoryModel.name.ilike(
                    f"%{search}%"
                )
            )
            count_stmt = count_stmt.where(
                RepositoryModel.name.ilike(
                    f"%{search}%"
                )
            )

        total_count = await self.session.scalar(
            count_stmt
        )
        stmt = stmt.order_by(RepositoryModel.updated_at.desc())
        stmt = (
            stmt
            .offset((page - 1) * take)
            .limit(take)
        )

        result = await self.session.execute(stmt)

        repositories = result.scalars().all()
        repositories_model=[self._map_to_domain(repository) for repository in repositories]
        return {
            "items": repositories_model,
            "total_count": total_count
        }

    async def get_all(self, owner_id: Optional[int] = None) -> List[Repository]:

        stmt = (
            select(RepositoryModel)
            .options(
                selectinload(
                    RepositoryModel.owner
                )
            )
        )
        if owner_id is not None:
            stmt = stmt.where(RepositoryModel.owner_id == owner_id)
        result = await self.session.execute(stmt)
        repositories = result.scalars().all()

        return [
            self._map_to_domain(repository)
            for repository in repositories
        ]

    async def create(self, repository: Repository) -> Repository:

        search_text = f"""
        Name:
        {repository.name}

        Description:
        {repository.description or ''}

        Language:
        {repository.language or ''}

        README:
        {''}
        """
        repository_model=RepositoryModel(
            name=repository.name,
            description=repository.description,
            visibility=repository.visibility,
            owner_id=repository.owner_id,
            language=repository.language,
            search_text=search_text
        )

        self.session.add(repository_model)
        await self.session.commit()
        await self.session.refresh(repository_model)
        result = await self.session.execute(
            select(RepositoryModel)
            .options(
                selectinload(
                    RepositoryModel.owner
                )
            )
            .where(
                RepositoryModel.id == repository_model.id
            )
        )

        repository_model = result.scalar_one()
        return self._map_to_domain(repository_model)

    async def get_by_id(self, repository_id: int,owner_id: Optional[int] = None) -> Optional[Repository]:
        stmt = (
            select(RepositoryModel).where(RepositoryModel.id == repository_id)
            .options(
                selectinload(
                    RepositoryModel.owner
                )
            )
        )
        if owner_id is not None:
            stmt = stmt.where(RepositoryModel.owner_id == owner_id)
        result = await self.session.execute(stmt)
        repository = result.scalar_one_or_none()

        if repository is None:
            return None

        return self._map_to_domain(repository)

    async def get_by_name(self, repository_name: str,owner_id: Optional[int] = None,owner_name: Optional[str] = None) -> Optional[Repository]:
        stmt = (
            select(RepositoryModel).where(RepositoryModel.name == repository_name)
            .options(
                selectinload(
                    RepositoryModel.owner
                )
            )
        )
        if owner_id is not None:
            stmt = stmt.where(RepositoryModel.owner_id == owner_id)
        if owner_name is not None:
            stmt = stmt.where(
                RepositoryModel.owner.has(
                    username=owner_name
                )
            )

        result = await self.session.execute(stmt)
        repository = result.scalar_one_or_none()

        if repository is None:
            return None

        return self._map_to_domain(repository)

    async def exists_by_id(self, repository_id: str, owner_id: Optional[int] = None) -> bool:
        stmt = (
            select(RepositoryModel)
            .where(RepositoryModel.id == repository_id)
            .options(selectinload(RepositoryModel.owner))
        )
        if owner_id is not None:
            stmt = stmt.where(RepositoryModel.owner_id == owner_id)

        # Convert to existence check
        exists_stmt = stmt.exists()

        # Execute and get scalar result
        result = await self.session.scalar(select(exists_stmt))
        return result

    async def get_model_by_id(self, repository_id: int,owner_id: Optional[int] = None) -> Optional[Repository]:
        stmt=select(RepositoryModel).where(RepositoryModel.id == repository_id)
        if owner_id is not None:
            stmt = stmt.where(RepositoryModel.owner_id == owner_id)
        result = await self.session.execute(stmt)
        repository = result.scalar_one_or_none()

        if repository is None:
            return None
        return  repository
    def __init__(self, session: AsyncSession):
        self.session = session


