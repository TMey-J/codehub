from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.interfaces.ai_request_repository import (
    IAIRequestRepository,
)
from app.infrastructure.database.models.ai_request import (
    AIRequestModel,
)


class AIRequestRepository(IAIRequestRepository):

    def __init__(
        self,
        session: AsyncSession
    ):
        self.session = session

    async def create(
        self,
        user_id: int | None,
        service: str
    ):

        request = AIRequestModel(
            user_id=user_id,
            service=service,
            created_at=datetime.now(timezone.utc)
        )

        self.session.add(request)

        await self.session.commit()