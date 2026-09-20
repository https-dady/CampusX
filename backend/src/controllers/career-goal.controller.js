import {
  getMyCareerGoal,
  createCareerGoal,
  updateCareerGoal,
} from "../services/career/career-goal.service.js";

export const getCareerGoal = async (req, res) => {
  try {
    const careerGoal = await getMyCareerGoal(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Career goal fetched successfully",
      data: {
        careerGoal,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch career goal.",
    });
  }
};

export const createCareerGoalController = async (
  req,
  res
) => {
  try {
    const careerGoal =
      await createCareerGoal(
        req.user.userId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Career goal created successfully",
      data: {
        careerGoal,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to create career goal.",
    });
  }
};

export const updateCareerGoalController =
  async (req, res) => {
    try {
      const careerGoal =
        await updateCareerGoal(
          req.user.userId,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Career goal updated successfully",
        data: {
          careerGoal,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to update career goal.",
      });
    }
  };