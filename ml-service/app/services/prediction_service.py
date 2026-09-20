from typing import Any

import numpy as np

from app.model.model_loader import (
    get_model,
)
from app.services.feature_service import (
    build_model_features,
)


def _get_model_classes(model: Any) -> list[str]:
    classes = getattr(model, "classes_", None)

    if classes is None:
        raise RuntimeError(
            "Loaded ML model does not expose classes_."
        )

    return [str(value) for value in classes]


def _validate_probabilities(
    probabilities: np.ndarray,
    class_count: int,
) -> np.ndarray:
    if probabilities.ndim != 2:
        raise RuntimeError(
            "Invalid prediction probability shape."
        )

    if probabilities.shape[0] != 1:
        raise RuntimeError(
            "Expected probabilities for exactly one profile."
        )

    if probabilities.shape[1] != class_count:
        raise RuntimeError(
            "Probability count does not match "
            "the model class count."
        )

    if not np.all(np.isfinite(probabilities)):
        raise RuntimeError(
            "Model returned invalid probability values."
        )

    if np.any(probabilities < 0) or np.any(
        probabilities > 1
    ):
        raise RuntimeError(
            "Model returned probabilities outside "
            "the valid range."
        )

    probability_sum = float(
        np.sum(probabilities[0])
    )

    if not np.isclose(
        probability_sum,
        1.0,
        atol=1e-6,
    ):
        raise RuntimeError(
            "Model probabilities do not sum to 1."
        )

    return probabilities


def predict_careers(
    profile: dict[str, Any],
) -> list[dict[str, Any]]:
    model = get_model()

    feature_vector = build_model_features(
        profile
    )

    try:
        probabilities = model.predict_proba(
            feature_vector
        )
    except Exception as error:
        raise RuntimeError(
            f"ML prediction failed: {error}"
        ) from error

    classes = _get_model_classes(model)

    probabilities = _validate_probabilities(
        np.asarray(probabilities),
        len(classes),
    )

    prediction_values = probabilities[0]

    predictions = [
        {
            "career": career,
            "probability": float(
                probability
            ),
        }
        for career, probability in zip(
            classes,
            prediction_values,
        )
    ]

    predictions.sort(
        key=lambda item: item["probability"],
        reverse=True,
    )

    return predictions