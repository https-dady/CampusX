import { getMyProfile } from "../services/profile/profile.service.js";
import { getCareerPrediction } from "../services/ml/ml.service.js";
import { analyzeCareerPrediction } from "../services/career/career.analysis.service.js";

export const predictCareer = async (req, res) => {
  try {
    const user = await getMyProfile(
      req.user.userId
    );

    const prediction =
      await getCareerPrediction(
        user.profile
      );

    const analysis =
      analyzeCareerPrediction(
        prediction
      );

    return res.status(200).json({
      success: true,
      message:
        "Career analysis generated successfully",
      data: {
        analysis,
      },
    });
  } catch (error) {
    const statusCode =
      error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to generate career analysis.",
    });
  }
};