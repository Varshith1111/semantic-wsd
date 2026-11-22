"""
Tests for the embedding and cosine similarity module.
"""

from __future__ import annotations

import numpy as np

from app.nlp.similarity import SentenceEmbedder


class TestCosine:
    def test_identical_vectors(self):
        v = np.array([1.0, 2.0, 3.0])
        assert SentenceEmbedder.cosine_similarity(v, v) == pytest.approx(1.0, abs=1e-6)

    def test_orthogonal_vectors(self):
        v1 = np.array([1.0, 0.0])
        v2 = np.array([0.0, 1.0])
        assert SentenceEmbedder.cosine_similarity(v1, v2) == pytest.approx(0.0, abs=1e-6)

    def test_opposite_vectors(self):
        v1 = np.array([1.0, 0.0])
        v2 = np.array([-1.0, 0.0])
        assert SentenceEmbedder.cosine_similarity(v1, v2) == pytest.approx(-1.0, abs=1e-6)

    def test_zero_vector(self):
        v1 = np.array([0.0, 0.0])
        v2 = np.array([1.0, 2.0])
        assert SentenceEmbedder.cosine_similarity(v1, v2) == 0.0


class TestSentenceEmbedder:
    def test_singleton(self):
        e1 = SentenceEmbedder.get_instance()
        e2 = SentenceEmbedder.get_instance()
        assert e1 is e2

    def test_encode_shape(self):
        embedder = SentenceEmbedder.get_instance()
        vec = embedder.encode("Hello world")
        assert isinstance(vec, np.ndarray)
        assert vec.ndim == 1
        assert vec.shape[0] > 0

    def test_similar_sentences_higher_score(self):
        embedder = SentenceEmbedder.get_instance()
        v_base = embedder.encode("I love playing football.")
        v_similar = embedder.encode("I enjoy soccer games.")
        v_different = embedder.encode("The chemical formula of water is H2O.")

        sim_close = embedder.cosine_similarity(v_base, v_similar)
        sim_far = embedder.cosine_similarity(v_base, v_different)
        assert sim_close > sim_far, (
            f"Similar sentences should score higher: {sim_close:.4f} vs {sim_far:.4f}"
        )

    def test_batch_encode(self):
        embedder = SentenceEmbedder.get_instance()
        texts = ["Hello", "World", "Foo bar"]
        vecs = embedder.batch_encode(texts)
        assert len(vecs) == 3
        assert all(isinstance(v, np.ndarray) for v in vecs)


# Need pytest for approx
import pytest  # noqa: E402
