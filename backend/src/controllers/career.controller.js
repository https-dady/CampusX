import User from "../models/user.model.js";

import {
  getMyProfile,
} from "../services/profile/profile.service.js";

import {
  getCareerPrediction,
} from "../services/ml/ml.service.js";

import {
  analyzeCareerPrediction,
} from "../services/career/career.analysis.service.js";

export const predictCareer = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const onboardingUser =
      await User.findById(
        userId
      )
        .select(
          "profile onboarding"
        )
        .lean();

    if (!onboardingUser) {
      const error =
        new Error(
          "User not found"
        );

      error.statusCode = 404;

      throw error;
    }

    const onboarding =
      onboardingUser.onboarding ||
      {};

    const allowedStatuses =
      new Set([
        "profile_completed",
        "career_analyzed",
        "journey_selected",
      ]);

    if (
      !allowedStatuses.has(
        onboarding.status
      )
    ) {
      const error =
        new Error(
          "Complete your profile before starting career analysis."
        );

      error.statusCode = 400;

      throw error;
    }

    const education =
      onboardingUser.profile
        ?.education || {};

    const missingModelFields =
      [];

    if (
      typeof education.degree !==
        "string" ||
      !education.degree.trim()
    ) {
      missingModelFields.push(
        "education.degree"
      );
    }

    if (
      typeof education.branch !==
        "string" ||
      !education.branch.trim()
    ) {
      missingModelFields.push(
        "education.branch"
      );
    }

    if (
      education.academicYear ===
        undefined ||
      education.academicYear ===
        null
    ) {
      missingModelFields.push(
        "education.academicYear"
      );
    }

    if (
      education.cgpa ===
        undefined ||
      education.cgpa === null
    ) {
      missingModelFields.push(
        "education.cgpa"
      );
    }

    if (
      missingModelFields.length > 0
    ) {
      const error =
        new Error(
          "Complete all career model inputs before continuing."
        );

      error.statusCode = 400;

      error.missingFields =
        missingModelFields;

      throw error;
    }

    const user =
      await getMyProfile(
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
    const careerAnalyzedAt =
      onboarding.careerAnalyzedAt ||
      new Date();

    const update =
      onboarding.status ===
      "profile_completed"
        ? {
            $set: {
              "onboarding.status":
                "career_analyzed",

              "onboarding.careerAnalyzedAt":
                careerAnalyzedAt,
            },
          }
        : {};

    const updatedUser =
      Object.keys(update).length >
      0
        ? await User.findByIdAndUpdate(
            userId,
            update,
            {
              new: true,
              runValidators: true,
              projection:
                "_id profile onboarding",
            }
          ).lean()
        : onboardingUser;

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Career analysis generated successfully",

        data: {
          analysis,

          onboarding: {
            status:
              updatedUser
                ?.onboarding
                ?.status ||
              "career_analyzed",

            resumeAnalyzedAt:
              updatedUser
                ?.onboarding
                ?.resumeAnalyzedAt ||
              null,

            profileCompletedAt:
              updatedUser
                ?.onboarding
                ?.profileCompletedAt ||
              null,

            careerAnalyzedAt:
              updatedUser
                ?.onboarding
                ?.careerAnalyzedAt ||
              careerAnalyzedAt,

            journeyType:
              updatedUser
                ?.onboarding
                ?.journeyType ||
              null,

            profileCompletion: {
              isComplete: true,
              missingFields: [],
            },
          },
        },
      });
  } catch (error) {
    const statusCode =
      error.statusCode || 500;

    return res
      .status(statusCode)
      .json({
        success: false,

        message:
          error.message ||
          "Unable to generate career analysis.",

        ...(error.missingFields
          ? {
              missingFields:
                error.missingFields,
            }
          : {}),
      });
  }
};