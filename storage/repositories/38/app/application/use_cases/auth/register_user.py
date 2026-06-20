from dataclasses import dataclass

from app.core.password_helper import hash_password
from app.domain.entities.user import User
from app.application.interfaces.user_repository import IUserRepository
from app.domain.value_objects import Email, Username, Password

@dataclass
class RegisterUserCommand:
    username: str
    email: str
    password: str

class RegisterUserUseCase:
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def execute(self, command: RegisterUserCommand) -> User:
        username_vo = Username(command.username)
        email_vo = Email(command.email)
        password_vo = Password(command.password)

        existing_user = await self.user_repository.get_by_username(username_vo.value)
        if existing_user:
            raise ValueError("Username already exists")

        existing_email = await self.user_repository.get_by_email(email_vo.value)
        if existing_email:
            raise ValueError("Email already exists")

        hashed_password = hash_password(password_vo.value)

        user = User(
            username=username_vo.value,
            email=email_vo.value,
            hashed_password=hashed_password
        )

        return await self.user_repository.create(user)
