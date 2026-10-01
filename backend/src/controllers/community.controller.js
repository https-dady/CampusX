import {
  getActiveCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
} from "../services/community/community.service.js";

import {
  getCommunityMessages,
  sendCommunityMessage,
  markMessageDelivered,
  markMessageRead,
  getMessageInfo,
} from "../services/community/community-message.service.js";

export const getCommunities = async (
  req,
  res
) => {
  try {
    const communities =
      await getActiveCommunities(
        req.user.userId
      );

    return res.status(200).json({
      success: true,

      message:
        "Communities fetched successfully.",

      data: {
        communities,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Unable to fetch communities.",
    });
  }
};

export const getCommunity = async (
  req,
  res
) => {
  try {
    const community =
      await getCommunityById(
        req.params.communityId,
        req.user.userId
      );

    return res.status(200).json({
      success: true,

      message:
        "Community fetched successfully.",

      data: {
        community,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Unable to fetch community.",
    });
  }
};

export const joinCommunityController =
  async (
    req,
    res
  ) => {
    try {
      const result =
        await joinCommunity(
          req.params.communityId,
          req.user.userId
        );

      return res
        .status(
          result.alreadyMember
            ? 200
            : 201
        )
        .json({
          success: true,

          message:
            result.alreadyMember
              ? "You are already a member of this community."
              : "Joined community successfully.",

          data: {
            community:
              result.community,

            membership:
              result.membership,
          },
        });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,

        message:
          error.message ||
          "Unable to join community.",
      });
    }
  };

export const leaveCommunityController =
  async (
    req,
    res
  ) => {
    try {
      await leaveCommunity(
        req.params.communityId,
        req.user.userId
      );

      return res.status(200).json({
        success: true,

        message:
          "Left community successfully.",
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,

        message:
          error.message ||
          "Unable to leave community.",
      });
    }
  };

export const getMessages = async (
  req,
  res
) => {
  try {
    const query =
      req.validatedQuery || req.query;

    const result =
      await getCommunityMessages(
        req.params.communityId,
        req.user.userId,
        query
      );

    return res.status(200).json({
      success: true,

      message:
        "Community messages fetched successfully.",

      data: result,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Unable to fetch community messages.",
    });
  }
};

export const sendMessage = async (
  req,
  res
) => {
  try {
    const message =
      await sendCommunityMessage(
        req.params.communityId,
        req.user.userId,
        req.body
      );

    return res.status(201).json({
      success: true,

      message:
        "Message sent successfully.",

      data: {
        message,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Unable to send community message.",
    });
  }
};

export const markDelivered =
  async (
    req,
    res
  ) => {
    try {
      const receipt =
        await markMessageDelivered(
          req.params.communityId,
          req.params.messageId,
          req.user.userId
        );

      return res.status(200).json({
        success: true,

        message:
          "Message delivery status updated.",

        data: {
          receipt,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,

        message:
          error.message ||
          "Unable to update delivery status.",
      });
    }
  };

export const markRead = async (
  req,
  res
) => {
  try {
    const receipt =
      await markMessageRead(
        req.params.communityId,
        req.params.messageId,
        req.user.userId
      );

    return res.status(200).json({
      success: true,

      message:
        "Message read status updated.",

      data: {
        receipt,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Unable to update read status.",
    });
  }
};

export const getMessageInfoController =
  async (
    req,
    res
  ) => {
    try {
      const info =
        await getMessageInfo(
          req.params.communityId,
          req.params.messageId,
          req.user.userId
        );

      return res.status(200).json({
        success: true,

        message:
          "Message info fetched successfully.",

        data: info,
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,

        message:
          error.message ||
          "Unable to fetch message info.",
      });
    }
  };