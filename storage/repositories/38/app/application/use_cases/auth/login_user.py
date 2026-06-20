from dataclasses import dataclass
from typing import Dict

from app.core.password_helper import verify_password
from app.application.interfaces.user_repository import IUserRepository
from app.core.security import create_access_token, create_refresh_token


@dataclass
class LoginUserCommand:
    username: str
    password: str


class LoginUserUseCase:
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, command: LoginUserCommand) -> Dict[str, str]:
        user = await self.user_repository.get_by_username(command.username)

        if not user or not verify_password(command.password,user.hashed_password):
            raise ValueError("Invalid username or password")

        access_token = create_access_token(data={"sub": user.username})
        refresh_token = create_refresh_token(data={"sub": user.username})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
