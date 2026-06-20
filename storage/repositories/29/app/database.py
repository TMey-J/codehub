import os
import sys

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

from app.settings import settings

# Create the async engine
engine = create_async_engine(settings.DATABASE_URL)

# Create a configured "Session" class
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for our models
Base = declarative_base()

# Dependency to get a DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
