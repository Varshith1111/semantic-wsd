"""
Pydantic models (schemas) for request/response validation.
These define the data contracts for the WSD API.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class PredictionRequest(BaseModel):
    """Incoming request to disambiguate a target word within a sentence."""

    sentence: str = Field(
        ...,
        min_length=1,
        description="The sentence containing the ambiguous word.",
        examples=["I deposited money at the bank."],
    )
    target_word: str = Field(
        ...,
        min_length=1,
        description="The word to disambiguate.",
        examples=["bank"],
    )


class SentenceRequest(BaseModel):
    """Incoming request containing only a sentence for ambiguous word detection."""

    sentence: str = Field(..., min_length=1, description="Input sentence to analyze.")


class AmbiguousWordsResponse(BaseModel):
    """List of detected polysemous words."""

    sentence: str
    ambiguous_words: list[str]


# ---------------------------------------------------------------------------
# Response sub-schemas
# ---------------------------------------------------------------------------

class CandidateMeaning(BaseModel):
    """One candidate word sense with its scoring breakdown."""

    definition: str
    pos: str
    synset_name: str
    first_order_score: float
    second_order_score: float
    combined_score: float
    examples: list[str] = Field(default_factory=list)


class PredictionResponse(BaseModel):
    """Full prediction result returned to the client."""

    sentence: str
    target_word: str
    predicted_meaning: str
    confidence: float
    similarity_score: float
    first_order_score: float
    second_order_score: float
    alternative_meanings: list[CandidateMeaning] = Field(default_factory=list)
    explanation: str
    context_words: list[str] = Field(default_factory=list)
    pos_tags: list[list[str]] = Field(default_factory=list)
    processing_time: float = 0.0
    id: Optional[int] = None


# ---------------------------------------------------------------------------
# History schemas
# ---------------------------------------------------------------------------

class HistoryItem(BaseModel):
    """Lightweight representation of a past prediction."""

    id: int
    sentence: str
    target_word: str
    predicted_meaning: str
    confidence: float
    similarity_score: float
    created_at: str


# ---------------------------------------------------------------------------
# Evaluation schemas
# ---------------------------------------------------------------------------

class EvaluationResult(BaseModel):
    """Metrics produced by running the evaluation suite."""

    accuracy: float
    precision: float
    recall: float
    f1_score: float
    total_samples: int
    correct_predictions: int
    dataset_name: str
    confusion_matrix: Any = None
    per_word_accuracy: dict[str, float] = Field(default_factory=dict)
