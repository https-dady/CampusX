from pathlib import Path
import os

import joblib
from huggingface_hub import hf_hub_download


MODEL_REPO_ID = os.getenv(
    "HF_MODEL_REPO_ID",
    "bytDeveloper/campusx-ml-models"
)

MODEL_FILENAME = "career_model.joblib"

MODEL_REVISION = os.getenv(
    "HF_MODEL_REVISION",
    "main"
)

MODEL_PATH = Path(
    os.getenv(
        "MODEL_PATH",
        Path(__file__).resolve().parents[2]
        / "models"
        / MODEL_FILENAME,
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


def resolve_model_path():
    """
    Resolve the ML model path.

    Use the local model when available.
    Otherwise download it from Hugging Face.
    """

    if MODEL_PATH.is_file():
        return MODEL_PATH

    try:
        downloaded_path = hf_hub_download(
            repo_id=MODEL_REPO_ID,
            filename=MODEL_FILENAME,
            revision=MODEL_REVISION,
            repo_type="model",
        )

        return Path(downloaded_path)

    except Exception as error:
        raise RuntimeError(
            "Unable to download ML model from Hugging Face. "
            f"Repository: {MODEL_REPO_ID}. "
            f"File: {MODEL_FILENAME}. "
            f"Error: {error}"
        ) from error


def load_model_artifact():
    global _model_artifact

    if _model_artifact is not None:
        return _model_artifact

    model_path = resolve_model_path()

    try:
        artifact = joblib.load(model_path)

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
    return load_model_artifact()["model"]


def get_skill_encoder():
    return load_model_artifact()["skill_encoder"]


def get_interest_encoder():
    return load_model_artifact()["interest_encoder"]


def get_categorical_encoder():
    return load_model_artifact()["categorical_encoder"]


def get_feature_columns():
    return load_model_artifact()["feature_columns"]