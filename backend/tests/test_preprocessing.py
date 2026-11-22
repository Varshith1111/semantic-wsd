"""
Tests for the NLTK preprocessing pipeline.
"""

from __future__ import annotations

from app.nlp.preprocessing import (
    lemmatize,
    pos_tag,
    preprocess_pipeline,
    remove_stopwords,
    tokenize,
)


class TestTokenize:
    def test_basic_sentence(self):
        tokens = tokenize("The cat sat on the mat.")
        assert "cat" in tokens
        assert "sat" in tokens
        assert "mat" in tokens

    def test_lowercases(self):
        tokens = tokenize("HELLO World")
        assert all(t == t.lower() for t in tokens)

    def test_empty_string(self):
        assert tokenize("") == []


class TestRemoveStopwords:
    def test_removes_common_stopwords(self):
        tokens = ["the", "cat", "is", "on", "the", "mat"]
        filtered = remove_stopwords(tokens)
        assert "the" not in filtered
        assert "is" not in filtered
        assert "cat" in filtered

    def test_removes_non_alpha(self):
        tokens = ["hello", ".", ",", "world"]
        filtered = remove_stopwords(tokens)
        assert "." not in filtered
        assert "," not in filtered


class TestLemmatize:
    def test_plural_nouns(self):
        result = lemmatize(["dogs", "cats", "running"])
        assert "dog" in result
        assert "cat" in result

    def test_already_lemma(self):
        result = lemmatize(["bank", "tree"])
        assert result == ["bank", "tree"]


class TestPosTag:
    def test_returns_tuples(self):
        tags = pos_tag(["the", "cat", "sat"])
        assert isinstance(tags, list)
        assert all(isinstance(t, tuple) and len(t) == 2 for t in tags)

    def test_noun_detected(self):
        tags = pos_tag(["cat"])
        # 'cat' is typically tagged NN
        assert tags[0][1].startswith("NN")


class TestPreprocessPipeline:
    def test_pipeline_keys(self):
        result = preprocess_pipeline("The dog is running fast.")
        assert "tokens" in result
        assert "filtered_tokens" in result
        assert "lemmatized_tokens" in result
        assert "pos_tags" in result

    def test_pipeline_filtering(self):
        result = preprocess_pipeline("The quick brown fox jumps over the lazy dog.")
        assert "the" not in result["filtered_tokens"]
        assert "fox" in result["filtered_tokens"]

    def test_pipeline_empty(self):
        result = preprocess_pipeline("")
        assert result["tokens"] == []
