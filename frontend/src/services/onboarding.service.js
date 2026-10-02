import api from "./api";

export const getOnboarding = async () => {
  const response = await api.get(
    "/onboarding/me"
  );

  return response.data;
};

export const analyzeResumeForOnboarding = async (
  file
) => {
  if (!(file instanceof File)) {
    throw new Error(
      "A resume file is required."
    );
  }

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response = await api.post(
    "/onboarding/resume",
    formData,
    {
      timeout: 90_000,
    }
  );

  return response.data;
};

export const completeOnboardingProfile =
  async () => {
    const response = await api.post(
      "/onboarding/profile/complete"
    );

    return response.data;
  };

export const selectOnboardingJourney =
  async (journeyType) => {
    const allowedJourneyTypes = new Set([
      "learn",
      "dream_job",
      "profile_jobs",
    ]);

    if (!allowedJourneyTypes.has(journeyType)) {
      throw new Error(
        "Invalid career journey selected."
      );
    }

    const response = await api.post(
      "/onboarding/journey",
      {
        journeyType,
      }
    );

    return response.data;
  };