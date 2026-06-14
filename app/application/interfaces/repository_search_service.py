from abc import ABC, abstractmethod


class IRepositorySearchService(ABC):

    @abstractmethod
    async def search(
        self,
        query: str,
        repositories: list[dict]
    ) -> list[int]:
        pass