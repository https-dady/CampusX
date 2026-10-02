import {
  createOrUpdateLearningPreference,
  getMyLearningPreference,
} from "../services/learning/learning-preference.service.js";

export const createLearningPreference = async (
  req,
  res,
  next
) => {
  try {
    const preference =
      await createOrUpdateLearningPreference({
        userId: req.user.userId,
        language: req.body.language,
        preferredSources:
          req.body.preferredSources,
      });

    return res.status(200).json({
      success: true,
      message:
        "Learning preferences saved successfully.",
      data: {
        preference,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLearningPreference = async (
  req,
  res,
  next
) => {
  try {
    const preference =
      await getMyLearningPreference(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Learning preferences fetched successfully.",
      data: {
        preference,
      },
    });
  } catch (error) {
    next(error);
  }
};