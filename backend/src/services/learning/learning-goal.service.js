import LearningGoal from "../../models/learning-goal.model.js";

import User from "../../models/user.model.js";

const normalizeSkill = (skill) => {
  if (
    typeof skill !== "string"
  ) {
    return "";
  }

  return skill
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const SKILL_ALIASES = {
  js: "javascript",
  javascript: "javascript",

  jsx: "react",
  reactjs: "react",
  "react.js": "react",
  react: "react",

  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",

  express: "express.js",
  expressjs: "express.js",
  "express.js": "express.js",

  mongo: "mongodb",
  mongodb: "mongodb",

  ml: "machine learning",
  "machine-learning":
    "machine learning",

  ai: "artificial intelligence",
  "artificial-intelligence":
    "artificial intelligence",

  ds: "data science",
  "data-science":
    "data science",

  dbms: "database management systems",
  database:
    "database management systems",
};

const getCanonicalSkill = (
  skill
) => {
  const normalized =
    normalizeSkill(skill);

  if (!normalized) {
    return "";
  }

  return (
    SKILL_ALIASES[normalized] ||
    normalized
  );
};

const normalizeSkillList = (
  skills = []
) => {
  const seen = new Set();
  const result = [];

  for (const skill of skills) {
    const canonical =
      getCanonicalSkill(skill);

    if (!canonical) {
      continue;
    }

    if (seen.has(canonical)) {
      continue;
    }

    seen.add(canonical);

    result.push(canonical);
  }

  return result;
};

const buildDisplayMap = (
  skills = []
) => {
  const map = new Map();

  for (const skill of skills) {
    const canonical =
      getCanonicalSkill(skill);

    if (!canonical) {
      continue;
    }

    if (!map.has(canonical)) {
      map.set(
        canonical,
        skill
          .trim()
          .replace(/\s+/g, " ")
      );
    }
  }

  return map;
};

const calculateMatchPercentage = (
  matchedCount,
  requiredCount
) => {
  if (requiredCount === 0) {
    return 0;
  }

  return Number(
    (
      (matchedCount /
        requiredCount) *
      100
    ).toFixed(2)
  );
};

export const calculateLearningSkillGap =
  ({
    targetSkills = [],
    userSkills = [],
  }) => {
    const normalizedTargetSkills =
      normalizeSkillList(
        targetSkills
      );

    const normalizedUserSkills =
      normalizeSkillList(
        userSkills
      );

    const userDisplayMap =
      buildDisplayMap(
        userSkills
      );

    const targetDisplayMap =
      buildDisplayMap(
        targetSkills
      );

    const userSkillSet =
      new Set(
        normalizedUserSkills
      );

    const matchedSkills = [];
    const missingSkills = [];

    for (const targetSkill of normalizedTargetSkills) {
      if (
        userSkillSet.has(
          targetSkill
        )
      ) {
        matchedSkills.push(
          targetDisplayMap.get(
            targetSkill
          ) || targetSkill
        );
      } else {
        missingSkills.push(
          targetDisplayMap.get(
            targetSkill
          ) || targetSkill
        );
      }
    }

    const availableSkills =
      normalizedUserSkills.map(
        (skill) =>
          userDisplayMap.get(
            skill
          ) || skill
      );

    return {
      targetSkills:
        normalizedTargetSkills.map(
          (skill) =>
            targetDisplayMap.get(
              skill
            ) || skill
        ),

      availableSkills,

      matchedSkills,

      missingSkills,

      matchPercentage:
        calculateMatchPercentage(
          matchedSkills.length,
          normalizedTargetSkills.length
        ),
    };
  };

export const createOrUpdateLearningGoal =
  async ({
    userId,
    domain,
    targetSkills,
  }) => {
    const user =
      await User.findById(userId)
        .select(
          "_id profile onboarding"
        )
        .lean();

    if (!user) {
      const error =
        new Error(
          "User not found."
        );

      error.statusCode = 404;

      throw error;
    }

    if (
      user.onboarding?.status !==
      "journey_selected" ||
      user.onboarding?.journeyType !==
        "learn"
    ) {
      const error =
        new Error(
          "Select the I WANT TO LEARN journey before creating a learning goal."
        );

      error.statusCode = 400;

      throw error;
    }

    const normalizedDomain =
      domain
        .trim()
        .replace(/\s+/g, " ");

    const normalizedTargetSkills =
      normalizeSkillList(
        targetSkills
      );

    if (
      normalizedTargetSkills.length ===
      0
    ) {
      const error =
        new Error(
          "At least one valid learning skill is required."
        );

      error.statusCode = 400;

      throw error;
    }

    const skillGap =
      calculateLearningSkillGap({
        targetSkills:
          normalizedTargetSkills,
        userSkills:
          user.profile
            ?.technicalSkills ||
          [],
      });

    const learningGoal =
      await LearningGoal.findOneAndUpdate(
        {
          userId,
        },
        {
          $set: {
            domain:
              normalizedDomain,

            targetSkills:
              normalizedTargetSkills,

            isActive: true,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      ).lean();

    return {
      goal: {
        id:
          learningGoal._id,
        domain:
          learningGoal.domain,
        targetSkills:
          learningGoal.targetSkills,
        isActive:
          learningGoal.isActive,
      },

      skillGap,
    };
  };

export const getMyLearningGoal =
  async (userId) => {
    const user =
      await User.findById(userId)
        .select(
          "_id profile onboarding"
        )
        .lean();

    if (!user) {
      const error =
        new Error(
          "User not found."
        );

      error.statusCode = 404;

      throw error;
    }

    const learningGoal =
      await LearningGoal.findOne({
        userId,
        isActive: true,
      }).lean();

    if (!learningGoal) {
      return null;
    }

    const skillGap =
      calculateLearningSkillGap({
        targetSkills:
          learningGoal.targetSkills,
        userSkills:
          user.profile
            ?.technicalSkills ||
          [],
      });

    return {
      goal: {
        id:
          learningGoal._id,
        domain:
          learningGoal.domain,
        targetSkills:
          learningGoal.targetSkills,
        isActive:
          learningGoal.isActive,
      },

      skillGap,
    };
  };