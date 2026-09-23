import { searchJobs } from "../services/job/job.service.js";

export const searchJobsController = async (req, res) => {
  try {
    const result = await searchJobs(req.body);

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully.",
      data: {
        jobs: result.jobs,
        total: result.total,
        hasMore: result.hasMore === true,
        cacheKey: result.cacheKey,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch jobs.",
    });
  }
};