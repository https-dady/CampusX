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

const buildJobSearchRequest = (jobData) => {
  return {
    targetRole: jobData.targetRole,
    ...(jobData.location && {
      location: jobData.location,
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
    buildJobSearchRequest(jobData);

  if (!request.targetRole) {
    const error = new Error(
      "Target role is required."
    );

    error.statusCode = 400;

    throw error;
  }

  return request;
};

export const searchJobs = async (
  jobData
) => {
  const request =
    prepareJobSearchRequest(jobData);

  if (!env.N8N_JOB_WEBHOOK_URL) {
    const error = new Error(
      "Job search workflow URL is not configured."
    );

    error.statusCode = 500;

    throw error;
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => {
      controller.abort();
    },
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
      error.name ===
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

    if (!error.statusCode) {
      const networkError =
        new Error(
          "Unable to connect to job search workflow."
        );

      networkError.statusCode =
        502;

      throw networkError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Uses the user's existing profile as the source of truth,
 * runs the existing ML career prediction pipeline directly,
 * and converts the primary predicted career into the
 * targetRole required by the existing job-search workflow.
 *
 * IMPORTANT:
 * This intentionally does NOT call /api/career/predict.
 * That controller changes onboarding.status to career_analyzed.
 *
 * Profile-based job search is a read/search operation and
 * must not mutate the user's onboarding lifecycle.
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

    const user =
      await getMyProfile(
        userId
      );

    if (!user?.profile) {
      const error = new Error(
        "Your profile is not available."
      );

      error.statusCode = 400;

      throw error;
    }

    const prediction =
      await getCareerPrediction(
        user.profile
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