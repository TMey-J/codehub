import pytest
from unittest.mock import AsyncMock

from app.application.use_cases.auth.login_user import (
    LoginUserUseCase,
    LoginUserCommand
)

from app.domain.entities.user import User
from app.core.password_helper import hash_password


@pytest.fixture
def user_repository():
    return AsyncMock()

@pytest.mark.asyncio
async def test_login_success(user_repository):

    password = "Taha1234"

    user_repository.get_by_username.return_value = User(
        id=1,
        username="taha",
        email="test@test.com",
        hashed_password=hash_password(password)
    )

    command = LoginUserCommand(
        username="taha",
        password=password
    )

    use_case = LoginUserUseCase(
        user_repository
    )

    result = await use_case.execute(command)

    assert "access_token" in result
    assert "refresh_token" in result
    assert result["token_type"] == "bearer"

    user_repository.get_by_username.assert_awaited_once_with(
        "taha"
    )

@pytest.mark.asyncio
async def test_login_user_not_found(user_repository):

    user_repository.get_by_username.return_value = None

    command = LoginUserCommand(
        username="taha",
        password="Taha1234"
    )

    use_case = LoginUserUseCase(
        user_repository
    )

    with pytest.raises(ValueError) as exc:
        await use_case.execute(command)

    assert str(exc.value) == "Invalid username or password"

    user_repository.get_by_username.assert_awaited_once_with(
        "taha"
    )

@pytest.mark.asyncio
async def test_login_wrong_password(user_repository):

    user_repository.get_by_username.return_value = User(
        id=1,
        username="taha",
        email="test@test.com",
        hashed_password=hash_password("Taha1234")
    )

    command = LoginUserCommand(
        username="taha",
        password="Taha12345"
    )

    use_case = LoginUserUseCase(
        user_repository
    )

    with pytest.raises(ValueError) as exc:
        await use_case.execute(command)

    assert str(exc.value) == "Invalid username or password"

    user_repository.get_by_username.assert_awaited_once_with(
        "taha"
    )