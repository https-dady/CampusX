import {
  saveLearningResourceCache,
  getLearningResourceCache,
} from "../services/learning/learning-cache.service.js";

export const saveLearningCache = async (req, res) => {
  try {
    const { cacheKey, resources } = req.body;

    const cache = await saveLearningResourceCache(
      cacheKey,
      resources
    );

    return res.status(201).json({
      success: true,
      message: "Learning resource cache saved successfully.",
      data: {
        cacheKey: cache.cacheKey,
        expiresAt: cache.expiresAt,
        total: cache.resources.length,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to save learning resource cache.",
    });
  }
};

export const getLearningCache = async (req, res) => {
  try {
    const cache = await getLearningResourceCache(
      req.params.cacheKey
    );

    return res.status(200).json({
      success: true,
      message: "Learning resource cache fetched successfully.",
      data: {
        cacheKey: cache.cacheKey,
        resources: cache.resources,
        total: cache.resources.length,
        expiresAt: cache.expiresAt,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch learning resource cache.",
    });
  }
};