import {
  saveJobResultCache,
  getJobResultCache,
} from "../services/job/job-cache.service.js";

export const saveJobCache = async (req, res) => {
  try {
    const { cacheKey, jobs } = req.body;

    const cache = await saveJobResultCache(
      cacheKey,
      jobs
    );

    return res.status(201).json({
      success: true,
      message: "Job result cache saved successfully.",
      data: {
        cacheKey: cache.cacheKey,
        expiresAt: cache.expiresAt,
        total: cache.jobs.length,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to save job result cache.",
    });
  }
};

export const getJobCache = async (req, res) => {
  try {
    const cache = await getJobResultCache(
      req.params.cacheKey
    );

    return res.status(200).json({
      success: true,
      message: "Job result cache fetched successfully.",
      data: {
        cacheKey: cache.cacheKey,
        jobs: cache.jobs,
        total: cache.jobs.length,
        expiresAt: cache.expiresAt,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch job result cache.",
    });
  }
};