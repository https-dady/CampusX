import LearningPreference from "../../models/learning-preference.model.js";
import User from "../../models/user.model.js";

const normalizeLanguage = (language) => {
  return language
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeSources = (sources) => {
  return [
    ...new Set(
      sources.map((source) =>
        source.trim().toLowerCase()
      )
    ),
  ];
};

const ensureLearningJourney = async (userId) => {
  const user = await User.findById(userId)
    .select("onboarding")
    .lean();

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (
    user.onboarding?.status !==
      "journey_selected" ||
    user.onboarding?.journeyType !== "learn"
  ) {
    const error = new Error(
      "Learning preferences are available only for the I WANT TO LEARN journey."
    );

    error.statusCode = 403;

    throw error;
  }

  return user;
};

export const createOrUpdateLearningPreference =
  async ({
    userId,
    language,
    preferredSources,
  }) => {
    await ensureLearningJourney(userId);

    const normalizedLanguage =
      normalizeLanguage(language);

    const normalizedSources =
      normalizeSources(preferredSources);

    const preference =
      await LearningPreference.findOneAndUpdate(
        {
          userId,
        },
        {
          $set: {
            language: normalizedLanguage,
            preferredSources: normalizedSources,
            isActive: true,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      ).lean();

    return preference;
  };

export const getMyLearningPreference =
  async (userId) => {
    await ensureLearningJourney(userId);

    const preference =
      await LearningPreference.findOne({
        userId,
        isActive: true,
      }).lean();

    if (!preference) {
      const error = new Error(
        "Learning preferences not found."
      );

      error.statusCode = 404;

      throw error;
    }

    return preference;
  };