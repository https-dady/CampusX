import { getMyProfile } from "../services/profile/profile.service.js";
import { getMyCareerGoal } from "../services/career/career-goal.service.js";
import { calculateSkillGap } from "../services/career/skill-gap.service.js";

export const getMySkillGap = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [userProfile, careerGoal] =
      await Promise.all([
        getMyProfile(userId),
        getMyCareerGoal(userId),
      ]);

    /*
     * A user can reach Career Insights before selecting
     * a career goal.
     *
     * This is a valid application state, not an API error.
     * Return a successful response with a null skill gap.
     *
     * The frontend already has the "Set goal" flow and
     * will request the skill gap again after the goal
     * is created/updated.
     */
    if (!careerGoal) {
      return res.status(200).json({
        success: true,
        message:
          "Career goal is not set yet. Skill gap will be generated after a career goal is selected.",
        data: {
          skillGap: null,
        },
      });
    }

    const skillGap =
      await calculateSkillGap({
        career: careerGoal.targetCareer,
        domain: careerGoal.targetDomain,
        userSkills:
          userProfile.profile?.technicalSkills ||
          [],
      });

    return res.status(200).json({
      success: true,
      message:
        "Skill gap generated successfully",
      data: {
        skillGap,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to generate skill gap.",
    });
  }
};