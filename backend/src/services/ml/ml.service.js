import env from "../../config/env.js";

const ML_REQUEST_TIMEOUT = 5000;

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

const buildMLProfile = (profile = {}) => {
  const education = profile.education || {};

  return {
    education: {
      degree: normalizeText(education.degree),
      branch: normalizeText(education.branch),
      academicYear: education.academicYear,
      cgpa: education.cgpa,
    },

    technicalSkills: normalizeList(
      profile.technicalSkills
    ),

    softSkills: normalizeList(
      profile.softSkills
    ),

    interests: normalizeList(
      profile.interests
    ),

    projects: Array.isArray(profile.projects)
      ? profile.projects.map((project) => ({
          title: normalizeText(project.title),
          technologies: normalizeList(
            project.technologies
          ),
        }))
      : [],

    experience: Array.isArray(profile.experience)
      ? profile.experience.map((experience) => ({
          organization: normalizeText(
            experience.organization
          ),
          role: normalizeText(
            experience.role
          ),
        }))
      : [],

    certifications: Array.isArray(
      profile.certifications
    )
      ? profile.certifications.map(
          (certification) => ({
            name: normalizeText(
              certification.name
            ),
            issuer: normalizeText(
              certification.issuer
            ),
          })
        )
      : [],

    hasInternship:
      profile.hasInternship === true,
  };
};

const validateMLResponse = (result) => {
  if (!result || typeof result !== "object") {
    throw new Error(
      "Invalid response received from ML service."
    );
  }

  if (result.success !== true) {
    throw new Error(
      "ML service returned an unsuccessful response."
    );
  }

  if (
    typeof result.modelVersion !== "string" ||
    !result.modelVersion.trim()
  ) {
    throw new Error(
      "ML service response is missing modelVersion."
    );
  }

  if (
    !Array.isArray(result.predictions) ||
    result.predictions.length === 0
  ) {
    throw new Error(
      "ML service returned no career predictions."
    );
  }

  for (const prediction of result.predictions) {
    if (
      !prediction ||
      typeof prediction.career !== "string" ||
      !prediction.career.trim()
    ) {
      throw new Error(
        "ML service returned an invalid career prediction."
      );
    }

    if (
      typeof prediction.probability !== "number" ||
      !Number.isFinite(
        prediction.probability
      ) ||
      prediction.probability < 0 ||
      prediction.probability > 1
    ) {
      throw new Error(
        "ML service returned an invalid prediction probability."
      );
    }
  }

  return result;
};

export const checkMLService = async () => {
  if (!env.ML_SERVICE_URL) {
    const error = new Error(
      "ML service URL is not configured."
    );

    error.statusCode = 503;

    throw error;
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    ML_REQUEST_TIMEOUT
  );

  try {
    const response = await fetch(
      `${env.ML_SERVICE_URL}/health`,
      {
        method: "GET",
        signal: controller.signal,
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      const error = new Error(
        "ML service returned an invalid health response."
      );

      error.statusCode = 503;

      throw error;
    }

    if (!response.ok) {
      const error = new Error(
        "ML service health check failed."
      );

      error.statusCode = 503;

      throw error;
    }

    return result;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "ML service health check timed out."
      );

      timeoutError.statusCode = 503;

      throw timeoutError;
    }

    if (error.statusCode) {
      throw error;
    }

    const serviceError = new Error(
      "Unable to connect to ML service."
    );

    serviceError.statusCode = 503;
    serviceError.cause = error;

    throw serviceError;
  } finally {
    clearTimeout(timeout);
  }
};

export const getCareerPrediction = async (
  profile
) => {
  if (!env.ML_SERVICE_URL) {
    const error = new Error(
      "ML service URL is not configured."
    );

    error.statusCode = 503;

    throw error;
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    ML_REQUEST_TIMEOUT
  );

  try {
    const mlProfile =
      buildMLProfile(profile);

    const response = await fetch(
      `${env.ML_SERVICE_URL}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: mlProfile,
        }),
        signal: controller.signal,
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      const error = new Error(
        "ML service returned an invalid JSON response."
      );

      error.statusCode = 503;

      throw error;
    }

    if (!response.ok) {
      const error = new Error(
        result?.detail ||
          "ML service prediction failed."
      );

      error.statusCode =
        response.status >= 500
          ? 503
          : 400;

      throw error;
    }

    return validateMLResponse(result);
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "ML service request timed out."
      );

      timeoutError.statusCode = 503;

      throw timeoutError;
    }

    if (error.statusCode) {
      throw error;
    }

    const serviceError = new Error(
      "Unable to connect to ML service."
    );

    serviceError.statusCode = 503;
    serviceError.cause = error;

    throw serviceError;
  } finally {
    clearTimeout(timeout);
  }
};