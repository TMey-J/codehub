from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.core.exceptions import AppException
from app.core.helpers import format_dt
from app.infrastructure.database.session import get_db
from app.schemas import ApiResponse
from app.schemas.Pagination import PagedResponse
from app.schemas.repository import RepositoryResponse
from app.schemas.user_profile import UserProfileResponse, UserProfileRepositoryResponse

router = APIRouter()

@router.get("/profile/{username}",response_model=ApiResponse[UserProfileResponse])
async def get_profile(
    username: str,
    page: int = 1,
    take: int = 20,
    db: AsyncSession = Depends(get_db)
):
    try:

        use_case = await dependencies.get_user_profile_use_case(db)

        profile = await use_case.execute(
            username=username,
            page=page,
            take=take
        )

        if profile is None:
            raise AppException(
                status_code=404,
                message="User not found"
            )

        return ApiResponse(
            is_success=True,
            errors=[],
            response=UserProfileResponse(
                username=profile["username"],
                created_at=format_dt(profile["created_at"]),
                repositories_count=profile["repositories_count"],
                files_count=profile["files_count"],
                received_stars=profile["received_stars"],
                repositories=PagedResponse(
                    items=[
                        RepositoryResponse(**repo.to_dict())
                        for repo in profile["repositories"]
                    ],
                    total_count=profile["repositories_total"],
                    page=page,
                    take=take,
                    total_pages=(profile["repositories_total"] + take - 1) // take
                )
            )
        )

    except ValueError as e:
        raise AppException(
            status_code=404,
            message=str(e)
        )