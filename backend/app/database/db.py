"""
Database layer using Python's standard sqlite3.
Handles persistence of prediction results and history queries with zero event-loop blocking.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from typing import Any, Optional

from app.core.config import settings

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

_CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS predictions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    sentence        TEXT    NOT NULL,
    target_word     TEXT    NOT NULL,
    predicted_meaning TEXT  NOT NULL,
    confidence      REAL    NOT NULL,
    similarity_score REAL   NOT NULL,
    first_order_score REAL  NOT NULL DEFAULT 0.0,
    second_order_score REAL NOT NULL DEFAULT 0.0,
    context_words   TEXT    NOT NULL DEFAULT '[]',
    explanation     TEXT    NOT NULL DEFAULT '',
    all_meanings    TEXT    NOT NULL DEFAULT '[]',
    created_at      TEXT    NOT NULL
);
"""


def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------------------------------------------------------
# Database API
# ---------------------------------------------------------------------------

def init_db() -> None:
    """Create the predictions table if it doesn't exist."""
    with _get_connection() as conn:
        conn.execute(_CREATE_TABLE_SQL)
        conn.commit()


def save_prediction(data: dict[str, Any]) -> int:
    """Insert a prediction row and return the new row id."""
    sql = """
    INSERT INTO predictions
        (sentence, target_word, predicted_meaning, confidence,
         similarity_score, first_order_score, second_order_score,
         context_words, explanation, all_meanings, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    params = (
        data["sentence"],
        data["target_word"],
        data["predicted_meaning"],
        data["confidence"],
        data["similarity_score"],
        data.get("first_order_score", 0.0),
        data.get("second_order_score", 0.0),
        json.dumps(data.get("context_words", [])),
        data.get("explanation", ""),
        json.dumps(data.get("all_meanings", [])),
        now,
    )
    with _get_connection() as conn:
        cursor = conn.execute(sql, params)
        conn.commit()
        return cursor.lastrowid


def get_history(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    """Return recent predictions ordered by most recent first."""
    sql = """
    SELECT id, sentence, target_word, predicted_meaning,
           confidence, similarity_score, created_at
    FROM predictions
    ORDER BY id DESC
    LIMIT ? OFFSET ?
    """
    with _get_connection() as conn:
        cursor = conn.execute(sql, (limit, offset))
        return [dict(row) for row in cursor.fetchall()]


def get_prediction_by_id(prediction_id: int) -> Optional[dict[str, Any]]:
    """Fetch a single prediction by id, or None if not found."""
    sql = "SELECT * FROM predictions WHERE id = ?"
    with _get_connection() as conn:
        cursor = conn.execute(sql, (prediction_id,))
        row = cursor.fetchone()
        if row is None:
            return None
        result = dict(row)
        for col in ("context_words", "all_meanings"):
            if isinstance(result.get(col), str):
                try:
                    result[col] = json.loads(result[col])
                except json.JSONDecodeError:
                    pass
        return result


def clear_history() -> int:
    """Delete all predictions. Returns the number of rows removed."""
    with _get_connection() as conn:
        cursor = conn.execute("DELETE FROM predictions")
        conn.commit()
        return cursor.rowcount


def get_prediction_count() -> int:
    """Return the total number of saved predictions."""
    with _get_connection() as conn:
        cursor = conn.execute("SELECT COUNT(*) FROM predictions")
        row = cursor.fetchone()
        return row[0] if row else 0
