import LearningPreference from "../../models/learning-preference.model.js";
import User from "../../models/user.model.js";

const ALLOWED_LANGUAGES = new Set(["english", "hindi"]);

const normalizeLanguage = (language) => {
  const normalized = String(language || "")
    .trim()
    .toLowerCase();

  if (!ALLOWED_LANGUAGES.has(normalized)) {
    throw new Error("Unsupported learning language");
  }

  return normalized;
};

const ensureLearnJourney = async (userId) => {
  const user = await User.findById(userId)
    .select("onboarding.status onboarding.journeyType")
    .lean();

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    user.onboarding?.status !== "journey_selected" ||
    user.onboarding?.journeyType !== "learn"
  ) {
    const error = new Error(
      "Learning preferences are available only after selecting the I WANT TO LEARN journey"
    );

    error.statusCode = 400;
    throw error;
  }
};

export const createOrUpdateLearningPreference = async ({
  userId,
  preferredLanguage,
}) => {
  await ensureLearnJourney(userId);

  const language = normalizeLanguage(preferredLanguage);

  const preference = await LearningPreference.findOneAndUpdate(
    { userId },
    {
      $set: {
        preferredLanguage: language,
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
    preference,
  };
};

export const getMyLearningPreference = async (userId) => {
  await ensureLearnJourney(userId);

  const preference = await LearningPreference.findOne({
    userId,
    isActive: true,
  }).lean();

  return {
    preference,
  };
};