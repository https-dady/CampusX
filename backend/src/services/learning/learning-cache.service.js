import LearningResourceCache from "../../models/learning-resource-cache.model.js";

const CACHE_TTL_MINUTES = 30;

export const saveLearningResourceCache = async (
  cacheKey,
  resources
) => {
  if (!cacheKey) {
    const error = new Error("Cache key is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(resources)) {
    const error = new Error("Resources must be an array.");
    error.statusCode = 400;
    throw error;
  }

  const expiresAt = new Date(
    Date.now() + CACHE_TTL_MINUTES * 60 * 1000
  );

  return LearningResourceCache.findOneAndUpdate(
    { cacheKey },
    {
      $set: {
        resources,
        expiresAt,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  ).lean();
};

export const getLearningResourceCache = async (cacheKey) => {
  if (!cacheKey) {
    const error = new Error("Cache key is required.");
    error.statusCode = 400;
    throw error;
  }

  const cache = await LearningResourceCache.findOne({
    cacheKey,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!cache) {
    const error = new Error("Learning resource cache not found or expired.");
    error.statusCode = 404;
    throw error;
  }

  return cache;
};