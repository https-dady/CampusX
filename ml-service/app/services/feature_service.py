from typing import Any

import numpy as np

from app.model.model_loader import (
    get_categorical_encoder,
    get_feature_columns,
    get_interest_encoder,
    get_skill_encoder,
)


def _normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def _normalize_list(values: list[str]) -> list[str]:
    seen = set()
    result = []

    for value in values:
        normalized = _normalize_text(value)

        if not normalized:
            continue

        key = normalized.lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(normalized)

    return result


def _encode_multilabel(
    encoder: Any,
    values: list[str],
    encoder_name: str,
) -> np.ndarray:
    values = _normalize_list(values)

    try:
        encoded = encoder.transform([values])
    except Exception as error:
        raise ValueError(
            f"Failed to encode {encoder_name}: {error}"
        ) from error

    return np.asarray(encoded)


def _encode_categorical(
    encoder: Any,
    values: dict[str, Any],
) -> tuple[np.ndarray, list[str]]:
    feature_names_in = getattr(
        encoder,
        "feature_names_in_",
        None,
    )

    if feature_names_in is None:
        raise RuntimeError(
            "Categorical encoder does not expose "
            "feature_names_in_."
        )

    row = []

    for field in feature_names_in:
        if field not in values:
            raise ValueError(
                f"Missing categorical field required "
                f"by the model: {field}"
            )

        row.append(values[field])

    try:
        encoded = encoder.transform([row])
    except Exception as error:
        raise ValueError(
            f"Failed to encode categorical features: "
            f"{error}"
        ) from error

    encoded = np.asarray(encoded)

    feature_names = list(
        encoder.get_feature_names_out(
            feature_names_in
        )
    )

    return encoded, feature_names


def build_model_features(
    profile: dict[str, Any],
) -> np.ndarray:
    """
    Convert application profile data into the exact
    83-feature vector expected by the trained model.

    The trained artifact remains the source of truth
    for feature ordering and encoder behavior.
    """

    education = profile.get("education") or {}

    academic_year = education.get("academicYear")
    cgpa = education.get("cgpa")

    if academic_year is None:
        raise ValueError(
            "academicYear is required"
        )

    if cgpa is None:
        raise ValueError(
            "cgpa is required"
        )

    technical_skills = profile.get(
        "technicalSkills",
        [],
    )

    interests = profile.get(
        "interests",
        [],
    )

    has_internship = bool(
        profile.get("hasInternship", False)
    )

    certifications = profile.get(
        "certifications",
        [],
    )

    has_certification = bool(
        certifications
    )

    skill_encoder = get_skill_encoder()
    interest_encoder = get_interest_encoder()
    categorical_encoder = (
        get_categorical_encoder()
    )

    skill_encoded = _encode_multilabel(
        skill_encoder,
        technical_skills,
        "technical skills",
    )

    interest_encoded = _encode_multilabel(
        interest_encoder,
        interests,
        "interests",
    )

    categorical_values = {
        "Degree": _normalize_text(
            str(education.get("degree", ""))
        ),
        "Branch": _normalize_text(
            str(education.get("branch", ""))
        ),
        "Internship": (
            "Yes"
            if has_internship
            else "No"
        ),
    }

    categorical_encoded, categorical_names = (
        _encode_categorical(
            categorical_encoder,
            categorical_values,
        )
    )

    feature_columns = get_feature_columns()

    feature_map: dict[str, float] = {}

    # Numeric features
    feature_map["Year"] = float(
        academic_year
    )

    feature_map["CGPA"] = float(
        cgpa
    )

    # Skill features
    skill_names = list(
        skill_encoder.classes_
    )

    if (
        len(skill_names)
        != skill_encoded.shape[1]
    ):
        raise RuntimeError(
            "Skill encoder output size does not "
            "match its classes."
        )

    for index, name in enumerate(
        skill_names
    ):
        feature_name = (
            f"Skill_{name}"
        )

        feature_map[feature_name] = float(
            skill_encoded[0][index]
        )

    # Interest features
    interest_names = list(
        interest_encoder.classes_
    )

    if (
        len(interest_names)
        != interest_encoded.shape[1]
    ):
        raise RuntimeError(
            "Interest encoder output size does not "
            "match its classes."
        )

    for index, name in enumerate(
        interest_names
    ):
        feature_name = (
            f"Interest_{name}"
        )

        feature_map[feature_name] = float(
            interest_encoded[0][index]
        )

    # Degree / Branch / Internship
    for index, name in enumerate(
        categorical_names
    ):
        feature_map[name] = float(
            categorical_encoded[0][index]
        )

    # Has_Certification is a direct numeric
    # feature in the trained model.
    feature_map["Has_Certification"] = float(
        has_certification
    )

    # Validate exact model contract.
    missing_features = [
        feature
        for feature in feature_columns
        if feature not in feature_map
    ]

    if missing_features:
        raise RuntimeError(
            "Model feature construction failed. "
            f"Missing features: {missing_features}"
        )

    extra_features = [
        feature
        for feature in feature_map
        if feature not in feature_columns
    ]

    if extra_features:
        raise RuntimeError(
            "Model feature construction produced "
            f"unexpected features: {extra_features}"
        )

    # IMPORTANT:
    # Always follow feature_columns from the
    # trained artifact.
    feature_vector = np.array(
        [
            feature_map[feature]
            for feature in feature_columns
        ],
        dtype=float,
    ).reshape(1, -1)

    expected_feature_count = len(
        feature_columns
    )

    if (
        feature_vector.shape[1]
        != expected_feature_count
    ):
        raise RuntimeError(
            "Invalid feature vector size. "
            f"Expected {expected_feature_count}, "
            f"got {feature_vector.shape[1]}"
        )

    if not np.all(
        np.isfinite(feature_vector)
    ):
        raise RuntimeError(
            "Feature vector contains invalid "
            "numeric values."
        )

    return feature_vector