"""
Unit tests for API route handlers.
Tests prediction, analyze, history, evaluation, and health endpoints.
"""

from __future__ import annotations

import pytest
from app.api.routes import (
    clear_all_history,
    delete_history,
    evaluation,
    get_history_item,
    health,
    list_history,
    predict,
    stats,
)
from app.models.schemas import PredictionRequest


class TestApiRoutes:
    def test_health(self):
        resp = health()
        assert resp["status"] == "healthy"

    def test_predict_endpoint(self):
        req = PredictionRequest(
            sentence="The bank approved my loan application.",
            target_word="bank",
        )
        res = predict(req)
        assert res.target_word == "bank"
        assert res.similarity_score > 0
        assert res.confidence > 0
        assert len(res.alternative_meanings) > 0
        assert "financial" in res.predicted_meaning.lower() or "deposit" in res.predicted_meaning.lower() or "lending" in res.predicted_meaning.lower()

    def test_history_endpoints(self):
        items = list_history(limit=5, offset=0)
        assert isinstance(items, list)
        assert len(items) > 0

        first_id = items[0].id
        item = get_history_item(first_id)
        assert item.id == first_id
        assert item.target_word == items[0].target_word

    def test_stats_endpoint(self):
        st = stats()
        assert "total_predictions" in st
        assert st["total_predictions"] >= 1
