import Community from "../../models/community.model.js";
import CommunityMember from "../../models/community-member.model.js";

const normalizeCommunity = (community) => {
  if (!community) return null;

  return {
    id: community._id,
    name: community.name,
    slug: community.slug,
    description: community.description,
    domain: community.domain,
    topics: community.topics,
    isActive: community.isActive,
    memberCount: community.memberCount,
    createdAt: community.createdAt,
    updatedAt: community.updatedAt,
  };
};

export const getActiveCommunities = async (userId) => {
  const communities = await Community.find({
    isActive: true,
  })
    .sort({ name: 1 })
    .lean();

  const memberships = await CommunityMember.find({
    user: userId,
    community: {
      $in: communities.map(
        (community) => community._id
      ),
    },
  })
    .select("community role")
    .lean();

  const membershipMap = new Map(
    memberships.map((membership) => [
      membership.community.toString(),
      membership,
    ])
  );

  return communities.map((community) => ({
    ...normalizeCommunity(community),

    isMember: membershipMap.has(
      community._id.toString()
    ),

    membershipRole:
      membershipMap.get(
        community._id.toString()
      )?.role || null,
  }));
};

export const getCommunityById = async (
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

  const membership = await CommunityMember.findOne({
    community: communityId,
    user: userId,
  })
    .select("role joinedAt lastReadAt")
    .lean();

  return {
    ...normalizeCommunity(community),

    isMember: Boolean(membership),

    membershipRole:
      membership?.role || null,

    joinedAt:
      membership?.joinedAt || null,

    lastReadAt:
      membership?.lastReadAt || null,
  };
};

export const joinCommunity = async (
  communityId,
  userId
) => {
  const community = await Community.findOne({
    _id: communityId,
    isActive: true,
  });

  if (!community) {
    const error = new Error(
      "Community not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const existingMembership =
    await CommunityMember.findOne({
      community: communityId,
      user: userId,
    });

  if (existingMembership) {
    return {
      alreadyMember: true,
      membership: existingMembership,
      community: normalizeCommunity(
        community.toObject()
      ),
    };
  }

  const membership =
    await CommunityMember.create({
      community: communityId,
      user: userId,
      role: "member",
    });

  await Community.updateOne(
    {
      _id: communityId,
    },
    {
      $inc: {
        memberCount: 1,
      },
    }
  );

  return {
    alreadyMember: false,
    membership,
    community: normalizeCommunity(
      community.toObject()
    ),
  };
};

export const leaveCommunity = async (
  communityId,
  userId
) => {
  const membership =
    await CommunityMember.findOneAndDelete({
      community: communityId,
      user: userId,
    });

  if (!membership) {
    const error = new Error(
      "You are not a member of this community."
    );

    error.statusCode = 404;

    throw error;
  }

  await Community.updateOne(
    {
      _id: communityId,
      memberCount: {
        $gt: 0,
      },
    },
    {
      $inc: {
        memberCount: -1,
      },
    }
  );

  return {
    left: true,
  };
};