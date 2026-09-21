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