from fastapi import Request, HTTPException
from slowapi import Limiter, util
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from src.config import settings

limiter = Limiter(key_func=util.get_remote_address)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Use slowapi's built-in handling
        # We'll integrate via decorators instead
        response = await call_next(request)
        return response
