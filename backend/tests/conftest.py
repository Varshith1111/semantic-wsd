"""
Pytest fixtures shared across all test modules.
"""

from __future__ import annotations

import pytest

from app.nlp.predictor import WSDPredictor


@pytest.fixture(scope="session")
def predictor() -> WSDPredictor:
    """Return a session-scoped WSDPredictor instance (loads model once)."""
    return WSDPredictor()
