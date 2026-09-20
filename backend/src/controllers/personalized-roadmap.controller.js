import { getMyProfile } from "../services/profile/profile.service.js";
import { getMyCareerGoal } from "../services/career/career-goal.service.js";
import { calculateSkillGap } from "../services/career/skill-gap.service.js";
import { generatePersonalizedRoadmap } from "../services/career/personalized-roadmap.service.js";

export const getMyPersonalizedRoadmap = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const [userProfile, careerGoal] =
      await Promise.all([
        getMyProfile(userId),
        getMyCareerGoal(userId),
      ]);

    if (!careerGoal) {
      const error = new Error(
        "Career goal is required before generating a personalized roadmap."
      );

      error.statusCode = 404;
      throw error;
    }

    const skillGap = await calculateSkillGap({
      career: careerGoal.targetCareer,
      domain: careerGoal.targetDomain,
      userSkills:
        userProfile.profile?.technicalSkills || [],
    });

    const roadmap =
      await generatePersonalizedRoadmap({
        career: careerGoal.targetCareer,
        domain: careerGoal.targetDomain,
        missingSkills: skillGap.missingSkills,
      });

    return res.status(200).json({
      success: true,
      message:
        "Personalized roadmap generated successfully",
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
        "Unable to generate personalized roadmap.",
    });
  }
};