import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileSearch,
  Map,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useOnboardingState } from "../../components/auth/OnboardingStateContext.jsx";
import { getMySkillGap } from "../../services/career.service";
import { getMyProfile } from "../../services/profile.service";
import {
  getMyCareerGoal,
  getMyPersonalizedLearningRoadmap,
  getMyPersonalizedRoadmap,
} from "../../services/learning.service";

const getJourneyDestination = (journeyType) => {
  switch (journeyType) {
    case "learn":
      return "/learning-roadmap";
    case "dream_job":
      return "/learning-roadmap";
    case "profile_jobs":
      return "/jobs/profile";
    default:
      return "/career-insights";
  }
};

const getJourneyLabel = (journeyType) => {
  switch (journeyType) {
    case "learn":
      return "Learning journey";
    case "dream_job":
      return "Dream job journey";
    case "profile_jobs":
      return "Profile jobs";
    default:
      return "Career workspace";
  }
};

const normalizeSteps = (steps = []) => {
  if (!Array.isArray(steps)) {
    return [];
  }

  return [...steps]
    .filter(Boolean)
    .sort(
      (first, second) =>
        Number(first?.order ?? 0) -
        Number(second?.order ?? 0)
    );
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to load your overview right now.";

const Overview = () => {
  const prefersReducedMotion = useReducedMotion();
  const quoteRef = useRef(null);

  const { onboardingState } = useOnboardingState();

  const [profile, setProfile] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [careerGoal, setCareerGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const journeyType =
    onboardingState?.onboarding?.journeyType || null;

  const loadOverview = async () => {
    setIsLoading(true);
    setError("");
    setWarning("");

    try {
      const [profileResult, skillGapResult] =
        await Promise.allSettled([
          getMyProfile(),
          getMySkillGap(),
        ]);

      if (profileResult.status === "rejected") {
        throw profileResult.reason;
      }

      setProfile(
        profileResult.value?.data?.profile || null
      );

      if (skillGapResult.status === "fulfilled") {
        setSkillGap(
          skillGapResult.value?.data?.skillGap || null
        );
      } else {
        setSkillGap(null);

        setWarning(
          skillGapResult.reason?.response?.status === 404
            ? "Skill-gap data is not available for the current target yet."
            : skillGapResult.reason?.response?.data?.message ||
                "Skill-gap data could not be refreshed right now."
        );
      }

      if (journeyType === "learn") {
        try {
          const roadmapResult =
            await getMyPersonalizedLearningRoadmap();

          setRoadmap(
            roadmapResult?.data?.roadmap || null
          );

          setCareerGoal(null);
        } catch (roadmapError) {
          setRoadmap(null);
          setCareerGoal(null);

          setWarning((currentWarning) =>
            currentWarning ||
            getErrorMessage(roadmapError)
          );
        }
      } else if (journeyType === "dream_job") {
        const [roadmapResult, goalResult] =
          await Promise.allSettled([
            getMyPersonalizedRoadmap(),
            getMyCareerGoal(),
          ]);

        if (roadmapResult.status === "fulfilled") {
          setRoadmap(
            roadmapResult.value?.data?.roadmap || null
          );
        } else {
          setRoadmap(null);

          setWarning((currentWarning) =>
            currentWarning ||
            getErrorMessage(roadmapResult.reason)
          );
        }

        if (goalResult.status === "fulfilled") {
          setCareerGoal(
            goalResult.value?.data?.careerGoal || null
          );
        } else {
          setCareerGoal(null);

          setWarning((currentWarning) =>
            currentWarning ||
            getErrorMessage(goalResult.reason)
          );
        }
      } else {
        setRoadmap(null);
        setCareerGoal(null);
      }
    } catch (requestError) {
      console.error(
        "Failed to load CampusX overview:",
        requestError
      );

      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [journeyType]);

  const profileData =
    profile?.profile || {};

  const technicalSkills =
    Array.isArray(
      profileData.technicalSkills
    )
      ? profileData.technicalSkills.filter(Boolean)
      : [];

  const profileCompletion =
    onboardingState?.onboarding?.profileCompletion ||
    {};

  const profileReadiness =
    useMemo(() => {
      const requiredFields = 5;

      const missingFields =
        Array.isArray(
          profileCompletion.missingFields
        )
          ? profileCompletion.missingFields.length
          : 0;

      return Math.round(
        (
          (
            requiredFields -
            Math.min(
              missingFields,
              requiredFields
            )
          ) /
          requiredFields
        ) *
        100
      );
    }, [
      profileCompletion.missingFields,
    ]);

  const roadmapSteps =
    useMemo(
      () =>
        normalizeSteps(
          roadmap?.steps
        ),
      [roadmap]
    );

  const firstRoadmapStep =
    roadmapSteps[0] || null;

  const matchPercentage =
    typeof roadmap?.matchPercentage ===
    "number"
      ? roadmap.matchPercentage
      : typeof skillGap?.matchPercentage ===
          "number"
        ? skillGap.matchPercentage
        : null;

  const missingSkills =
    Array.isArray(
      roadmap?.missingSkills
    )
      ? roadmap.missingSkills
      : Array.isArray(
          skillGap?.missingSkills
        )
        ? skillGap.missingSkills
        : [];

  const userName =
    profile?.name ||
    onboardingState?.name ||
    "there";

  const goalLabel =
    journeyType === "learn"
      ? roadmap?.domain ||
        "Your learning target"
      : journeyType === "dream_job"
        ? careerGoal?.targetCareer ||
          roadmap?.career ||
          "Your target career"
        : journeyType === "profile_jobs"
          ? "Jobs matched to your skills"
          : "Your next career step";

  const planLabel =
    journeyType === "learn"
      ? roadmap?.domain
        ? `Learning path · ${roadmap.domain}`
        : "Learning path"
      : journeyType === "dream_job"
        ? roadmap?.career
          ? `Career path · ${roadmap.career}`
          : "Career roadmap"
        : "Profile-based opportunities";

  const nextStepLabel =
    firstRoadmapStep?.title ||
    (
      journeyType === "profile_jobs"
        ? "Explore jobs matching your current skills"
        : "Choose the next step in your journey"
    );

  const nextStepDescription =
    firstRoadmapStep?.description ||
    (
      journeyType === "profile_jobs"
        ? "Use the skills already present in your profile to discover external job opportunities."
        : "CampusX will use your current profile and selected journey to guide the next action."
    );

  const nextStepHref =
    journeyType === "profile_jobs"
      ? "/jobs/profile"
      : getJourneyDestination(
          journeyType
        );

  const readinessValue =
    matchPercentage !== null
      ? `${Math.round(matchPercentage)}%`
      : "—";

  const readinessNote =
    matchPercentage !== null
      ? `${missingSkills.length} skill${missingSkills.length === 1 ? "" : "s"} still to build`
      : "Choose a target to measure your skill match";

  const stats = [
    {
      label: "Career readiness",
      value: readinessValue,
      note: readinessNote,
      dark: true,
      icon: Target,
    },
    {
      label: "Profile readiness",
      value: `${profileReadiness}%`,
      note:
        profileReadiness === 100
          ? "Required profile fields complete"
          : "Complete the remaining profile fields",
      icon: FileSearch,
    },
    {
      label: "Current plan",
      value:
        roadmapSteps.length
          ? `${roadmapSteps.length}`
          : "—",
      note:
        roadmapSteps.length
          ? `${roadmapSteps.length === 1 ? "step" : "steps"} in your current plan`
          : getJourneyLabel(
              journeyType
            ),
      icon: Map,
    },
    {
      label: "Technical skills",
      value: `${technicalSkills.length}`,
      note:
        technicalSkills.length === 1
          ? "Skill in your profile"
          : "Skills in your profile",
      icon: BarChart3,
    },
  ];

  const handleQuoteMove = (
    event
  ) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !quoteRef.current
    ) {
      return;
    }

    const rect =
      quoteRef.current.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    const rotateY =
      (
        (x - rect.width / 2) /
        (rect.width / 2)
      ) * 1.8;

    const rotateX =
      (
        (rect.height / 2 - y) /
        (rect.height / 2)
      ) * 1.8;

    quoteRef.current.style.transform = `
      perspective(900px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-2px)
    `;
  };

  const resetQuote = () => {
    if (
      !quoteRef.current ||
      prefersReducedMotion
    ) {
      return;
    }

    quoteRef.current.style.transform = `
      perspective(900px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0)
    `;
  };

  const handleSurfaceMove = (
    event,
    intensity = 2.2
  ) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    const surface =
      event.currentTarget;

    const rect =
      surface.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    const percentX =
      x / rect.width - 0.5;

    const percentY =
      y / rect.height - 0.5;

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

    surface.style.setProperty(
      "--cursor-opacity",
      "1"
    );
  };

  const resetSurface = (
    event
  ) => {
    if (prefersReducedMotion) {
      return;
    }

    const surface =
      event.currentTarget;

    surface.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    surface.style.setProperty(
      "--cursor-opacity",
      "0"
    );
  };

  const reveal = {
    hidden:
      prefersReducedMotion
        ? {
            opacity: 1,
            y: 0,
          }
        : {
            opacity: 0,
            y: 18,
          },

    visible: {
      opacity: 1,
      y: 0,
    },
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1216px] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div
          className="text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
            Your career space
          </p>

          <p className="mt-3 text-sm text-stone-500">
            Loading your current profile and journey...
          </p>
        </div>
      </div>
    );
  }

  if (
    error &&
    !profile
  ) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1216px] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-xl rounded-lg border border-red-200 bg-white p-7 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadOverview}
            className="mt-5 min-h-10 rounded-md bg-teal-950 px-4 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={reveal}
        transition={{
          duration:
            prefersReducedMotion
              ? 0
              : 0.65,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        aria-labelledby="workspace-title"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Your career space
        </p>

        <h1
          id="workspace-title"
          className="mt-2 max-w-3xl font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl"
        >
          Good to see you, {userName}.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
          Here is what matters today. You do not need to solve your whole
          future at once.
        </p>

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
            duration:
              prefersReducedMotion
                ? 0
                : 0.5,
            delay:
              prefersReducedMotion
                ? 0
                : 0.18,
          }}
          className="mt-6"
        >
          <Link
            to="/resume-analysis"
            className="group inline-flex min-h-10 items-center gap-2 rounded-md bg-teal-950 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(6,78,59,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-900 hover:shadow-[0_12px_28px_rgba(6,78,59,0.16)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800 active:translate-y-0"
          >
            <FileSearch
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            Analyze my resume

            <ArrowRight
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </motion.section>

      <section
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Career summary"
      >
        {stats.map(
          (
            stat,
            index
          ) => {
            const Icon =
              stat.icon;

            return (
              <motion.article
                key={stat.label}
                initial={
                  prefersReducedMotion
                    ? {
                        opacity: 1,
                        y: 0,
                      }
                    : {
                        opacity: 0,
                        y: 22,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration:
                    prefersReducedMotion
                      ? 0
                      : 0.55,
                  delay:
                    prefersReducedMotion
                      ? 0
                      : 0.25 +
                        index * 0.08,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className={[
                  "group relative min-h-[154px] overflow-hidden rounded-lg border p-5",
                  "transition-[border-color,box-shadow] duration-300",
                  stat.dark
                    ? "border-teal-950 bg-teal-950 text-white shadow-[0_14px_36px_rgba(6,78,59,0.12)]"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-[0_14px_36px_rgba(28,25,23,0.06)]",
                ].join(" ")}
                onPointerMove={(
                  event
                ) =>
                  handleSurfaceMove(
                    event,
                    2.2
                  )
                }
                onPointerLeave={
                  resetSurface
                }
                style={{
                  "--cursor-x":
                    "50%",
                  "--cursor-y":
                    "50%",
                  "--cursor-opacity":
                    "0",
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 opacity-[var(--cursor-opacity)] transition-opacity duration-200"
                  style={{
                    background:
                      "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.38), transparent 72%)",
                  }}
                />

                {!stat.dark && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-12 size-28 rounded-full bg-teal-900/[0.035] blur-2xl transition-transform duration-500 group-hover:scale-125"
                  />
                )}

                <div className="relative flex items-center justify-between gap-3">
                  <span
                    className={
                      stat.dark
                        ? "text-[11px] text-white/60"
                        : "text-[11px] text-stone-500"
                    }
                  >
                    {stat.label}
                  </span>

                  <span
                    className={[
                      "flex size-8 items-center justify-center rounded-md transition-transform duration-300 group-hover:scale-105",
                      stat.dark
                        ? "bg-white/10 text-orange-300"
                        : "bg-[#eef5f1] text-teal-900",
                    ].join(" ")}
                  >
                    <Icon
                      size={16}
                      strokeWidth={
                        1.7
                      }
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <p className="relative mt-7 font-['Newsreader'] text-4xl font-semibold tracking-[-0.025em]">
                  {stat.value}
                </p>

                <p
                  className={[
                    "relative mt-2 text-xs",
                    stat.dark
                      ? "text-white/60"
                      : "text-stone-500",
                  ].join(" ")}
                >
                  {stat.note}
                </p>

                {stat.dark && (
                  <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? {
                              width:
                                "68%",
                            }
                          : {
                              width:
                                "0%",
                            }
                      }
                      animate={{
                        width: "68%",
                      }}
                      transition={{
                        duration:
                          prefersReducedMotion
                            ? 0
                            : 1,
                        delay:
                          prefersReducedMotion
                            ? 0
                            : 0.6,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                      className="h-full rounded-full bg-orange-300"
                    />
                  </div>
                )}
              </motion.article>
            );
          }
        )}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.75fr]">
        <motion.article
          initial={
            prefersReducedMotion
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 22,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration:
              prefersReducedMotion
                ? 0
                : 0.65,
            delay:
              prefersReducedMotion
                ? 0
                : 0.55,
          }}
          className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] transition-[box-shadow,border-color] duration-300 hover:border-stone-300 hover:shadow-[0_14px_34px_rgba(28,25,23,0.05)] sm:p-7 transition-[transform,box-shadow] duration-300 ease-out will-change-transform"
          onPointerMove={(
            event
          ) =>
            handleSurfaceMove(
              event,
              2.2
            )
          }
          onPointerLeave={
            resetSurface
          }
          style={{
            "--cursor-x":
              "50%",
            "--cursor-y":
              "50%",
            "--cursor-opacity":
              "0",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[var(--cursor-opacity)] transition-opacity duration-200"
            style={{
              background:
                "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.38), transparent 72%)",
            }}
          />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                Your next useful step
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#10231f]">
                {nextStepLabel}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                {nextStepDescription}
              </p>
            </div>

            <motion.span
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [
                        0,
                        -2,
                        0,
                      ],
                    }
              }
              transition={{
                duration: 3.5,
                repeat:
                  Infinity,
                ease: "easeInOut",
              }}
              className="rounded-full bg-[#dcefe9] px-3 py-1 text-[11px] font-semibold text-teal-950"
            >
              Personalized
            </motion.span>
          </div>

          <Link
            to={nextStepHref}
            className="group mt-6 inline-flex min-h-10 items-center gap-2 rounded-md bg-teal-950 px-4 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(6,78,59,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-900 hover:shadow-[0_10px_24px_rgba(6,78,59,0.13)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
          >
            Open next step

            <ArrowRight
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </motion.article>

        <motion.aside
          ref={quoteRef}
          initial={
            prefersReducedMotion
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 22,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration:
              prefersReducedMotion
                ? 0
                : 0.7,
            delay:
              prefersReducedMotion
                ? 0
                : 0.68,
          }}
          onPointerMove={
            handleQuoteMove
          }
          onPointerLeave={
            resetQuote
          }
          className="relative overflow-hidden rounded-lg border border-orange-200 bg-[#fde0cd] p-6 shadow-[0_10px_30px_rgba(194,103,52,0.05)] transition-transform duration-300 ease-out sm:p-7"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-14 -top-14 size-36 rounded-full bg-orange-200/40 blur-3xl"
          />

          <TrendingUp
            size={20}
            strokeWidth={1.7}
            className="relative text-teal-950"
            aria-hidden="true"
          />

          <blockquote className="relative mt-7 font-['Newsreader'] text-2xl leading-tight tracking-[-0.02em] text-[#221410]">
            “Clarity often arrives after you begin, not before.”
          </blockquote>

          <p className="relative mt-5 text-xs text-stone-600">
            A small note for the week ahead
          </p>
        </motion.aside>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <motion.article
          initial={
            prefersReducedMotion
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 22,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration:
              prefersReducedMotion
                ? 0
                : 0.65,
            delay:
              prefersReducedMotion
                ? 0
                : 0.8,
          }}
          className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] transition-[transform,box-shadow] duration-300 ease-out will-change-transform sm:p-7"
          onPointerMove={(
            event
          ) =>
            handleSurfaceMove(
              event,
              2.2
            )
          }
          onPointerLeave={
            resetSurface
          }
          style={{
            "--cursor-x":
              "50%",
            "--cursor-y":
              "50%",
            "--cursor-opacity":
              "0",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[var(--cursor-opacity)] transition-opacity duration-200"
            style={{
              background:
                "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.38), transparent 72%)",
            }}
          />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                {journeyType ===
                "profile_jobs"
                  ? "Profile skills"
                  : "Learning roadmap"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                {planLabel}
              </h2>
            </div>

            <Link
              to={
                journeyType ===
                "profile_jobs"
                  ? "/jobs/profile"
                  : "/learning-roadmap"
              }
              className="group inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
            >
              View plan

              <ArrowRight
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {roadmapSteps.length >
          0 ? (
            <ol className="relative z-10 mt-7 space-y-5">
              {roadmapSteps
                .slice(0, 3)
                .map(
                  (
                    step,
                    index
                  ) => (
                    <motion.li
                      key={
                        step._id ||
                        step.id ||
                        `${step.title}-${index}`
                      }
                      initial={
                        prefersReducedMotion
                          ? {
                              opacity: 1,
                              x: 0,
                            }
                          : {
                              opacity: 0,
                              x: -12,
                            }
                      }
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration:
                          prefersReducedMotion
                            ? 0
                            : 0.4,
                        delay:
                          prefersReducedMotion
                            ? 0
                            : 1 +
                              index *
                                0.1,
                      }}
                      className="flex items-start gap-3"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-500">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#10231f]">
                          {step.title ||
                            `Step ${
                              index + 1
                            }`}
                        </p>

                        <p className="mt-0.5 line-clamp-2 text-[11px] text-stone-500">
                          {step.description ||
                            "Follow this step as part of your current plan."}
                        </p>
                      </div>
                    </motion.li>
                  )
                )}
            </ol>
          ) : (
            <div className="relative z-10 mt-7 rounded-md bg-[#f2eee5] p-5">
              <p className="text-sm font-semibold text-[#10231f]">
                {journeyType ===
                "profile_jobs"
                  ? "Your profile skills are ready for job discovery."
                  : "Your roadmap is not available yet."}
              </p>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                {journeyType ===
                "profile_jobs"
                  ? `${technicalSkills.length} technical skill${technicalSkills.length === 1 ? "" : "s"} currently connected to your profile.`
                  : "Complete the selected journey setup to generate the next personalized steps."}
              </p>
            </div>
          )}
        </motion.article>

        <motion.article
          initial={
            prefersReducedMotion
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 22,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration:
              prefersReducedMotion
                ? 0
                : 0.65,
            delay:
              prefersReducedMotion
                ? 0
                : 0.9,
          }}
          className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] transition-[transform,box-shadow] duration-300 ease-out will-change-transform sm:p-7"
          onPointerMove={(
            event
          ) =>
            handleSurfaceMove(
              event,
              2.2
            )
          }
          onPointerLeave={
            resetSurface
          }
          style={{
            "--cursor-x":
              "50%",
            "--cursor-y":
              "50%",
            "--cursor-opacity":
              "0",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[var(--cursor-opacity)] transition-opacity duration-200"
            style={{
              background:
                "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.38), transparent 72%)",
            }}
          />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                Keep moving
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                Your current focus
              </h2>
            </div>

            <BookOpen
              size={20}
              strokeWidth={1.7}
              className="text-teal-950"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 mt-6 rounded-md bg-[#f2eee5] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              {journeyType ===
              "learn"
                ? "Learning target"
                : journeyType ===
                    "dream_job"
                  ? "Dream job"
                  : "Profile jobs"}
            </p>

            <h3 className="mt-2 text-lg font-semibold text-[#10231f]">
              {goalLabel}
            </h3>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              {journeyType ===
              "learn"
                ? `${missingSkills.length} skill${missingSkills.length === 1 ? "" : "s"} currently missing from your selected learning target.`
                : journeyType ===
                    "dream_job"
                  ? `${missingSkills.length} skill${missingSkills.length === 1 ? "" : "s"} currently missing for the selected career direction.`
                  : "Search external opportunities using the technical skills already stored in your profile."}
            </p>
          </div>

          <Link
            to={
              journeyType ===
              "learn"
                ? "/courses-resources"
                : journeyType ===
                    "dream_job"
                  ? "/learning-roadmap"
                  : "/jobs/profile"
            }
            className="relative z-10 group mt-4 inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-800/30 hover:text-teal-950 hover:shadow-[0_6px_18px_rgba(28,25,23,0.05)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          >
            {journeyType ===
            "learn"
              ? "Explore resources"
              : journeyType ===
                  "dream_job"
                ? "Open roadmap"
                : "Explore jobs"}

            <ArrowRight
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </motion.article>
      </section>

      {(warning ||
        (error && profile)) && (
        <p
          className="mt-5 text-xs text-amber-700"
          role="status"
          aria-live="polite"
        >
          Some overview data could not be refreshed:{" "}
          {warning || error}
        </p>
      )}
    </div>
  );
};

export default Overview;