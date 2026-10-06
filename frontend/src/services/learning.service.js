import api from "./api.js";

export const getLearningResources = async (learningData) => {
  const response = await api.post(
    "/learning/resources",
    learningData
  );

  return response.data;
};

export const getLearningCache = async (cacheKey) => {
  const response = await api.get(
    `/learning/cache/${encodeURIComponent(cacheKey)}`
  );

  return response.data;
};

/**
 * Fetch the authenticated user's personalized learning roadmap.
 *
 * This endpoint is specifically for the
 * I WANT TO LEARN journey.
 *
 * Backend:
 * GET /api/personalized-roadmap/learning/me
 */
export const getMyPersonalizedRoadmap = async () => {
  const response = await api.get(
    "/personalized-roadmap/learning/me"
  );

  return response.data;
};

/**
 * Fetch the authenticated user's current career goal.
 *
 * Backend:
 * GET /api/career-goal/me
 */
export const getMyCareerGoal = async () => {
  const response = await api.get(
    "/career-goal/me"
  );

  return response.data;
};

/**
 * Fetch an active career roadmap by career and domain.
 *
 * Backend:
 * GET /api/career-roadmap/:career/:domain
 */
export const getCareerRoadmap = async (
  career,
  domain
) => {
  const response = await api.get(
    `/career-roadmap/${encodeURIComponent(
      career
    )}/${encodeURIComponent(domain)}`
  );

  return response.data;
};