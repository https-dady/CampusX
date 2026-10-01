import express from "express";

import {
  getCommunities,
  getCommunity,
  joinCommunityController,
  leaveCommunityController,
  getMessages,
  sendMessage,
  markDelivered,
  markRead,
  getMessageInfoController,
} from "../controllers/community.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import validateCommunity from "../middleware/community-validation.middleware.js";

import {
  communityIdParamSchema,
  messageIdParamSchema,
  messageListQuerySchema,
  sendMessageSchema,
} from "../validators/community.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  getCommunities
);

router.get(
  "/:communityId",
  validateCommunity(
    communityIdParamSchema,
    "params"
  ),
  getCommunity
);

router.post(
  "/:communityId/join",
  validateCommunity(
    communityIdParamSchema,
    "params"
  ),
  joinCommunityController
);

router.delete(
  "/:communityId/leave",
  validateCommunity(
    communityIdParamSchema,
    "params"
  ),
  leaveCommunityController
);

router.get(
  "/:communityId/messages",
  validateCommunity(
    communityIdParamSchema,
    "params"
  ),

  validateCommunity(
    messageListQuerySchema,
    "query"
  ),

  getMessages
);

router.post(
  "/:communityId/messages",
  validateCommunity(
    communityIdParamSchema,
    "params"
  ),

  validateCommunity(
    sendMessageSchema
  ),

  sendMessage
);

router.post(
  "/:communityId/messages/:messageId/delivered",

  validateCommunity(
    messageIdParamSchema,
    "params"
  ),

  markDelivered
);

router.post(
  "/:communityId/messages/:messageId/read",

  validateCommunity(
    messageIdParamSchema,
    "params"
  ),

  markRead
);

router.get(
  "/:communityId/messages/:messageId/info",

  validateCommunity(
    messageIdParamSchema,
    "params"
  ),

  getMessageInfoController
);

export default router;