from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.core.security import get_current_user
from app.domain.entities.dashboard_statistics import DashboardUserStatistics
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.schemas import ApiResponse
from app.schemas.dashboard import DashboardStatisticsResponse

router = APIRouter()

@router.get(
    "",
    response_model=ApiResponse[DashboardStatisticsResponse]
)
async def dashboard(
    db: AsyncSession = Depends(get_db)
):

    use_case = await dependencies.get_dashboard_use_case(
        db
    )

    result = await use_case.execute()

    return ApiResponse(
        is_success=True,
        errors=[],
        response=DashboardStatisticsResponse(
            **result.__dict__
        )
    )

@router.get(
    "/user",
    response_model=ApiResponse[DashboardUserStatistics]
)
async def user_dashboard(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):

    use_case = await dependencies.get_user_dashboard_use_case(
        db,
        user
    )

    result = await use_case.execute()

    return ApiResponse(
        is_success=True,
        errors=[],
        response=DashboardUserStatistics(
            **result.__dict__
        )
    )