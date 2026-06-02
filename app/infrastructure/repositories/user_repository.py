from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.domain.entities.user import User
from app.application.interfaces.user_repository import IUserRepository
from app.infrastructure.database.models.user import UserModel


class UserRepository(IUserRepository):
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
