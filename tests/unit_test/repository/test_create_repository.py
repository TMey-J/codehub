import pytest
from unittest.mock import AsyncMock

from app.application.use_cases.repository.create_repository import (
    CreateRepositoryUseCase
)

from app.schemas.repository import CreateRepositoryCommand
from app.domain.entities.repository import Repository, RepositoryVisibility
from app.domain.entities.user import User


@pytest.fixture
def user():
    return User(
        id=1,
        username="taha",
        email="test@test.com",
        hashed_password="asfgasdfgasd"
    )


@pytest.fixture
def repository_repository():
    return AsyncMock()

@pytest.mark.asyncio
async def test_create_repository_success(
    repository_repository,
    user
):
    command = CreateRepositoryCommand(
        name="MyRepo",
        description="Test Repository",
        language="Python",
        visibility=RepositoryVisibility.PUBLIC
    )

    repository_repository.get_by_name.return_value = None

    repository_repository.create.return_value = Repository(
        id=1,
        name="MyRepo",
        owner_id=user.id,
        owner_name=user.username,
        language="Python",
        visibility=True,
        description="Test Repository"
    )

    use_case = CreateRepositoryUseCase(
        repository_repository,
        user
    )

    result = await use_case.execute(command)

    assert result.name == "MyRepo"
    assert result.owner_id == user.id

    repository_repository.get_by_name.assert_awaited_once_with(
        "MyRepo",
        user.id
    )

    repository_repository.create.assert_awaited_once()

@pytest.mark.asyncio
async def test_create_repository_duplicate_name(
    repository_repository,
    user
):
    command = CreateRepositoryCommand(
        name="MyRepo",
        description="Test",
        language="Python",
        visibility=RepositoryVisibility.PUBLIC
    )

    repository_repository.get_by_name.return_value = Repository(
        id=5,
        name="MyRepo",
        owner_id=user.id,
        owner_name=user.username
    )

    use_case = CreateRepositoryUseCase(
        repository_repository,
        user
    )

    with pytest.raises(ValueError) as exc:
        await use_case.execute(command)

    assert str(exc.value) == "you already have one repository with this name"

    repository_repository.create.assert_not_called()