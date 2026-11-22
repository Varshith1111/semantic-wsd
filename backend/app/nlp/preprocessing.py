"""
NLTK-based text preprocessing pipeline.
Downloads required NLTK data on first import.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

logger = logging.getLogger(__name__)

# Ensure local workspace nltk_data is prioritized
_LOCAL_NLTK = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "nltk_data",
)
if _LOCAL_NLTK not in nltk.data.path:
    nltk.data.path.insert(0, _LOCAL_NLTK)

# ---------------------------------------------------------------------------
# NLTK data download (safe to call multiple times – nltk skips if present)
# ---------------------------------------------------------------------------

_NLTK_PACKAGES = [
    "punkt",
    "averaged_perceptron_tagger",
    "wordnet",
    "stopwords",
    "punkt_tab",
    "averaged_perceptron_tagger_eng",
]


def download_nltk_data() -> None:
    """Ensure all required NLTK corpora / models are available without hanging on network checks."""
    package_to_resource = {
        "punkt": "tokenizers/punkt",
        "punkt_tab": "tokenizers/punkt_tab",
        "wordnet": "corpora/wordnet",
        "stopwords": "corpora/stopwords",
        "averaged_perceptron_tagger": "taggers/averaged_perceptron_tagger",
        "averaged_perceptron_tagger_eng": "taggers/averaged_perceptron_tagger_eng",
    }
    for pkg, resource in package_to_resource.items():
        try:
            nltk.data.find(resource)
        except LookupError:
            try:
                nltk.download(pkg, quiet=True)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Could not download NLTK package %s: %s", pkg, exc)


# Trigger download on import so the rest of the module can rely on it.
download_nltk_data()

# Pre-build stop-word set and lemmatizer once.
_STOP_WORDS: set[str] = set(stopwords.words("english"))
_LEMMATIZER = WordNetLemmatizer()


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def tokenize(text: str) -> list[str]:
    """Tokenize *text* into a list of word tokens (lowercased)."""
    return word_tokenize(text.lower())


def remove_stopwords(tokens: list[str]) -> list[str]:
    """Remove English stop-words and non-alphabetic tokens."""
    return [t for t in tokens if t.isalpha() and t not in _STOP_WORDS]


def lemmatize(tokens: list[str]) -> list[str]:
    """Lemmatize each token using the WordNet lemmatizer."""
    return [_LEMMATIZER.lemmatize(t) for t in tokens]


def pos_tag(tokens: list[str]) -> list[tuple[str, str]]:
    """Return POS tags for the token list using the NLTK perceptron tagger."""
    return nltk.pos_tag(tokens)


def preprocess_pipeline(text: str) -> dict[str, Any]:
    """
    Run the full preprocessing pipeline and return intermediate results.

    Returns a dict with keys:
        tokens, filtered_tokens, lemmatized_tokens, pos_tags
    """
    tokens = tokenize(text)
    filtered = remove_stopwords(tokens)
    lemmatized = lemmatize(filtered)
    tags = pos_tag(tokens)

    return {
        "tokens": tokens,
        "filtered_tokens": filtered,
        "lemmatized_tokens": lemmatized,
        "pos_tags": tags,
    }
