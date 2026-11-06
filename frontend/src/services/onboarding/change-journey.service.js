import User from "../../models/user.model.js";

const ALLOWED_JOURNEY_TYPES = new Set([
  "learn",
  "dream_job",
  "profile_jobs",
]);

const changeOnboardingJourney = async (
  userId,
  journeyType
) => {
  if (
    !ALLOWED_JOURNEY_TYPES.has(
      journeyType
    )
  ) {
    const error = new Error(
      "Invalid career journey. Choose learn, dream_job, or profile_jobs."
    );

    error.statusCode = 400;

    throw error;
  }

  const user = await User.findById(userId)
    .select("_id profile onboarding")
    .lean();

  if (!user) {
    const error = new Error(
      "User not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const onboarding = user.onboarding || {};

  const allowedStatuses = new Set([
    "career_analyzed",
    "journey_selected",
  ]);

  if (!allowedStatuses.has(onboarding.status)) {
    const error = new Error(
      "Complete your profile and career analysis before changing your career journey."
    );

    error.statusCode = 400;

    throw error;
  }

  if (!onboarding.careerAnalyzedAt) {
    const error = new Error(
      "Career analysis is required before changing your career journey."
    );

    error.statusCode = 400;

    throw error;
  }

  const updatedUser =
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "onboarding.status": "journey_selected",
          "onboarding.journeyType": journeyType,
        },
      },
      {
        new: true,
        runValidators: true,
        projection: "_id profile onboarding",
      }
    ).lean();

  if (!updatedUser) {
    const error = new Error(
      "Unable to update your career journey."
    );

    error.statusCode = 500;

    throw error;
  }

  return {
    onboarding: {
      status:
        updatedUser.onboarding?.status ||
        "journey_selected",

      journeyType:
        updatedUser.onboarding?.journeyType ||
        journeyType,

      profileCompletedAt:
        updatedUser.onboarding?.profileCompletedAt ||
        null,

      careerAnalyzedAt:
        updatedUser.onboarding?.careerAnalyzedAt ||
        null,
    },
  };
};

export default changeOnboardingJourney;