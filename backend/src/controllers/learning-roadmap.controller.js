import {
  createLearningRoadmap,
  getLearningRoadmap,
  getAllLearningRoadmaps,
  updateLearningRoadmap,
  deleteLearningRoadmap,
} from "../services/learning/learning-roadmap.service.js";

export const createRoadmap = async (req, res) => {
  try {
    const roadmap = await createLearningRoadmap(req.body);

    return res.status(201).json({
      success: true,
      message: "Learning roadmap created successfully.",
      data: {
        roadmap,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to create learning roadmap.",
    });
  }
};

export const getRoadmap = async (req, res) => {
  try {
    const { domain, techStack } = req.body;

    const roadmap = await getLearningRoadmap(
      domain,
      techStack
    );

    return res.status(200).json({
      success: true,
      message: "Learning roadmap fetched successfully.",
      data: {
        roadmap,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch learning roadmap.",
    });
  }
};

export const getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps =
      await getAllLearningRoadmaps();

    return res.status(200).json({
      success: true,
      message: "Learning roadmaps fetched successfully.",
      data: {
        roadmaps,
        total: roadmaps.length,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch learning roadmaps.",
    });
  }
};

export const updateRoadmap = async (req, res) => {
  try {
    const roadmap =
      await updateLearningRoadmap(
        req.params.roadmapId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Learning roadmap updated successfully.",
      data: {
        roadmap,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to update learning roadmap.",
    });
  }
};

export const deleteRoadmap = async (req, res) => {
  try {
    await deleteLearningRoadmap(
      req.params.roadmapId
    );

    return res.status(200).json({
      success: true,
      message: "Learning roadmap deleted successfully.",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to delete learning roadmap.",
    });
  }
};