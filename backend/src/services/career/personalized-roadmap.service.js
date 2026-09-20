import CareerRoadmap from "../../models/career-roadmap.model.js";

const normalizeSkill = (skill) => {
  return skill
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const normalizeSkillSet = (skills = []) => {
  return new Set(
    skills
      .filter(
        (skill) => typeof skill === "string"
      )
      .map(normalizeSkill)
      .filter(Boolean)
  );
};

const getRelevantSteps = (
  steps = [],
  missingSkills = []
) => {
  const missingSkillSet =
    normalizeSkillSet(missingSkills);

  return steps
    .filter((step) => {
      const stepSkills =
        step.skills || [];

      return stepSkills.some((skill) =>
        missingSkillSet.has(
          normalizeSkill(skill)
        )
      );
    })
    .sort(
      (a, b) => a.order - b.order
    );
};

export const generatePersonalizedRoadmap =
  async ({
    career,
    domain,
    missingSkills = [],
  }) => {
    if (!career || !domain) {
      const error = new Error(
        "Career and domain are required."
      );

      error.statusCode = 400;
      throw error;
    }

    const roadmap =
      await CareerRoadmap.findOne({
        career,
        domain,
        isActive: true,
      })
        .select(
          "_id career domain steps"
        )
        .lean();

    if (!roadmap) {
      const error = new Error(
        "Career roadmap not found."
      );

      error.statusCode = 404;
      throw error;
    }

    const relevantSteps =
      getRelevantSteps(
        roadmap.steps,
        missingSkills
      );

    return {
      career: roadmap.career,
      domain: roadmap.domain,
      missingSkills,
      steps: relevantSteps,
    };
  };