from pathlib import Path
import os

import joblib


MODEL_PATH = Path(
    os.getenv(
        "MODEL_PATH",
        Path(__file__).resolve().parents[2]
        / "models"
        / "career_model.joblib",
    )
)


REQUIRED_ARTIFACT_KEYS = {
    "model",
    "skill_encoder",
    "interest_encoder",
    "categorical_encoder",
    "feature_columns",
}


_model_artifact = None


def load_model_artifact():
    global _model_artifact

    if _model_artifact is not None:
        return _model_artifact

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"ML model file not found: {MODEL_PATH}"
        )

    try:
        artifact = joblib.load(MODEL_PATH)
    except Exception as error:
        raise RuntimeError(
            f"Failed to load ML model: {error}"
        ) from error

    if not isinstance(artifact, dict):
        raise RuntimeError(
            "Invalid ML model artifact: expected a dictionary"
        )

    missing_keys = REQUIRED_ARTIFACT_KEYS - set(
        artifact.keys()
    )

    if missing_keys:
        raise RuntimeError(
            "Invalid ML model artifact. "
            f"Missing keys: {sorted(missing_keys)}"
        )

    model = artifact["model"]
    feature_columns = artifact["feature_columns"]

    if not hasattr(model, "predict"):
        raise RuntimeError(
            "Invalid ML model: predict() is not available"
        )

    if not hasattr(model, "predict_proba"):
        raise RuntimeError(
            "Invalid ML model: predict_proba() is not available"
        )

    if not isinstance(feature_columns, list):
        raise RuntimeError(
            "Invalid ML model artifact: "
            "feature_columns must be a list"
        )

    if not feature_columns:
        raise RuntimeError(
            "Invalid ML model artifact: "
            "feature_columns is empty"
        )

    _model_artifact = artifact

    return _model_artifact


def get_model():
    artifact = load_model_artifact()

    return artifact["model"]


def get_skill_encoder():
    artifact = load_model_artifact()

    return artifact["skill_encoder"]


def get_interest_encoder():
    artifact = load_model_artifact()

    return artifact["interest_encoder"]


def get_categorical_encoder():
    artifact = load_model_artifact()

    return artifact["categorical_encoder"]


def get_feature_columns():
    artifact = load_model_artifact()

    return artifact["feature_columns"]