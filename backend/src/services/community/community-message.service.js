import CommunityMessage from "../../models/community-message.model.js";
import CommunityMessageReceipt from "../../models/community-message-receipt.model.js";
import CommunityMember from "../../models/community-member.model.js";

import {
  requireCommunityMember,
} from "./community-member.service.js";

const serializeUser = (user) => ({
  id: user?._id || null,
  name: user?.name || "CampusX user",
});

const serializeMessage = (message) => ({
  id: message._id,

  communityId:
    message.community,

  sender:
    serializeUser(message.sender),

  message:
    message.message,

  replyTo:
    message.replyTo || null,

  editedAt:
    message.editedAt,

  deletedAt:
    message.deletedAt,

  createdAt:
    message.createdAt,

  updatedAt:
    message.updatedAt,
});

export const getCommunityMessages = async (
  communityId,
  userId,
  {
    limit = 30,
    before,
  } = {}
) => {
  await requireCommunityMember(
    communityId,
    userId
  );

  const query = {
    community: communityId,
  };

  if (before) {
    const beforeMessage =
      await CommunityMessage.findOne({
        _id: before,
        community: communityId,
      })
        .select("createdAt")
        .lean();

    if (!beforeMessage) {
      const error = new Error(
        "Invalid message cursor."
      );

      error.statusCode = 400;

      throw error;
    }

    query.createdAt = {
      $lt: beforeMessage.createdAt,
    };
  }

  const messages =
    await CommunityMessage.find(query)
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .populate(
        "sender",
        "name"
      )
      .lean();

  messages.reverse();

  const lastMessage =
    messages[0] || null;

  const hasMore =
    messages.length === limit;

  return {
    messages:
      messages.map(serializeMessage),

    hasMore,

    nextBefore:
      lastMessage?._id || null,
  };
};

export const sendCommunityMessage =
  async (
    communityId,
    userId,
    {
      message,
      replyTo = null,
    }
  ) => {
    await requireCommunityMember(
      communityId,
      userId
    );

    if (replyTo) {
      const repliedMessage =
        await CommunityMessage.findOne({
          _id: replyTo,
          community: communityId,
        }).lean();

      if (!repliedMessage) {
        const error = new Error(
          "Reply target message was not found."
        );

        error.statusCode = 400;

        throw error;
      }
    }

    const createdMessage =
      await CommunityMessage.create({
        community: communityId,
        sender: userId,
        message,
        replyTo,
      });

    const populatedMessage =
      await CommunityMessage.findById(
        createdMessage._id
      )
        .populate(
          "sender",
          "name"
        )
        .lean();

    return serializeMessage(
      populatedMessage
    );
  };

export const markMessageDelivered =
  async (
    communityId,
    messageId,
    userId
  ) => {
    await requireCommunityMember(
      communityId,
      userId
    );

    const message =
      await CommunityMessage.findOne({
        _id: messageId,
        community: communityId,
      })
        .select("sender")
        .lean();

    if (!message) {
      const error = new Error(
        "Message not found."
      );

      error.statusCode = 404;

      throw error;
    }

    if (
      message.sender.toString() ===
      userId.toString()
    ) {
      return null;
    }

    const now = new Date();

    return CommunityMessageReceipt.findOneAndUpdate(
      {
        message: messageId,
        user: userId,
      },
      {
        $set: {
          status: "delivered",
          deliveredAt: now,
        },

        $setOnInsert: {
          message: messageId,
          user: userId,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();
  };

export const markMessageRead =
  async (
    communityId,
    messageId,
    userId
  ) => {
    const {
      membership,
    } = await requireCommunityMember(
      communityId,
      userId
    );

    const message =
      await CommunityMessage.findOne({
        _id: messageId,
        community: communityId,
      })
        .select("sender")
        .lean();

    if (!message) {
      const error = new Error(
        "Message not found."
      );

      error.statusCode = 404;

      throw error;
    }

    const now = new Date();

    await CommunityMember.updateOne(
      {
        _id: membership._id,
      },
      {
        $set: {
          lastReadAt: now,
        },
      }
    );

    if (
      message.sender.toString() ===
      userId.toString()
    ) {
      return null;
    }

    return CommunityMessageReceipt.findOneAndUpdate(
      {
        message: messageId,
        user: userId,
      },
      {
        $set: {
          status: "read",
          deliveredAt: now,
          readAt: now,
        },

        $setOnInsert: {
          message: messageId,
          user: userId,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();
  };

export const getMessageInfo =
  async (
    communityId,
    messageId,
    userId
  ) => {
    await requireCommunityMember(
      communityId,
      userId
    );

    const message =
      await CommunityMessage.findOne({
        _id: messageId,
        community: communityId,
      })
        .select("sender")
        .lean();

    if (!message) {
      const error = new Error(
        "Message not found."
      );

      error.statusCode = 404;

      throw error;
    }

    if (
      message.sender.toString() !==
      userId.toString()
    ) {
      const error = new Error(
        "Only the message sender can view message info."
      );

      error.statusCode = 403;

      throw error;
    }

    const [
      receipts,
      messageDetails,
    ] = await Promise.all([
      CommunityMessageReceipt.find({
        message: messageId,
        user: {
          $ne: userId,
        },
      })
        .populate(
          "user",
          "name"
        )
        .sort({
          readAt: 1,
          deliveredAt: 1,
          createdAt: 1,
        })
        .lean(),

      CommunityMessage.findById(
        messageId
      )
        .select(
          "community createdAt"
        )
        .lean(),
    ]);

    const eligibleMembers =
      await CommunityMember.find({
        community: communityId,

        user: {
          $ne: userId,
        },

        joinedAt: {
          $lte:
            messageDetails.createdAt,
        },
      })
        .select("user")
        .populate(
          "user",
          "name"
        )
        .lean();

    const receiptMap =
      new Map(
        receipts.map(
          (receipt) => [
            receipt.user?._id?.toString() ||
              receipt.user?.toString(),

            receipt,
          ]
        )
      );

    const readBy = [];
    const deliveredTo = [];
    const sentTo = [];

    for (
      const member of eligibleMembers
    ) {
      const userIdString =
        member.user?._id?.toString();

      const receipt =
        receiptMap.get(
          userIdString
        );

      const item = {
        userId:
          member.user?._id ||
          member.user,

        name:
          member.user?.name ||
          "CampusX user",

        deliveredAt:
          receipt?.deliveredAt ||
          null,

        readAt:
          receipt?.readAt ||
          null,
      };

      if (
        receipt?.status ===
        "read"
      ) {
        readBy.push(item);
        continue;
      }

      if (
        receipt?.status ===
        "delivered"
      ) {
        deliveredTo.push(item);
        continue;
      }

      sentTo.push(item);
    }

    return {
      messageId,

      readBy,

      deliveredTo,

      sentTo,
    };
  };