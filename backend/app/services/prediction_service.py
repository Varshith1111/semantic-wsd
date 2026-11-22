"""
Service layer that bridges the WSD predictor with the database.
"""

from __future__ import annotations

import logging
from typing import Any

from app.database.db import (
    clear_history as db_clear_history,
    get_history as db_get_history,
    get_prediction_by_id,
    get_prediction_count,
    save_prediction,
)
from app.models.schemas import PredictionRequest, PredictionResponse
from app.nlp.predictor import WSDPredictor

logger = logging.getLogger(__name__)

# Module-level predictor singleton
_predictor: WSDPredictor | None = None


def _get_predictor() -> WSDPredictor:
    global _predictor
    if _predictor is None:
        _predictor = WSDPredictor()
    return _predictor


def predict_and_save(request: PredictionRequest) -> PredictionResponse:
    """Run prediction and persist the result to the database."""
    predictor = _get_predictor()
    result = predictor.predict(request.sentence, request.target_word)

    # Persist to DB
    row_id = save_prediction(
        {
            "sentence": result.sentence,
            "target_word": result.target_word,
            "predicted_meaning": result.predicted_meaning,
            "confidence": result.confidence,
            "similarity_score": result.similarity_score,
            "first_order_score": result.first_order_score,
            "second_order_score": result.second_order_score,
            "context_words": result.context_words,
            "explanation": result.explanation,
            "all_meanings": [m.model_dump() for m in result.alternative_meanings],
        }
    )
    result.id = row_id
    return result


def get_history(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    """Return prediction history."""
    return db_get_history(limit=limit, offset=offset)


def get_prediction(prediction_id: int) -> dict[str, Any] | None:
    """Return a single prediction or None."""
    return get_prediction_by_id(prediction_id)


def clear_all_history() -> int:
    """Delete all prediction history. Returns count of removed rows."""
    return db_clear_history()


def get_stats() -> dict[str, Any]:
    """Return summary statistics about stored predictions."""
    count = get_prediction_count()
    return {
        "total_predictions": count,
    }
