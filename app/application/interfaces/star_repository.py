from abc import ABC, abstractmethod


class IRepositoryStarRepository(ABC):

    @abstractmethod
    async def exists(
        self,
        repository_id: int,
        user_id: int
    ) -> bool:
        pass

    @abstractmethod
    async def add(
        self,
        repository_id: int,
        user_id: int
    ):
        pass

    @abstractmethod
    async def remove(
        self,
        repository_id: int,
        user_id: int
    ):
        pass