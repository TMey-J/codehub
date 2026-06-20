from sqlalchemy import select, delete, update

from app.application.interfaces.star_repository import (
    IRepositoryStarRepository
)
from app.infrastructure.database.models.repository import RepositoryModel
from app.infrastructure.database.models.star import (
    RepositoryStarModel
)


class RepositoryStarRepository(
    IRepositoryStarRepository
):

    async def is_starred(
            self,
            repository_id: int,
            user_id: int
    ) -> bool:
        stmt = (
            select(RepositoryStarModel.id)
            .where(
                RepositoryStarModel.repository_id == repository_id,
                RepositoryStarModel.user_id == user_id
            )
            .limit(1)
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none() is not None

    def __init__(self, session):
        self.session = session

    async def exists(
        self,
        repository_id: int,
        user_id: int
    ) -> bool:

        result = await self.session.execute(
            select(RepositoryStarModel)
            .where(
                RepositoryStarModel.repository_id
                == repository_id,

                RepositoryStarModel.user_id
                == user_id
            )
        )

        return result.scalar_one_or_none() is not None

    async def add(
            self,
            repository_id: int,
            user_id: int
    ):
        self.session.add(
            RepositoryStarModel(
                repository_id=repository_id,
                user_id=user_id
            )
        )

        await self.session.execute(
            update(RepositoryModel)
            .where(RepositoryModel.id == repository_id)
            .values(
                stars_count=RepositoryModel.stars_count + 1
            )
        )

        await self.session.commit()

    async def remove(
            self,
            repository_id: int,
            user_id: int
    ):
        await self.session.execute(
            delete(RepositoryStarModel)
            .where(
                RepositoryStarModel.repository_id == repository_id,
                RepositoryStarModel.user_id == user_id
            )
        )

        await self.session.execute(
            update(RepositoryModel)
            .where(RepositoryModel.id == repository_id)
            .values(
                stars_count=RepositoryModel.stars_count - 1
            )
        )

        await self.session.commit()