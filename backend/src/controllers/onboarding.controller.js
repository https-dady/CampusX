import { analyzeResume } from "../services/resume/resume.service.js";

import {
  createResumeProfileDraft,
  getMyOnboardingState,
  markProfileCompleted,
  selectOnboardingJourney,
} from "../services/onboarding/onboarding.service.js";

export const getOnboarding = async (req, res) => {
  try {
    const onboarding = await getMyOnboardingState(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Onboarding state fetched successfully.",
      data: onboarding,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch onboarding state.",
    });
  }
};

export const analyzeResumeForOnboarding = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required.",
      });
    }

    const analysis = await analyzeResume({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });

    const draft = await createResumeProfileDraft(
      req.user.userId,
      analysis
    );

    return res.status(200).json({
      success: true,
      message:
        "Resume analyzed and profile draft prepared successfully.",
      data: {
        resume: analysis,
        profileDraft: draft.profile,
        personal: draft.personal,
        source: draft.source,
        completion: draft.completion,
      },
    });
  } catch (error) {
    console.error(
      "Onboarding resume analysis error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode &&
        error.statusCode < 500
          ? error.message
          : "Unable to prepare your profile from the resume right now.",
    });
  }
};

export const completeProfileForOnboarding = async (
  req,
  res
) => {
  try {
    const result =
      await markProfileCompleted(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Profile completed successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Unable to complete profile.",
      ...(error.missingFields
        ? {
            missingFields:
              error.missingFields,
          }
        : {}),
    });
  }
};

export const selectJourneyForOnboarding = async (
  req,
  res
) => {
  try {
    const { journeyType } =
      req.body || {};

    const result =
      await selectOnboardingJourney(
        req.user.userId,
        journeyType
      );

    return res.status(200).json({
      success: true,
      message:
        "Career journey selected successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Unable to select career journey.",
    });
  }
};