from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from src.config import settings

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/v1/query") or request.url.path.startswith("/api/v1/ingest"):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
                request.state.user_groups = payload.get("groups", [])
            except JWTError:
                raise HTTPException(status_code=401, detail="Invalid token")
        response = await call_next(request)
        return response
