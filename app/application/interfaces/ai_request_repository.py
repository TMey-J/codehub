from abc import ABC, abstractmethod


class IAIRequestRepository(ABC):

    @abstractmethod
    async def create(
        self,
        user_id: int | None,
        service: str
    ):
        pass