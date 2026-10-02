import {
  createOrUpdateLearningPreference,
  getMyLearningPreference,
} from "../services/learning/learning-preference.service.js";

export const upsertLearningPreference = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await createOrUpdateLearningPreference({
        userId: req.user.userId,
        preferredLanguage:
          req.body.preferredLanguage,
      });

    return res.status(200).json({
      success: true,
      message:
        "Learning preferences saved successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getLearningPreference = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getMyLearningPreference(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};