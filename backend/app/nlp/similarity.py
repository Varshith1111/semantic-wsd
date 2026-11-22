"""
Sentence-level embedding & cosine similarity using sentence-transformers.

A singleton pattern ensures the (potentially large) model is loaded exactly once
and reused across the application lifetime.
"""

from __future__ import annotations

import logging
import os
import threading
from typing import Optional

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import numpy as np
from numpy.typing import NDArray
from sentence_transformers import SentenceTransformer

from app.core.config import settings

logger = logging.getLogger(__name__)


class SentenceEmbedder:
    """
    Thin wrapper around a SentenceTransformer model.

    Usage::

        embedder = SentenceEmbedder.get_instance()
        vec = embedder.encode("The bank approved my loan.")
    """

    _instance: Optional["SentenceEmbedder"] = None
    _lock = threading.Lock()

    def __init__(self, model_name: str | None = None) -> None:
        name = model_name or settings.EMBEDDING_MODEL_NAME
        logger.info("Loading sentence-transformers model: %s", name)
        try:
            self._model = SentenceTransformer(name, local_files_only=True)
        except Exception:
            self._model = SentenceTransformer(name)
        logger.info("Model loaded successfully.")

    # ---- Singleton access ----

    @classmethod
    def get_instance(cls) -> "SentenceEmbedder":
        """Return (and lazily create) the global embedder instance."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    # ---- Encoding ----

    def encode(self, text: str) -> NDArray[np.float32]:
        """Encode a single text into a dense vector."""
        return self._model.encode(text, convert_to_numpy=True, show_progress_bar=False)

    def batch_encode(self, texts: list[str]) -> list[NDArray[np.float32]]:
        """Encode multiple texts efficiently in a single forward pass."""
        if not texts:
            return []
        embeddings = self._model.encode(
            texts, convert_to_numpy=True, show_progress_bar=False, batch_size=64,
        )
        return list(embeddings)

    # ---- Similarity ----

    @staticmethod
    def cosine_similarity(vec1: NDArray, vec2: NDArray) -> float:
        """
        Compute cosine similarity between two vectors.
        Returns a float in [-1, 1].
        """
        vec1 = vec1.flatten().astype(np.float64)
        vec2 = vec2.flatten().astype(np.float64)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0.0 or norm2 == 0.0:
            return 0.0
        return float(np.dot(vec1, vec2) / (norm1 * norm2))
