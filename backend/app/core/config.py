"""
Application configuration using pydantic BaseSettings.
Manages all configurable parameters for the WSD application.
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with sensible defaults for the WSD backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Application metadata ---
    APP_NAME: str = "Second-Order Semantic Modeling for Context-Aware Meaning Prediction"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "wsd_predictions.db",
    )

    # --- CORS ---
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:8080",
    ]

    # --- Sentence-Transformers model ---
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"

    # --- First / Second order weight configuration ---
    FIRST_ORDER_WEIGHT: float = 0.6
    SECOND_ORDER_WEIGHT: float = 0.4

    # --- Context extraction ---
    CONTEXT_WINDOW_SIZE: int = 5


# Global singleton
settings = Settings()
