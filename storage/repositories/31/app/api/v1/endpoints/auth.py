from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AppException
from app.core.security import get_current_user
from app.domain.entities.user import User
from app.schemas import ApiResponse
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.application.use_cases.auth.register_user import RegisterUserCommand
from app.application.use_cases.auth.login_user import LoginUserCommand
from app.api.dependencies import get_register_use_case, get_login_use_case
from app.infrastructure.database.session import get_db

router = APIRouter()

@router.post("/register", response_model=ApiResponse[UserResponse])
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        use_case = await get_register_use_case(db)
        command = RegisterUserCommand(
            username=request.username,
            email=request.email.__str__(),
            password=request.password
        )
        user = await use_case.execute(command)
        return ApiResponse(is_success=True,errors=[],response=UserResponse(**user.to_dict()))
    except ValueError as e:
        raise AppException(status_code=400, message=str(e))

@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        use_case = await get_login_use_case(db)
        command = LoginUserCommand(
            username=request.username,
            password=request.password
        )
        tokens = await use_case.execute(command)
        return ApiResponse(is_success=True, errors=[], response=TokenResponse(**tokens))
    except ValueError as e:
        raise AppException(status_code=401, message=str(e))

@router.get("/user-info", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Protected endpoint - returns current authenticated user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        updated_at=current_user.updated_at,
        created_at=current_user.created_at
    )