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

const DOMAIN_ALIASES = {
  cse: "Computer Science and Engineering",
  "computer science": "Computer Science and Engineering",

  it: "Information Technology",

  ece: "Electronics and Communication Engineering",
  "electronics and communication":
    "Electronics and Communication Engineering",

  ee: "Electrical Engineering",
  "electrical and electronics": "Electrical Engineering",

  me: "Mechanical Engineering",
  ce: "Civil Engineering",

  "ai/ml": "AI and Machine Learning",
  "ai & ml": "AI and Machine Learning",
  "ai and ml": "AI and Machine Learning",

  ml: "Machine Learning",
  ds: "Data Science",

  "data analytics": "Data Analytics",

  "ai & ds": "Artificial Intelligence and Data Science",
  "ai and ds": "Artificial Intelligence and Data Science",
  "ai/data science": "Artificial Intelligence and Data Science",

  "web dev": "Web Development",
  "full stack development": "Web Development",
  "full-stack development": "Web Development",

  cybersecurity: "Cyber Security",
  "cyber security": "Cyber Security",
};

const normalizeDomain = (domain) => {
  const normalized = String(domain || "")
    .trim()
    .replace(/\s+/g, " ");

  return DOMAIN_ALIASES[normalized.toLowerCase()] || normalized;
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const normalizeSkillSet = (skills = []) => {
  return new Set(
    skills
      .filter((skill) => typeof skill === "string")
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
  requiredSkills = []
) => {
  const requiredSkillSet =
    normalizeSkillSet(requiredSkills);

  return steps
    .filter((step) => {
      const technologies =
        Array.isArray(step.technologies)
          ? step.technologies
          : [];

      return technologies.some((technology) =>
        requiredSkillSet.has(
          normalizeSkill(technology)
        )
      );
    })
    .sort(
      (first, second) =>
        first.order - second.order
    );
};

const mergeLearningSteps = (steps = []) => {
  const mergedSteps = [];
  const seen = new Set();

  for (const step of steps) {
    const technologies =
      Array.isArray(step.technologies)
        ? step.technologies
        : [];

    const normalizedTechnologies =
      technologies
        .map(normalizeSkill)
        .sort();

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
    });
  }

  return mergedSteps.sort(
    (first, second) =>
      first.order - second.order
  );
};

const buildLearningStepIndex = (steps = []) => {
  const index = new Map();

  for (const step of steps) {
    const technologies =
      Array.isArray(step.technologies)
        ? step.technologies
        : [];

    for (const technology of technologies) {
      const normalized =
        normalizeSkill(technology);

      if (normalized && !index.has(normalized)) {
        index.set(normalized, step);
      }
    }
  }

  return index;
};

const collectLearningDependencies = ({
  targetSkills,
  userSkills,
  steps,
}) => {
  const userSkillSet =
    normalizeSkillSet(userSkills);

  const stepIndex =
    buildLearningStepIndex(steps);

  const requiredSkillSet = new Set();
  const visiting = new Set();

  const visitSkill = (skill) => {
    const normalizedSkill =
      normalizeSkill(skill);

    if (
      !normalizedSkill ||
      userSkillSet.has(normalizedSkill)
    ) {
      return;
    }

    if (requiredSkillSet.has(normalizedSkill)) {
      return;
    }

    if (visiting.has(normalizedSkill)) {
      return;
    }

    visiting.add(normalizedSkill);

    const step =
      stepIndex.get(normalizedSkill);

    if (step) {
      const prerequisites =
        Array.isArray(step.prerequisites)
          ? step.prerequisites
          : [];

      for (const prerequisite of prerequisites) {
        visitSkill(prerequisite);
      }
    }

    visiting.delete(normalizedSkill);

    requiredSkillSet.add(normalizedSkill);
  };

  for (const targetSkill of targetSkills) {
    visitSkill(targetSkill);
  }

  return requiredSkillSet;
};

const getRoadmapSkillsFromSteps = (
  steps = []
) => {
  const skills = [];
  const seen = new Set();

  for (const step of steps) {
    const technologies =
      Array.isArray(step.technologies)
        ? step.technologies
        : [];

    for (const technology of technologies) {
      const normalized =
        normalizeSkill(technology);

      if (!normalized || seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      skills.push(technology);
    }
  }

  return skills;
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
      normalizeSkillSet(
        normalizedUserSkills
      );

    const matchedSkills = [];
    const missingTargetSkills = [];

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
        missingTargetSkills.push(
          targetSkill
        );
      }
    }

    const matchPercentage =
      calculateMatchPercentage(
        matchedSkills.length,
        normalizedTargetSkills.length
      );

    const normalizedDomain =
      normalizeDomain(domain);

    const escapedDomain =
      escapeRegex(normalizedDomain);

    const learningRoadmaps =
      await LearningRoadmap.find({
        domain: {
          $regex: `^${escapedDomain}$`,
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

    /*
     * IMPORTANT:
     * Attach roadmapId to every step before
     * dependency calculation and filtering.
     *
     * The previous implementation lost this
     * relationship, which caused every step to
     * be filtered out later.
     */
    const allSteps =
      learningRoadmaps.flatMap(
        (roadmap) =>
          Array.isArray(roadmap.steps)
            ? roadmap.steps.map((step) => ({
                ...step,
                roadmapId: roadmap._id,
              }))
            : []
      );

    const requiredSkillSet =
      collectLearningDependencies({
        targetSkills:
          normalizedTargetSkills,
        userSkills:
          normalizedUserSkills,
        steps: allSteps,
      });

    const relevantSteps =
      getRelevantLearningSteps(
        allSteps,
        [...requiredSkillSet]
      );

    const personalizedSteps =
      mergeLearningSteps(
        relevantSteps
      );

    const roadmapSkills =
      getRoadmapSkillsFromSteps(
        personalizedSteps
      );

    const missingSkills =
      roadmapSkills.filter((skill) => {
        return !userSkillSet.has(
          normalizeSkill(skill)
        );
      });

    return {
      domain: normalizedDomain,
      targetSkills:
        normalizedTargetSkills,
      availableSkills:
        normalizedUserSkills,
      matchedSkills,
      missingSkills,
      missingTargetSkills,
      matchPercentage,
      roadmapSkills,
      steps: personalizedSteps,
    };
  };