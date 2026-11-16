from pathlib import Path
import os
from typing import Any

import joblib
from huggingface_hub import hf_hub_download


MODEL_REPO_ID = os.getenv(
    "HF_MODEL_REPO_ID",
    "bytDeveloper/campusx-ml-models"
)

MODEL_FILENAME = "resume_model.joblib"

MODEL_REVISION = os.getenv(
    "HF_MODEL_REVISION",
    "main"
)


MODEL_PATH = Path(
    os.getenv(
        "RESUME_MODEL_PATH",
        Path(__file__).resolve().parents[2]
        / "models"
        / MODEL_FILENAME,
    )
)


_resume_artifact: Any = None


def resolve_resume_model_path():
    """
    Resolve the resume model path.

    Use local model if available.
    Otherwise download from Hugging Face.
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
            "Unable to download resume model from Hugging Face. "
            f"Repository: {MODEL_REPO_ID}. "
            f"File: {MODEL_FILENAME}. "
            f"Error: {error}"
        ) from error


def load_resume_artifact():
    global _resume_artifact

    if _resume_artifact is not None:
        return _resume_artifact

    model_path = resolve_resume_model_path()

    try:
        artifact = joblib.load(model_path)

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
            "Invalid resume model artifact: "
            "career_model does not support predict()."
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