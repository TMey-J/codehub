from fastapi import APIRouter
from app.api.v1.endpoints import auth, repository, file, dashboard, user

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(repository.router, prefix="/repo", tags=["Repository"])
api_router.include_router(file.router, prefix="/file", tags=["File"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(user.router, prefix="/user", tags=["User"])
