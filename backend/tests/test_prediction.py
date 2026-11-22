"""
Integration tests for the WSD predictor.
Verifies that the predictor returns sensible results for known ambiguous
words and handles edge cases gracefully.
"""

from __future__ import annotations

import pytest

from app.nlp.predictor import WSDPredictor


class TestBankFinancial:
    """'bank' used in a financial context should map to a financial sense."""

    def test_financial_context(self, predictor: WSDPredictor):
        result = predictor.predict(
            "I deposited money at the bank.", "bank"
        )
        meaning_lower = result.predicted_meaning.lower()
        # Should reference money / financial institution / deposit
        assert any(
            kw in meaning_lower
            for kw in ("financial", "deposit", "money", "savings", "fund", "bank")
        ), f"Expected financial sense, got: {result.predicted_meaning}"
        assert result.confidence > 0


class TestBankRiver:
    """'bank' used in a river context should map to a geographical sense."""

    def test_river_context(self, predictor: WSDPredictor):
        result = predictor.predict(
            "The river bank was covered with wild flowers.", "bank"
        )
        meaning_lower = result.predicted_meaning.lower()
        assert any(
            kw in meaning_lower
            for kw in ("sloping", "land", "river", "water", "shore", "edge", "slope")
        ), f"Expected river-bank sense, got: {result.predicted_meaning}"


class TestBat:
    def test_sports_context(self, predictor: WSDPredictor):
        result = predictor.predict(
            "He swung the bat and hit a home run.", "bat"
        )
        meaning_lower = result.predicted_meaning.lower()
        assert any(
            kw in meaning_lower
            for kw in ("bat", "club", "hit", "strike", "baseball", "implement", "cricket")
        ), f"Expected sports sense, got: {result.predicted_meaning}"

    def test_animal_context(self, predictor: WSDPredictor):
        result = predictor.predict(
            "A bat flew out of the dark cave.", "bat"
        )
        meaning_lower = result.predicted_meaning.lower()
        assert any(
            kw in meaning_lower
            for kw in ("nocturnal", "mammal", "fly", "wing", "animal", "chiroptera")
        ), f"Expected animal sense, got: {result.predicted_meaning}"


class TestEdgeCases:
    def test_unknown_word(self, predictor: WSDPredictor):
        result = predictor.predict(
            "The xylqzz is very important.", "xylqzz"
        )
        # Should return gracefully with 0 confidence
        assert result.confidence == 0.0
        assert "not found" in result.predicted_meaning.lower() or result.predicted_meaning != ""

    def test_empty_sentence(self, predictor: WSDPredictor):
        result = predictor.predict("", "bank")
        assert result.confidence == 0.0

    def test_empty_target(self, predictor: WSDPredictor):
        result = predictor.predict("The river flows gently.", "")
        assert result.confidence == 0.0

    def test_response_has_alternatives(self, predictor: WSDPredictor):
        result = predictor.predict(
            "The bright star lit up the night sky.", "star"
        )
        assert len(result.alternative_meanings) > 1
        # Scores should be real numbers summing (roughly) across alternatives
        for alt in result.alternative_meanings:
            assert 0.0 <= alt.combined_score <= 1.0

    def test_explanation_not_empty(self, predictor: WSDPredictor):
        result = predictor.predict(
            "She played a note on the piano.", "note"
        )
        assert len(result.explanation) > 20

    def test_processing_time_positive(self, predictor: WSDPredictor):
        result = predictor.predict("The crane lifted the steel beams.", "crane")
        assert result.processing_time > 0
