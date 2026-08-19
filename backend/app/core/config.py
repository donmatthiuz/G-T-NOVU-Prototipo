from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_ENV = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_ENV,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "NOVU API"
    environment: str = "development"
    api_prefix: str = "/v1"
    mongodb_uri: str = "mongodb://localhost:27017/novu?replicaSet=rs0&directConnection=true"
    mongodb_database: str = "novu"
    cors_origins: str = "http://localhost:3000"
    session_hours: int = Field(default=24, ge=1, le=720)
    kyc_storage_path: Path = Path("/data/kyc")
    max_upload_bytes: int = 10 * 1024 * 1024
    openai_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("API_OPENAI", "OPENAI_API_KEY"),
    )
    openai_model: str = "gpt-5.6-luna"
    openai_timeout_seconds: float = Field(default=30, ge=5, le=120)
    seed_demo_data: bool = True

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
