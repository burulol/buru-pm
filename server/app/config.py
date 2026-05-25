from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str
    FULL_ACCESS_TOKEN_EXPIRE_DAYS: int = 1
    LIMITED_ACCESS_TOKEN_EXPIRE_DAYS: int = 1
    DATABASE_URL: str

    class Config:
        env_file = ".env"


settings = Settings()
