import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  RefreshCw,
  Target,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  getCareerRoadmap,
  getMyCareerGoal,
  getMyPersonalizedRoadmap,
} from "../../services/learning.service";

const pageEase = [0.22, 1, 0.36, 1];

const CursorCard = ({
  children,
  className = "",
  intensity = 2.2,
  delay = 0,
  cursorColor = "rgba(15,118,110,0.08)",
}) => {
  const prefersReducedMotion = useReducedMotion();

  const handlePointerMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !event.currentTarget
    ) {
      return;
    }

    const surface = event.currentTarget;
    const rect = surface.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    surface.style.transform = `
      perspective(1100px)
      translate3d(${px * 4}px, ${py * 4 - 2}px, 0)
      rotateX(${-py * intensity}deg)
      rotateY(${px * intensity}deg)
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

  const resetSurface = (event) => {
    if (prefersReducedMotion) return;

    const surface = event.currentTarget;

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

  return (
    <motion.article
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 22 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : delay,
        ease: pageEase,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetSurface}
      className={`
        relative overflow-hidden
        transition-[transform,box-shadow,border-color]
        duration-300 ease-out
        ${className}
      `}
      style={{
        "--cursor-x": "50%",
        "--cursor-y": "50%",
        "--cursor-opacity": "0",
      }}
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 z-0
          opacity-[var(--cursor-opacity)]
          transition-opacity duration-200
        "
        style={{
          background: `radial-gradient(
            circle 180px at var(--cursor-x) var(--cursor-y),
            ${cursorColor},
            transparent 72%
          )`,
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load your learning roadmap."
  );
};

const normalizeRoadmapSteps = (steps = []) => {
  if (!Array.isArray(steps)) {
    return [];
  }

  return [...steps]
    .filter(Boolean)
    .sort(
      (a, b) =>
        Number(a?.order ?? 0) -
        Number(b?.order ?? 0)
    )
    .map((step, index) => ({
      id:
        step?._id ||
        step?.id ||
        `roadmap-step-${index + 1}`,

      order:
        Number.isFinite(Number(step?.order))
          ? Number(step.order)
          : index + 1,

      phase: `Step ${index + 1}`,

      title:
        step?.title ||
        `Learning step ${index + 1}`,

      description:
        step?.description ||
        "Follow this step as part of your career roadmap.",

      skills: Array.isArray(step?.skills)
        ? step.skills.filter(
            (skill) =>
              typeof skill === "string" &&
              skill.trim()
          )
        : [],

      resources: Array.isArray(step?.resources)
        ? step.resources.filter(Boolean)
        : [],
    }));
};

const LearningRoadmap = () => {
  const prefersReducedMotion = useReducedMotion();

  const [roadmap, setRoadmap] = useState(null);
  const [roadmapSource, setRoadmapSource] =
    useState("personalized");

  const [activeStep, setActiveStep] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [isRetrying, setIsRetrying] =
    useState(false);

  const loadRoadmap = async () => {
    setIsLoading(true);
    setError("");

    try {
      /*
       * Primary source:
       * GET /api/personalized-roadmap/me
       */
      const personalizedResponse =
        await getMyPersonalizedRoadmap();

      const personalizedRoadmap =
        personalizedResponse?.data?.roadmap;

      if (
        !personalizedResponse?.success ||
        !personalizedRoadmap
      ) {
        throw new Error(
          personalizedResponse?.message ||
            "Personalized roadmap is unavailable."
        );
      }

      setRoadmap({
        ...personalizedRoadmap,
        steps: normalizeRoadmapSteps(
          personalizedRoadmap.steps
        ),
      });

      setRoadmapSource("personalized");
      return;
    } catch (personalizedError) {
      /*
       * If the personalized roadmap is unavailable,
       * use the existing career roadmap as a safe
       * frontend fallback.
       *
       * No backend change is made here.
       */
      if (
        personalizedError?.response?.status !== 404
      ) {
        console.error(
          "Failed to load personalized roadmap:",
          personalizedError
        );
      }

      try {
        const careerGoalResponse =
          await getMyCareerGoal();

        const careerGoal =
          careerGoalResponse?.data?.careerGoal;

        const career =
          careerGoal?.targetCareer;

        const domain =
          careerGoal?.targetDomain;

        if (!career || !domain) {
          throw new Error(
            "Your career goal is not available yet."
          );
        }

        const careerRoadmapResponse =
          await getCareerRoadmap(
            career,
            domain
          );

        const careerRoadmap =
          careerRoadmapResponse?.data?.roadmap;

        if (
          !careerRoadmapResponse?.success ||
          !careerRoadmap
        ) {
          throw new Error(
            careerRoadmapResponse?.message ||
              "Career roadmap is unavailable."
          );
        }

        setRoadmap({
          ...careerRoadmap,
          steps: normalizeRoadmapSteps(
            careerRoadmap.steps
          ),
        });

        setRoadmapSource("career");
      } catch (fallbackError) {
        console.error(
          "Failed to load career roadmap:",
          fallbackError
        );

        setRoadmap(null);

        setError(
          getErrorMessage(fallbackError)
        );
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const roadmapSteps = useMemo(
    () =>
      Array.isArray(roadmap?.steps)
        ? roadmap.steps
        : [],
    [roadmap]
  );

  useEffect(() => {
    if (!roadmapSteps.length) {
      setActiveStep(null);
      return;
    }

    setActiveStep((currentStep) => {
      const stillExists = roadmapSteps.some(
        (step) => step.id === currentStep
      );

      if (stillExists) {
        return currentStep;
      }

      return roadmapSteps[0].id;
    });
  }, [roadmapSteps]);

  const selectedStep =
    roadmapSteps.find(
      (step) => step.id === activeStep
    ) || roadmapSteps[0];

  const missingSkills = Array.isArray(
    roadmap?.missingSkills
  )
    ? roadmap.missingSkills
    : [];

  const careerName =
    roadmap?.career || "Career path";

  const domainName =
    roadmap?.domain || "Career development";

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadRoadmap();
  };

  /*
   * ------------------------------------------------------------------------
   * LOADING STATE
   * ------------------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.div
          initial={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          animate={{ opacity: 1 }}
          className="
            flex min-h-[420px]
            items-center justify-center
          "
        >
          <div
            className="
              flex flex-col
              items-center
              text-center
            "
            role="status"
            aria-live="polite"
          >
            <div
              className="
                flex size-12
                items-center justify-center
                rounded-full
                bg-[#dcefe9]
                text-teal-950
              "
            >
              <RefreshCw
                size={20}
                strokeWidth={1.8}
                className="animate-spin"
                aria-hidden="true"
              />
            </div>

            <p
              className="
                mt-4
                text-sm font-semibold
                text-[#10231f]
              "
            >
              Loading your roadmap...
            </p>

            <p
              className="
                mt-1
                text-xs
                text-stone-500
              "
            >
              Connecting your career goal with your
              learning path.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------------------
   * ERROR STATE
   * ------------------------------------------------------------------------
   */

  if (error || !roadmap) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.section
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 18 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.55,
            ease: pageEase,
          }}
          className="
            mx-auto
            flex min-h-[420px]
            max-w-2xl
            items-center
            justify-center
          "
        >
          <div
            className="
              w-full
              rounded-xl
              border border-red-200
              bg-red-50
              p-7
              text-center
              shadow-[0_10px_30px_rgba(127,29,29,0.04)]
              sm:p-9
            "
            role="alert"
          >
            <div
              className="
                mx-auto
                flex size-12
                items-center justify-center
                rounded-full
                bg-white
                text-red-700
              "
            >
              <AlertCircle
                size={22}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <h1
              className="
                mt-5
                font-['Newsreader']
                text-3xl
                font-semibold
                tracking-[-0.025em]
                text-red-950
              "
            >
              Your learning roadmap isn't
              available yet.
            </h1>

            <p
              className="
                mx-auto mt-3
                max-w-lg
                text-sm leading-6
                text-red-800/80
              "
            >
              {error ||
                "We couldn't load your current career roadmap."}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="
                mt-6
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-md
                bg-teal-950
                px-4
                text-sm
                font-semibold
                text-white
                shadow-[0_7px_18px_rgba(6,78,59,0.10)]
                transition-[background-color,box-shadow,transform]
                duration-200
                hover:-translate-y-0.5
                hover:bg-teal-900
                hover:shadow-[0_12px_25px_rgba(6,78,59,0.15)]
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={15}
                strokeWidth={1.8}
                className={
                  isRetrying
                    ? "animate-spin"
                    : ""
                }
                aria-hidden="true"
              />

              {isRetrying
                ? "Trying again..."
                : "Try again"}
            </button>
          </div>
        </motion.section>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------------------
   * EMPTY ROADMAP STATE
   * ------------------------------------------------------------------------
   */

  if (!roadmapSteps.length) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.section
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 18 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.55,
            ease: pageEase,
          }}
          className="
            mx-auto
            flex min-h-[420px]
            max-w-2xl
            items-center
            justify-center
          "
        >
          <div
            className="
              w-full
              rounded-xl
              border border-stone-200
              bg-white
              p-7
              text-center
              shadow-[0_10px_32px_rgba(28,25,23,0.04)]
              sm:p-9
            "
          >
            <div
              className="
                mx-auto
                flex size-12
                items-center justify-center
                rounded-full
                bg-[#dcefe9]
                text-teal-950
              "
            >
              <BookOpen
                size={22}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <h1
              className="
                mt-5
                font-['Newsreader']
                text-3xl
                font-semibold
                tracking-[-0.025em]
                text-[#10231f]
              "
            >
              Your roadmap has no matched
              learning steps yet.
            </h1>

            <p
              className="
                mx-auto mt-3
                max-w-lg
                text-sm leading-6
                text-stone-500
              "
            >
              Your current career direction is{" "}
              <span className="font-semibold text-stone-700">
                {careerName}
              </span>{" "}
              in{" "}
              <span className="font-semibold text-stone-700">
                {domainName}
              </span>
              .
            </p>

            {missingSkills.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="
                      rounded-full
                      border border-stone-200
                      bg-[#fffdf9]
                      px-2.5 py-1
                      text-[10px]
                      font-semibold
                      text-stone-500
                    "
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="
                mt-6
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-md
                bg-teal-950
                px-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-teal-900
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={15}
                strokeWidth={1.8}
                className={
                  isRetrying
                    ? "animate-spin"
                    : ""
                }
                aria-hidden="true"
              />

              Refresh roadmap
            </button>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* ================================================================ */}
      {/* PAGE HEADER                                                       */}
      {/* ================================================================ */}

      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.65,
          ease: pageEase,
        }}
        aria-labelledby="roadmap-title"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Learning roadmap
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <motion.h1
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 14 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.08,
                ease: pageEase,
              }}
              id="roadmap-title"
              className="
                font-['Newsreader']
                text-4xl font-semibold
                leading-[1.02]
                tracking-[-0.035em]
                text-[#10231f]
                sm:text-5xl
              "
            >
              Know what to learn next.
            </motion.h1>

            <motion.p
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 12 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.55,
                delay: prefersReducedMotion ? 0 : 0.17,
                ease: pageEase,
              }}
              className="
                mt-4 max-w-2xl
                text-sm leading-6
                text-stone-500
                sm:text-[15px]
              "
            >
              Follow a focused sequence based on
              your current career direction instead
              of trying to learn everything at once.
            </motion.p>
          </div>

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: 12 }
            }
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.55,
              delay: prefersReducedMotion ? 0 : 0.24,
              ease: pageEase,
            }}
            className="
              inline-flex min-h-10
              shrink-0 items-center gap-2
              self-start rounded-md
              border border-stone-200
              bg-white px-3.5
              text-xs font-semibold
              text-stone-600
              shadow-[0_3px_12px_rgba(28,25,23,0.04)]
              sm:self-auto
            "
          >
            <Target
              size={15}
              strokeWidth={1.7}
              className="text-teal-900"
              aria-hidden="true"
            />

            <span>
              {careerName}
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* ROADMAP SNAPSHOT                                                  */}
      {/* ================================================================ */}

      <CursorCard
        intensity={2.3}
        delay={0.25}
        cursorColor="rgba(255,255,255,0.14)"
        className="
          mt-8
          rounded-lg
          border border-teal-950
          bg-teal-950
          p-6 text-white
          shadow-[0_18px_45px_rgba(6,78,59,0.13)]
          sm:p-8
        "
      >
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-300">
              {roadmapSource === "personalized"
                ? "Personalized path"
                : "Career roadmap"}
            </p>

            <h2 className="mt-2 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              Build towards {careerName}.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
              Your roadmap is connected to the{" "}
              <span className="font-semibold text-white">
                {domainName}
              </span>{" "}
              career direction.
            </p>
          </div>

          <div
            className="
              grid shrink-0
              grid-cols-2
              gap-2
              sm:min-w-[300px]
            "
          >
            <div
              className="
                rounded-md
                border border-white/10
                bg-white/[0.05]
                px-4 py-3
              "
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
                Roadmap steps
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {roadmapSteps.length}
              </p>
            </div>

            <div
              className="
                rounded-md
                border border-white/10
                bg-white/[0.05]
                px-4 py-3
              "
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
                Missing skills
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {missingSkills.length}
              </p>
            </div>
          </div>
        </div>
      </CursorCard>

      {/* ================================================================ */}
      {/* MISSING SKILLS                                                   */}
      {/* ================================================================ */}

      {missingSkills.length > 0 && (
        <motion.section
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 16 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.55,
            delay: prefersReducedMotion ? 0 : 0.3,
            ease: pageEase,
          }}
          className="mt-8"
          aria-labelledby="missing-skills-title"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Skill gap
            </p>

            <h2
              id="missing-skills-title"
              className="
                mt-2
                font-['Newsreader']
                text-3xl font-semibold
                tracking-[-0.025em]
                text-[#10231f]
              "
            >
              Skills connected to your roadmap.
            </h2>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {missingSkills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 8,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: prefersReducedMotion
                    ? 0
                    : 0.35,
                  delay: prefersReducedMotion
                    ? 0
                    : index * 0.05,
                  ease: pageEase,
                }}
                className="
                  rounded-full
                  border border-stone-200
                  bg-white
                  px-3 py-1.5
                  text-[11px]
                  font-semibold
                  text-stone-600
                  shadow-[0_3px_12px_rgba(28,25,23,0.03)]
                "
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.section>
      )}

      {/* ================================================================ */}
      {/* ROADMAP                                                           */}
      {/* ================================================================ */}

      <section
        className="mt-8"
        aria-labelledby="roadmap-steps-title"
      >
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
            Your path
          </p>

          <h2
            id="roadmap-steps-title"
            className="
              mt-2
              font-['Newsreader']
              text-3xl font-semibold
              tracking-[-0.025em]
              text-[#10231f]
            "
          >
            {roadmapSteps.length} focused{" "}
            {roadmapSteps.length === 1
              ? "step"
              : "steps"}.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ============================================================ */}
          {/* STEP LIST                                                      */}
          {/* ============================================================ */}

          <div className="space-y-4">
            {roadmapSteps.map((step, index) => {
              const isSelected =
                activeStep === step.id;

              return (
                <CursorCard
                  key={step.id}
                  intensity={2.1}
                  delay={0.4 + index * 0.08}
                  className={`
                    rounded-lg
                    border p-5
                    shadow-[0_8px_28px_rgba(28,25,23,0.025)]
                    ${
                      isSelected
                        ? "border-teal-950 bg-[#f7faf8] shadow-[0_15px_34px_rgba(6,78,59,0.07)]"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-[0_16px_34px_rgba(28,25,23,0.07)]"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStep(step.id)
                    }
                    aria-pressed={isSelected}
                    className="
                      block w-full
                      text-left
                      focus-visible:outline-2
                      focus-visible:outline-offset-4
                      focus-visible:outline-teal-800
                    "
                  >
                    <div className="flex gap-4">
                      <div
                        className={`
                          flex size-10
                          shrink-0 items-center
                          justify-center rounded-md
                          ${
                            isSelected
                              ? "bg-orange-200 text-teal-950"
                              : "bg-stone-100 text-stone-500"
                          }
                        `}
                      >
                        {isSelected ? (
                          <BookOpen
                            size={17}
                            strokeWidth={1.7}
                            aria-hidden="true"
                          />
                        ) : (
                          <LockKeyhole
                            size={16}
                            strokeWidth={1.7}
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                            {step.phase}
                          </p>

                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                            <Clock3
                              size={13}
                              strokeWidth={1.7}
                              aria-hidden="true"
                            />

                            Order {step.order}
                          </span>
                        </div>

                        <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-[#10231f]">
                          {step.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-stone-500">
                          {step.description}
                        </p>

                        {step.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {step.skills.map(
                              (skill) => (
                                <span
                                  key={skill}
                                  className="
                                    rounded-full
                                    border border-stone-200
                                    bg-white
                                    px-2.5 py-1
                                    text-[10px]
                                    font-semibold
                                    text-stone-500
                                  "
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <ChevronRight
                        size={17}
                        strokeWidth={1.7}
                        className={`
                          mt-1
                          shrink-0
                          transition-transform
                          duration-200
                          ${
                            isSelected
                              ? "translate-x-0.5 text-teal-950"
                              : "text-stone-300"
                          }
                        `}
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                </CursorCard>
              );
            })}
          </div>

          {/* ============================================================ */}
          {/* SELECTED STEP                                                  */}
          {/* ============================================================ */}

          {selectedStep && (
            <CursorCard
              intensity={2.3}
              delay={0.68}
              cursorColor="rgba(15,118,110,0.08)"
              className="
                h-fit
                rounded-lg
                border border-stone-200
                bg-white
                p-6
                shadow-[0_10px_32px_rgba(28,25,23,0.04)]
                lg:sticky lg:top-[92px]
                sm:p-8
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                    Selected milestone
                  </p>

                  <h2 className="mt-2 font-['Newsreader'] text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#10231f]">
                    {selectedStep.title}
                  </h2>
                </div>

                <motion.div
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : {
                          y: [0, -3, 0],
                        }
                  }
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    flex size-10
                    shrink-0 items-center
                    justify-center rounded-md
                    bg-[#dcefe9]
                    text-teal-950
                  "
                >
                  <BookOpen
                    size={18}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </motion.div>
              </div>

              <p className="mt-4 text-sm leading-6 text-stone-500">
                {selectedStep.description}
              </p>

              <div className="mt-6 border-t border-stone-100 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                    Focus skills
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                    <Clock3
                      size={13}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />

                    Order {selectedStep.order}
                  </span>
                </div>

                {selectedStep.skills.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {selectedStep.skills.map(
                      (skill, index) => (
                        <motion.div
                          key={skill}
                          initial={
                            prefersReducedMotion
                              ? false
                              : {
                                  opacity: 0,
                                  x: 8,
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
                                : 0.35,
                            delay:
                              prefersReducedMotion
                                ? 0
                                : index * 0.06,
                            ease: pageEase,
                          }}
                          className="
                            flex min-h-10
                            items-center gap-3
                            rounded-md
                            border border-stone-200
                            bg-[#fffdf9]
                            px-3.5
                          "
                        >
                          <span
                            className="
                              flex size-5
                              shrink-0 items-center
                              justify-center rounded-full
                              bg-[#dcefe9]
                              text-teal-950
                            "
                          >
                            <Check
                              size={12}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          </span>

                          <span className="text-xs font-semibold text-stone-600">
                            {skill}
                          </span>
                        </motion.div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-stone-500">
                    No specific skills were attached
                    to this roadmap step.
                  </p>
                )}
              </div>

              {/* RESOURCES */}
              {selectedStep.resources.length >
                0 && (
                <div className="mt-6 border-t border-stone-100 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                      Resources
                    </span>

                    <span className="text-[11px] font-medium text-stone-400">
                      {selectedStep.resources.length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {selectedStep.resources.map(
                      (resource, index) => {
                        const resourceTitle =
                          typeof resource ===
                          "string"
                            ? resource
                            : resource?.title ||
                              `Resource ${index + 1}`;

                        const resourceUrl =
                          typeof resource ===
                          "object"
                            ? resource?.url
                            : null;

                        if (!resourceUrl) {
                          return (
                            <div
                              key={`${resourceTitle}-${index}`}
                              className="
                                rounded-md
                                border
                                border-stone-200
                                bg-[#fffdf9]
                                px-3.5 py-3
                              "
                            >
                              <p className="text-xs font-semibold text-stone-600">
                                {resourceTitle}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <a
                            key={`${resourceUrl}-${index}`}
                            href={resourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="
                              group
                              flex items-center
                              justify-between gap-3
                              rounded-md
                              border border-stone-200
                              bg-[#fffdf9]
                              px-3.5 py-3
                              transition
                              hover:border-teal-800/20
                              hover:bg-[#f7faf8]
                              focus-visible:outline-2
                              focus-visible:outline-offset-2
                              focus-visible:outline-teal-800
                            "
                          >
                            <span className="min-w-0 text-xs font-semibold text-stone-600">
                              {resourceTitle}
                            </span>

                            <ArrowRight
                              size={14}
                              strokeWidth={1.8}
                              aria-hidden="true"
                              className="
                                shrink-0
                                text-stone-400
                                transition-transform
                                duration-200
                                group-hover:translate-x-1
                              "
                            />
                          </a>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <a
                  href="/courses-resources"
                  className="
                    group
                    inline-flex min-h-10
                    w-full items-center
                    justify-center gap-2
                    rounded-md
                    bg-teal-950 px-4
                    text-sm font-semibold
                    text-white
                    shadow-[0_7px_18px_rgba(6,78,59,0.10)]
                    transition-[background-color,box-shadow,transform]
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-teal-900
                    hover:shadow-[0_12px_25px_rgba(6,78,59,0.15)]
                    focus-visible:outline-2
                    focus-visible:outline-offset-4
                    focus-visible:outline-teal-800
                    active:translate-y-0
                  "
                >
                  Explore courses

                  <ArrowRight
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </a>
              </div>
            </CursorCard>
          )}
        </div>
      </section>
    </div>
  );
};

export default LearningRoadmap;