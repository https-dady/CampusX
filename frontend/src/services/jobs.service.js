import api from "./api";

export const searchJobs = async ({
  targetRole,
  location,
  experienceLevel,
  employmentType,
}) => {
  const payload = {
    targetRole: targetRole.trim(),
  };

  if (location?.trim()) {
    payload.location = location.trim();
  }

  if (experienceLevel?.trim()) {
    payload.experienceLevel = experienceLevel.trim();
  }

  if (employmentType?.trim()) {
    payload.employmentType = employmentType.trim();
  }

  const response = await api.post("/jobs/search", payload);

  return response.data;
};

export const getJobCache = async (cacheKey) => {
  const response = await api.get(
    `/jobs/cache/${encodeURIComponent(cacheKey)}`
  );

  return response.data;
};