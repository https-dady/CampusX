import {
  getMyProfile,
  updateMyProfile,
} from "../services/profile/profile.service.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await getMyProfile(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        profile,
      },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await updateMyProfile(
      req.user.userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        profile,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};