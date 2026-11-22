"""
WordNet word-sense utilities.
Wraps NLTK's WordNet interface to provide clean helpers for
sense enumeration, definitions, examples, and relations.
"""

from __future__ import annotations

from nltk.corpus import wordnet as wn
from nltk.corpus.reader.wordnet import Synset

from app.nlp.preprocessing import tokenize, remove_stopwords

# Map WordNet POS codes to human-readable strings.
_POS_MAP: dict[str, str] = {
    "n": "noun",
    "v": "verb",
    "a": "adjective",
    "r": "adverb",
    "s": "adjective satellite",
}


def get_word_senses(word: str, pos: str | None = None) -> list[Synset]:
    """Return all WordNet synsets for *word*, optionally filtered by *pos* ('n', 'v', 'a', 'r')."""
    if pos:
        senses = wn.synsets(word, pos=pos)
        if senses:
            return senses
    return wn.synsets(word)


def get_sense_definition(synset: Synset) -> str:
    """Return the gloss (definition) of a synset."""
    return synset.definition()


def get_sense_examples(synset: Synset) -> list[str]:
    """Return usage examples for a synset."""
    return synset.examples()


def get_related_words(synset: Synset) -> list[str]:
    """
    Collect lemma names from hypernyms, hyponyms, meronyms, and holonyms.
    Returns a deduplicated list of related words.
    """
    related: set[str] = set()

    for hyper in synset.hypernyms()[:5]:
        related.update(l.name().replace("_", " ") for l in hyper.lemmas()[:3])
    for hypo in synset.hyponyms()[:8]:
        related.update(l.name().replace("_", " ") for l in hypo.lemmas()[:3])
    for mero in (synset.part_meronyms() + synset.substance_meronyms() + synset.member_meronyms())[:5]:
        related.update(l.name().replace("_", " ") for l in mero.lemmas()[:3])
    for holo in (synset.part_holonyms() + synset.substance_holonyms() + synset.member_holonyms())[:5]:
        related.update(l.name().replace("_", " ") for l in holo.lemmas()[:3])

    # Also include the synset's own lemma names (excluding the query word).
    related.update(l.name().replace("_", " ") for l in synset.lemmas())

    return sorted(related)[:20]


def get_sense_pos(synset: Synset) -> str:
    """Return a human-readable POS string for a synset."""
    return _POS_MAP.get(synset.pos(), synset.pos())


def detect_ambiguous_words(sentence: str) -> list[str]:
    """
    Return words in *sentence* that have more than one WordNet synset,
    i.e. words that are genuinely ambiguous.
    """
    tokens = remove_stopwords(tokenize(sentence))
    ambiguous: list[str] = []
    seen: set[str] = set()
    for tok in tokens:
        if tok in seen:
            continue
        seen.add(tok)
        if len(wn.synsets(tok)) > 1:
            ambiguous.append(tok)
    return ambiguous
