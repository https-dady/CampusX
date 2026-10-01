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

/* ========================================================================== */
/* GET COMMUNITY MESSAGES                                                    */
/* ========================================================================== */

export const getCommunityMessages =
  async (
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
        messages.map(
          serializeMessage
        ),

      hasMore,

      nextBefore:
        lastMessage?._id || null,
    };
  };

/* ========================================================================== */
/* SEND COMMUNITY MESSAGE                                                    */
/* ========================================================================== */

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

/* ========================================================================== */
/* MARK MESSAGE DELIVERED                                                    */
/* ========================================================================== */

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

    /*
     * Sender does not create a receipt
     * for their own message.
     */
    if (
      message.sender.toString() ===
      userId.toString()
    ) {
      return null;
    }

    const now = new Date();

    /*
     * First check whether a receipt already exists.
     */
    const existingReceipt =
      await CommunityMessageReceipt.findOne({
        message: messageId,
        user: userId,
      }).lean();

    /*
     * IMPORTANT:
     *
     * Receipt state can only move forward:
     *
     * sent -> delivered -> read
     *
     * A read receipt must NEVER become
     * delivered again.
     */
    if (existingReceipt) {
      if (
        existingReceipt.status ===
        "read"
      ) {
        return existingReceipt;
      }

      if (
        existingReceipt.status ===
        "delivered"
      ) {
        return existingReceipt;
      }

      const updatedReceipt =
        await CommunityMessageReceipt.findOneAndUpdate(
          {
            _id:
              existingReceipt._id,

            status: {
              $ne: "read",
            },
          },
          {
            $set: {
              status: "delivered",

              deliveredAt:
                existingReceipt.deliveredAt ||
                now,
            },
          },
          {
            new: true,
          }
        ).lean();

      /*
       * If another request changed the receipt
       * to read while this request was executing,
       * fetch the final state instead of downgrading it.
       */
      if (!updatedReceipt) {
        return (
          CommunityMessageReceipt.findOne({
            _id:
              existingReceipt._id,
          }).lean()
        );
      }

      return updatedReceipt;
    }

    /*
     * No receipt exists.
     *
     * Create exactly one receipt.
     *
     * The database has a unique
     * { message, user } index, so concurrent
     * requests cannot create duplicates.
     */
    try {
      return await CommunityMessageReceipt.create({
        message: messageId,

        user: userId,

        status: "delivered",

        deliveredAt: now,
      });
    } catch (error) {
      /*
       * Another concurrent request may have
       * inserted the receipt first.
       */
      if (
        error?.code === 11000
      ) {
        return (
          CommunityMessageReceipt.findOne({
            message: messageId,
            user: userId,
          }).lean()
        );
      }

      throw error;
    }
  };

/* ========================================================================== */
/* MARK MESSAGE READ                                                         */
/* ========================================================================== */

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

    /*
     * Keep community-level last-read tracking.
     */
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

    /*
     * Sender does not create a receipt
     * for their own message.
     */
    if (
      message.sender.toString() ===
      userId.toString()
    ) {
      return null;
    }

    /*
     * Check existing receipt first.
     */
    const existingReceipt =
      await CommunityMessageReceipt.findOne({
        message: messageId,
        user: userId,
      }).lean();

    /*
     * Already read.
     *
     * Do not modify timestamps again.
     */
    if (
      existingReceipt?.status ===
      "read"
    ) {
      return existingReceipt;
    }

    /*
     * Existing delivered receipt.
     *
     * Preserve original deliveredAt.
     */
    if (existingReceipt) {
      const updatedReceipt =
        await CommunityMessageReceipt.findOneAndUpdate(
          {
            _id:
              existingReceipt._id,

            status: {
              $ne: "read",
            },
          },
          {
            $set: {
              status: "read",

              deliveredAt:
                existingReceipt.deliveredAt ||
                now,

              readAt:
                existingReceipt.readAt ||
                now,
            },
          },
          {
            new: true,
          }
        ).lean();

      /*
       * Another request may have changed
       * the receipt to read first.
       */
      if (!updatedReceipt) {
        return (
          CommunityMessageReceipt.findOne({
            _id:
              existingReceipt._id,
          }).lean()
        );
      }

      return updatedReceipt;
    }

    /*
     * No receipt existed.
     *
     * If a message is read directly,
     * it is considered delivered at the
     * same moment.
     */
    try {
      return await CommunityMessageReceipt.create({
        message: messageId,

        user: userId,

        status: "read",

        deliveredAt: now,

        readAt: now,
      });
    } catch (error) {
      /*
       * Handle concurrent insert safely.
       */
      if (
        error?.code === 11000
      ) {
        return (
          CommunityMessageReceipt.findOne({
            message: messageId,
            user: userId,
          }).lean()
        );
      }

      throw error;
    }
  };

/* ========================================================================== */
/* GET MESSAGE INFO                                                          */
/* ========================================================================== */

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

    /*
     * Fetch the message first.
     */
    const message =
      await CommunityMessage.findOne({
        _id: messageId,
        community: communityId,
      })
        .select(
          "sender community createdAt"
        )
        .lean();

    if (!message) {
      const error = new Error(
        "Message not found."
      );

      error.statusCode = 404;

      throw error;
    }

    /*
     * Only sender can open message info.
     */
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

    /*
     * Fetch receipts and eligible members
     * in parallel.
     */
    const [
      receipts,
      eligibleMembers,
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
        .lean(),

      CommunityMember.find({
        community: communityId,

        user: {
          $ne: userId,
        },

        /*
         * Only users who were members
         * when this message was sent
         * are recipients.
         */
        joinedAt: {
          $lte:
            message.createdAt,
        },
      })
        .select("user")
        .populate(
          "user",
          "name"
        )
        .lean(),
    ]);

    /*
     * Receipt lookup by USER ID.
     *
     * Never use name as the key because
     * two users can have the same name.
     */
    const receiptMap =
      new Map();

    for (
      const receipt of receipts
    ) {
      const receiptUserId =
        receipt.user?._id?.toString() ||
        receipt.user?.toString();

      if (!receiptUserId) {
        continue;
      }

      receiptMap.set(
        receiptUserId,
        receipt
      );
    }

    /*
     * Defensive member deduplication.
     *
     * Database already has a unique
     * community + user index.
     */
    const memberMap =
      new Map();

    for (
      const member of eligibleMembers
    ) {
      const memberUserId =
        member.user?._id?.toString() ||
        member.user?.toString();

      if (!memberUserId) {
        continue;
      }

      if (
        memberMap.has(
          memberUserId
        )
      ) {
        continue;
      }

      memberMap.set(
        memberUserId,
        member
      );
    }

    /*
     * ONE recipient = ONE timeline.
     *
     * Sent is always present.
     *
     * Delivered and Read are timestamps
     * on that same recipient.
     */
    const recipients =
      Array.from(
        memberMap.values()
      ).map((member) => {
        const recipientUserId =
          member.user?._id ||
          member.user;

        const recipientUserIdString =
          recipientUserId.toString();

        const receipt =
          receiptMap.get(
            recipientUserIdString
          );

        let status = "sent";

        if (
          receipt?.status ===
          "read"
        ) {
          status = "read";
        } else if (
          receipt?.status ===
          "delivered"
        ) {
          status = "delivered";
        }

        return {
          userId:
            recipientUserId,

          name:
            member.user?.name ||
            "CampusX user",

          status,

          sentAt:
            message.createdAt,

          deliveredAt:
            receipt?.deliveredAt ||
            null,

          readAt:
            receipt?.readAt ||
            null,
        };
      });

    /*
     * Cumulative status groups.
     */
    const readBy =
      recipients.filter(
        (recipient) =>
          recipient.status ===
          "read"
      );

    const deliveredTo =
      recipients.filter(
        (recipient) =>
          recipient.status ===
            "delivered" ||
          recipient.status ===
            "read"
      );

    /*
     * Every recipient was sent the message.
     *
     * This is intentionally NOT just
     * the pending "sent" bucket.
     */
    const sentTo =
      recipients;

    return {
      messageId,

      recipients,

      counts: {
        sent:
          recipients.length,

        delivered:
          deliveredTo.length,

        read:
          readBy.length,
      },

      /*
       * Backward-compatible fields.
       */
      readBy,

      deliveredTo,

      sentTo,
    };
  };