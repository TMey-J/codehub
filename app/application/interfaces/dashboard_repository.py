
from abc import ABC, abstractmethod

from app.domain.entities.dashboard_statistics import DashboardStatistics, DashboardUserStatistics


class IDashboardRepository(ABC):

    @abstractmethod
    async def get_public_statistics(
        self
    ) -> DashboardStatistics:
        ...

    @abstractmethod
    async def get_user_statistics(
        self,
        user_id: int
    ) -> DashboardUserStatistics:
        ...