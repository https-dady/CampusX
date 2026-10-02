import {
  createOrUpdateLearningGoal,
  getMyLearningGoal,
} from "../services/learning/learning-goal.service.js";

export const createLearningGoal =
  async (req, res) => {
    try {
      const result =
        await createOrUpdateLearningGoal(
          {
            userId:
              req.user.userId,

            domain:
              req.body.domain,

            targetSkills:
              req.body.targetSkills,
          }
        );

      return res.status(200).json({
        success: true,

        message:
          "Learning goal created successfully.",

        data: result,
      });
    } catch (error) {
      return res
        .status(
          error.statusCode ||
            500
        )
        .json({
          success: false,

          message:
            error.message ||
            "Unable to create learning goal.",
        });
    }
  };

export const getLearningGoal =
  async (req, res) => {
    try {
      const result =
        await getMyLearningGoal(
          req.user.userId
        );

      return res.status(200).json({
        success: true,

        message:
          "Learning goal fetched successfully.",

        data:
          result || {
            goal: null,
            skillGap: null,
          },
      });
    } catch (error) {
      return res
        .status(
          error.statusCode ||
            500
        )
        .json({
          success: false,

          message:
            error.message ||
            "Unable to fetch learning goal.",
        });
    }
  };