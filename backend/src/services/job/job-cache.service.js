import JobResultCache from "../../models/job-result-cache.model.js";

const CACHE_TTL_MINUTES = 30;

export const saveJobResultCache = async (
  cacheKey,
  jobs
) => {
  if (!cacheKey) {
    const error = new Error("Cache key is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(jobs)) {
    const error = new Error("Jobs must be an array.");
    error.statusCode = 400;
    throw error;
  }

  const expiresAt = new Date(
    Date.now() + CACHE_TTL_MINUTES * 60 * 1000
  );

  return JobResultCache.findOneAndUpdate(
    { cacheKey },
    {
      $set: {
        jobs,
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

export const getJobResultCache = async (cacheKey) => {
  if (!cacheKey) {
    const error = new Error("Cache key is required.");
    error.statusCode = 400;
    throw error;
  }

  const cache = await JobResultCache.findOne({
    cacheKey,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!cache) {
    const error = new Error(
      "Job result cache not found or expired."
    );

    error.statusCode = 404;
    throw error;
  }

  return cache;
};