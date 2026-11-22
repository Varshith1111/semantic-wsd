"""
Second-order semantic similarity scoring.

Instead of comparing the sentence directly to each candidate sense
(first-order), second-order modeling asks:

    "Do the **semantic neighborhoods** (hypernyms, hyponyms, related senses)
     of the candidate sense overlap with the semantic neighborhoods of the
     **context words**?"

This captures deeper, structural relationships.  A financial sense of "bank"
has neighbours like *deposit*, *credit*, *savings* whose neighbourhoods
overlap heavily with context words such as *loan* and *approved*.
"""

from __future__ import annotations

from nltk.corpus import wordnet as wn
from nltk.corpus.reader.wordnet import Synset

from app.nlp.similarity import SentenceEmbedder
from app.nlp.word_sense import get_related_words, get_sense_definition


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_related_synsets(synset: Synset) -> list[Synset]:
    """Collect immediate relational synsets (hypernyms, hyponyms, etc.)."""
    related: list[Synset] = []
    related.extend(synset.hypernyms()[:3])
    related.extend(synset.hyponyms()[:4])
    related.extend(synset.part_meronyms()[:2])
    related.extend(synset.member_meronyms()[:2])
    # Also include synsets reachable via lemma-level relations (derivations, etc.)
    for lemma in synset.lemmas()[:3]:
        for related_form in lemma.derivationally_related_forms()[:2]:
            related.append(related_form.synset())
    return related[:6]


def _build_neighbourhood_text(synset: Synset) -> str:
    """
    Build a composite text that represents the **semantic neighbourhood**
    of a synset: its own definition + definitions of related synsets +
    related lemma names.
    """
    parts: list[str] = [get_sense_definition(synset)]

    for related_syn in _get_related_synsets(synset):
        defn = related_syn.definition()
        if defn:
            parts.append(defn)

    related_words = get_related_words(synset)[:10]
    if related_words:
        parts.append(" ".join(related_words))

    return " . ".join(parts)


def _build_context_word_neighbourhood(word: str) -> str:
    """
    For a context word, gather the semantic neighbourhoods of **all** its
    senses and concatenate them into a single textual representation.
    """
    synsets = wn.synsets(word)
    if not synsets:
        return word  # fall back to the raw word

    parts: list[str] = []
    for syn in synsets[:3]:  # limit to first 3 senses for efficiency
        defn = get_sense_definition(syn)
        if defn:
            parts.append(defn)
        for rel in _get_related_synsets(syn)[:2]:
            r_defn = rel.definition()
            if r_defn:
                parts.append(r_defn)
        rw = get_related_words(syn)[:6]
        if rw:
            parts.append(" ".join(rw))

    return " . ".join(parts) if parts else word


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_second_order_scores(
    sentence: str,
    target_word: str,
    candidate_senses: list[Synset],
    context_words: list[str],
    embedder: SentenceEmbedder,
) -> list[float]:
    """
    Compute second-order similarity for each candidate sense.

    Algorithm
    ---------
    1. For each **candidate sense**, build a "semantic neighbourhood" text
       (definitions of the sense + its hypernyms/hyponyms/meronyms/holonyms
       + their related lemma names).
    2. For each **context word**, build a *context-word neighbourhood* text
       in the same way.
    3. Encode all neighbourhood texts.
    4. For each candidate, compute the **average cosine similarity** between
       its neighbourhood embedding and every context-word neighbourhood
       embedding.  This average measures how well the *relational structure*
       of the candidate aligns with the relational structure of the context.

    Returns normalised scores (sum = 1).
    """
    if not candidate_senses:
        return []

    # If no context words, fall back to uniform scores.
    if not context_words:
        return [1.0 / len(candidate_senses)] * len(candidate_senses)

    # 1. Build candidate neighbourhood texts.
    candidate_texts = [_build_neighbourhood_text(s) for s in candidate_senses]

    # 2. Build context-word neighbourhood texts (up to 6 context tokens).
    cw_texts = [_build_context_word_neighbourhood(cw) for cw in context_words[:6]]

    # 3. Batch-encode everything.
    all_texts = candidate_texts + cw_texts
    all_vecs = embedder.batch_encode(all_texts)

    n_candidates = len(candidate_senses)
    cand_vecs = all_vecs[:n_candidates]
    cw_vecs = all_vecs[n_candidates:]

    # 4. Average neighbourhood similarity.
    raw_scores: list[float] = []
    for cv in cand_vecs:
        similarities = [embedder.cosine_similarity(cv, cwv) for cwv in cw_vecs]
        avg_sim = sum(similarities) / len(similarities) if similarities else 0.0
        raw_scores.append(avg_sim)

    return _normalise(raw_scores)


def _normalise(scores: list[float]) -> list[float]:
    """Ensure non-negative bounded cosine similarity values in [0, 1]."""
    if not scores:
        return scores
    return [max(0.0, min(1.0, float(s))) for s in scores]
