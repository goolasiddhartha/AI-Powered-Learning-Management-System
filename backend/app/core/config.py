"""Application settings loaded from environment variables."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "ai_lms"

    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    gemini_api_key: str = ""
    embedding_model: str = "models/text-embedding-004"
    llm_model: str = "gemini-2.5-flash"

    frontend_url: str = "http://localhost:4200"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    environment: str = "development"
    log_level: str = "INFO"

    max_upload_size_mb: int = 10
    upload_dir: str = "uploads"

    @property
    def cors_origins(self) -> List[str]:
        origins = {self.frontend_url, "http://localhost:4200", "http://127.0.0.1:4200"}
        for port in range(4200, 4211):
            origins.add(f"http://localhost:{port}")
            origins.add(f"http://127.0.0.1:{port}")
        return list(origins)

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
