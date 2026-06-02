from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

import app.api.dependencies as dependencies
from app.application.use_cases.repository.create_repository import CreateRepositoryCommand
from app.core.exceptions import AppException
from app.core.security import get_current_user
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.schemas import ApiResponse
from app.schemas.repository import RepositoryResponse, RepositoryRequestBase

router = APIRouter()

@router.post("", response_model=ApiResponse[RepositoryResponse])
async def create_repository(
    request: RepositoryRequestBase,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        use_case = await dependencies.get_create_repository_use_case(db,current_user)
        command = CreateRepositoryCommand(
            name=request.name,
            description=request.description,
            language=request.language,
            visibility=request.visibility
        )
        repository = await use_case.execute(command)
        return ApiResponse(is_success=True,errors=[],response=RepositoryResponse(**repository.to_dict()))
    except ValueError as e:
        raise AppException(status_code=400, message=str(e))

@router.get("", response_model=ApiResponse[List[RepositoryResponse]])
async def get_repositories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
        use_case = await dependencies.get_get_all_repositories_use_case(db,current_user)
        repositories = await use_case.execute()
        return ApiResponse(is_success=True,errors=[],
                           response=[RepositoryResponse(**repo.to_dict()) for repo in repositories])

@router.get("/{repo_name}", response_model=ApiResponse[RepositoryResponse])
async def get_repository(repo_name:str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),

):
    try:
        use_case = await dependencies.get_get_repository_use_case(db,current_user)
        repository = await use_case.execute(repo_name)
        return ApiResponse(is_success=True,errors=[],
                           response=RepositoryResponse(**repository.to_dict()))
    except ValueError as e:
        raise AppException(status_code=404, message=str(e))