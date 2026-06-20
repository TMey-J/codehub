from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from sqlalchemy.orm import selectinload

from app.domain.entities.user import User
from app.application.interfaces.user_repository import IUserRepository
from app.infrastructure.database.models.file import FileModel
from app.infrastructure.database.models.repository import RepositoryModel
from app.infrastructure.database.models.user import UserModel
from app.schemas.user_profile import UserProfileResponse


class UserRepository(IUserRepository):
    async def get_profile(
        self,
        username: str,
        page: int = 1,
        take: int = 20
    ) -> UserProfileResponse | None:

        result = await self.session.execute(
            select(UserModel)
            .where(UserModel.username == username)
        )

        user = result.scalar_one_or_none()

        if user is None:
            return None

        repositories_count = await self.session.scalar(
            select(func.count(RepositoryModel.id))
            .where(RepositoryModel.owner_id == user.id)
        ) or 0

        files_count = await self.session.scalar(
            select(func.count(FileModel.id))
            .join(
                RepositoryModel,
                RepositoryModel.id == FileModel.repository_id
            )
            .where(RepositoryModel.owner_id == user.id)
        ) or 0

        received_stars = await self.session.scalar(
            select(func.coalesce(func.sum(RepositoryModel.stars_count), 0))
            .where(RepositoryModel.owner_id == user.id)
        ) or 0

        repositories = (
            await self.session.execute(
                select(RepositoryModel)
                .where(RepositoryModel.owner_id == user.id)
                .offset((page - 1) * take)
                .limit(take)
            )
        ).scalars().all()
        repositories_entity=[self._map_to_domain(repository) for repository in repositories]
        return {
            "username": user.username,
            "created_at": user.created_at,
            "repositories_count": repositories_count,
            "files_count": files_count,
            "received_stars": received_stars,
            "repositories": repositories_entity,
            "repositories_total": repositories_count
        }

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user: User) -> User:
        db_user = UserModel(
            username=user.username,
            email=user.email,
            hashed_password=user.hashed_password
        )
        self.session.add(db_user)
        await self.session.commit()
        await self.session.refresh(db_user)

        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.session.execute(
            select(UserModel).where(UserModel.username == username)
        )
        db_user = result.scalar_one_or_none()

        if not db_user:
            return None

        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(UserModel).where(UserModel.email == email)
        )
        db_user = result.scalar_one_or_none()

        if not db_user:
            return None

        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )
    async def get_by_id(self, id: int) -> Optional[User]:
        result = await self.session.execute(
            select(UserModel).where(UserModel.id == id)
        )
        db_user = result.scalar_one_or_none()

        if not db_user:
            return None

        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )
    async def exists_by_username(self, username: str) -> bool:
        pass

    async def exists_by_email(self, email: str) -> bool:
        pass
