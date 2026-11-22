"""
First-order semantic similarity scoring.

For each candidate word sense, we build a textual representation from
its definition, examples, and related words, then measure how close
the **sentence context** is to that representation via cosine similarity
in the embedding space.
"""

from __future__ import annotations

from nltk.corpus.reader.wordnet import Synset

from app.nlp.similarity import SentenceEmbedder
from app.nlp.word_sense import (
    get_related_words,
    get_sense_definition,
    get_sense_examples,
)


def _build_sense_text(synset: Synset) -> str:
    """
    Construct a rich textual description of a synset by combining
    its definition, usage examples, and related words.
    """
    parts: list[str] = []

    definition = get_sense_definition(synset)
    if definition:
        parts.append(definition)

    examples = get_sense_examples(synset)
    if examples:
        parts.extend(examples)

    related = get_related_words(synset)
    if related:
        parts.append(" ".join(related))

    return " . ".join(parts) if parts else ""


def compute_first_order_scores(
    sentence: str,
    target_word: str,
    candidate_senses: list[Synset],
    embedder: SentenceEmbedder,
) -> list[float]:
    """
    Compute first-order similarity between *sentence* and each candidate sense.

    For every candidate:
      1. Build a textual sense representation (definition + examples + related words).
      2. Encode both the sentence and the sense text.
      3. Return cosine similarity.

    Returns a list of **normalised** scores (sum = 1) in the same order as
    *candidate_senses*.
    """
    if not candidate_senses:
        return []

    # Build sense texts.
    sense_texts = [_build_sense_text(s) for s in candidate_senses]

    # Encode everything in one batch for efficiency.
    all_texts = [sentence] + sense_texts
    embeddings = embedder.batch_encode(all_texts)

    sentence_vec = embeddings[0]
    sense_vecs = embeddings[1:]

    raw_scores = [
        embedder.cosine_similarity(sentence_vec, sv) for sv in sense_vecs
    ]

    # Shift to [0, …] then normalise so scores sum to 1.
    return _normalise(raw_scores)


def _normalise(scores: list[float]) -> list[float]:
    """Ensure non-negative bounded cosine similarity values in [0, 1]."""
    if not scores:
        return scores
    return [max(0.0, min(1.0, float(s))) for s in scores]
