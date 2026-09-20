from typing import List

from pydantic import BaseModel, Field


class EducationInput(BaseModel):
    degree: str = Field(..., min_length=1, max_length=100)
    branch: str = Field(..., min_length=1, max_length=150)
    academicYear: int = Field(..., ge=1, le=6)
    cgpa: float = Field(..., ge=0, le=10)


class ProjectInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    technologies: List[str] = Field(default_factory=list)


class ExperienceInput(BaseModel):
    organization: str = Field(
        ..., min_length=1, max_length=150
    )
    role: str = Field(
        ..., min_length=1, max_length=150
    )


class CertificationInput(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=200
    )
    issuer: str = Field(
        ..., min_length=1, max_length=150
    )


class ProfileInput(BaseModel):
    education: EducationInput

    technicalSkills: List[str] = Field(
        default_factory=list,
        max_length=100,
    )

    softSkills: List[str] = Field(
        default_factory=list,
        max_length=50,
    )

    interests: List[str] = Field(
        default_factory=list,
        max_length=50,
    )

    projects: List[ProjectInput] = Field(
        default_factory=list,
        max_length=50,
    )

    experience: List[ExperienceInput] = Field(
        default_factory=list,
        max_length=50,
    )

    certifications: List[CertificationInput] = Field(
        default_factory=list,
        max_length=50,
    )

    hasInternship: bool = False


class PredictionRequest(BaseModel):
    profile: ProfileInput


class CareerPrediction(BaseModel):
    career: str
    probability: float = Field(
        ..., ge=0, le=1
    )


class PredictionResponse(BaseModel):
    success: bool
    modelVersion: str
    predictions: List[CareerPrediction]