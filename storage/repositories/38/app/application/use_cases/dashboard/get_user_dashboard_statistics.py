from app.application.interfaces.dashboard_repository import IDashboardRepository
from app.domain.entities.user import User


class GetUserDashboardStatisticsUseCase:

    def __init__(
        self,
        dashboard_repository: IDashboardRepository,
        user: User
    ):
        self.dashboard_repository = dashboard_repository
        self.user = user

    async def execute(self):
        return await self.dashboard_repository.get_user_statistics(
            self.user.id
        )