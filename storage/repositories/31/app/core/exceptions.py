from fastapi import Request, FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.schemas import ApiResponse
import logging

logger = logging.getLogger(__name__)

class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code


def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content=ApiResponse(is_success=False, errors=["Somthing Wrong"],response=None).model_dump()
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = [err["msg"].replace("Value error, ","") for err in exc.errors()]
        return JSONResponse(
            status_code=422,
            content=ApiResponse(is_success=False, errors=errors, response=None).model_dump()
        )

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content=ApiResponse(is_success=False, errors=[exc.message], response=None).model_dump()
        )