import User from "../../models/user.model.js";

const ALLOWED_JOURNEY_TYPES = new Set([
  "learn",
  "dream_job",
  "profile_jobs",
]);

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
};

const normalizeList = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  for (const value of values) {
    const normalized = normalizeText(value);

    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
};

const hasText = (value) => Boolean(normalizeText(value));

const getMissingProfileFields = (profile = {}) => {
  const education = profile.education || {};
  const missing = [];

  if (!hasText(education.degree)) {
    missing.push("education.degree");
  }

  if (!hasText(education.branch)) {
    missing.push("education.branch");
  }

  if (!hasText(education.university)) {
    missing.push("education.university");
  }

  if (
    education.academicYear === undefined ||
    education.academicYear === null
  ) {
    missing.push("education.academicYear");
  }

  if (
    education.cgpa === undefined ||
    education.cgpa === null
  ) {
    missing.push("education.cgpa");
  }

  return missing;
};

const getProfileCompletion = (profile = {}) => {
  const missingFields = getMissingProfileFields(profile);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
};

const buildResumeProfileDraft = (analysis) => {
  const extracted = analysis?.extracted || {};
  const personal = extracted.personal || {};
  const education = extracted.education || {};

  const technicalSkills = normalizeList(
    extracted.skills || []
  );

  const draft = {
    technicalSkills,

    hasInternship:
      extracted.hasInternship === true,

    education: {
      degree: normalizeText(education.degree),
      branch: normalizeText(education.branch),
      university: "",
      academicYear:
        education.academicYear ?? undefined,
      cgpa:
        education.cgpa ?? undefined,
    },
  };

  return {
    profile: draft,

    personal: {
      name: normalizeText(personal.name),
      email: normalizeText(personal.email).toLowerCase(),
      phone: normalizeText(personal.phone),
    },

    source: {
      modelVersion:
        analysis?.modelVersion || null,

      detectedSkills: technicalSkills,
    },
  };
};

const getOnboardingState = (user) => {
  const profile = user.profile || {};
  const completion = getProfileCompletion(profile);
  const onboarding = user.onboarding || {};

  return {
    status:
      onboarding.status ||
      "profile_incomplete",

    profileCompletedAt:
      onboarding.profileCompletedAt ||
      null,

    careerAnalyzedAt:
      onboarding.careerAnalyzedAt ||
      null,

    journeyType:
      onboarding.journeyType ||
      null,

    profileCompletion: completion,
  };
};

export const getMyOnboardingState = async (userId) => {
  const user = await User.findById(userId)
    .select("_id name email profile onboarding")
    .lean();

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    onboarding: getOnboardingState(user),
  };
};

export const createResumeProfileDraft = async (
  userId,
  analysis
) => {
  const user = await User.findById(userId)
    .select("_id profile onboarding")
    .lean();

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const draft =
    buildResumeProfileDraft(analysis);

  return {
    ...draft,

    completion: getProfileCompletion({
      ...(user.profile || {}),

      ...draft.profile,

      education: {
        ...(user.profile?.education || {}),
        ...(draft.profile.education || {}),
      },
    }),
  };
};

export const markProfileCompleted = async (
  userId
) => {
  const user = await User.findById(userId)
    .select("profile onboarding")
    .lean();

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const completion =
    getProfileCompletion(user.profile || {});

  if (!completion.isComplete) {
    const error = new Error(
      "Profile is incomplete. Complete all required fields before continuing."
    );

    error.statusCode = 400;
    error.missingFields =
      completion.missingFields;

    throw error;
  }

  const profileCompletedAt =
    new Date();

  const updatedUser =
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "onboarding.status":
            "profile_completed",

          "onboarding.profileCompletedAt":
            profileCompletedAt,
        },
      },
      {
        new: true,
        projection:
          "_id profile onboarding",
      }
    ).lean();

  return {
    onboarding: {
      ...getOnboardingState(updatedUser),

      profileCompletion:
        completion,
    },
  };
};

export const selectOnboardingJourney = async (
  userId,
  journeyType
) => {
  if (!ALLOWED_JOURNEY_TYPES.has(journeyType)) {
    const error = new Error(
      "Invalid journey type. Choose learn, dream_job, or profile_jobs."
    );

    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId)
    .select("_id onboarding")
    .lean();

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const onboarding = user.onboarding || {};

  if (onboarding.status !== "career_analyzed") {
    const error = new Error(
      "Complete career analysis before selecting a career journey."
    );

    error.statusCode = 400;
    throw error;
  }

  const updatedUser =
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "onboarding.status":
            "journey_selected",

          "onboarding.journeyType":
            journeyType,
        },
      },
      {
        new: true,
        projection:
          "_id profile onboarding",
      }
    ).lean();

  return {
    onboarding: getOnboardingState(
      updatedUser
    ),
  };
};