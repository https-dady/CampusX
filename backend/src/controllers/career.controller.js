import User from "../models/user.model.js";

import { getMyProfile } from "../services/profile/profile.service.js";
import { getCareerPrediction } from "../services/ml/ml.service.js";
import { analyzeCareerPrediction } from "../services/career/career.analysis.service.js";

export const predictCareer = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await getMyProfile(
      userId
    );

    const prediction =
      await getCareerPrediction(
        user.profile
      );

    const analysis =
      analyzeCareerPrediction(
        prediction
      );

    /*
     * Career analysis is considered complete only
     * after the existing ML prediction and analysis
     * have successfully completed.
     */
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "onboarding.status":
            "career_analyzed",
          "onboarding.careerAnalyzedAt":
            new Date(),
        },
      },
      {
        runValidators: true,
      }
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