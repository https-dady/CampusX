import {
  createCareerRequirement,
  getCareerRequirement,
  getActiveCareerRequirements,
  updateCareerRequirement,
} from "../services/career/career-requirement.service.js";

export const createCareerRequirementController =
  async (req, res) => {
    try {
      const requirement =
        await createCareerRequirement(
          req.body
        );

      return res.status(201).json({
        success: true,
        message:
          "Career requirement created successfully",
        data: {
          requirement,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to create career requirement.",
      });
    }
  };

export const getCareerRequirementController =
  async (req, res) => {
    try {
      const {
        career,
        domain,
      } = req.params;

      const requirement =
        await getCareerRequirement(
          career,
          domain
        );

      return res.status(200).json({
        success: true,
        message:
          "Career requirement fetched successfully",
        data: {
          requirement,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch career requirement.",
      });
    }
  };

export const getActiveCareerRequirementsController =
  async (req, res) => {
    try {
      const requirements =
        await getActiveCareerRequirements();

      return res.status(200).json({
        success: true,
        message:
          "Career requirements fetched successfully",
        data: {
          requirements,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch career requirements.",
      });
    }
  };

export const updateCareerRequirementController =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const requirement =
        await updateCareerRequirement(
          id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Career requirement updated successfully",
        data: {
          requirement,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to update career requirement.",
      });
    }
  };