from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SAMBANOVA_API_KEYS:str

    @property
    def sambanova_api_keys(self) -> list[str]:
        return [
            x.strip()
            for x in self.SAMBANOVA_API_KEYS.split(",")
            if x.strip()
        ]
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
settings = Settings()
