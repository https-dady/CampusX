import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  ChevronRight,
  LoaderCircle,
  Search,
  UsersRound,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  getCommunities,
  joinCommunity,
} from "../../services/community.service.js";

const pageEase = [0.22, 1, 0.36, 1];

/* ========================================================================== */
/* TONE STYLES                                                               */
/* ========================================================================== */

const toneStyles = {
  teal: "bg-[#d9eee8] text-teal-950",
  orange: "bg-[#fff0e7] text-orange-700",
  green: "bg-emerald-100 text-emerald-900",
};

/* ========================================================================== */
/* CURSOR SURFACE                                                             */
/* ========================================================================== */

const CursorCard = ({
  children,
  className = "",
  intensity = 2.2,
  delay = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const handleSurfaceMove = (event) => {
    if (prefersReducedMotion || event.pointerType !== "mouse") {
      return;
    }

    const surface = event.currentTarget;
    const rect = surface.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    surface.style.transform = `
      perspective(1100px)
      translate3d(
        ${percentX * 4}px,
        ${percentY * 4 - 2}px,
        0
      )
      rotateX(${-percentY * intensity}deg)
      rotateY(${percentX * intensity}deg)
    `;

    surface.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    surface.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
    );

    surface.style.setProperty("--cursor-opacity", "1");
  };

  const resetSurface = (event) => {
    if (prefersReducedMotion) {
      return;
    }

    const surface = event.currentTarget;

    surface.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    surface.style.setProperty("--cursor-opacity", "0");
  };

  return (
    <motion.article
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 18 }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : delay,
        ease: pageEase,
      }}
      onPointerMove={handleSurfaceMove}
      onPointerLeave={resetSurface}
      style={{
        "--cursor-x": "50%",
        "--cursor-y": "50%",
        "--cursor-opacity": "0",
      }}
      className={[
        "relative overflow-hidden",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "will-change-transform",
        "hover:border-stone-300",
        "hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]",
        className,
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
        style={{
          opacity: "var(--cursor-opacity)",
          background:
            "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(15,118,110,0.07), transparent 72%)",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

const normalizeCommunity = (community) => {
  const id =
    community?.id ??
    community?._id ??
    community?.communityId;

  const name =
    community?.name ??
    community?.title ??
    "Community";

  const description =
    community?.description ??
    "Connect with students, ask questions, share projects and learn together.";

  const memberCount =
    community?.memberCount ??
    community?.membersCount ??
    community?.members ??
    0;

  const isMember = Boolean(
    community?.isMember ??
    community?.joined ??
    community?.isJoined
  );

  const topics = Array.isArray(community?.topics)
    ? community.topics
    : Array.isArray(community?.tags)
      ? community.tags
      : [];

  return {
    ...community,
    id,
    name,
    description,
    memberCount,
    isMember,
    topics,
    short:
      community?.short ||
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
    tone: community?.tone || "teal",
  };
};

/* ========================================================================== */
/* COMMUNITY PAGE                                                             */
/* ========================================================================== */

const Community = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [communities, setCommunities] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------------------- */
  /* PAGE ANIMATION                                                         */
  /* ---------------------------------------------------------------------- */

  const reveal = {
    hidden: prefersReducedMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 18 },

    visible: {
      opacity: 1,
      y: 0,
    },
  };

  /* ---------------------------------------------------------------------- */
  /* FETCH ALL COMMUNITIES                                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadCommunities = async () => {
      setLoading(true);
      setError("");

      try {
        /*
         * This calls:
         *
         * GET /communities
         *
         * Backend should return all communities available
         * for the authenticated CampusX user.
         */
        const response = await getCommunities();

        if (!mounted) {
          return;
        }

        /*
         * Supported backend response shapes:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * OR
         *
         * {
         *   communities: [...]
         * }
         *
         * OR
         *
         * {
         *   data: [...]
         * }
         */

        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.communities)
            ? response.communities
            : Array.isArray(response?.data?.communities)
              ? response.data.communities
              : Array.isArray(response?.data)
                ? response.data
                : [];


        /*
        * IMPORTANT:
        * Do NOT hardcode communities here.
        *
        * Every community returned by the backend is kept.
        */
        setCommunities(list.map(normalizeCommunity));

      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
          "Unable to load communities. Please try again."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCommunities();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* FILTER COMMUNITIES                                                     */
  /* ---------------------------------------------------------------------- */

  const filteredCommunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = communities;

    if (activeCommunity !== "all") {
      result = result.filter(
        (community) => community.id === activeCommunity
      );
    }

    if (!query) {
      return result;
    }

    return result.filter((community) => {
      const nameMatch = community.name
        .toLowerCase()
        .includes(query);

      const descriptionMatch = community.description
        .toLowerCase()
        .includes(query);

      const topicMatch = community.topics.some((topic) =>
        String(topic).toLowerCase().includes(query)
      );

      return (
        nameMatch ||
        descriptionMatch ||
        topicMatch
      );
    });
  }, [
    communities,
    activeCommunity,
    searchQuery,
  ]);

  /* ---------------------------------------------------------------------- */
  /* OPEN COMMUNITY                                                         */
  /* ---------------------------------------------------------------------- */

  const openCommunity = async (community) => {
    if (!community?.id) {
      return;
    }

    setError("");
    setBusyId(community.id);

    try {
      /*
       * Existing member:
       * directly open the community.
       *
       * New member:
       * join first, then open the community.
       */
      if (!community.isMember) {
        await joinCommunity(community.id);

        /*
         * Update local state immediately so the card
         * changes from "Join Community" to "Open Community".
         */
        setCommunities((previous) =>
          previous.map((item) =>
            item.id === community.id
              ? {
                ...item,
                isMember: true,
                memberCount:
                  Number(item.memberCount) + 1,
              }
              : item
          )
        );
      }

      /*
       * Dedicated chat page.
       *
       * Community list remains at:
       * /community
       *
       * Chat opens at:
       * /community/:communityId
       */
      navigate(
        `/community/${encodeURIComponent(
          community.id
        )}`
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
        "Unable to join this community. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* RETRY                                                                   */
  /* ---------------------------------------------------------------------- */

  const retryCommunities = () => {
    window.location.reload();
  };

  /* ---------------------------------------------------------------------- */
  /* TOTAL MEMBERS                                                           */
  /* ---------------------------------------------------------------------- */

  const totalMembers = useMemo(() => {
    return communities.reduce((total, community) => {
      const value = Number(community.memberCount);

      return (
        total +
        (Number.isFinite(value) ? value : 0)
      );
    }, 0);
  }, [communities]);

  /* ====================================================================== */
  /* RENDER                                                                 */
  /* ====================================================================== */

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

      {/* ================================================================== */}
      {/* PAGE INTRO                                                         */}
      {/* ================================================================== */}

      <motion.section
        initial="hidden"
        animate="visible"
        variants={reveal}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.65,
          ease: pageEase,
        }}
        aria-labelledby="community-title"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Campus community
            </p>

            <h1
              id="community-title"
              className="mt-2 max-w-3xl font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl"
            >
              Find people who are figuring it out too.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
              Join communities around the fields you care about,
              ask questions, share what you are building, and learn
              from other students moving in the same direction.
            </p>
          </div>

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: 12 }
            }
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              delay: prefersReducedMotion ? 0 : 0.12,
              ease: pageEase,
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                  y: -2,
                  boxShadow:
                    "0 8px 22px rgba(28,25,23,0.07)",
                }
            }
            className="flex shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 shadow-[0_4px_16px_rgba(28,25,23,0.04)]"
          >
            <UsersRound
              size={15}
              className="text-teal-800"
              aria-hidden="true"
            />

            <span>
              {totalMembers.toLocaleString()} students across
              communities
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* SEARCH                                                             */}
      {/* ================================================================== */}

      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 14 }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.55,
          delay: prefersReducedMotion ? 0 : 0.08,
          ease: pageEase,
        }}
        className="mt-7"
      >
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search communities, topics or skills..."
            aria-label="Search communities"
            className="
              h-12
              w-full
              rounded-xl
              border border-stone-200
              bg-white
              pl-11 pr-4
              text-sm
              text-stone-800
              shadow-[0_4px_16px_rgba(28,25,23,0.035)]
              outline-none
              transition
              placeholder:text-stone-400
              focus:border-teal-700
              focus:ring-2
              focus:ring-teal-700/10
            "
          />
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* FILTER                                                             */}
      {/* ================================================================== */}

      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 12 }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          delay: prefersReducedMotion ? 0 : 0.14,
          ease: pageEase,
        }}
        className="mt-5"
      >
        <div className="flex flex-wrap gap-2">

          {/* ALL COMMUNITIES */}

          <button
            type="button"
            onClick={() => setActiveCommunity("all")}
            className={[
              "rounded-full px-3.5 py-2 text-xs font-semibold transition",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
              activeCommunity === "all"
                ? "bg-[#10231f] text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900",
            ].join(" ")}
          >
            All communities
          </button>

          {/* EVERY COMMUNITY FROM DATABASE */}

          {communities.map((community) => (
            <button
              key={community.id}
              type="button"
              onClick={() =>
                setActiveCommunity(community.id)
              }
              className={[
                "rounded-full px-3.5 py-2 text-xs font-semibold transition",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                activeCommunity === community.id
                  ? "bg-[#10231f] text-white"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900",
              ].join(" ")}
            >
              {community.name}
            </button>
          ))}
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* ERROR                                                              */}
      {/* ================================================================== */}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            mt-6
            flex flex-col gap-3
            rounded-xl
            border border-red-200
            bg-red-50
            px-4 py-4
            text-sm text-red-800
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
          role="alert"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={retryCommunities}
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-red-700
              px-3
              py-2
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-red-800
            "
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* ================================================================== */}
      {/* LOADING                                                            */}
      {/* ================================================================== */}

      {loading && (
        <div
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Loading communities"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="
                h-[270px]
                animate-pulse
                rounded-2xl
                border border-stone-200
                bg-white
              "
            />
          ))}
        </div>
      )}

      {/* ================================================================== */}
      {/* EMPTY                                                              */}
      {/* ================================================================== */}

      {!loading &&
        !error &&
        filteredCommunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              mt-8
              rounded-2xl
              border border-dashed
              border-stone-300
              bg-white
              px-6 py-14
              text-center
            "
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#d9eee8] text-teal-900">
              <UsersRound size={20} />
            </div>

            <h2 className="mt-4 text-base font-semibold text-stone-800">
              No communities found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Try a different community name, topic or skill.
            </p>
          </motion.div>
        )}

      {/* ================================================================== */}
      {/* COMMUNITY CARDS                                                    */}
      {/* ================================================================== */}

      {!loading &&
        filteredCommunities.length > 0 && (
          <section
            aria-label="Communities"
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredCommunities.map(
              (community, index) => (
                <CursorCard
                  key={community.id}
                  delay={
                    prefersReducedMotion
                      ? 0
                      : 0.05 + index * 0.045
                  }
                  className="
                    rounded-2xl
                    border border-stone-200
                    bg-white
                    p-5
                    shadow-[0_4px_18px_rgba(28,25,23,0.035)]
                  "
                >
                  {/* ------------------------------------------------------ */}
                  {/* CARD HEADER                                             */}
                  {/* ------------------------------------------------------ */}

                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={[
                        "flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                        toneStyles[
                        community.tone
                        ] || toneStyles.teal,
                      ].join(" ")}
                    >
                      {community.short}
                    </div>

                    {community.isMember && (
                      <span
                        className="
                          rounded-full
                          bg-emerald-50
                          px-2.5 py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.08em]
                          text-emerald-700
                        "
                      >
                        Joined
                      </span>
                    )}
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* CARD CONTENT                                            */}
                  {/* ------------------------------------------------------ */}

                  <div className="mt-5">
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#10231f]">
                      {community.name}
                    </h2>

                    <p className="mt-2 min-h-[66px] text-sm leading-5 text-stone-500">
                      {community.description}
                    </p>
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* TOPICS                                                   */}
                  {/* ------------------------------------------------------ */}

                  {community.topics.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {community.topics
                        .slice(0, 3)
                        .map((topic) => (
                          <span
                            key={topic}
                            className="
                              rounded-full
                              bg-stone-100
                              px-2.5 py-1
                              text-[10px]
                              font-medium
                              text-stone-600
                            "
                          >
                            {topic}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* ------------------------------------------------------ */}
                  {/* CARD FOOTER                                             */}
                  {/* ------------------------------------------------------ */}

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">

                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <UsersRound
                        size={14}
                        aria-hidden="true"
                      />

                      <span>
                        {Number(
                          community.memberCount
                        ).toLocaleString()}{" "}
                        members
                      </span>
                    </div>

                    <motion.button
                      type="button"
                      onClick={() =>
                        openCommunity(community)
                      }
                      disabled={
                        busyId === community.id
                      }
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { x: 2 }
                      }
                      whileTap={
                        prefersReducedMotion
                          ? undefined
                          : { scale: 0.98 }
                      }
                      className="
                        group
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-[#10231f]
                        px-3.5 py-2
                        text-[11px]
                        font-bold
                        text-white
                        shadow-[0_5px_16px_rgba(0,0,0,0.12)]
                        transition
                        hover:bg-teal-900
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-orange-300
                      "
                    >
                      {busyId === community.id ? (
                        <>
                          <LoaderCircle
                            size={13}
                            className="animate-spin"
                            aria-hidden="true"
                          />

                          <span>
                            Opening...
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            {community.isMember
                              ? "Open Community"
                              : "Join Community"}
                          </span>

                          <ArrowRight
                            size={13}
                            className="transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </motion.button>
                  </div>
                </CursorCard>
              )
            )}
          </section>
        )}

      {/* ================================================================== */}
      {/* COMMUNITY NOTE                                                     */}
      {/* ================================================================== */}

      <motion.section
        initial="hidden"
        animate="visible"
        variants={reveal}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          delay: prefersReducedMotion ? 0 : 0.4,
          ease: pageEase,
        }}
        className="
          mt-10
          rounded-lg
          border border-stone-200
          bg-[#f2ede4]
          px-5 py-5
          sm:px-6
        "
        aria-label="Community guidelines"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex gap-3">

            <motion.div
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                    rotate: -4,
                    scale: 1.05,
                  }
              }
              className="
                mt-0.5
                flex size-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                text-teal-900
              "
            >
              <Bell
                size={15}
                aria-hidden="true"
              />
            </motion.div>

            <div>
              <p className="text-xs font-semibold text-stone-800">
                Keep the community useful.
              </p>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-500">
                Share what you know, ask clear questions,
                respect different learning paths, and keep
                conversations focused on helping students move
                forward.
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={
              prefersReducedMotion
                ? undefined
                : { x: 3 }
            }
            whileTap={
              prefersReducedMotion
                ? undefined
                : { scale: 0.98 }
            }
            className="
              inline-flex
              shrink-0
              items-center
              gap-1.5
              text-xs
              font-semibold
              text-teal-950
              transition-[gap]
              duration-200
              hover:gap-2
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-teal-800
            "
          >
            Community guidelines

            <ChevronRight
              size={14}
              aria-hidden="true"
            />
          </motion.button>

        </div>
      </motion.section>
    </div>
  );
};

export default Community;