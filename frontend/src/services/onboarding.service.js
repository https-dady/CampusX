import api from "./api";

let onboardingRequest = null;

export const getOnboarding = async () => {
  if (!onboardingRequest) {
    onboardingRequest = api
      .get("/onboarding/me")
      .then((response) => response.data)
      .finally(() => {
        onboardingRequest = null;
      });
  }

  return onboardingRequest;
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

    if (
      !allowedJourneyTypes.has(
        journeyType
      )
    ) {
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