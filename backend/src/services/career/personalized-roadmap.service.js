import CareerRoadmap from "../../models/career-roadmap.model.js";
import LearningRoadmap from "../../models/learning-roadmap.model.js";

const SKILL_ALIASES = {
  js: "javascript",
  "java script": "javascript",
  jsx: "react",
  reactjs: "react",
  "react.js": "react",
  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",
  express: "express.js",
  expressjs: "express.js",
  "express.js": "express.js",
  mongo: "mongodb",
  "mongo db": "mongodb",
  mongodb: "mongodb",
  ml: "machine learning",
  ai: "artificial intelligence",
  ds: "data science",
};

const normalizeSkill = (skill) => {
  if (typeof skill !== "string") {
    return "";
  }

  const normalized = skill
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  return SKILL_ALIASES[normalized] || normalized;
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

const getDisplaySkills = (skills = []) => {
  const seen = new Set();

  return skills.filter((skill) => {
    if (typeof skill !== "string") {
      return false;
    }

    const trimmed = skill
      .trim()
      .replace(/\s+/g, " ");

    const normalized = normalizeSkill(trimmed);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
};

const calculateMatchPercentage = (
  matchedCount,
  requiredCount
) => {
  if (requiredCount === 0) {
    return 0;
  }

  return Number(
    ((matchedCount / requiredCount) * 100).toFixed(2)
  );
};

const getRelevantCareerSteps = (
  steps = [],
  missingSkills = []
) => {
  const missingSkillSet =
    normalizeSkillSet(missingSkills);

  return steps
    .filter((step) => {
      const stepSkills =
        Array.isArray(step.skills)
          ? step.skills
          : [];

      return stepSkills.some((skill) =>
        missingSkillSet.has(
          normalizeSkill(skill)
        )
      );
    })
    .sort(
      (first, second) =>
        first.order - second.order
    );
};

const getRelevantLearningSteps = (
  steps = [],
  missingSkills = []
) => {
  const missingSkillSet =
    normalizeSkillSet(missingSkills);

  return steps
    .filter((step) => {
      const technologies =
        Array.isArray(step.technologies)
          ? step.technologies
          : [];

      return technologies.some((technology) =>
        missingSkillSet.has(
          normalizeSkill(technology)
        )
      );
    })
    .sort(
      (first, second) =>
        first.order - second.order
    );
};

const mergeLearningSteps = (roadmaps = []) => {
  const mergedSteps = [];
  const seen = new Set();

  for (const roadmap of roadmaps) {
    const steps = Array.isArray(roadmap.steps)
      ? roadmap.steps
      : [];

    for (const step of steps) {
      const technologies = Array.isArray(
        step.technologies
      )
        ? step.technologies
        : [];

      const normalizedTechnologies =
        technologies.map(normalizeSkill);

      const key = [
        normalizeSkill(step.title || ""),
        normalizedTechnologies.join("|"),
      ].join("::");

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);

      mergedSteps.push({
        ...step,
        roadmapId: roadmap._id,
      });
    }
  }

  return mergedSteps.sort(
    (first, second) =>
      first.order - second.order
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
      getRelevantCareerSteps(
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

export const generatePersonalizedLearningRoadmap =
  async ({
    domain,
    targetSkills = [],
    userSkills = [],
  }) => {
    if (!domain) {
      const error = new Error(
        "Learning domain is required."
      );

      error.statusCode = 400;
      throw error;
    }

    const normalizedTargetSkills =
      getDisplaySkills(targetSkills);

    if (!normalizedTargetSkills.length) {
      const error = new Error(
        "At least one learning target skill is required."
      );

      error.statusCode = 400;
      throw error;
    }

    const normalizedUserSkills =
      getDisplaySkills(userSkills);

    const userSkillSet =
      normalizeSkillSet(normalizedUserSkills);

    const matchedSkills = [];
    const missingSkills = [];

    for (const targetSkill of normalizedTargetSkills) {
      const normalizedTargetSkill =
        normalizeSkill(targetSkill);

      if (
        userSkillSet.has(
          normalizedTargetSkill
        )
      ) {
        matchedSkills.push(targetSkill);
      } else {
        missingSkills.push(targetSkill);
      }
    }

    const matchPercentage =
      calculateMatchPercentage(
        matchedSkills.length,
        normalizedTargetSkills.length
      );

    const normalizedDomain = domain
      .trim()
      .replace(/\s+/g, " ");

    const learningRoadmaps =
      await LearningRoadmap.find({
        domain: {
          $regex: `^${normalizedDomain.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`,
          $options: "i",
        },
        isActive: true,
      })
        .select(
          "_id domain techStack steps"
        )
        .lean();

    if (!learningRoadmaps.length) {
      const error = new Error(
        "Learning roadmap not found for the selected domain."
      );

      error.statusCode = 404;
      throw error;
    }

    const missingSkillSet =
      normalizeSkillSet(missingSkills);

    const relevantRoadmaps =
      learningRoadmaps
        .map((roadmap) => {
          const roadmapTechStack =
            Array.isArray(
              roadmap.techStack
            )
              ? roadmap.techStack
              : [];

          const matchingTechStack =
            roadmapTechStack.filter(
              (technology) =>
                missingSkillSet.has(
                  normalizeSkill(technology)
                )
            );

          const relevantSteps =
            getRelevantLearningSteps(
              roadmap.steps,
              missingSkills
            );

          return {
            roadmap,
            matchingTechStack,
            relevantSteps,
          };
        })
        .filter(
          ({
            matchingTechStack,
            relevantSteps,
          }) =>
            matchingTechStack.length > 0 ||
            relevantSteps.length > 0
        )
        .sort(
          (first, second) =>
            second.matchingTechStack.length -
            first.matchingTechStack.length
        );

    const selectedRoadmaps =
      relevantRoadmaps.length > 0
        ? relevantRoadmaps
        : learningRoadmaps.map(
            (roadmap) => ({
              roadmap,
              matchingTechStack: [],
              relevantSteps: [],
            })
          );

    const personalizedSteps =
      mergeLearningSteps(
        selectedRoadmaps.map(
          ({ roadmap, relevantSteps }) => ({
            ...roadmap,
            steps: relevantSteps,
          })
        )
      );

    const roadmapSkills = [];

    for (const step of personalizedSteps) {
      const technologies =
        Array.isArray(step.technologies)
          ? step.technologies
          : [];

      for (const technology of technologies) {
        if (
          !roadmapSkills.some(
            (existingSkill) =>
              normalizeSkill(
                existingSkill
              ) ===
              normalizeSkill(
                technology
              )
          )
        ) {
          roadmapSkills.push(
            technology
          );
        }
      }
    }

    return {
      domain: normalizedDomain,
      targetSkills:
        normalizedTargetSkills,
      availableSkills:
        normalizedUserSkills,
      matchedSkills,
      missingSkills,
      matchPercentage,
      roadmapSkills,
      steps: personalizedSteps,
    };
  };