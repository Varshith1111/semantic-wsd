"""
Evaluation module with a hand-crafted WSD benchmark dataset.

Contains 30+ examples covering common ambiguous English words, each
annotated with the expected WordNet synset.  The evaluator runs the
full prediction pipeline and reports accuracy, precision, recall, and F1.
"""

from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

from app.models.schemas import EvaluationResult
from app.nlp.predictor import WSDPredictor

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Hand-crafted evaluation dataset
# Each tuple: (sentence, target_word, expected_synset_name)
# ---------------------------------------------------------------------------

EVAL_DATASET: list[tuple[str, str, str]] = [
    # bank
    ("I deposited money at the bank.", "bank", "savings_bank.n.02"),
    ("The river bank was covered in mud.", "bank", "bank.n.01"),
    ("She walked along the bank of the river.", "bank", "bank.n.01"),
    # bat
    ("He swung the bat and hit a home run.", "bat", "bat.n.05"),
    ("A bat flew out of the cave at dusk.", "bat", "bat.n.01"),
    # crane
    ("The crane lifted the steel beams.", "crane", "crane.n.04"),
    ("A crane stood gracefully in the marsh.", "crane", "crane.n.05"),
    # spring
    ("Flowers bloom in the spring.", "spring", "spring.n.01"),
    ("The spring in the mattress broke.", "spring", "spring.n.03"),
    ("Fresh water flows from the spring.", "spring", "spring.n.06"),
    # bark
    ("The dog will bark at strangers.", "bark", "bark.v.01"),
    ("The bark of the tree was rough.", "bark", "bark.n.02"),
    # bass
    ("He played the bass guitar at the concert.", "bass", "bass.n.07"),
    ("They caught a large bass in the lake.", "bass", "bass.n.01"),
    # bow
    ("She tied a bow on the gift.", "bow", "bow.n.04"),
    ("The archer drew the bow carefully.", "bow", "bow.n.02"),
    # chip
    ("The computer chip is very powerful.", "chip", "chip.n.07"),
    ("She ate a bag of potato chips.", "chip", "chip.n.04"),
    # club
    ("She joined the drama club at school.", "club", "club.n.01"),
    ("He used a golf club to hit the ball.", "club", "club.n.07"),
    # diamond
    ("She wore a beautiful diamond ring.", "diamond", "diamond.n.01"),
    ("The baseball player ran to the diamond.", "diamond", "diamond.n.07"),
    # fan
    ("The electric fan cooled the room.", "fan", "fan.n.01"),
    ("He is a huge fan of that band.", "fan", "fan.n.03"),
    # jam
    ("I spread jam on my toast.", "jam", "jam.n.01"),
    ("We were stuck in a traffic jam.", "jam", "jam.n.02"),
    # mole
    ("The mole dug tunnels in the garden.", "mole", "mole.n.06"),
    ("She had a small mole on her cheek.", "mole", "mole.n.01"),
    # nail
    ("He hammered the nail into the wall.", "nail", "nail.n.02"),
    ("She painted her nail a bright red.", "nail", "nail.n.01"),
    # palm
    ("She held the coin in the palm of her hand.", "palm", "palm.n.01"),
    ("Coconuts grow on palm trees.", "palm", "palm.n.03"),
    # pitcher
    ("The pitcher threw a fastball.", "pitcher", "pitcher.n.01"),
    ("Pour water from the pitcher.", "pitcher", "pitcher.n.02"),
    # plant
    ("She watered the plant every day.", "plant", "plant.n.02"),
    ("The manufacturing plant produces cars.", "plant", "plant.n.01"),
    # ring
    ("He gave her a diamond ring.", "ring", "ring.n.08"),
    ("The phone began to ring loudly.", "ring", "ring.v.01"),
    # rock
    ("He sat on a large rock by the river.", "rock", "rock.n.01"),
    ("They like to listen to rock music.", "rock", "rock.n.08"),
    # seal
    ("A seal was swimming near the shore.", "seal", "seal.n.09"),
    ("Please seal the envelope before sending it.", "seal", "seal.v.01"),
    # star
    ("The star shone brightly in the night sky.", "star", "star.n.01"),
    ("She is a famous movie star.", "star", "star.n.04"),
    # tank
    ("The fish tank needs cleaning.", "tank", "tank.n.01"),
    ("The army tank rolled across the field.", "tank", "tank.n.02"),
    # tie
    ("He wore a silk tie to the interview.", "tie", "tie.n.01"),
    ("The game ended in a tie.", "tie", "tie.n.03"),
    # trunk
    ("The elephant lifted its trunk.", "trunk", "trunk.n.01"),
    ("She packed her clothes in the trunk.", "trunk", "trunk.n.02"),
    # vessel
    ("The vessel sailed across the ocean.", "vessel", "vessel.n.02"),
    ("Blood flows through every vessel in the body.", "vessel", "vessel.n.03"),
    # watch
    ("He checked the time on his watch.", "watch", "watch.n.01"),
    ("Watch the sunset from the balcony.", "watch", "watch.v.01"),
]


def run_evaluation(predictor: WSDPredictor | None = None) -> EvaluationResult:
    """
    Run the full evaluation suite and return structured metrics.

    If *predictor* is not supplied, a new one is instantiated.
    """
    if predictor is None:
        predictor = WSDPredictor()

    y_true: list[str] = []
    y_pred: list[str] = []
    per_word_correct: dict[str, int] = defaultdict(int)
    per_word_total: dict[str, int] = defaultdict(int)

    for sentence, target, expected_synset in EVAL_DATASET:
        result = predictor.predict(sentence, target)

        # Find the predicted synset name from the top alternative meaning.
        predicted_synset = ""
        if result.alternative_meanings:
            predicted_synset = result.alternative_meanings[0].synset_name

        y_true.append(expected_synset)
        y_pred.append(predicted_synset)

        per_word_total[target] += 1
        if predicted_synset == expected_synset:
            per_word_correct[target] += 1

    # --- Compute metrics ---
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    total = len(y_true)

    # Collect unique labels for metric calculation.
    all_labels = sorted(set(y_true + y_pred))

    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average="weighted", zero_division=0, labels=all_labels)
    rec = recall_score(y_true, y_pred, average="weighted", zero_division=0, labels=all_labels)
    f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0, labels=all_labels)
    cm = confusion_matrix(y_true, y_pred, labels=all_labels).tolist()

    per_word_acc: dict[str, float] = {}
    for word in per_word_total:
        per_word_acc[word] = round(per_word_correct[word] / per_word_total[word], 4)

    return EvaluationResult(
        accuracy=round(acc, 4),
        precision=round(prec, 4),
        recall=round(rec, 4),
        f1_score=round(f1, 4),
        total_samples=total,
        correct_predictions=correct,
        dataset_name="WSD Hand-Crafted Benchmark (v1)",
        confusion_matrix=cm,
        per_word_accuracy=per_word_acc,
    )
