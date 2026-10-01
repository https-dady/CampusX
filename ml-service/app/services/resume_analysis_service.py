from __future__ import annotations

import re
from typing import Any

from app.model.resume_model_loader import (
    get_resume_artifact_value,
    get_resume_model,
)

from app.services.resume_extraction_service import (
    build_resume_data,
    extract_text,
)


# ============================================================================
# NORMALIZATION
# ============================================================================


def _normalize(
    value: str,
) -> str:
    return " ".join(
        (value or "").strip().split()
    ).lower()


# ============================================================================
# MODEL METADATA
# ============================================================================


def _aliases() -> dict[str, str]:
    value = (
        get_resume_artifact_value(
            "skill_aliases",
            {},
        )
        or {}
    )

    if not isinstance(value, dict):
        return {}

    return {
        _normalize(str(alias)): str(canonical)
        for canonical, aliases in value.items()
        for alias in (
            aliases
            if isinstance(aliases, (list, tuple, set))
            else [aliases]
        )
    }


def _known_skills() -> list[str]:
    encoder = get_resume_artifact_value(
        "skills_encoder"
    )

    if (
        encoder is not None
        and hasattr(
            encoder,
            "classes_",
        )
    ):
        return [
            str(value)
            for value in encoder.classes_
        ]

    model = get_resume_model()

    names = getattr(
        model,
        "feature_names_in_",
        [],
    )

    if names is None:
        names = []

    names = list(names)

    return [
        str(name)
        for name in names
        if not re.match(
            r"^(Year|CGPA|Degree_|Branch_|Internship_|Interest_|Skill_|Has_)",
            str(name),
            re.I,
        )
    ]


# ============================================================================
# SKILL NORMALIZATION
# ============================================================================


def _canonicalize_skills(
    skills: list[str],
) -> list[str]:
    aliases = _aliases()

    result = []
    seen = set()

    for skill in skills:
        key = _normalize(skill)

        canonical = aliases.get(
            key,
            skill,
        )

        canonical_key = _normalize(
            canonical
        )

        if (
            canonical_key
            and canonical_key not in seen
        ):
            seen.add(
                canonical_key
            )

            result.append(
                canonical
            )

    return result


# ============================================================================
# EDUCATION NORMALIZATION
# ============================================================================


def _canonical_degree(
    value: str,
) -> str:
    normalized = (
        _normalize(value)
        .replace(" ", "")
    )

    aliases = {
        "btech": "b.tech",
        "b.tech": "b.tech",
        "be": "b.e.",
        "b.e.": "b.e.",
        "bsc": "b.sc",
        "b.sc": "b.sc",
        "bba": "bba",
        "bca": "bca",
        "mtech": "m.tech",
        "m.tech": "m.tech",
        "mca": "mca",
        "mba": "mba",
    }

    return aliases.get(
        normalized,
        _normalize(value),
    )


def _canonical_branch(
    value: str,
) -> str:
    normalized = (
        _normalize(value)
        .replace(" ", "")
    )

    aliases = {
        "ai&ds": "ai&ds",
        "aids": "ai&ds",
        "artificialintelligence&datascience": "ai&ds",
        "cse": "cse",
        "computerscience": "cse",
        "computerscienceandengineering": "cse",
        "it": "it",
        "informationtechnology": "it",
        "datascience": "data science",
        "ece": "ece",
        "businessanalytics": "business analytics",
        "computerapplications": "computer applications",
    }

    return aliases.get(
        normalized,
        _normalize(value),
    )


# ============================================================================
# FEATURE VECTOR
# ============================================================================


def _feature_vector(
    resume: dict[str, Any],
) -> list[float]:
    model = get_resume_model()

    feature_names = getattr(
        model,
        "feature_names_in_",
        None,
    )

    if feature_names is None:
        feature_names = (
            get_resume_artifact_value(
                "feature_names_in"
            )
        )

    if feature_names is None:
        feature_names = (
            get_resume_artifact_value(
                "feature_columns"
            )
        )

    if feature_names is None:
        raise RuntimeError(
            "Resume model does not expose its feature contract."
        )

    # RandomForest feature_names_in_ can be a NumPy array.
    # Convert it to a normal Python list before checking/iterating.
    feature_names = list(feature_names)

    if len(feature_names) == 0:
        raise RuntimeError(
            "Resume model does not expose its feature contract."
        )

    education = resume[
        "education"
    ]

    degree = (
        education.get("degree")
        or ""
    )

    branch = (
        education.get("branch")
        or ""
    )

    internship = (
        "Yes"
        if resume.get(
            "hasInternship"
        )
        else "No"
    )

    skills = {
        _normalize(skill)
        for skill in resume.get(
            "skills",
            [],
        )
    }

    aliases = _aliases()

    skills = {
        _normalize(
            aliases.get(
                skill,
                skill,
            )
        )
        for skill in skills
    }

    cgpa = education.get(
        "cgpa"
    )

    academic_year = education.get(
        "academicYear"
    )

    vector: list[float] = []

    for feature in feature_names:
        name = str(feature)

        normalized = _normalize(
            name
        )

        if normalized == "year":
            vector.append(
                float(
                    academic_year or 0
                )
            )
            continue

        if normalized == "cgpa":
            vector.append(
                float(
                    cgpa or 0
                )
            )
            continue

        if normalized.startswith(
            "degree_"
        ):
            expected = normalized[
                len("degree_") :
            ]

            vector.append(
                1.0
                if (
                    _canonical_degree(
                        degree
                    )
                    == _canonical_degree(
                        expected
                    )
                )
                else 0.0
            )

            continue

        if normalized.startswith(
            "branch_"
        ):
            expected = normalized[
                len("branch_") :
            ]

            vector.append(
                1.0
                if (
                    _canonical_branch(
                        branch
                    )
                    == _canonical_branch(
                        expected
                    )
                )
                else 0.0
            )

            continue

        if normalized.startswith(
            "internship_"
        ):
            expected = normalized[
                len("internship_") :
            ]

            vector.append(
                1.0
                if (
                    _normalize(
                        internship
                    )
                    == expected
                )
                else 0.0
            )

            continue

        if normalized.startswith(
            "skill_"
        ):
            skill_name = normalized[
                len("skill_") :
            ]

            vector.append(
                1.0
                if skill_name in skills
                else 0.0
            )

            continue

        if normalized.startswith(
            "interest_"
        ):
            vector.append(0.0)
            continue

        if normalized.startswith(
            "has_"
        ):
            vector.append(
                1.0
                if (
                    "certification"
                    in normalized
                    and resume[
                        "sections"
                    ].get(
                        "certifications"
                    )
                )
                else 0.0
            )

            continue

        vector.append(
            1.0
            if normalized in skills
            else 0.0
        )

    return vector


# ============================================================================
# CAREER DECODING
# ============================================================================


def _decode_career(
    value: Any,
) -> str:
    encoder = get_resume_artifact_value(
        "career_encoder"
    )

    if (
        encoder is not None
        and hasattr(
            encoder,
            "inverse_transform",
        )
    ):
        try:
            decoded = encoder.inverse_transform(
                [value]
            )

            return str(
                decoded[0]
            )

        except Exception:
            pass

    return str(value)


# ============================================================================
# REQUIRED SKILLS
# ============================================================================


def _required_skills(
    career: str,
) -> list[str]:
    mapping = (
        get_resume_artifact_value(
            "career_required_skills",
            {},
        )
        or {}
    )

    if not isinstance(
        mapping,
        dict,
    ):
        return []

    if career in mapping:
        return [
            str(value)
            for value in mapping[
                career
            ]
        ]

    target = _normalize(
        career
    )

    for key, values in mapping.items():
        if (
            _normalize(
                str(key)
            )
            == target
        ):
            return [
                str(value)
                for value in values
            ]

    return []


# ============================================================================
# STRUCTURE CHECKS
# ============================================================================


def _structure_checks(
    resume: dict[str, Any],
) -> list[dict[str, str]]:
    checks = []

    sections = resume[
        "sections"
    ]

    required = [
        (
            "contact",
            "Contact information",
        ),
        (
            "education",
            "Education",
        ),
        (
            "skills",
            "Technical skills",
        ),
        (
            "projects",
            "Projects",
        ),
    ]

    for key, label in required:
        checks.append(
            {
                "type": "structure",
                "severity": (
                    "success"
                    if sections.get(key)
                    else "warning"
                ),
                "message": (
                    f"{label} section detected."
                    if sections.get(key)
                    else f"{label} section is missing or could not be detected."
                ),
            }
        )

    return checks


# ============================================================================
# CONTENT CHECKS
# ============================================================================


def _content_checks(
    resume: dict[str, Any],
    text: str,
) -> list[dict[str, str]]:
    checks = []

    word_count = resume.get(
        "wordCount",
        0,
    )

    if word_count < 120:
        checks.append(
            {
                "type": "content",
                "severity": "warning",
                "message": (
                    "Resume content is quite short; "
                    "add relevant evidence from projects, "
                    "internships, or experience where applicable."
                ),
            }
        )

    if not resume[
        "sections"
    ].get("summary"):
        checks.append(
            {
                "type": "content",
                "severity": "warning",
                "message": (
                    "A concise professional summary/profile "
                    "section was not detected."
                ),
            }
        )

    if resume[
        "sections"
    ].get("projects"):
        project_text = resume[
            "sectionText"
        ].get(
            "projects",
            "",
        )

        if len(
            project_text.split()
        ) < 25:
            checks.append(
                {
                    "type": "content",
                    "severity": "warning",
                    "message": (
                        "The projects section looks brief; "
                        "include technologies, your contribution, "
                        "and measurable outcomes where possible."
                    ),
                }
            )

    if re.search(
        r"\b(lorem ipsum|your name|xyz company|dummy text)\b",
        text,
        re.I,
    ):
        checks.append(
            {
                "type": "content",
                "severity": "error",
                "message": (
                    "Placeholder text was detected and "
                    "should be replaced before using the resume."
                ),
            }
        )

    return checks


# ============================================================================
# FORMATTING / QUALITY CHECKS
# ============================================================================


def _quality_checks(
    resume: dict[str, Any],
    text: str,
) -> list[dict[str, str]]:
    checks = []

    if resume.get(
        "wordCount",
        0,
    ) > 1200:
        checks.append(
            {
                "type": "formatting",
                "severity": "warning",
                "message": (
                    "The extracted resume text is very long; "
                    "consider tightening repetitive content."
                ),
            }
        )

    if "  " in text:
        checks.append(
            {
                "type": "formatting",
                "severity": "warning",
                "message": (
                    "Inconsistent spacing was detected in extracted text; "
                    "verify the final document formatting."
                ),
            }
        )

    return checks


# ============================================================================
# MAIN RESUME ANALYSIS
# ============================================================================


def analyze_resume(
    file_bytes: bytes,
    mimetype: str,
) -> dict[str, Any]:
    text = extract_text(
        file_bytes,
        mimetype,
    )

    if not text.strip():
        raise ValueError(
            "No readable text could be extracted from the uploaded resume."
        )

    resume = build_resume_data(
        text,
        _known_skills(),
    )

    resume["skills"] = (
        _canonicalize_skills(
            resume["skills"]
        )
    )

    vector = _feature_vector(
        resume
    )

    model = get_resume_model()

    predictions = model.predict_proba(
        [vector]
    )[0]

    classes = getattr(
        model,
        "classes_",
        None,
    )

    if classes is None:
        raise RuntimeError(
            "Resume model does not expose classes_."
        )

    classes = list(classes)

    pairs = [
        {
            "career": _decode_career(
                value
            ),
            "probability": float(
                probability
            ),
        }
        for value, probability in zip(
            classes,
            predictions,
        )
    ]

    pairs.sort(
        key=lambda item: item[
            "probability"
        ],
        reverse=True,
    )

    top_career = (
        pairs[0]["career"]
        if pairs
        else None
    )

    required = (
        _required_skills(
            top_career
        )
        if top_career
        else []
    )

    detected_map = {
        _normalize(value): value
        for value in resume[
            "skills"
        ]
    }

    missing = [
        skill
        for skill in required
        if _normalize(skill)
        not in detected_map
    ]

    checks = (
        _structure_checks(
            resume
        )
        + _content_checks(
            resume,
            text,
        )
        + _quality_checks(
            resume,
            text,
        )
    )

    return {
        "modelVersion": "resume-v1",
        "file": {
            "type": mimetype,
        },
        "extracted": {
            "personal": resume[
                "personal"
            ],
            "education": resume[
                "education"
            ],
            "hasInternship": resume[
                "hasInternship"
            ],
            "skills": resume[
                "skills"
            ],
            "sections": resume[
                "sections"
            ],
            "wordCount": resume[
                "wordCount"
            ],
        },
        "career": {
            "predictions": pairs[:5],
            "topMatch": top_career,
        },
        "skills": {
            "detected": resume[
                "skills"
            ],
            "requiredForTopCareer": required,
            "missingForTopCareer": missing,
        },
        "checks": checks,
        "summary": {
            "totalIssues": sum(
                1
                for check in checks
                if check[
                    "severity"
                ]
                in {
                    "warning",
                    "error",
                }
            ),
            "structureIssues": sum(
                1
                for check in checks
                if check["type"]
                == "structure"
                and check[
                    "severity"
                ]
                != "success"
            ),
            "contentIssues": sum(
                1
                for check in checks
                if check["type"]
                == "content"
                and check[
                    "severity"
                ]
                != "success"
            ),
            "formattingIssues": sum(
                1
                for check in checks
                if check["type"]
                == "formatting"
                and check[
                    "severity"
                ]
                != "success"
            ),
        },
    }