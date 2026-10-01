from pathlib import Path
import os
from typing import Any

import joblib


MODEL_PATH = Path(
    os.getenv(
        "RESUME_MODEL_PATH",
        Path(__file__).resolve().parents[2] / "models" / "resume_model.joblib",
    )
)

_resume_artifact: Any = None


def load_resume_artifact():
    global _resume_artifact

    if _resume_artifact is not None:
        return _resume_artifact

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Resume model file not found: {MODEL_PATH}"
        )

    try:
        artifact = joblib.load(MODEL_PATH)
    except Exception as error:
        raise RuntimeError(
            f"Failed to load resume model: {error}"
        ) from error

    if not isinstance(artifact, dict):
        raise RuntimeError(
            "Invalid resume model artifact. Expected a dictionary."
        )

    required_keys = {
        "career_model",
        "career_encoder",
        "feature_columns",
    }

    missing_keys = required_keys.difference(artifact.keys())

    if missing_keys:
        missing = ", ".join(sorted(missing_keys))
        raise RuntimeError(
            f"Invalid resume model artifact: missing keys: {missing}."
        )

    career_model = artifact["career_model"]

    if not hasattr(career_model, "predict"):
        raise RuntimeError(
            "Invalid resume model artifact: career_model does not support predict()."
        )

    _resume_artifact = artifact

    return _resume_artifact


def get_resume_model():
    """
    Return the actual career prediction model stored
    inside the resume model artifact.
    """
    return load_resume_artifact()["career_model"]


def get_resume_artifact_value(name: str, default=None):
    """
    Return any additional metadata stored inside
    the resume model artifact.
    """
    artifact = load_resume_artifact()
    return artifact.get(name, default)