"""
Context-word extraction utilities.
Extracts the words surrounding a target word that carry semantic content.
"""

from __future__ import annotations

import nltk

from app.nlp.preprocessing import remove_stopwords, tokenize

# POS tags that correspond to content words (nouns, verbs, adjectives, adverbs).
_CONTENT_POS_PREFIXES = {"NN", "VB", "JJ", "RB"}


def extract_context_words(
    sentence: str,
    target_word: str,
    window_size: int = 5,
) -> list[str]:
    """
    Return content words within *window_size* tokens of *target_word*.

    Steps:
        1. Tokenize & lowercase.
        2. Locate target word.
        3. Grab a window of tokens around it.
        4. Filter to content words (minus the target itself).
    """
    tokens = tokenize(sentence)
    target_lower = target_word.lower()

    # Find the index of the target word.
    target_idx: int | None = None
    for i, tok in enumerate(tokens):
        if tok == target_lower:
            target_idx = i
            break

    if target_idx is None:
        # Fallback: return all content words
        filtered = remove_stopwords(tokens)
        return [w for w in filtered if w != target_lower]

    window_tokens = get_context_window(tokens, target_idx, window_size)
    # Remove the target word itself, then filter to content words.
    window_tokens = [t for t in window_tokens if t != target_lower]
    content = extract_content_words(window_tokens)
    return content if content else remove_stopwords(window_tokens)


def get_context_window(
    tokens: list[str],
    target_index: int,
    window_size: int = 5,
) -> list[str]:
    """Return tokens within *window_size* positions of *target_index*."""
    start = max(0, target_index - window_size)
    end = min(len(tokens), target_index + window_size + 1)
    return tokens[start:end]


def extract_content_words(tokens: list[str]) -> list[str]:
    """
    Keep only nouns, verbs, adjectives, and adverbs based on POS tagging.
    Also removes stop-words and non-alphabetic tokens.
    """
    if not tokens:
        return []

    alpha_tokens = [t for t in tokens if t.isalpha()]
    if not alpha_tokens:
        return []

    tagged = nltk.pos_tag(alpha_tokens)
    content: list[str] = []
    for word, tag in tagged:
        if any(tag.startswith(prefix) for prefix in _CONTENT_POS_PREFIXES):
            content.append(word)
    return content
