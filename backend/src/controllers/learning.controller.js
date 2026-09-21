import {
  getLearningResources,
} from "../services/learning/learning.service.js";

export const getResources = async (req, res) => {
  try {
    const result = await getLearningResources(req.body);

    return res.status(200).json({
      success: true,
      message: "Learning resources fetched successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch learning resources.",
    });
  }
};