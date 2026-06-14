from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.file import File
from app.infrastructure.database.models.file import FileModel
from app.application.interfaces.file_repository import IFileRepository


class FileRepository(IFileRepository):

    async def remove_all_by_repository_id(self, repository_id: int):
        result = await self.session.execute(
            select(FileModel)
            .where(FileModel.repository_id == repository_id)
        )

        models = result.scalars().all()

        if models is not None:
            for model in models:
                await self.session.delete(model)
            await self.session.commit()

    def __init__(self, session: AsyncSession):
        self.session = session

    def _map(self, model: FileModel):
        return File(
            id=model.id,
            repository_id=model.repository_id,
            file_name=model.file_name,
            relative_path=model.relative_path,
            stored_name=model.stored_name,
            file_path=model.file_path,
            file_size=model.file_size,
            uploaded_at=model.uploaded_at
        )

    async def create(self, file: File):
        model = FileModel(
            repository_id=file.repository_id,
            file_name=file.file_name,
            relative_path=file.relative_path,
            stored_name=file.stored_name,
            file_path=file.file_path,
            file_size=file.file_size
        )

        self.session.add(model)

        await self.session.commit()
        await self.session.refresh(model)

    async def get_by_id(self, file_id: int):

        result = await self.session.execute(
            select(FileModel)
            .where(FileModel.id == file_id)
        )

        model = result.scalar_one_or_none()

        return None if model is None else self._map(model)

    async def get_all(self, repository_id: int):

        result = await self.session.execute(
            select(FileModel)
            .where(FileModel.repository_id == repository_id)
        )

        return [
            self._map(x)
            for x in result.scalars().all()
        ]

    async def remove(self, file_id: int):

        result = await self.session.execute(
            select(FileModel)
            .where(FileModel.id == file_id)
        )

        model = result.scalar_one_or_none()

        if model:
            await self.session.delete(model)
            await self.session.commit()

    async def get_by_path(
            self,
            repository_id: int,
            relative_path: str
    ):
        result = await self.session.execute(
            select(FileModel)
            .where(
                FileModel.repository_id == repository_id,
                FileModel.relative_path == relative_path
            )
        )

        return result.scalar_one_or_none()