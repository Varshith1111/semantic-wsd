"""
FastAPI router – all API endpoints for the WSD application.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status

from app.evaluation.evaluator import run_evaluation
from app.models.schemas import (
    AmbiguousWordsResponse,
    EvaluationResult,
    HistoryItem,
    PredictionRequest,
    PredictionResponse,
    SentenceRequest,
)
from app.nlp.word_sense import detect_ambiguous_words
from app.services.prediction_service import (
    clear_all_history,
    get_history,
    get_prediction,
    get_stats,
    predict_and_save,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["WSD"])


# ---------------------------------------------------------------------------
# Prediction endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict the meaning of a target word",
)
def predict(request: PredictionRequest) -> PredictionResponse:
    """
    Disambiguate *target_word* within *sentence* using first- and second-order
    semantic similarity.
    """
    try:
        result = predict_and_save(request)
        return result
    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {exc}",
        ) from exc


@router.post(
    "/analyze",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Full analysis of a target word (same as predict)",
)
def analyze(request: PredictionRequest) -> PredictionResponse:
    """
    Identical to /predict but semantically indicates a full analysis
    view to the frontend.
    """
    return predict(request)


# ---------------------------------------------------------------------------
# History endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/history",
    response_model=list[HistoryItem],
    summary="List prediction history",
)
def list_history(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> list[HistoryItem]:
    """Return past predictions, most recent first."""
    rows = get_history(limit=limit, offset=offset)
    return [HistoryItem(**row) for row in rows]


@router.get(
    "/history/{prediction_id}",
    response_model=HistoryItem,
    summary="Get a specific prediction",
)
def get_history_item(prediction_id: int) -> HistoryItem:
    """Fetch a single past prediction by its id."""
    row = get_prediction(prediction_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction {prediction_id} not found.",
        )
    return HistoryItem(
        id=row["id"],
        sentence=row["sentence"],
        target_word=row["target_word"],
        predicted_meaning=row["predicted_meaning"],
        confidence=row["confidence"],
        similarity_score=row["similarity_score"],
        created_at=row["created_at"],
    )


@router.delete(
    "/history",
    status_code=status.HTTP_200_OK,
    summary="Clear all history",
)
def delete_history() -> dict:
    """Delete every stored prediction."""
    count = clear_all_history()
    return {"deleted": count, "message": "History cleared."}


# ---------------------------------------------------------------------------
# Evaluation endpoints (supports both /evaluation and /evaluate)
# ---------------------------------------------------------------------------

@router.get(
    "/evaluation",
    response_model=EvaluationResult,
    summary="Run the evaluation suite",
)
@router.get(
    "/evaluate",
    response_model=EvaluationResult,
    include_in_schema=False,
)
def evaluation() -> EvaluationResult:
    """
    Execute the hand-crafted WSD benchmark and return accuracy / F1 metrics.
    """
    try:
        result = run_evaluation()
        return result
    except Exception as exc:
        logger.exception("Evaluation failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {exc}",
        ) from exc


# ---------------------------------------------------------------------------
# Health / stats
# ---------------------------------------------------------------------------

@router.get("/health", summary="Health check")
def health() -> dict:
    """Simple liveness check."""
    return {"status": "healthy", "service": "WSD Backend"}


@router.get("/stats", summary="Prediction statistics")
def stats() -> dict:
    """Return aggregate statistics."""
    return get_stats()
