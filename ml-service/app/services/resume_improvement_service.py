from __future__ import annotations

import re
from typing import Any

from app.model.resume_model_loader import (
    get_resume_artifact_value,
)


def _normalize(value: Any) -> str:
    return " ".join(
        str(value or "").strip().split()
    ).lower()


def _artifact_dict(
    name: str,
    default: Any,
) -> Any:
    value = get_resume_artifact_value(
        name,
        default,
    )

    return (
        value
        if value is not None
        else default
    )


def _required_skills(
    career: str | None,
) -> list[str]:
    if not career:
        return []

    mapping = _artifact_dict(
        "career_required_skills",
        {},
    )

    if not isinstance(mapping, dict):
        return []

    if career in mapping:
        return [
            str(skill)
            for skill in mapping[career]
        ]

    target = _normalize(career)

    for key, skills in mapping.items():
        if (
            _normalize(key)
            == target
        ):
            return [
                str(skill)
                for skill in skills
            ]

    return []


def _section_present(
    sections: dict[str, Any],
    *names: str,
) -> bool:
    for name in names:
        if sections.get(name):
            return True

    return False


def _count_action_verbs(
    text: str,
) -> int:
    verbs = _artifact_dict(
        "action_verbs",
        set(),
    )

    if not isinstance(
        verbs,
        (set, list, tuple),
    ):
        return 0

    normalized_text = _normalize(text)

    return sum(
        1
        for verb in verbs
        if re.search(
            rf"\b{re.escape(str(verb).lower())}\b",
            normalized_text,
        )
    )


def _count_impact_patterns(
    text: str,
) -> int:
    patterns = _artifact_dict(
        "impact_patterns",
        [],
    )

    if not isinstance(
        patterns,
        (list, tuple),
    ):
        return 0

    count = 0

    for pattern in patterns:
        try:
            count += len(
                re.findall(
                    pattern,
                    text,
                    flags=re.IGNORECASE,
                )
            )
        except re.error:
            continue

    return count


def _structure_score(
    sections: dict[str, Any],
) -> float:
    important_sections = [
        (
            "contact",
        ),
        (
            "education",
        ),
        (
            "skills",
        ),
        (
            "projects",
        ),
        (
            "summary",
        ),
        (
            "experience",
        ),
        (
            "certifications",
        ),
    ]

    detected = sum(
        1
        for section_group in important_sections
        if _section_present(
            sections,
            *section_group,
        )
    )

    return round(
        (
            detected
            / len(important_sections)
        )
        * 100,
        1,
    )


def _skill_score(
    detected_skills: list[str],
    required_skills: list[str],
) -> float:
    if not required_skills:
        return 100.0

    detected = {
        _normalize(skill)
        for skill in detected_skills
    }

    matched = sum(
        1
        for skill in required_skills
        if _normalize(skill)
        in detected
    )

    return round(
        (
            matched
            / len(required_skills)
        )
        * 100,
        1,
    )


def _impact_score(
    impact_count: int,
) -> float:
    if impact_count <= 0:
        return 0.0

    if impact_count >= 5:
        return 100.0

    return round(
        impact_count
        / 5
        * 100,
        1,
    )


def _bullet_quality_score(
    action_verb_count: int,
    project_text: str,
    experience_text: str,
) -> float:
    combined_text = (
        f"{project_text}\n"
        f"{experience_text}"
    ).strip()

    if not combined_text:
        return 0.0

    word_count = len(
        combined_text.split()
    )

    if word_count == 0:
        return 0.0

    score = 0.0

    if action_verb_count >= 1:
        score += 35

    if action_verb_count >= 3:
        score += 25

    if action_verb_count >= 5:
        score += 20

    if word_count >= 50:
        score += 20

    return min(
        round(score, 1),
        100.0,
    )


def _weighted_score(
    skills_score: float,
    structure_score: float,
    impact_score: float,
    bullet_quality_score: float,
) -> float:
    configured_weights = _artifact_dict(
        "score_weights",
        {},
    )

    if not isinstance(
        configured_weights,
        dict,
    ):
        configured_weights = {}

    weights = {
        "skills": float(
            configured_weights.get(
                "skills",
                0.40,
            )
        ),
        "structure": float(
            configured_weights.get(
                "structure",
                0.20,
            )
        ),
        "impact": float(
            configured_weights.get(
                "impact",
                0.20,
            )
        ),
        "bullet_quality": float(
            configured_weights.get(
                "bullet_quality",
                0.20,
            )
        ),
    }

    total_weight = sum(
        weights.values()
    )

    if total_weight <= 0:
        weights = {
            "skills": 0.40,
            "structure": 0.20,
            "impact": 0.20,
            "bullet_quality": 0.20,
        }
        total_weight = 1.0

    score = (
        (
            skills_score
            * weights["skills"]
        )
        + (
            structure_score
            * weights["structure"]
        )
        + (
            impact_score
            * weights["impact"]
        )
        + (
            bullet_quality_score
            * weights["bullet_quality"]
        )
    ) / total_weight

    return round(
        max(
            0.0,
            min(
                100.0,
                score,
            ),
        ),
        1,
    )


def _priority(
    severity: str,
) -> str:
    if severity == "error":
        return "high"

    if severity == "warning":
        return "medium"

    return "low"


def _build_check_suggestions(
    checks: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    suggestions = []

    for check in checks:
        severity = str(
            check.get(
                "severity",
                "warning",
            )
        )

        if severity == "success":
            continue

        check_type = str(
            check.get(
                "type",
                "content",
            )
        )

        message = str(
            check.get(
                "message",
                "",
            )
        )

        if not message:
            continue

        if check_type == "structure":
            action = (
                "Add the missing section and keep "
                "its heading clear and consistent."
            )

        elif check_type == "formatting":
            action = (
                "Review spacing, alignment, "
                "section hierarchy, and visual consistency "
                "in the final resume."
            )

        else:
            action = (
                "Rewrite this section with specific evidence, "
                "technologies, responsibilities, and outcomes."
            )

        suggestions.append(
            {
                "category": check_type,
                "priority": _priority(
                    severity
                ),
                "issue": message,
                "action": action,
            }
        )

    return suggestions


def _build_skill_suggestions(
    career: str | None,
    missing_skills: list[str],
) -> list[dict[str, Any]]:
    if not missing_skills:
        return []

    top_skills = missing_skills[:8]

    return [
        {
            "category": "skills",
            "priority": (
                "high"
                if index < 3
                else "medium"
            ),
            "issue": (
                f"{skill} is relevant to "
                f"the predicted {career or 'target'} career."
            ),
            "action": (
                f"Add {skill} only after gaining "
                f"real project, academic, internship, "
                f"or certification evidence for it."
            ),
            "skill": skill,
        }
        for index, skill in enumerate(
            top_skills
        )
    ]


def _build_strengths(
    detected_skills: list[str],
    sections: dict[str, Any],
    top_career: str | None,
    impact_count: int,
) -> list[str]:
    strengths = []

    if detected_skills:
        strengths.append(
            f"{len(detected_skills)} relevant "
            "technical skills were detected."
        )

    if top_career:
        strengths.append(
            f"The resume has a model-predicted "
            f"career direction: {top_career}."
        )

    if _section_present(
        sections,
        "projects",
    ):
        strengths.append(
            "A projects section was detected."
        )

    if _section_present(
        sections,
        "education",
    ):
        strengths.append(
            "Education information was detected."
        )

    if impact_count > 0:
        strengths.append(
            "Measurable or outcome-oriented "
            "evidence was detected."
        )

    return strengths[:6]


def _build_quick_wins(
    sections: dict[str, Any],
    missing_skills: list[str],
    impact_count: int,
    action_verb_count: int,
) -> list[str]:
    quick_wins = []

    if not _section_present(
        sections,
        "summary",
    ):
        quick_wins.append(
            "Add a concise professional summary "
            "aligned with the intended career direction."
        )

    if missing_skills:
        quick_wins.append(
            "Prioritize the first few missing skills "
            "that are genuinely relevant to your target career."
        )

    if impact_count == 0:
        quick_wins.append(
            "Add measurable outcomes to project or "
            "experience bullets where truthful evidence exists."
        )

    if action_verb_count < 3:
        quick_wins.append(
            "Start project and experience bullets "
            "with clear action verbs describing your contribution."
        )

    if not _section_present(
        sections,
        "projects",
    ):
        quick_wins.append(
            "Add a projects section with technologies, "
            "your contribution, and outcomes."
        )

    return quick_wins[:5]


def build_improvement_report(
    resume: dict[str, Any],
    checks: list[dict[str, Any]],
    top_career: str | None,
    missing_skills: list[str],
    raw_text: str,
) -> dict[str, Any]:
    sections = (
        resume.get(
            "sections",
            {},
        )
        or {}
    )

    detected_skills = (
        resume.get(
            "skills",
            [],
        )
        or []
    )

    section_text = (
        resume.get(
            "sectionText",
            {},
        )
        or {}
    )

    project_text = str(
        section_text.get(
            "projects",
            "",
        )
        or ""
    )

    experience_text = str(
        section_text.get(
            "experience",
            "",
        )
        or ""
    )

    action_verb_count = (
        _count_action_verbs(
            (
                project_text
                + "\n"
                + experience_text
            )
        )
    )

    impact_count = (
        _count_impact_patterns(
            raw_text
        )
    )

    required_skills = _required_skills(
        top_career
    )

    skills_score = _skill_score(
        detected_skills,
        required_skills,
    )

    structure_score = _structure_score(
        sections
    )

    impact_score = _impact_score(
        impact_count
    )

    bullet_quality_score = (
        _bullet_quality_score(
            action_verb_count,
            project_text,
            experience_text,
        )
    )

    overall_score = _weighted_score(
        skills_score,
        structure_score,
        impact_score,
        bullet_quality_score,
    )

    priority_suggestions = (
        _build_skill_suggestions(
            top_career,
            missing_skills,
        )
    )

    priority_suggestions.extend(
        _build_check_suggestions(
            checks
        )
    )

    strengths = _build_strengths(
        detected_skills,
        sections,
        top_career,
        impact_count,
    )

    quick_wins = _build_quick_wins(
        sections,
        missing_skills,
        impact_count,
        action_verb_count,
    )

    priority_order = {
        "high": 0,
        "medium": 1,
        "low": 2,
    }

    priority_suggestions.sort(
        key=lambda item: priority_order.get(
            item.get(
                "priority",
                "medium",
            ),
            1,
        )
    )

    return {
        "score": {
            "overall": overall_score,
            "components": {
                "skills": skills_score,
                "structure": structure_score,
                "impact": impact_score,
                "bulletQuality": bullet_quality_score,
            },
        },
        "strengths": strengths,
        "prioritySuggestions": priority_suggestions[
            :12
        ],
        "quickWins": quick_wins,
        "metrics": {
            "detectedSkills": len(
                detected_skills
            ),
            "requiredSkills": len(
                required_skills
            ),
            "missingSkills": len(
                missing_skills
            ),
            "actionVerbsDetected": action_verb_count,
            "impactEvidenceDetected": impact_count,
        },
        "career": {
            "target": top_career,
            "requiredSkills": required_skills,
            "missingSkills": missing_skills,
        },
    }