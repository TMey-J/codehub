from app.application.interfaces.dashboard_repository import IDashboardRepository


class GetDashboardStatisticsUseCase:

    def __init__(
        self,
        dashboard_repository: IDashboardRepository,
    ):
        self.dashboard_repository = dashboard_repository

    async def execute(self):
        return await self.dashboard_repository.get_public_statistics()