import env from "../../config/env.js";

import LearningGoal from "../../models/learning-goal.model.js";
import LearningPreference from "../../models/learning-preference.model.js";
import User from "../../models/user.model.js";

const REQUEST_TIMEOUT_MS = 15000;

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
  "machine learning": "machine learning",

  ai: "artificial intelligence",
  "artificial intelligence":
    "artificial intelligence",

  ds: "data science",
  "data science": "data science",

  dbms: "database management systems",
  database: "database management systems",
  "database management systems":
    "database management systems",
};

const normalizeSkill = (skill) => {
  if (typeof skill !== "string") {
    return "";
  }

  const normalized = skill
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return SKILL_ALIASES[normalized] || normalized;
};

const uniqueSkills = (skills = []) => {
  const seen = new Set();
  const result = [];

  for (const skill of skills) {
    const normalized = normalizeSkill(skill);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

const calculateMissingSkills = ({
  targetSkills = [],
  userSkills = [],
}) => {
  const normalizedTargetSkills =
    uniqueSkills(targetSkills);

  const normalizedUserSkills =
    uniqueSkills(userSkills);

  const userSkillSet = new Set(
    normalizedUserSkills
  );

  const missingSkills =
    normalizedTargetSkills.filter(
      (skill) => !userSkillSet.has(skill)
    );

  return {
    targetSkills: normalizedTargetSkills,

    availableSkills:
      normalizedTargetSkills.filter(
        (skill) => userSkillSet.has(skill)
      ),

    missingSkills,
  };
};

/*
 * ---------------------------------------------------------
 * Learning Resource Source Priority
 * ---------------------------------------------------------
 *
 * Priority 1:
 *   SWAYAM / NPTEL
 *
 * Priority 2:
 *   Verified government / official academic sources
 *
 * Priority 3:
 *   Official technology documentation
 *
 * Priority 4:
 *   Other learning resources
 *
 * IMPORTANT:
 * Resources are NOT removed.
 * They are only ordered by source priority.
 */

const normalizeUrl = (url) => {
  if (typeof url !== "string") {
    return "";
  }

  return url.trim().toLowerCase();
};

const normalizeResourceText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

const getHostname = (url) => {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    return parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return "";
  }
};

const isSwayamResource = ({
  hostname,
  title,
  description,
}) => {
  const text = [
    hostname,
    title,
    description,
  ]
    .map(normalizeResourceText)
    .join(" ");

  return (
    hostname === "swayam.gov.in" ||
    hostname.endsWith(".swayam.gov.in") ||
    text.includes("swayam")
  );
};

const isNptelResource = ({
  hostname,
  title,
  description,
}) => {
  const text = [
    hostname,
    title,
    description,
  ]
    .map(normalizeResourceText)
    .join(" ");

  return (
    hostname === "nptel.ac.in" ||
    hostname.endsWith(".nptel.ac.in") ||
    hostname === "onlinecourses.nptel.ac.in" ||
    hostname.endsWith(".nptel.ac.in") ||
    text.includes("nptel")
  );
};

const isGovernmentDomain = (hostname) => {
  if (!hostname) {
    return false;
  }

  const governmentDomains = [
    ".gov.in",
    ".nic.in",
    ".ac.in",
  ];

  return governmentDomains.some(
    (domain) =>
      hostname === domain.slice(1) ||
      hostname.endsWith(domain)
  );
};

const isOfficialTechnologyResource = ({
  hostname,
}) => {
  const officialTechnologyDomains = new Set([
    "developer.mozilla.org",
    "react.dev",
    "reactjs.org",
    "nodejs.org",
    "expressjs.com",
    "mongodb.com",
    "docs.mongodb.com",
    "typescriptlang.org",
    "docs.python.org",
    "python.org",
    "git-scm.com",
    "developer.android.com",
    "kotlinlang.org",
    "docs.oracle.com",
    "docs.github.com",
  ]);

  return officialTechnologyDomains.has(
    hostname
  );
};

const classifyResourceSource = (resource) => {
  const url = normalizeUrl(resource?.url);
  const hostname = getHostname(url);

  const title =
    resource?.title || "";

  const description =
    resource?.description || "";

  if (
    isSwayamResource({
      hostname,
      title,
      description,
    })
  ) {
    return {
      sourcePriority: 1,
      sourceCategory: "government",
      sourceName: "SWAYAM",
      isPrioritySource: true,
    };
  }

  if (
    isNptelResource({
      hostname,
      title,
      description,
    })
  ) {
    return {
      sourcePriority: 1,
      sourceCategory: "government",
      sourceName: "NPTEL",
      isPrioritySource: true,
    };
  }

  if (
    isGovernmentDomain(hostname)
  ) {
    return {
      sourcePriority: 2,
      sourceCategory: "official",
      sourceName: "Government / Academic",
      isPrioritySource: true,
    };
  }

  if (
    isOfficialTechnologyResource({
      hostname,
    })
  ) {
    return {
      sourcePriority: 3,
      sourceCategory: "official",
      sourceName: "Official Documentation",
      isPrioritySource: false,
    };
  }

  return {
    sourcePriority: 4,
    sourceCategory: "other",
    sourceName: "Learning Resource",
    isPrioritySource: false,
  };
};

const prioritizeLearningResources = (
  resources = []
) => {
  return resources
    .map((resource, index) => {
      const classification =
        classifyResourceSource(resource);

      return {
        ...resource,

        sourcePriority:
          classification.sourcePriority,

        sourceCategory:
          classification.sourceCategory,

        sourceName:
          classification.sourceName,

        isPrioritySource:
          classification.isPrioritySource,

        _originalIndex: index,
      };
    })
    .sort((first, second) => {
      if (
        first.sourcePriority !==
        second.sourcePriority
      ) {
        return (
          first.sourcePriority -
          second.sourcePriority
        );
      }

      return (
        first._originalIndex -
        second._originalIndex
      );
    })
    .map(
      ({
        _originalIndex,
        ...resource
      }) => resource
    );
};

const buildLearningRequest = ({
  domain,
  techStack,
  missingSkills,
  preferredLanguage,
}) => {
  /*
   * Existing n8n contract remains unchanged:
   *
   * {
   *   domain,
   *   techStack
   * }
   *
   * preferredLanguage is retained in the
   * personalization context and is not injected
   * into the existing n8n payload.
   */

  const requestedSkills =
    uniqueSkills(techStack);

  const prioritizedMissingSkills =
    uniqueSkills(missingSkills);

  const mergedSkills = [
    ...prioritizedMissingSkills,

    ...requestedSkills.filter(
      (skill) =>
        !prioritizedMissingSkills.includes(
          normalizeSkill(skill)
        )
    ),
  ];

  return {
    domain,

    techStack: mergedSkills,

    preferredLanguage:
      preferredLanguage || "english",
  };
};

const validateLearningResponse = (
  response
) => {
  if (
    !response ||
    typeof response !== "object"
  ) {
    const error = new Error(
      "Invalid response received from learning workflow."
    );

    error.statusCode = 502;

    throw error;
  }

  if (response.success !== true) {
    const error = new Error(
      "Learning workflow did not return a successful response."
    );

    error.statusCode = 502;

    throw error;
  }

  if (!Array.isArray(response.resources)) {
    const error = new Error(
      "Learning workflow returned an invalid resources list."
    );

    error.statusCode = 502;

    throw error;
  }

  if (
    response.cacheKey !== undefined &&
    typeof response.cacheKey !== "string"
  ) {
    const error = new Error(
      "Learning workflow returned an invalid cache key."
    );

    error.statusCode = 502;

    throw error;
  }

  if (
    response.hasMore !== undefined &&
    typeof response.hasMore !== "boolean"
  ) {
    const error = new Error(
      "Learning workflow returned an invalid hasMore value."
    );

    error.statusCode = 502;

    throw error;
  }

  const resources =
    response.resources.filter(
      (resource) =>
        resource &&
        typeof resource.title === "string" &&
        typeof resource.url === "string" &&
        typeof resource.type === "string" &&
        typeof resource.description === "string"
    );

  const prioritizedResources =
    prioritizeLearningResources(
      resources
    );

  return {
    success: true,

    cacheKey:
      response.cacheKey || null,

    hasMore:
      response.hasMore === true,

    resources:
      prioritizedResources,

    total:
      prioritizedResources.length,
  };
};

const getLearningContext = async (
  userId
) => {
  if (!userId) {
    return {
      learningGoal: null,
      learningPreference: null,
      userSkills: [],
    };
  }

  const [
    user,
    learningGoal,
    learningPreference,
  ] = await Promise.all([
    User.findById(userId)
      .select(
        "profile.technicalSkills onboarding.status onboarding.journeyType"
      )
      .lean(),

    LearningGoal.findOne({
      userId,
      isActive: true,
    }).lean(),

    LearningPreference.findOne({
      userId,
      isActive: true,
    }).lean(),
  ]);

  if (!user) {
    const error = new Error(
      "User not found."
    );

    error.statusCode = 404;

    throw error;
  }

  if (
    user.onboarding?.status !==
      "journey_selected" ||
    user.onboarding?.journeyType !== "learn"
  ) {
    const error = new Error(
      "Learning resources are available only for the I WANT TO LEARN journey."
    );

    error.statusCode = 400;

    throw error;
  }

  return {
    learningGoal,

    learningPreference,

    userSkills:
      user.profile?.technicalSkills || [],
  };
};

export const prepareLearningRequest = async (
  learningData,
  userId = null
) => {
  if (!learningData) {
    const error = new Error(
      "Learning request is required."
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    !learningData.domain ||
    !learningData.techStack?.length
  ) {
    const error = new Error(
      "Domain and at least one technology are required."
    );

    error.statusCode = 400;

    throw error;
  }

  const context =
    await getLearningContext(userId);

  const targetSkills =
    context.learningGoal?.targetSkills
      ?.length
      ? context.learningGoal.targetSkills
      : learningData.techStack;

  const skillGap =
    calculateMissingSkills({
      targetSkills,
      userSkills:
        context.userSkills,
    });

  const preferredLanguage =
    context.learningPreference
      ?.preferredLanguage ||
    "english";

  const request =
    buildLearningRequest({
      domain:
        context.learningGoal?.domain ||
        learningData.domain,

      techStack:
        learningData.techStack,

      missingSkills:
        skillGap.missingSkills,

      preferredLanguage,
    });

  return {
    request,

    context: {
      preferredLanguage,

      targetSkills:
        skillGap.targetSkills,

      availableSkills:
        skillGap.availableSkills,

      missingSkills:
        skillGap.missingSkills,
    },
  };
};

export const getLearningResources =
  async (
    learningData,
    userId = null
  ) => {
    const prepared =
      await prepareLearningRequest(
        learningData,
        userId
      );

    if (
      !env.N8N_LEARNING_WEBHOOK_URL
    ) {
      const error = new Error(
        "Learning workflow URL is not configured."
      );

      error.statusCode = 500;

      throw error;
    }

    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(
        env.N8N_LEARNING_WEBHOOK_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          /*
           * Existing n8n request contract
           * remains unchanged.
           */
          body: JSON.stringify(
            prepared.request
          ),

          signal:
            controller.signal,
        }
      );

      let data;

      try {
        data =
          await response.json();
      } catch {
        const error = new Error(
          "Learning workflow returned an invalid JSON response."
        );

        error.statusCode = 502;

        throw error;
      }

      if (!response.ok) {
        const error = new Error(
          data?.message ||
            `Learning workflow failed with status ${response.status}.`
        );

        error.statusCode = 502;

        throw error;
      }

      const result =
        validateLearningResponse(
          data
        );

      return {
        ...result,

        personalization: {
          preferredLanguage:
            prepared.context
              .preferredLanguage,

          targetSkills:
            prepared.context
              .targetSkills,

          availableSkills:
            prepared.context
              .availableSkills,

          missingSkills:
            prepared.context
              .missingSkills,
        },
      };
    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        const timeoutError =
          new Error(
            "Learning resource search timed out."
          );

        timeoutError.statusCode =
          504;

        throw timeoutError;
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };