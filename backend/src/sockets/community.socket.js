import jwt from "jsonwebtoken";

import env from "../config/env.js";

import {
  requireCommunityMember,
} from "../services/community/community-member.service.js";

import {
  sendCommunityMessage,
  markMessageDelivered,
  markMessageRead,
} from "../services/community/community-message.service.js";

const COMMUNITY_ROOM_PREFIX =
  "community:";

const getCommunityRoom = (
  communityId
) =>
  `${COMMUNITY_ROOM_PREFIX}${communityId}`;

/* ========================================================================== */
/* SOCKET AUTH                                                               */
/* ========================================================================== */

const getTokenFromSocket = (
  socket
) => {
  const authToken =
    socket.handshake.auth?.token;

  if (authToken) {
    return authToken.startsWith(
      "Bearer "
    )
      ? authToken.split(" ")[1]
      : authToken;
  }

  const authorization =
    socket.handshake.headers
      ?.authorization;

  if (
    authorization &&
    authorization.startsWith(
      "Bearer "
    )
  ) {
    return authorization.split(
      " "
    )[1];
  }

  return null;
};

const authenticateSocket = (
  socket
) => {
  const token =
    getTokenFromSocket(socket);

  if (!token) {
    const error = new Error(
      "Authentication token is required."
    );

    error.data = {
      code: "AUTH_TOKEN_REQUIRED",
    };

    throw error;
  }

  try {
    return jwt.verify(
      token,
      env.JWT_SECRET
    );
  } catch {
    const error = new Error(
      "Invalid or expired authentication token."
    );

    error.data = {
      code: "INVALID_AUTH_TOKEN",
    };

    throw error;
  }
};

/* ========================================================================== */
/* VALIDATION                                                                 */
/* ========================================================================== */

const validateCommunityId = (
  communityId
) => {
  if (
    !communityId ||
    typeof communityId !==
      "string"
  ) {
    const error = new Error(
      "Community ID is required."
    );

    error.data = {
      code: "INVALID_COMMUNITY_ID",
    };

    throw error;
  }

  return communityId;
};

const validateMessageId = (
  messageId
) => {
  if (
    !messageId ||
    typeof messageId !==
      "string"
  ) {
    const error = new Error(
      "Message ID is required."
    );

    error.data = {
      code: "INVALID_MESSAGE_ID",
    };

    throw error;
  }

  return messageId;
};

const validateMessagePayload = (
  payload
) => {
  if (
    !payload ||
    typeof payload !==
      "object"
  ) {
    const error = new Error(
      "Message payload is required."
    );

    error.data = {
      code: "INVALID_MESSAGE_PAYLOAD",
    };

    throw error;
  }

  const message =
    typeof payload.message ===
    "string"
      ? payload.message.trim()
      : "";

  if (!message) {
    const error = new Error(
      "Message is required."
    );

    error.data = {
      code: "MESSAGE_REQUIRED",
    };

    throw error;
  }

  if (message.length > 5000) {
    const error = new Error(
      "Message cannot exceed 5000 characters."
    );

    error.data = {
      code: "MESSAGE_TOO_LONG",
    };

    throw error;
  }

  const replyTo =
    payload.replyTo || null;

  return {
    message,
    replyTo,
  };
};

/* ========================================================================== */
/* SOCKET ERROR                                                               */
/* ========================================================================== */

const emitSocketError = (
  socket,
  error,
  callback
) => {
  const response = {
    success: false,

    message:
      error?.message ||
      "Socket request failed.",

    code:
      error?.data?.code ||
      "SOCKET_REQUEST_FAILED",
  };

  if (
    typeof callback ===
    "function"
  ) {
    callback(response);
  } else {
    socket.emit(
      "socket-error",
      response
    );
  }
};

/* ========================================================================== */
/* COMMUNITY SOCKET HANDLERS                                                  */
/* ========================================================================== */

const registerCommunitySocketHandlers =
  (
    io,
    socket
  ) => {
    /* ---------------------------------------------------------------------- */
    /* JOIN COMMUNITY                                                         */
    /* ---------------------------------------------------------------------- */

    socket.on(
      "join-community",
      async (
        payload,
        callback
      ) => {
        try {
          const communityId =
            validateCommunityId(
              payload?.communityId
            );

          const userId =
            socket.user.userId;

          await requireCommunityMember(
            communityId,
            userId
          );

          const room =
            getCommunityRoom(
              communityId
            );

          await socket.join(room);

          if (
            typeof callback ===
            "function"
          ) {
            callback({
              success: true,

              message:
                "Joined community realtime room successfully.",

              data: {
                communityId,
                room,
              },
            });
          }
        } catch (error) {
          emitSocketError(
            socket,
            error,
            callback
          );
        }
      }
    );

    /* ---------------------------------------------------------------------- */
    /* LEAVE COMMUNITY                                                        */
    /* ---------------------------------------------------------------------- */

    socket.on(
      "leave-community",
      async (
        payload,
        callback
      ) => {
        try {
          const communityId =
            validateCommunityId(
              payload?.communityId
            );

          const room =
            getCommunityRoom(
              communityId
            );

          await socket.leave(room);

          if (
            typeof callback ===
            "function"
          ) {
            callback({
              success: true,

              message:
                "Left community realtime room successfully.",

              data: {
                communityId,
                room,
              },
            });
          }
        } catch (error) {
          emitSocketError(
            socket,
            error,
            callback
          );
        }
      }
    );

    /* ---------------------------------------------------------------------- */
    /* SEND MESSAGE                                                           */
    /* ---------------------------------------------------------------------- */

    socket.on(
      "send-message",
      async (
        payload,
        callback
      ) => {
        try {
          const communityId =
            validateCommunityId(
              payload?.communityId
            );

          const messagePayload =
            validateMessagePayload(
              payload
            );

          const userId =
            socket.user.userId;

          await requireCommunityMember(
            communityId,
            userId
          );

          const message =
            await sendCommunityMessage(
              communityId,
              userId,
              messagePayload
            );

          const room =
            getCommunityRoom(
              communityId
            );

          io.to(room).emit(
            "new-message",
            message
          );

          if (
            typeof callback ===
            "function"
          ) {
            callback({
              success: true,

              message:
                "Message sent successfully.",

              data: {
                message,
              },
            });
          }
        } catch (error) {
          emitSocketError(
            socket,
            error,
            callback
          );
        }
      }
    );

    /* ---------------------------------------------------------------------- */
    /* MARK MESSAGE DELIVERED                                                 */
    /* ---------------------------------------------------------------------- */

    socket.on(
      "mark-delivered",
      async (
        payload,
        callback
      ) => {
        try {
          const communityId =
            validateCommunityId(
              payload?.communityId
            );

          const messageId =
            validateMessageId(
              payload?.messageId
            );

          const userId =
            socket.user.userId;

          const receipt =
            await markMessageDelivered(
              communityId,
              messageId,
              userId
            );

          /*
           * Sender does not create
           * their own receipt.
           */
          if (receipt) {
            const room =
              getCommunityRoom(
                communityId
              );

            /*
             * Send the receipt update
             * to every socket in the room.
             *
             * Frontend will only apply it
             * to the relevant message.
             */
            io.to(room).emit(
              "message-receipt-updated",
              {
                communityId,

                messageId,

                userId,

                status:
                  receipt.status,

                deliveredAt:
                  receipt.deliveredAt ||
                  null,

                readAt:
                  receipt.readAt ||
                  null,
              }
            );
          }

          if (
            typeof callback ===
            "function"
          ) {
            callback({
              success: true,

              message:
                "Message delivery status updated.",

              data: {
                receipt,
              },
            });
          }
        } catch (error) {
          emitSocketError(
            socket,
            error,
            callback
          );
        }
      }
    );

    /* ---------------------------------------------------------------------- */
    /* MARK MESSAGE READ                                                      */
    /* ---------------------------------------------------------------------- */

    socket.on(
      "mark-read",
      async (
        payload,
        callback
      ) => {
        try {
          const communityId =
            validateCommunityId(
              payload?.communityId
            );

          const messageId =
            validateMessageId(
              payload?.messageId
            );

          const userId =
            socket.user.userId;

          const receipt =
            await markMessageRead(
              communityId,
              messageId,
              userId
            );

          /*
           * Sender does not create
           * their own receipt.
           */
          if (receipt) {
            const room =
              getCommunityRoom(
                communityId
              );

            io.to(room).emit(
              "message-receipt-updated",
              {
                communityId,

                messageId,

                userId,

                status:
                  receipt.status,

                deliveredAt:
                  receipt.deliveredAt ||
                  null,

                readAt:
                  receipt.readAt ||
                  null,
              }
            );
          }

          if (
            typeof callback ===
            "function"
          ) {
            callback({
              success: true,

              message:
                "Message read status updated.",

              data: {
                receipt,
              },
            });
          }
        } catch (error) {
          emitSocketError(
            socket,
            error,
            callback
          );
        }
      }
    );
  };

/* ========================================================================== */
/* REGISTER COMMUNITY SOCKET                                                 */
/* ========================================================================== */

export const registerCommunitySocket =
  (
    io
  ) => {
    io.use(
      (
        socket,
        next
      ) => {
        try {
          const user =
            authenticateSocket(
              socket
            );

          socket.user =
            user;

          next();
        } catch (error) {
          next(error);
        }
      }
    );

    io.on(
      "connection",
      (socket) => {
        console.log(
          `Community socket connected: ${socket.id}`
        );

        registerCommunitySocketHandlers(
          io,
          socket
        );

        socket.on(
          "disconnect",
          (reason) => {
            console.log(
              `Community socket disconnected: ${socket.id} (${reason})`
            );
          }
        );
      }
    );
  };