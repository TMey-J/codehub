from app.application.interfaces.user_repository import IUserRepository


class GetUserProfileUseCase:

    def __init__(
        self,
        user_repository: IUserRepository
    ):
        self.user_repository = user_repository

    async def execute(
        self,
        username: str,
        page: int = 1,
        take: int = 20
    ):
        profile = await self.user_repository.get_profile(
            username,
            page,
            take
        )

        if profile is None:
            raise ValueError("User not found")

        return profile