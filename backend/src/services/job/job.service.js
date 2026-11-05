import env from "../../config/env.js";

import {
  getMyProfile,
} from "../profile/profile.service.js";

import {
  getCareerPrediction,
} from "../ml/ml.service.js";

import {
  analyzeCareerPrediction,
} from "../career/career.analysis.service.js";

import {
  jobSearchResponseSchema,
} from "../../validators/job-response.validator.js";

const REQUEST_TIMEOUT_MS = 15000;

const buildJobSearchRequest = (
  jobData
) => {
  return {
    targetRole:
      jobData.targetRole,

    ...(jobData.location && {
      location:
        jobData.location,
    }),

    ...(jobData.experienceLevel && {
      experienceLevel:
        jobData.experienceLevel,
    }),

    ...(jobData.employmentType && {
      employmentType:
        jobData.employmentType,
    }),
  };
};

export const prepareJobSearchRequest = (
  jobData
) => {
  if (!jobData) {
    const error = new Error(
      "Job search request is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const request =
    buildJobSearchRequest(
      jobData
    );

  if (
    !request.targetRole ||
    typeof request.targetRole !==
      "string" ||
    !request.targetRole.trim()
  ) {
    const error = new Error(
      "Target role is required."
    );

    error.statusCode = 400;

    throw error;
  }

  request.targetRole =
    request.targetRole
      .trim();

  return request;
};

export const searchJobs = async (
  jobData
) => {
  const request =
    prepareJobSearchRequest(
      jobData
    );

  if (
    !env.N8N_JOB_WEBHOOK_URL
  ) {
    const error = new Error(
      "Job search workflow URL is not configured."
    );

    error.statusCode = 500;

    throw error;
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      REQUEST_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        env.N8N_JOB_WEBHOOK_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            request
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
        "Job search workflow returned an invalid JSON response."
      );

      error.statusCode = 502;

      throw error;
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
          `Job search workflow failed with status ${response.status}.`
      );

      error.statusCode = 502;

      throw error;
    }

    const result =
      jobSearchResponseSchema.safeParse(
        data
      );

    if (!result.success) {
      const error = new Error(
        "Job search workflow returned invalid job data."
      );

      error.statusCode = 502;

      throw error;
    }

    return result.data;
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      const timeoutError =
        new Error(
          "Job search timed out."
        );

      timeoutError.statusCode =
        504;

      throw timeoutError;
    }

    if (
      error?.statusCode
    ) {
      throw error;
    }

    const networkError =
      new Error(
        "Unable to connect to job search workflow."
      );

    networkError.statusCode =
      502;

    networkError.cause =
      error;

    throw networkError;
  } finally {
    clearTimeout(timeout);
  }
};

/*
 * Profile-based job journey
 *
 * IMPORTANT:
 * Technical skills are NOT passed directly as targetRole.
 *
 * Flow:
 *
 * User Profile
 *      ↓
 * Existing Career Prediction ML
 *      ↓
 * analyzeCareerPrediction()
 *      ↓
 * Primary predicted career
 *      ↓
 * Existing searchJobs()
 *      ↓
 * Existing n8n + TinyFish workflow
 *
 * This method deliberately does NOT call the
 * /api/career/predict controller because that controller
 * mutates onboarding state.
 */
export const searchJobsBasedOnProfile =
  async (userId) => {
    if (!userId) {
      const error = new Error(
        "Authenticated user is required."
      );

      error.statusCode = 401;

      throw error;
    }

    const userProfile =
      await getMyProfile(
        userId
      );

    const profile =
      userProfile?.profile;

    if (!profile) {
      const error = new Error(
        "Your profile is not available."
      );

      error.statusCode = 400;

      throw error;
    }

    const technicalSkills =
      Array.isArray(
        profile.technicalSkills
      )
        ? profile.technicalSkills.filter(
            (skill) =>
              typeof skill ===
                "string" &&
              skill.trim()
          )
        : [];

    if (
      technicalSkills.length ===
      0
    ) {
      const error = new Error(
        "No technical skills are available in your profile for career prediction."
      );

      error.statusCode = 422;

      throw error;
    }

    /*
     * Reuse the existing ML service directly.
     * Do not call /api/career/predict here because that
     * endpoint also changes onboarding.status.
     */
    const prediction =
      await getCareerPrediction(
        profile
      );

    const analysis =
      analyzeCareerPrediction(
        prediction
      );

    const targetRole =
      analysis?.primaryCareer
        ?.career?.trim();

    if (!targetRole) {
      const error = new Error(
        "No suitable career role could be predicted from your profile."
      );

      error.statusCode = 422;

      throw error;
    }

    const result =
      await searchJobs({
        targetRole,
      });

    return {
      ...result,

      targetRole,

      prediction: {
        primaryCareer:
          analysis.primaryCareer,

        predictions:
          analysis.predictions,
      },
    };
  };