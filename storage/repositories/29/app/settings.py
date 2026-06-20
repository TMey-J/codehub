from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # این مدل به صورت خودکار متغیر محیطی DATABASE_URL را می‌خواند
    DATABASE_URL: str
    POSTGRES_USER :str
    POSTGRES_PASSWORD :str
    POSTGRES_DB:str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()