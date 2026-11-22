"""
Main WSD prediction orchestrator.

Combines preprocessing, context extraction, WordNet sense enumeration,
first-order scoring, second-order scoring, and explanation generation
into a single ``predict()`` call.
"""

from __future__ import annotations

import logging
import time

from app.core.config import settings
from app.models.schemas import CandidateMeaning, PredictionResponse
from app.nlp.context_extractor import extract_context_words
from app.nlp.first_order import compute_first_order_scores
from app.nlp.preprocessing import preprocess_pipeline
from app.nlp.second_order import compute_second_order_scores
from app.nlp.similarity import SentenceEmbedder
from app.nlp.word_sense import (
    get_related_words,
    get_sense_definition,
    get_sense_examples,
    get_sense_pos,
    get_word_senses,
)

logger = logging.getLogger(__name__)


class WSDPredictor:
    """
    Orchestrates the full Word Sense Disambiguation pipeline using
    weighted first-order and second-order semantic similarity.
    """

    def __init__(
        self,
        first_order_weight: float | None = None,
        second_order_weight: float | None = None,
    ) -> None:
        self.w1 = first_order_weight if first_order_weight is not None else settings.FIRST_ORDER_WEIGHT
        self.w2 = second_order_weight if second_order_weight is not None else settings.SECOND_ORDER_WEIGHT
        self._embedder = SentenceEmbedder.get_instance()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(self, sentence: str, target_word: str) -> PredictionResponse:
        """
        Run the full disambiguation pipeline for *target_word* in *sentence*.
        """
        start = time.perf_counter()

        # 1. Validate inputs --------------------------------------------------
        if not sentence or not sentence.strip():
            return self._error_response(sentence, target_word, "Empty sentence provided.", start)
        if not target_word or not target_word.strip():
            return self._error_response(sentence, target_word, "Empty target word provided.", start)

        target_word_clean = target_word.strip().lower()

        # 2. Preprocess -------------------------------------------------------
        pipeline = preprocess_pipeline(sentence)

        # 3. Extract context words --------------------------------------------
        context_words = extract_context_words(
            sentence, target_word_clean, window_size=settings.CONTEXT_WINDOW_SIZE,
        )

        # 4. Candidate senses from WordNet with POS awareness ----------------
        wn_pos = None
        for tok, tag in pipeline["pos_tags"]:
            if tok.lower() == target_word_clean:
                if tag.startswith("NN"):
                    wn_pos = "n"
                elif tag.startswith("VB"):
                    wn_pos = "v"
                elif tag.startswith("JJ"):
                    wn_pos = "a"
                elif tag.startswith("RB"):
                    wn_pos = "r"
                break

        candidate_senses = get_word_senses(target_word_clean, pos=wn_pos)
        if not candidate_senses:
            return self._error_response(
                sentence,
                target_word,
                f"The word '{target_word}' was not found in WordNet.",
                start,
                context_words=context_words,
                pos_tags=pipeline["pos_tags"],
            )

        # 5. First-order scores ------------------------------------------------
        first_order_scores = compute_first_order_scores(
            sentence, target_word_clean, candidate_senses, self._embedder,
        )

        # 6. Second-order scores -----------------------------------------------
        second_order_scores = compute_second_order_scores(
            sentence, target_word_clean, candidate_senses, context_words, self._embedder,
        )

        # 7. Combine scores ----------------------------------------------------
        combined_scores = [
            self.w1 * fo + self.w2 * so
            for fo, so in zip(first_order_scores, second_order_scores)
        ]

        # 8. Rank candidates ---------------------------------------------------
        indexed = list(enumerate(combined_scores))
        indexed.sort(key=lambda x: x[1], reverse=True)

        best_idx = indexed[0][0]
        best_sense = candidate_senses[best_idx]
        best_combined = combined_scores[best_idx]
        best_fo = first_order_scores[best_idx]
        best_so = second_order_scores[best_idx]

        # Confidence: difference between top-1 and top-2 combined scores
        if len(indexed) > 1:
            confidence = best_combined - indexed[1][1]
            # Scale to [0, 1] – in practice combined scores are already in [0,1]
            confidence = min(max(confidence + 0.5, 0.0), 1.0)
        else:
            confidence = 1.0

        # 9. Build alternative meanings ----------------------------------------
        alternatives: list[CandidateMeaning] = []
        for rank, (idx, _) in enumerate(indexed):
            sense = candidate_senses[idx]
            alternatives.append(
                CandidateMeaning(
                    definition=get_sense_definition(sense),
                    pos=get_sense_pos(sense),
                    synset_name=sense.name(),
                    first_order_score=round(first_order_scores[idx], 4),
                    second_order_score=round(second_order_scores[idx], 4),
                    combined_score=round(combined_scores[idx], 4),
                    examples=get_sense_examples(sense),
                )
            )

        # 10. Generate explanation --------------------------------------------
        explanation = self._generate_explanation(
            sentence, target_word_clean, best_sense,
            best_fo, best_so, context_words,
        )

        elapsed = time.perf_counter() - start

        return PredictionResponse(
            sentence=sentence,
            target_word=target_word,
            predicted_meaning=get_sense_definition(best_sense),
            confidence=round(confidence, 4),
            similarity_score=round(best_combined, 4),
            first_order_score=round(best_fo, 4),
            second_order_score=round(best_so, 4),
            alternative_meanings=alternatives,
            explanation=explanation,
            context_words=context_words,
            pos_tags=[[w, t] for w, t in pipeline["pos_tags"]],
            processing_time=round(elapsed, 4),
        )

    # ------------------------------------------------------------------
    # Explanation generation
    # ------------------------------------------------------------------

    def _generate_explanation(
        self,
        sentence: str,
        target_word: str,
        top_sense,
        first_score: float,
        second_score: float,
        context_words: list[str],
    ) -> str:
        """
        Produce a human-readable explanation of why the top sense was chosen.
        """
        definition = get_sense_definition(top_sense)
        pos = get_sense_pos(top_sense)
        related = get_related_words(top_sense)[:8]

        parts: list[str] = []
        parts.append(
            f"The word '{target_word}' is predicted to mean "
            f"'{definition}' (used as a {pos})."
        )

        if context_words:
            cw_str = "', '".join(context_words[:6])
            parts.append(
                f"The surrounding context words ['{cw_str}'] were analysed."
            )

        parts.append(
            f"First-order similarity (direct context–definition match) "
            f"scored {first_score:.4f}, "
            f"while second-order similarity (neighbourhood overlap) "
            f"scored {second_score:.4f}."
        )

        if related:
            rel_str = ", ".join(related[:6])
            parts.append(
                f"The semantic neighbourhood of this sense includes words "
                f"like: {rel_str}, which align well with the sentence context."
            )

        dominant = "first-order (direct)" if first_score > second_score else "second-order (neighbourhood)"
        parts.append(
            f"The {dominant} signal contributed more to the final prediction, "
            f"with weights {self.w1}/{self.w2}."
        )

        return " ".join(parts)

    # ------------------------------------------------------------------
    # Error / fallback responses
    # ------------------------------------------------------------------

    @staticmethod
    def _error_response(
        sentence: str,
        target_word: str,
        message: str,
        start: float,
        context_words: list[str] | None = None,
        pos_tags: list | None = None,
    ) -> PredictionResponse:
        elapsed = time.perf_counter() - start
        return PredictionResponse(
            sentence=sentence,
            target_word=target_word,
            predicted_meaning=message,
            confidence=0.0,
            similarity_score=0.0,
            first_order_score=0.0,
            second_order_score=0.0,
            alternative_meanings=[],
            explanation=message,
            context_words=context_words or [],
            pos_tags=pos_tags or [],
            processing_time=round(elapsed, 4),
        )
