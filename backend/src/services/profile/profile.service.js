import User from "../../models/user.model.js";

const buildProfileUpdate = (profileData) => {
  const update = {};

  Object.entries(profileData).forEach(
    ([field, value]) => {
      update[`profile.${field}`] = value;
    }
  );

  return update;
};

export const getMyProfile = async (userId) => {
  const user = await User.findById(userId)
    .select(
      "_id name email authProvider isEmailVerified profile"
    )
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    authProvider: user.authProvider,
    isEmailVerified: user.isEmailVerified,
    profile: user.profile || {},
  };
};

export const updateMyProfile = async (
  userId,
  profileData
) => {
  const update = buildProfileUpdate(profileData);

  if (Object.keys(update).length === 0) {
    throw new Error(
      "At least one profile field is required"
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: update,
    },
    {
      new: true,
      runValidators: true,
      projection:
        "_id name email authProvider isEmailVerified profile",
    }
  ).lean();

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    authProvider: user.authProvider,
    isEmailVerified: user.isEmailVerified,
    profile: user.profile || {},
  };
};