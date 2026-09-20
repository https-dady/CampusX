import {
  createCareerRoadmap,
  getCareerRoadmap,
  getActiveCareerRoadmaps,
  updateCareerRoadmap,
} from "../services/career/career-roadmap.service.js";

export const createCareerRoadmapController =
  async (req, res) => {
    try {
      const roadmap =
        await createCareerRoadmap(req.body);

      return res.status(201).json({
        success: true,
        message:
          "Career roadmap created successfully",
        data: {
          roadmap,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to create career roadmap.",
      });
    }
  };

export const getCareerRoadmapController =
  async (req, res) => {
    try {
      const {
        career,
        domain,
      } = req.params;

      const roadmap =
        await getCareerRoadmap(
          career,
          domain
        );

      return res.status(200).json({
        success: true,
        message:
          "Career roadmap fetched successfully",
        data: {
          roadmap,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch career roadmap.",
      });
    }
  };

export const getActiveCareerRoadmapsController =
  async (req, res) => {
    try {
      const roadmaps =
        await getActiveCareerRoadmaps();

      return res.status(200).json({
        success: true,
        message:
          "Career roadmaps fetched successfully",
        data: {
          roadmaps,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch career roadmaps.",
      });
    }
  };

export const updateCareerRoadmapController =
  async (req, res) => {
    try {
      const { id } = req.params;

      const roadmap =
        await updateCareerRoadmap(
          id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Career roadmap updated successfully",
        data: {
          roadmap,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to update career roadmap.",
      });
    }
  };