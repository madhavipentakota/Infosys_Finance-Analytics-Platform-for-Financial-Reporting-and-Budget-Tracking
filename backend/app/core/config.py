import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "OilCrop Intelligence"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "oilcrop_intelligence_super_secret_jwt_key_for_development_replace_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/oilcrop_db"
    FALLBACK_SQLITE_URL: str = "sqlite:///./oilcrop_intelligence.db"

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    ADMIN_EMAIL: str = "admin@oilcrop.org"
    ADMIN_PASSWORD: str = "AdminOilCrop2025!"
    ADMIN_NAME: str = "System Administrator"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
