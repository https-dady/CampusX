import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  ChevronRight,
  MessageCircle,
  Search,
  UsersRound,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const pageEase = [0.22, 1, 0.36, 1];

const communities = [
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    short: "AI",
    description:
      "Discuss ML concepts, projects, research, model building and career paths.",
    members: "428",
    active: "32 active",
    topics: ["Machine Learning", "Deep Learning", "Projects"],
    tone: "teal",
  },
  {
    id: "web-dev",
    name: "Web Development",
    short: "WD",
    description:
      "Build better web projects, share frontend ideas and solve development roadblocks.",
    members: "612",
    active: "47 active",
    topics: ["React", "JavaScript", "Backend"],
    tone: "orange",
  },
  {
    id: "data",
    name: "Data Science",
    short: "DS",
    description:
      "Explore analytics, statistics, visualization and practical data projects.",
    members: "356",
    active: "24 active",
    topics: ["Python", "SQL", "Analytics"],
    tone: "green",
  },
  {
    id: "cyber",
    name: "Cyber Security",
    short: "CS",
    description:
      "Learn security fundamentals, ethical practices, tools and career preparation.",
    members: "284",
    active: "18 active",
    topics: ["Security", "Networking", "CTF"],
    tone: "teal",
  },
  {
    id: "cloud",
    name: "Cloud & DevOps",
    short: "CD",
    description:
      "Talk about cloud platforms, deployment, CI/CD and infrastructure.",
    members: "241",
    active: "16 active",
    topics: ["AWS", "Docker", "DevOps"],
    tone: "orange",
  },
  {
    id: "product",
    name: "Product & Management",
    short: "PM",
    description:
      "Exchange ideas around product thinking, UX, management and startup building.",
    members: "198",
    active: "12 active",
    topics: ["Product", "UX", "Startups"],
    tone: "green",
  },
];

const conversations = [
  {
    id: 1,
    community: "AI & Machine Learning",
    initials: "RK",
    name: "Rahul K.",
    message: "Has anyone tried building a RAG project with local models?",
    time: "8m",
    replies: 12,
  },
  {
    id: 2,
    community: "Web Development",
    initials: "AS",
    name: "Ananya S.",
    message: "Sharing my React project structure. Would love some feedback.",
    time: "24m",
    replies: 8,
  },
  {
    id: 3,
    community: "Data Science",
    initials: "MV",
    name: "Mohit V.",
    message: "What should I focus on first for a data analyst role?",
    time: "41m",
    replies: 15,
  },
];

const toneStyles = {
  teal: "bg-[#d9eee8] text-teal-950",
  orange: "bg-[#fff0e7] text-orange-700",
  green: "bg-emerald-100 text-emerald-900",
};

/* ========================================================================== */
/* CURSOR SURFACE — SAME PATTERN AS EXISTING WORKSPACE CARDS                 */
/* ========================================================================== */

const CursorCard = ({
  children,
  className = "",
  intensity = 2.2,
  delay = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const handleSurfaceMove = (event) => {
    if (prefersReducedMotion || event.pointerType !== "mouse") return;

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
    if (prefersReducedMotion) return;

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

      <div className="relative z-10">{children}</div>
    </motion.article>
  );
};

const Community = () => {
  const [activeCommunity, setActiveCommunity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const prefersReducedMotion = useReducedMotion();

  const reveal = {
    hidden: prefersReducedMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const filteredCommunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return communities;

    return communities.filter(
      (community) =>
        community.name.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query) ||
        community.topics.some((topic) =>
          topic.toLowerCase().includes(query)
        )
    );
  }, [searchQuery]);

  const filteredConversations = useMemo(() => {
    if (activeCommunity === "all") return conversations;

    const selected = communities.find(
      (community) => community.id === activeCommunity
    );

    if (!selected) return conversations;

    return conversations.filter(
      (conversation) => conversation.community === selected.name
    );
  }, [activeCommunity]);

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
              Join communities around the fields you care about, ask
              questions, share what you are building, and learn from other
              students moving in the same direction.
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
            <span>2,119 students across communities</span>
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
          duration: prefersReducedMotion ? 0 : 0.5,
          delay: prefersReducedMotion ? 0 : 0.08,
          ease: pageEase,
        }}
        className="mt-8"
        aria-label="Find a community"
      >
        <label htmlFor="community-search" className="sr-only">
          Search communities
        </label>

        <div className="relative max-w-xl">
          <Search
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            id="community-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search communities, skills or topics..."
            className="
              h-12 w-full rounded-lg
              border border-stone-200
              bg-white
              pl-11 pr-4
              text-sm text-stone-800
              shadow-[0_5px_20px_rgba(28,25,23,0.035)]
              outline-none
              transition-all duration-200
              placeholder:text-stone-400
              hover:border-stone-300
              focus:border-teal-800/40
              focus:ring-4 focus:ring-teal-800/10
            "
          />
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* COMMUNITIES                                                        */}
      {/* ================================================================== */}

      <section
        className="mt-10"
        aria-labelledby="communities-heading"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.55,
            delay: prefersReducedMotion ? 0 : 0.14,
            ease: pageEase,
          }}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
              Explore
            </p>

            <h2
              id="communities-heading"
              className="mt-1 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] text-[#10231f]"
            >
              Communities for your direction.
            </h2>
          </div>

          <span className="hidden text-xs text-stone-400 sm:block">
            {filteredCommunities.length} communities
          </span>
        </motion.div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCommunities.map((community, index) => (
            <CursorCard
              key={community.id}
              intensity={2.3}
              delay={0.2 + index * 0.08}
              className="
                rounded-lg
                border border-stone-200
                bg-white
                p-6
                shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              "
            >
              <div className="flex items-start justify-between gap-4">
                <motion.div
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          rotate: 5,
                          scale: 1.06,
                        }
                  }
                  className={[
                    "flex size-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    toneStyles[community.tone],
                  ].join(" ")}
                >
                  {community.short}
                </motion.div>

                <motion.span
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : {
                          y: [0, -3, 0],
                        }
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-stone-400"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {community.active}
                </motion.span>
              </div>

              <h3 className="mt-5 font-['Newsreader'] text-2xl font-semibold tracking-[-0.02em] text-[#10231f]">
                {community.name}
              </h3>

              <p className="mt-2 min-h-[48px] text-[13px] leading-5 text-stone-500">
                {community.description}
              </p>

              <motion.div
                layout
                className="mt-4 flex flex-wrap gap-1.5"
              >
                {community.topics.map((topic, topicIndex) => (
                  <motion.span
                    key={topic}
                    initial={
                      prefersReducedMotion
                        ? false
                        : {
                            opacity: 0,
                            scale: 0.88,
                            y: 5,
                          }
                    }
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.35,
                      delay: prefersReducedMotion
                        ? 0
                        : 0.42 +
                          index * 0.08 +
                          topicIndex * 0.05,
                    }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            y: -2,
                            scale: 1.02,
                          }
                    }
                    className="
                      inline-flex items-center
                      rounded-full
                      border border-teal-900/10
                      bg-[#edf5f1]
                      px-3 py-1.5
                      text-[10px] font-medium
                      text-teal-950
                    "
                  >
                    {topic}
                  </motion.span>
                ))}
              </motion.div>

              <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                <span className="text-[11px] text-stone-400">
                  {community.members} members
                </span>

                <motion.button
                  type="button"
                  onClick={() =>
                    setActiveCommunity(community.id)
                  }
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
                    inline-flex min-h-9
                    items-center gap-1.5
                    rounded-md
                    px-2.5
                    text-xs font-semibold
                    text-teal-950
                    transition-colors duration-200
                    hover:bg-teal-50
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-teal-800
                  "
                >
                  Open community
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                  />
                </motion.button>
              </div>
            </CursorCard>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 10,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.4,
            }}
            className="mt-5 rounded-lg border border-dashed border-stone-300 bg-white px-6 py-12 text-center"
          >
            <Search
              size={22}
              className="mx-auto text-stone-400"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-semibold text-stone-700">
              No communities found.
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Try another skill, field or topic.
            </p>
          </motion.div>
        )}
      </section>

      {/* ================================================================== */}
      {/* COMMUNITY PULSE                                                    */}
      {/* ================================================================== */}

      <section
        className="mt-12"
        aria-labelledby="conversations-heading"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.55,
            delay: prefersReducedMotion ? 0 : 0.18,
            ease: pageEase,
          }}
          className="
            flex flex-col gap-4
            border-b border-stone-200
            pb-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
              Community pulse
            </p>

            <h2
              id="conversations-heading"
              className="mt-1 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] text-[#10231f]"
            >
              What students are talking about.
            </h2>
          </div>

          <div
            className="flex gap-1 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Filter conversations"
          >
            <motion.button
              type="button"
              role="tab"
              aria-selected={activeCommunity === "all"}
              onClick={() => setActiveCommunity("all")}
              whileTap={
                prefersReducedMotion
                  ? undefined
                  : { scale: 0.97 }
              }
              className={[
                "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                activeCommunity === "all"
                  ? "bg-teal-950 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200",
              ].join(" ")}
            >
              All
            </motion.button>

            {communities.slice(0, 3).map((community) => (
              <motion.button
                key={community.id}
                type="button"
                role="tab"
                aria-selected={
                  activeCommunity === community.id
                }
                onClick={() =>
                  setActiveCommunity(community.id)
                }
                whileTap={
                  prefersReducedMotion
                    ? undefined
                    : { scale: 0.97 }
                }
                className={[
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                  activeCommunity === community.id
                    ? "bg-teal-950 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200",
                ].join(" ")}
              >
                {community.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-3">
            {filteredConversations.map(
              (conversation, index) => (
                <CursorCard
                  key={conversation.id}
                  intensity={2.2}
                  delay={0.28 + index * 0.08}
                  className="
                    rounded-lg
                    border border-stone-200
                    bg-white
                    p-5
                    shadow-[0_5px_20px_rgba(28,25,23,0.025)]
                  "
                >
                  <div className="flex gap-3">
                    <motion.div
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : {
                              scale: 1.05,
                            }
                      }
                      className="
                        flex size-9 shrink-0
                        items-center justify-center
                        rounded-full
                        bg-[#d9eee8]
                        text-[10px]
                        font-bold
                        text-teal-950
                      "
                    >
                      {conversation.initials}
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-xs font-semibold text-stone-800">
                          {conversation.name}
                        </p>

                        <span className="text-[10px] text-stone-400">
                          in {conversation.community}
                        </span>

                        <span className="ml-auto text-[10px] text-stone-400">
                          {conversation.time}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-5 text-stone-600">
                        {conversation.message}
                      </p>

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
                          mt-3 inline-flex
                          min-h-8
                          items-center gap-1.5
                          rounded-md px-2
                          text-[11px]
                          font-semibold
                          text-teal-900
                          transition-colors duration-200
                          hover:bg-teal-50
                          focus-visible:outline-2
                          focus-visible:outline-offset-2
                          focus-visible:outline-teal-800
                        "
                      >
                        <MessageCircle
                          size={13}
                          aria-hidden="true"
                        />
                        {conversation.replies} replies
                      </motion.button>
                    </div>
                  </div>
                </CursorCard>
              )
            )}
          </div>

          {/* DARK COMMUNITY CTA */}

          <CursorCard
            intensity={2.4}
            delay={0.34}
            cursorColor="rgba(255,255,255,0.06)"
            className="
              rounded-lg
              border border-teal-950
              bg-teal-950
              p-6
              text-white
              shadow-[0_12px_32px_rgba(6,78,59,0.10)]
            "
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.9,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.45,
                delay: prefersReducedMotion ? 0 : 0.5,
                ease: pageEase,
              }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: -4,
                      scale: 1.05,
                    }
              }
              className="
                flex size-10
                items-center justify-center
                rounded-md
                bg-orange-300
                text-teal-950
              "
            >
              <MessageCircle
                size={18}
                aria-hidden="true"
              />
            </motion.div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-200">
              Your next conversation
            </p>

            <h2 className="mt-2 font-['Newsreader'] text-3xl font-semibold leading-tight tracking-[-0.025em]">
              Ask something you are stuck on.
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              The fastest way to find your direction is often
              to talk to someone who has already worked through
              the same question.
            </p>

            <motion.button
              type="button"
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: -2,
                      boxShadow:
                        "0 10px 24px rgba(0,0,0,0.16)",
                    }
              }
              whileTap={
                prefersReducedMotion
                  ? undefined
                  : { scale: 0.98 }
              }
              className="
                mt-6 inline-flex
                min-h-10
                items-center gap-2
                rounded-md
                bg-white
                px-4
                text-xs font-bold
                text-teal-950
                shadow-[0_5px_16px_rgba(0,0,0,0.12)]
                transition-shadow duration-200
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-orange-300
              "
            >
              Start a conversation
              <ArrowRight
                size={14}
                aria-hidden="true"
              />
            </motion.button>
          </CursorCard>
        </div>
      </section>

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
                mt-0.5 flex size-8
                shrink-0 items-center
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
                Share what you know, ask clear questions, respect
                different learning paths, and keep conversations
                focused on helping students move forward.
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
              inline-flex shrink-0
              items-center gap-1.5
              text-xs font-semibold
              text-teal-950
              transition-[gap] duration-200
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