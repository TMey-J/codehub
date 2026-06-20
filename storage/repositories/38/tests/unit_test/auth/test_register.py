import pytest
from unittest.mock import AsyncMock

from app.application.use_cases.auth.register_user import (
    RegisterUserUseCase,
    RegisterUserCommand
)

from app.domain.entities.user import User
from app.core.password_helper import verify_password


@pytest.fixture
def user_repository():
    return AsyncMock()


@pytest.mark.asyncio
async def test_register_user_success(user_repository):

    command = RegisterUserCommand(
        username="taha",
        email="test@test.com",
        password="Taha1234"
    )

    user_repository.get_by_username.return_value = None
    user_repository.get_by_email.return_value = None

    user_repository.create.side_effect = lambda user: user

    use_case = RegisterUserUseCase(
        user_repository
    )

    result = await use_case.execute(command)

    assert result.username == "taha"
    assert result.email == "test@test.com"

    assert result.hashed_password != "Taha1234"

    assert verify_password(
        "Taha1234",
        result.hashed_password
    )

    user_repository.get_by_username.assert_awaited_once_with(
        "taha"
    )

    user_repository.get_by_email.assert_awaited_once_with(
        "test@test.com"
    )

    user_repository.create.assert_awaited_once()

@pytest.mark.asyncio
async def test_register_user_duplicate_username(
    user_repository
):

    command = RegisterUserCommand(
        username="taha",
        email="test@test.com",
        password="Taha1234"
    )

    user_repository.get_by_username.return_value = User(
        id=1,
        username="taha",
        email="old@test.com",
        hashed_password="hash"
    )

    use_case = RegisterUserUseCase(
        user_repository
    )

    with pytest.raises(ValueError) as exc:
        await use_case.execute(command)

    assert str(exc.value) == "Username already exists"

    user_repository.create.assert_not_called()

@pytest.mark.asyncio
async def test_register_user_duplicate_email(
    user_repository
):

    command = RegisterUserCommand(
        username="newuser",
        email="test@test.com",
        password="Taha1234"
    )

    user_repository.get_by_username.return_value = None

    user_repository.get_by_email.return_value = User(
        id=1,
        username="another",
        email="test@test.com",
        hashed_password="hash"
    )

    use_case = RegisterUserUseCase(
        user_repository
    )

    with pytest.raises(ValueError) as exc:
        await use_case.execute(command)

    assert str(exc.value) == "Email already exists"

    user_repository.create.assert_not_called()