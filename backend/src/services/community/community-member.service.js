import Community from "../../models/community.model.js";
import CommunityMember from "../../models/community-member.model.js";

export const requireCommunityMember = async (
  communityId,
  userId
) => {
  const community = await Community.findOne({
    _id: communityId,
    isActive: true,
  }).lean();

  if (!community) {
    const error = new Error(
      "Community not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const membership =
    await CommunityMember.findOne({
      community: communityId,
      user: userId,
    }).lean();

  if (!membership) {
    const error = new Error(
      "Join the community before accessing its messages."
    );

    error.statusCode = 403;

    throw error;
  }

  return {
    community,
    membership,
  };
};