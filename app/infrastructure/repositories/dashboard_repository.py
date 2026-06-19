# app/infrastructure/repositories/dashboard_repository.py

from sqlalchemy import func
from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.interfaces.dashboard_repository import (
    IDashboardRepository,
)

from app.domain.entities.dashboard_statistics import (
    DashboardStatistics, DashboardUserStatistics,
)

from app.infrastructure.database.models.ai_request import (
    AIRequestModel,
)

from app.infrastructure.database.models.file import (
    FileModel,
)

from app.infrastructure.database.models.repository import (
    RepositoryModel,
)

from app.infrastructure.database.models.user import (
    UserModel,
)


class DashboardRepository(IDashboardRepository):

    def __init__(
        self,
        session: AsyncSession
    ):
        self.session = session

    async def get_public_statistics(
        self
    ) -> DashboardStatistics:

        stmt = select(

            (
                select(
                    func.count(
                        RepositoryModel.id
                    )
                ).scalar_subquery()
            ).label(
                "repositories"
            ),

            (
                select(
                    func.count(
                        FileModel.id
                    )
                ).scalar_subquery()
            ).label(
                "files"
            ),

            (
                select(
                    func.count(
                        UserModel.id
                    )
                ).scalar_subquery()
            ).label(
                "users"
            ),

            (
                select(
                    func.coalesce(
                        func.sum(
                            RepositoryModel.stars_count
                        ),
                        0
                    )
                ).scalar_subquery()
            ).label(
                "stars"
            ),

            (
                select(
                    func.count(
                        AIRequestModel.id
                    )
                )
                .where(
                    AIRequestModel.service == "vulnerability"
                )
                .scalar_subquery()
            ).label(
                "vulnerability"
            ),

            (
                select(
                    func.count(
                        AIRequestModel.id
                    )
                )
                .where(
                    AIRequestModel.service == "optimization"
                )
                .scalar_subquery()
            ).label(
                "optimization"
            ),

            (
                select(
                    func.count(
                        AIRequestModel.id
                    )
                )
                .where(
                    AIRequestModel.service == "readme"
                )
                .scalar_subquery()
            ).label(
                "readme"
            ),

            (
                select(
                    func.count(
                        AIRequestModel.id
                    )
                )
                .where(
                    AIRequestModel.service == "repository_search"
                )
                .scalar_subquery()
            ).label(
                "repository_search"
            )
        )

        result = (
            await self.session.execute(
                stmt
            )
        ).one()

        return DashboardStatistics(
            repositories=result.repositories,
            files=result.files,
            users=result.users,
            stars=result.stars,
            vulnerability_requests=result.vulnerability,
            optimization_requests=result.optimization,
            readme_requests=result.readme,
            repository_search_requests=result.repository_search
        )

    async def get_user_statistics(
        self,
        user_id: int
    ) -> DashboardUserStatistics:

        stmt = select(

            (
                select(
                    func.count(
                        RepositoryModel.id
                    )
                )
                .where(
                    RepositoryModel.owner_id == user_id
                )
                .scalar_subquery()
            ).label(
                "repositories"
            ),

            (
                select(
                    func.count(
                        FileModel.id
                    )
                )
                .join(
                    RepositoryModel,
                    RepositoryModel.id == FileModel.repository_id
                )
                .where(
                    RepositoryModel.owner_id == user_id
                )
                .scalar_subquery()
            ).label(
                "files"
            ),

            (
                select(
                    func.coalesce(
                        func.sum(
                            RepositoryModel.stars_count
                        ),
                        0
                    )
                )
                .where(
                    RepositoryModel.owner_id == user_id
                )
                .scalar_subquery()
            ).label(
                "stars"
            ),

            (
                select(
                    func.count(
                        AIRequestModel.id
                    )
                )
                .where(
                    AIRequestModel.user_id == user_id,
                    AIRequestModel.service == "vulnerability"
                )
                .scalar_subquery()
            ).label(
                "vulnerability"
            ),

            (
                select(
                    func.count(
                        AIRequestModel.id
                    )
                )
                .where(
                    AIRequestModel.user_id == user_id,
                    AIRequestModel.service == "optimization"
                )
                .scalar_subquery()
            ).label(
                "optimization"
            ),

            (
                select(
                    func.count(
                        AIRequestModel.id
                    )
                )
                .where(
                    AIRequestModel.user_id == user_id,
                    AIRequestModel.service == "readme"
                )
                .scalar_subquery()
            ).label(
                "readme"
            ),

            (
                select(
                    func.count(
                        AIRequestModel.id
                    )
                )
                .where(
                    AIRequestModel.user_id == user_id,
                    AIRequestModel.service == "repository_search"
                )
                .scalar_subquery()
            ).label(
                "repository_search"
            )
        )

        result = (
            await self.session.execute(
                stmt
            )
        ).one()

        return DashboardUserStatistics(
            repositories=result.repositories,
            files=result.files,
            stars=result.stars,
            vulnerability_requests=result.vulnerability,
            optimization_requests=result.optimization,
            readme_requests=result.readme,
            repository_search_requests=result.repository_search
        )