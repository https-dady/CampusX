import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Info,
  LoaderCircle,
  LogOut,
  MessageCircleReply,
  MoreVertical,
  Send,
  UsersRound,
  X,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";

import {
  getCommunity,
  getCommunityMessages,
  getMessageInfo,
  joinCommunity,
  leaveCommunity,
  markMessageDelivered,
  markMessageRead,
} from "../../services/community.service.js";

import { createCommunitySocket } from "../../services/community.socket.js";

const TOKEN_KEY = "campusx_token";
const USER_KEY = "campusx_user";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem(USER_KEY) || "null"
    );
  } catch {
    return null;
  }
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== now.getFullYear()
        ? "numeric"
        : undefined,
  }).format(date);
};

const initials = (name = "CampusX user") => {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CX"
  );
};

/* ========================================================================= */
/* MESSAGE TICKS                                                             */
/* ========================================================================= */

const MessageTicks = ({ message }) => {
  const readCount =
    message?.deliveryStatus?.readCount || 0;

  const deliveredCount =
    message?.deliveryStatus?.deliveredCount || 0;

  const recipientCount =
    message?.deliveryStatus?.recipientCount || 0;

  /*
   * In a group message, the final state is reached only when
   * all eligible recipients have reached that state.
   *
   * If recipientCount is not available yet, we still show the
   * strongest state we have received instead of hiding receipt
   * progress completely.
   */

  if (
    recipientCount > 0 &&
    readCount >= recipientCount
  ) {
    return (
      <CheckCheck
        size={15}
        strokeWidth={2.5}
        aria-label="Read by everyone"
        className="text-teal-700"
      />
    );
  }

  if (
    recipientCount > 0 &&
    deliveredCount >= recipientCount
  ) {
    return (
      <CheckCheck
        size={15}
        strokeWidth={2.5}
        aria-label="Delivered to everyone"
      />
    );
  }

  if (readCount > 0) {
    return (
      <CheckCheck
        size={15}
        strokeWidth={2.5}
        aria-label="Read by some recipients"
        className="text-teal-700"
      />
    );
  }

  if (deliveredCount > 0) {
    return (
      <CheckCheck
        size={15}
        strokeWidth={2.5}
        aria-label="Delivered to some recipients"
      />
    );
  }

  return (
    <Check
      size={15}
      strokeWidth={2.5}
      aria-label="Sent"
    />
  );
};

/* ========================================================================= */
/* INFO SECTION                                                              */
/* ========================================================================= */

const InfoSection = ({
  title,
  count,
  children,
  last = false,
}) => {
  return (
    <section
      className={[
        last
          ? ""
          : "border-b border-stone-100 pb-4",
        title === "Read by" ? "" : "pt-4",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#10231f]">
          {title}
        </h3>

        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
          {count}
        </span>
      </div>

      {children}
    </section>
  );
};

const RecipientTimeline = ({ recipients = [] }) => {
  if (recipients.length === 0) {
    return (
      <p className="text-[11px] text-stone-400">
        No recipients yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {recipients.map((recipient) => {
        const status =
          recipient?.status || "sent";

        return (
          <div
            key={String(recipient.userId)}
            className="rounded-xl bg-stone-50 px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d9eee8] text-[9px] font-bold text-teal-900">
                {initials(recipient.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-stone-700">
                  {recipient.name || "CampusX user"}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-stone-400">
                  <span>
                    Sent {formatTime(recipient.sentAt)}
                  </span>

                  {recipient.deliveredAt && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span>
                        Delivered{" "}
                        {formatTime(
                          recipient.deliveredAt
                        )}
                      </span>
                    </>
                  )}

                  {recipient.readAt && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="font-medium text-teal-700">
                        Read{" "}
                        {formatTime(
                          recipient.readAt
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <span
                className={[
                  "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold",
                  status === "read"
                    ? "bg-teal-50 text-teal-700"
                    : status === "delivered"
                      ? "bg-stone-200 text-stone-600"
                      : "bg-stone-100 text-stone-400",
                ].join(" ")}
              >
                {status === "read"
                  ? "Read"
                  : status === "delivered"
                    ? "Delivered"
                    : "Sent"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const normalizeMessages = (
  messageList,
  recipientCount = 0
) => {
  return (messageList || []).map((message) => ({
    ...message,
    deliveryStatus: {
      recipientCount:
        message?.deliveryStatus?.recipientCount ??
        recipientCount,
      deliveredCount:
        message?.deliveryStatus?.deliveredCount || 0,
      readCount:
        message?.deliveryStatus?.readCount || 0,
    },
  }));
};

/* ========================================================================= */
/* COMMUNITY CHAT                                                            */
/* ========================================================================= */

const CommunityChat = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const currentUser = useMemo(
    () => getStoredUser(),
    []
  );

  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [hasMore, setHasMore] = useState(false);

  const [infoMessageId, setInfoMessageId] =
    useState(null);

  const [info, setInfo] = useState(null);
  const [infoLoading, setInfoLoading] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);

  const initialLoadRef = useRef(true);

  const readSentRef = useRef(new Set());
  const deliveredUsersRef =
    useRef(new Map());

  const readUsersRef =
    useRef(new Map());

  const currentUserId =
    currentUser?.id ||
    currentUser?._id ||
    currentUser?.userId ||
    null;

  /* ======================================================================= */
  /* SCROLL                                                                  */
  /* ======================================================================= */

  const scrollToBottom = useCallback(
    (behavior = "smooth") => {
      bottomRef.current?.scrollIntoView({
        behavior: prefersReducedMotion
          ? "auto"
          : behavior,
        block: "end",
      });
    },
    [prefersReducedMotion]
  );

  /* ======================================================================= */
  /* MARK READ                                                               */
  /* ======================================================================= */

  const markRead = useCallback(
    (messageId) => {
      if (!messageId) {
        return;
      }

      if (socketRef.current?.connected) {
        socketRef.current.emit(
          "mark-read",
          {
            communityId,
            messageId,
          }
        );

        return;
      }

      markMessageRead({
        communityId,
        messageId,
      }).catch(() => {});
    },
    [communityId]
  );

  /* ======================================================================= */
  /* MARK DELIVERED                                                          */
  /* ======================================================================= */

  const markDelivered = useCallback(
    (messageId) => {
      if (!messageId) {
        return;
      }

      if (socketRef.current?.connected) {
        socketRef.current.emit(
          "mark-delivered",
          {
            communityId,
            messageId,
          }
        );

        return;
      }

      markMessageDelivered({
        communityId,
        messageId,
      }).catch(() => {});
    },
    [communityId]
  );

  /* ======================================================================= */
  /* LOAD COMMUNITY + INITIAL MESSAGES                                       */
  /* ======================================================================= */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          communityResponse,
          messagesResponse,
        ] = await Promise.all([
          getCommunity(communityId),

          getCommunityMessages({
            communityId,
            limit: 30,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const nextCommunity =
          communityResponse?.data?.community;

        const nextMessages =
          messagesResponse?.data?.messages || [];

        /*
         * Normally the user reaches this page after
         * joining from Community.jsx.
         *
         * This extra check makes the route safe if
         * somebody directly opens /community/:id.
         */

        if (!nextCommunity?.isMember) {
          await joinCommunity(communityId);

          const refreshed =
            await getCommunity(communityId);

          if (cancelled) {
            return;
          }

          setCommunity(
            refreshed?.data?.community ||
              nextCommunity
          );
        } else {
          setCommunity(nextCommunity);
        }

        setMessages(
          normalizeMessages(
            nextMessages,
            Math.max(
              Number(nextCommunity?.memberCount || 0) - 1,
              0
            )
          )
        );

        setHasMore(
          Boolean(
            messagesResponse?.data?.hasMore
          )
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError?.response?.data?.message ||
              loadError?.message ||
              "Unable to open this community."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [communityId]);

  /* ======================================================================= */
  /* SOCKET.IO                                                               */
  /* ======================================================================= */

  useEffect(() => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (!token || !communityId) {
      return undefined;
    }

    const socket =
      createCommunitySocket(token);

    socketRef.current = socket;

    /* ------------------------------------------------------------------- */
    /* CONNECT                                                              */
    /* ------------------------------------------------------------------- */

    socket.on("connect", () => {
      socket.emit(
        "join-community",
        {
          communityId,
        }
      );
    });

    /* ------------------------------------------------------------------- */
    /* NEW MESSAGE                                                          */
    /* ------------------------------------------------------------------- */

    socket.on(
      "new-message",
      (message) => {
        if (
          String(message?.communityId) !==
          String(communityId)
        ) {
          return;
        }

        setMessages((current) => {
          if (
            current.some(
              (item) =>
                String(item.id) ===
                String(message.id)
            )
          ) {
            return current;
          }

          return [...current, message];
        });

        /*
         * The chat is currently open, so an incoming message
         * can be marked read directly.
         *
         * The backend read transition also records deliveredAt
         * when no delivery receipt exists. This avoids firing
         * delivered + read at the same time and creating a race
         * where "read" can be overwritten by "delivered".
         */

        if (
          String(message?.sender?.id) !==
          String(currentUserId)
        ) {
          if (
            !readSentRef.current.has(
              message.id
            )
          ) {
            readSentRef.current.add(
              message.id
            );

            markRead(message.id);
          }
        }

        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    );

    /* ------------------------------------------------------------------- */
    /* RECEIPT UPDATE                                                       */
    /* ------------------------------------------------------------------- */

    socket.on(
      "message-receipt-updated",
      (payload) => {
        if (
          String(payload?.communityId) !==
          String(communityId)
        ) {
          return;
        }

        if (!payload?.messageId || !payload?.userId) {
          return;
        }

        setMessages((current) =>
          current.map((message) => {
            if (
              String(message.id) !==
              String(payload.messageId)
            ) {
              return message;
            }

            /*
             * Receipt counters matter only for messages
             * sent by the current user.
             */
            if (
              String(message?.sender?.id) !==
              String(currentUserId)
            ) {
              return message;
            }

            const deliveredUsers =
              deliveredUsersRef.current.get(
                message.id
              ) || new Set();

            const readUsers =
              readUsersRef.current.get(
                message.id
              ) || new Set();

            const receiptUserId =
              String(payload.userId);

            /*
             * A read receipt is also a delivered receipt.
             */
            deliveredUsers.add(receiptUserId);

            if (
              payload.status === "read"
            ) {
              readUsers.add(receiptUserId);
            }

            deliveredUsersRef.current.set(
              message.id,
              deliveredUsers
            );

            readUsersRef.current.set(
              message.id,
              readUsers
            );

            const previous =
              message.deliveryStatus || {};

            return {
              ...message,

              deliveryStatus: {
                recipientCount:
                  previous.recipientCount ??
                  Math.max(
                    Number(
                      community?.memberCount || 0
                    ) - 1,
                    0
                  ),

                deliveredCount:
                  deliveredUsers.size,

                readCount:
                  readUsers.size,
              },
            };
          })
        );
      }
    );

    /* ------------------------------------------------------------------- */
    /* SOCKET ERROR                                                         */
    /* ------------------------------------------------------------------- */

    socket.on(
      "connect_error",
      (socketError) => {
        setError(
          socketError?.message ||
            "Community realtime connection failed."
        );
      }
    );

    /* ------------------------------------------------------------------- */
    /* CLEANUP                                                              */
    /* ------------------------------------------------------------------- */

    return () => {
      if (socket.connected) {
        socket.emit(
          "leave-community",
          {
            communityId,
          }
        );
      }

      socket.disconnect();

      socketRef.current = null;
    };
  }, [
    communityId,
    currentUserId,
    markRead,
    scrollToBottom,
  ]);

  /* ======================================================================= */
  /* MARK EXISTING INCOMING MESSAGES READ                                    */
  /* ======================================================================= */

  useEffect(() => {
    if (
      loading ||
      messages.length === 0
    ) {
      return;
    }

    const incomingMessages =
      messages.filter(
        (message) =>
          String(message?.sender?.id) !==
          String(currentUserId)
      );

    incomingMessages.forEach(
      (message) => {
        if (
          readSentRef.current.has(
            message.id
          )
        ) {
          return;
        }

        readSentRef.current.add(
          message.id
        );

        markRead(message.id);
      }
    );

    if (initialLoadRef.current) {
      initialLoadRef.current = false;

      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    }
  }, [
    loading,
    messages,
    currentUserId,
    markRead,
    scrollToBottom,
  ]);

  /* ======================================================================= */
  /* LOAD OLDER MESSAGES                                                    */
  /* ======================================================================= */

  const loadOlder = async () => {
    if (
      !hasMore ||
      loadingOlder ||
      messages.length === 0
    ) {
      return;
    }

    const container =
      messagesRef.current;

    const previousHeight =
      container?.scrollHeight || 0;

    const previousTop =
      container?.scrollTop || 0;

    setLoadingOlder(true);

    try {
      const response =
        await getCommunityMessages({
          communityId,
          limit: 30,
          before: messages[0].id,
        });

      const older =
        response?.data?.messages || [];

      setMessages((current) => [
        ...normalizeMessages(
          older,
          Math.max(
            Number(community?.memberCount || 0) - 1,
            0
          )
        ),
        ...current,
      ]);

      setHasMore(
        Boolean(
          response?.data?.hasMore
        )
      );

      requestAnimationFrame(() => {
        if (!container) {
          return;
        }

        container.scrollTop =
          previousTop +
          (container.scrollHeight -
            previousHeight);
      });
    } catch (loadError) {
      setError(
        loadError?.response?.data?.message ||
          "Unable to load older messages."
      );
    } finally {
      setLoadingOlder(false);
    }
  };

  /* ======================================================================= */
  /* SEND MESSAGE                                                            */
  /* ======================================================================= */

  const sendMessage = async (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      if (
        !socketRef.current?.connected
      ) {
        throw new Error(
          "Realtime connection is not ready yet."
        );
      }

      await new Promise(
        (resolve, reject) => {
          socketRef.current.emit(
            "send-message",
            {
              communityId,
              message,

              ...(replyTo?.id
                ? {
                    replyTo:
                      replyTo.id,
                  }
                : {}),
            },

            (response) => {
              if (
                response?.success
              ) {
                resolve(response);
                return;
              }

              reject(
                new Error(
                  response?.message ||
                    "Unable to send message."
                )
              );
            }
          );
        }
      );

      setInput("");
      setReplyTo(null);

      requestAnimationFrame(() => {
        scrollToBottom();
      });
    } catch (sendError) {
      setError(
        sendError?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /* ======================================================================= */
  /* MESSAGE INFO                                                            */
  /* ======================================================================= */

  const openInfo = async (
    messageId
  ) => {
    setInfoMessageId(messageId);
    setInfo(null);
    setInfoLoading(true);

    try {
      const response =
        await getMessageInfo({
          communityId,
          messageId,
        });

      /*
       * Backend controller currently returns
       * the info object inside response.data.
       */

      setInfo(
        response?.data?.data ||
          response?.data
      );
    } catch (infoError) {
      setError(
        infoError?.response?.data?.message ||
          "Unable to load message info."
      );

      setInfoMessageId(null);
    } finally {
      setInfoLoading(false);
    }
  };

  /* ======================================================================= */
  /* LEAVE COMMUNITY                                                         */
  /* ======================================================================= */

  const leave = async () => {
    const confirmed =
      window.confirm(
        "Leave this community?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await leaveCommunity(
        communityId
      );

      navigate("/community");
    } catch (leaveError) {
      setError(
        leaveError?.response?.data?.message ||
          "Unable to leave community."
      );
    }
  };

  /* ======================================================================= */
  /* LOADING                                                                 */
  /* ======================================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f7f4ed]">
        <LoaderCircle
          className="animate-spin text-teal-800"
          size={28}
        />
      </div>
    );
  }

  /* ======================================================================= */
  /* ERROR WITHOUT COMMUNITY                                                */
  /* ======================================================================= */

  if (error && !community) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-[#f7f4ed] px-6 text-center">
        <MessageCircleReply
          size={34}
          className="text-stone-400"
        />

        <p className="max-w-md text-sm text-stone-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/community")
          }
          className="rounded-lg bg-[#10231f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-900"
        >
          Back to communities
        </button>
      </div>
    );
  }

  /* ======================================================================= */
  /* MAIN CHAT UI                                                            */
  /* ======================================================================= */

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[#efeae2]">
      <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col border-x border-stone-200 bg-[#f7f4ed] shadow-[0_10px_50px_rgba(28,25,23,0.05)]">

        {/* ================================================================= */}
        {/* HEADER                                                            */}
        {/* ================================================================= */}

        <header className="relative z-20 flex min-h-[70px] shrink-0 items-center gap-3 border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:px-6">

          <button
            type="button"
            onClick={() =>
              navigate("/community")
            }
            aria-label="Back to communities"
            className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d9eee8] text-xs font-bold text-teal-950">
            {initials(
              community?.name
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold text-[#10231f]">
              {community?.name ||
                "Community"}
            </h1>

            <p className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <UsersRound size={12} />

              {community?.memberCount ||
                0}{" "}
              members
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (value) => !value
              )
            }
            aria-label="Community options"
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-5 top-[62px] z-30 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white p-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  leave();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} />

                Leave community
              </button>
            </div>
          )}
        </header>

        {/* ================================================================= */}
        {/* ERROR BAR                                                         */}
        {/* ================================================================= */}

        {error && (
          <div className="flex shrink-0 items-center justify-between gap-3 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              aria-label="Dismiss"
              className="rounded-full p-1 hover:bg-amber-100"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* MESSAGES                                                          */}
        {/* ================================================================= */}

        <main
          ref={messagesRef}
          className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6"
          style={{
            backgroundImage:
              "radial-gradient(rgba(16,35,31,0.045) 1px, transparent 1px)",
            backgroundSize:
              "20px 20px",
          }}
        >

          {/* --------------------------------------------------------------- */}
          {/* OLDER MESSAGES                                                  */}
          {/* --------------------------------------------------------------- */}

          {hasMore && (
            <div className="mb-4 flex justify-center">
              <button
                type="button"
                onClick={loadOlder}
                disabled={loadingOlder}
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 shadow-sm transition hover:bg-stone-50 disabled:opacity-60"
              >
                {loadingOlder && (
                  <LoaderCircle
                    size={13}
                    className="animate-spin"
                  />
                )}

                Load older messages
              </button>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* EMPTY CHAT                                                      */}
          {/* --------------------------------------------------------------- */}

          {messages.length === 0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center">
              <div className="max-w-sm rounded-2xl bg-white/85 px-6 py-5 text-center shadow-sm ring-1 ring-stone-200">
                <MessageCircleReply
                  className="mx-auto text-teal-800"
                  size={28}
                />

                <p className="mt-3 text-sm font-semibold text-[#10231f]">
                  Start the conversation
                </p>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Ask a question, share a
                  project, or help another
                  student.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-4xl flex-col gap-2">

              {messages.map(
                (message, index) => {
                  const mine =
                    String(
                      message?.sender?.id
                    ) ===
                    String(
                      currentUserId
                    );

                  const previous =
                    messages[index - 1];

                  const showDate =
                    !previous ||
                    formatDate(
                      previous.createdAt
                    ) !==
                      formatDate(
                        message.createdAt
                      );

                  return (
                    <div
                      key={message.id}
                    >

                      {/* ------------------------------------------------- */}
                      {/* DATE SEPARATOR                                    */}
                      {/* ------------------------------------------------- */}

                      {showDate && (
                        <div className="my-4 flex justify-center">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold text-stone-500 shadow-sm">
                            {formatDate(
                              message.createdAt
                            )}
                          </span>
                        </div>
                      )}

                      {/* ------------------------------------------------- */}
                      {/* MESSAGE ROW                                       */}
                      {/* ------------------------------------------------- */}

                      <div
                        className={[
                          "group flex",
                          mine
                            ? "justify-end"
                            : "justify-start",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex max-w-[86%] items-end gap-1.5 sm:max-w-[72%]",
                            mine
                              ? "flex-row-reverse"
                              : "",
                          ].join(" ")}
                        >

                          {/* ------------------------------------------------ */}
                          {/* SENDER AVATAR                                    */}
                          {/* ------------------------------------------------ */}

                          {!mine && (
                            <div className="mb-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-bold text-teal-900 shadow-sm ring-1 ring-stone-200">
                              {initials(
                                message
                                  ?.sender
                                  ?.name
                              )}
                            </div>
                          )}

                          {/* ------------------------------------------------ */}
                          {/* BUBBLE                                           */}
                          {/* ------------------------------------------------ */}

                          <div
                            className={[
                              "relative rounded-2xl px-3.5 py-2.5 shadow-sm",
                              mine
                                ? "rounded-br-md bg-[#d9eee8] text-[#10231f]"
                                : "rounded-bl-md bg-white text-stone-800",
                            ].join(" ")}
                          >

                            {/* -------------------------------------------- */}
                            {/* SENDER NAME                                   */}
                            {/* -------------------------------------------- */}

                            {!mine && (
                              <p className="mb-1 text-[10px] font-bold text-teal-900">
                                {message
                                  ?.sender
                                  ?.name ||
                                  "CampusX user"}
                              </p>
                            )}

                            {/* -------------------------------------------- */}
                            {/* REPLY PREVIEW                                 */}
                            {/* -------------------------------------------- */}

                            {message.replyTo && (
                              <div className="mb-2 rounded-lg border-l-2 border-teal-700 bg-black/[0.035] px-2.5 py-1.5 text-[11px] text-stone-500">
                                <p className="font-semibold text-teal-800">
                                  Reply
                                </p>

                                <p className="mt-0.5 truncate">
                                  {typeof message.replyTo ===
                                  "string"
                                    ? "Replied message"
                                    : message
                                        .replyTo
                                        ?.message ||
                                      "Replied message"}
                                </p>
                              </div>
                            )}

                            {/* -------------------------------------------- */}
                            {/* MESSAGE TEXT                                  */}
                            {/* -------------------------------------------- */}

                            <p className="whitespace-pre-wrap break-words text-[13px] leading-5">
                              {message.message}
                            </p>

                            {/* -------------------------------------------- */}
                            {/* TIME + TICKS                                  */}
                            {/* -------------------------------------------- */}

                            <div
                              className={[
                                "mt-1 flex items-center justify-end gap-1.5",
                                mine
                                  ? "text-teal-800"
                                  : "text-stone-400",
                              ].join(" ")}
                            >
                              <span className="text-[9px]">
                                {formatTime(
                                  message.createdAt
                                )}
                              </span>

                              {mine && (
                                <MessageTicks
                                  message={
                                    message
                                  }
                                />
                              )}
                            </div>

                            {/* -------------------------------------------- */}
                            {/* INFO BUTTON                                    */}
                            {/* -------------------------------------------- */}

                            {mine && (
                              <button
                                type="button"
                                onClick={() =>
                                  openInfo(
                                    message.id
                                  )
                                }
                                aria-label="Message info"
                                className="absolute -right-8 bottom-1 rounded-full p-1.5 text-stone-400 opacity-0 transition hover:bg-white hover:text-teal-800 group-hover:opacity-100 focus:opacity-100"
                              >
                                <Info
                                  size={14}
                                />
                              </button>
                            )}
                          </div>

                          {/* ------------------------------------------------ */}
                          {/* REPLY BUTTON                                     */}
                          {/* ------------------------------------------------ */}

                          <button
                            type="button"
                            onClick={() =>
                              setReplyTo(
                                message
                              )
                            }
                            aria-label="Reply to message"
                            className="mb-1 rounded-full p-1.5 text-stone-400 opacity-0 transition hover:bg-white hover:text-teal-800 group-hover:opacity-100 focus:opacity-100"
                          >
                            <MessageCircleReply
                              size={14}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </main>

        {/* ================================================================= */}
        {/* REPLY BAR                                                         */}
        {/* ================================================================= */}

        {replyTo && (
          <div className="flex shrink-0 items-center gap-3 border-t border-stone-200 bg-white px-4 py-2 sm:px-6">
            <div className="min-w-0 flex-1 border-l-2 border-teal-700 pl-3">
              <p className="text-[10px] font-bold text-teal-800">
                Replying to{" "}
                {replyTo?.sender?.name ||
                  "CampusX user"}
              </p>

              <p className="truncate text-xs text-stone-500">
                {replyTo.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setReplyTo(null)
              }
              aria-label="Cancel reply"
              className="rounded-full p-1.5 transition hover:bg-stone-100"
            >
              <X
                size={17}
                className="text-stone-400"
              />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* MESSAGE COMPOSER                                                  */}
        {/* ================================================================= */}

        <form
          onSubmit={sendMessage}
          className="flex shrink-0 items-end gap-2 border-t border-stone-200 bg-white p-3 sm:p-4"
        >
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={5000}
            placeholder="Type a message..."
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-stone-200 bg-[#faf9f6] px-4 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-teal-700/40 focus:ring-4 focus:ring-teal-700/10"
          />

          <button
            type="submit"
            disabled={
              !input.trim() ||
              sending
            }
            aria-label="Send message"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#10231f] text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>

      {/* =================================================================== */}
      {/* MESSAGE INFO MODAL                                                  */}
      {/* =================================================================== */}

      {infoMessageId && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={() =>
            setInfoMessageId(null)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-info-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="max-h-[82vh] w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >

            {/* ------------------------------------------------------------- */}
            {/* MODAL HEADER                                                   */}
            {/* ------------------------------------------------------------- */}

            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <div>
                <h2
                  id="message-info-title"
                  className="text-sm font-bold text-[#10231f]"
                >
                  Message info
                </h2>

                <p className="mt-0.5 text-[11px] text-stone-400">
                  Delivery and read status
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setInfoMessageId(
                    null
                  )
                }
                aria-label="Close"
                className="rounded-full p-1.5 transition hover:bg-stone-100"
              >
                <X
                  size={18}
                  className="text-stone-500"
                />
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* LOADING                                                        */}
            {/* ------------------------------------------------------------- */}

            {infoLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoaderCircle
                  size={24}
                  className="animate-spin text-teal-800"
                />
              </div>
            ) : info ? (
              <div className="max-h-[calc(82vh-76px)] overflow-y-auto p-5">

                {/*
                 * One recipient appears exactly once.
                 * Their complete Sent → Delivered → Read
                 * timeline is shown in the same row.
                 */}

                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-stone-50 px-2.5 py-2 text-center">
                    <p className="text-[10px] text-stone-400">
                      Read by
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-teal-700">
                      {info?.counts?.read ??
                        info?.readBy?.length ??
                        0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-stone-50 px-2.5 py-2 text-center">
                    <p className="text-[10px] text-stone-400">
                      Delivered
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-stone-700">
                      {info?.counts?.delivered ??
                        info?.deliveredTo?.length ??
                        0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-stone-50 px-2.5 py-2 text-center">
                    <p className="text-[10px] text-stone-400">
                      Sent to
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-stone-700">
                      {info?.counts?.sent ??
                        info?.recipients?.length ??
                        info?.sentTo?.length ??
                        0}
                    </p>
                  </div>
                </div>

                <InfoSection
                  title="Recipients"
                  count={
                    info?.counts?.sent ??
                    info?.recipients?.length ??
                    info?.sentTo?.length ??
                    0
                  }
                  last
                >
                  <RecipientTimeline
                    recipients={
                      info?.recipients ||
                      []
                    }
                  />
                </InfoSection>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center px-6 text-center">
                <p className="text-xs text-stone-400">
                  Message information is
                  unavailable.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default CommunityChat;