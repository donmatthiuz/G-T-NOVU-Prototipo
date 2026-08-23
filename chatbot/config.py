import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env"


class ChatbotConfigurationError(RuntimeError):
    """La configuración requerida para ejecutar el chatbot no está completa."""


@dataclass(frozen=True)
class Settings:
    api_key: str
    model: str
    max_output_tokens: int
    allowed_origins: tuple[str, ...]


def _read_positive_int(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default)).strip()
    try:
        value = int(raw_value)
    except ValueError as error:
        raise ChatbotConfigurationError(
            f"{name} debe contener un número entero."
        ) from error

    if value <= 0:
        raise ChatbotConfigurationError(f"{name} debe ser mayor que cero.")
    return value


def _read_allowed_origins() -> tuple[str, ...]:
    defaults = (
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://novu-prototipo-gt.netlify.app",
    )
    configured = os.getenv("CHATBOT_ALLOWED_ORIGINS", "").strip()
    if not configured:
        return defaults
    return tuple(origin.strip() for origin in configured.split(",") if origin.strip())


@lru_cache
def get_settings() -> Settings:
    load_dotenv(ENV_FILE, override=False)

    api_key = os.getenv("API_GPT", "").strip()
    if not api_key:
        raise ChatbotConfigurationError(
            "Falta API_GPT en el archivo .env de la raíz del proyecto."
        )

    return Settings(
        api_key=api_key,
        model=os.getenv("OPENAI_MODEL", "gpt-5-mini").strip() or "gpt-5-mini",
        max_output_tokens=_read_positive_int("OPENAI_MAX_OUTPUT_TOKENS", 700),
        allowed_origins=_read_allowed_origins(),
    )


def api_key_is_configured() -> bool:
    load_dotenv(ENV_FILE, override=False)
    return bool(os.getenv("API_GPT", "").strip())
