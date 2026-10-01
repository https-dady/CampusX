import api from "./api";

/* ========================================================================== */
/* COMMUNITIES                                                                */
/* ========================================================================== */

export const getCommunities =
  async () => {
    const response =
      await api.get(
        "/communities"
      );

    return response.data;
  };

export const getCommunity =
  async (
    communityId
  ) => {
    const response =
      await api.get(
        `/communities/${encodeURIComponent(
          communityId
        )}`
      );

    return response.data;
  };

export const joinCommunity =
  async (
    communityId
  ) => {
    const response =
      await api.post(
        `/communities/${encodeURIComponent(
          communityId
        )}/join`
      );

    return response.data;
  };

export const leaveCommunity =
  async (
    communityId
  ) => {
    const response =
      await api.delete(
        `/communities/${encodeURIComponent(
          communityId
        )}/leave`
      );

    return response.data;
  };

/* ========================================================================== */
/* MESSAGES                                                                   */
/* ========================================================================== */

export const getCommunityMessages =
  async ({
    communityId,
    limit = 30,
    before,
  }) => {
    const params = {
      limit,
    };

    if (before) {
      params.before =
        before;
    }

    const response =
      await api.get(
        `/communities/${encodeURIComponent(
          communityId
        )}/messages`,
        {
          params,
        }
      );

    return response.data;
  };

export const sendCommunityMessage =
  async ({
    communityId,
    message,
    replyTo = null,
  }) => {
    const response =
      await api.post(
        `/communities/${encodeURIComponent(
          communityId
        )}/messages`,
        {
          message,

          ...(replyTo
            ? {
                replyTo,
              }
            : {}),
        }
      );

    return response.data;
  };

/* ========================================================================== */
/* RECEIPTS                                                                   */
/* ========================================================================== */

export const markMessageDelivered =
  async ({
    communityId,
    messageId,
  }) => {
    const response =
      await api.post(
        `/communities/${encodeURIComponent(
          communityId
        )}/messages/${encodeURIComponent(
          messageId
        )}/delivered`
      );

    return response.data;
  };

export const markMessageRead =
  async ({
    communityId,
    messageId,
  }) => {
    const response =
      await api.post(
        `/communities/${encodeURIComponent(
          communityId
        )}/messages/${encodeURIComponent(
          messageId
        )}/read`
      );

    return response.data;
  };

/* ========================================================================== */
/* MESSAGE INFO                                                               */
/* ========================================================================== */

export const getMessageInfo =
  async ({
    communityId,
    messageId,
  }) => {
    const response =
      await api.get(
        `/communities/${encodeURIComponent(
          communityId
        )}/messages/${encodeURIComponent(
          messageId
        )}/info`
      );

    return response.data;
  };