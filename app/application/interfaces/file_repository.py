from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.file import File


class IFileRepository(ABC):

    @abstractmethod
    async def create(self, file: File) -> File:
        pass

    @abstractmethod
    async def get_by_id(self, file_id: int) -> Optional[File]:
        pass

    @abstractmethod
    async def get_all(self, repository_id: int) -> List[File]:
        pass

    @abstractmethod
    async def remove(self, file_id: int):
        pass

    @abstractmethod
    async def remove_all_by_repository_id(self, repository_id: int):
        pass

    @abstractmethod
    async def get_by_path(
            self,
            repository_id: int,
            relative_path: str
    ):
        pass