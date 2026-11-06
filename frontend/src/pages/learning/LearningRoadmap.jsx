import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  getMyPersonalizedLearningRoadmap,
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
      rotateX(${-py * intensity}deg)
      rotateY(${px * intensity}deg)
      translateY(-2px)
    `;

    surface.style.setProperty(
      "--cursor-x",
      `${x}px`
    );

    surface.style.setProperty(
      "--cursor-y",
      `${y}px`
    );

    surface.style.setProperty(
      "--cursor-color",
      cursorColor
    );
  };

  const handlePointerLeave = (event) => {
    const surface = event.currentTarget;

    surface.style.transform = "";
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
        delay,
        ease: pageEase,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={[
        "relative overflow-hidden transition-transform duration-300 ease-out",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {children}
    </motion.div>
  );
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load your personalized learning roadmap."
  );
};

const normalizeRoadmapSteps = (steps) => {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step, index) => {
    const technologies = Array.isArray(
      step?.technologies
    )
      ? step.technologies
      : Array.isArray(step?.skills)
        ? step.skills
        : [];

    return {
      ...step,

      id:
        step?._id ||
        step?.id ||
        `learning-step-${index + 1}`,

      order:
        step?.order ||
        index + 1,

      title:
        step?.title ||
        step?.name ||
        `Learning Step ${index + 1}`,

      description:
        step?.description ||
        step?.overview ||
        "Complete this learning stage to strengthen your skills.",

      technologies,

      prerequisites: Array.isArray(
        step?.prerequisites
      )
        ? step.prerequisites
        : [],

      resources: Array.isArray(
        step?.resources
      )
        ? step.resources
        : [],

      estimatedDuration:
        step?.estimatedDuration ||
        step?.duration ||
        null,
    };
  });
};

const getStepStatus = (step, index, completedSteps) => {
  const stepId = String(
    step?._id ||
      step?.id ||
      index
  );

  if (
    completedSteps.includes(stepId) ||
    step?.isCompleted === true ||
    step?.status === "completed"
  ) {
    return "completed";
  }

  if (
    step?.status === "in_progress" ||
    step?.isCurrent === true
  ) {
    return "in_progress";
  }

  return "pending";
};

const LearningRoadmap = () => {
  const navigate = useNavigate();

  const prefersReducedMotion = useReducedMotion();

  const [roadmap, setRoadmap] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [isRetrying, setIsRetrying] =
    useState(false);

  const [completedSteps, setCompletedSteps] =
    useState([]);

  const loadRoadmap = async () => {
    setIsLoading(true);
    setError("");

    try {
      /*
       * This page belongs to the I WANT TO LEARN journey.
       *
       * It must use the personalized learning roadmap only.
       *
       * Backend:
       * GET /api/personalized-roadmap/learning/me
       */
      const personalizedResponse =
        await getMyPersonalizedLearningRoadmap();

      const personalizedRoadmap =
        personalizedResponse?.data?.roadmap;

      if (
        !personalizedResponse?.success ||
        !personalizedRoadmap
      ) {
        throw new Error(
          personalizedResponse?.message ||
            "Personalized learning roadmap is unavailable."
        );
      }

      setRoadmap({
        ...personalizedRoadmap,
        steps: normalizeRoadmapSteps(
          personalizedRoadmap.steps
        ),
      });
    } catch (roadmapError) {
      console.error(
        "Failed to load personalized learning roadmap:",
        roadmapError
      );

      setRoadmap(null);
      setError(getErrorMessage(roadmapError));
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const steps = useMemo(
    () =>
      Array.isArray(roadmap?.steps)
        ? roadmap.steps
        : [],
    [roadmap]
  );

  const completedCount = useMemo(
    () =>
      steps.filter((step, index) => {
        return (
          getStepStatus(
            step,
            index,
            completedSteps
          ) === "completed"
        );
      }).length,
    [steps, completedSteps]
  );

  const progressPercentage = useMemo(
    () => {
      if (!steps.length) {
        return 0;
      }

      return Math.round(
        (completedCount / steps.length) * 100
      );
    },
    [steps.length, completedCount]
  );

  const currentStep = useMemo(
    () =>
      steps.find((step, index) => {
        return (
          getStepStatus(
            step,
            index,
            completedSteps
          ) === "in_progress"
        );
      }) ||
      steps.find((step, index) => {
        return (
          getStepStatus(
            step,
            index,
            completedSteps
          ) === "pending"
        );
      }) ||
      null,
    [steps, completedSteps]
  );

  const handleRetry = () => {
    setIsRetrying(true);
    loadRoadmap();
  };

  const handleOpenResources = () => {
    navigate("/courses-resources");
  };

  const handleToggleComplete = (step, index) => {
    const stepId = String(
      step?._id ||
        step?.id ||
        index
    );

    setCompletedSteps((previous) => {
      if (previous.includes(stepId)) {
        return previous.filter(
          (id) => id !== stepId
        );
      }

      return [
        ...previous,
        stepId,
      ];
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf7f0] px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-stone-200" />

            <div className="h-32 rounded-2xl bg-stone-200" />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-52 rounded-2xl bg-stone-200" />
              <div className="h-52 rounded-2xl bg-stone-200" />
            </div>

            <div className="h-72 rounded-2xl bg-stone-200" />
          </div>

          <p
            className="mt-8 text-center text-sm text-stone-500"
            role="status"
            aria-live="polite"
          >
            Preparing your personalized learning roadmap...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf7f0] px-5 py-12 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-200 bg-white p-7 shadow-sm md:p-9">
            <div className="flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle size={23} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-teal-950">
              Unable to load your learning roadmap
            </h1>

            <p className="mt-3 text-sm leading-7 text-stone-600">
              {error}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    isRetrying
                      ? "animate-spin"
                      : ""
                  }
                />

                {isRetrying
                  ? "Retrying..."
                  : "Try again"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/learning-goal")
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white px-5 text-sm font-semibold text-teal-900 transition-colors hover:bg-stone-50"
              >
                Update learning goal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap || !steps.length) {
    return (
      <div className="min-h-screen bg-[#faf7f0] px-5 py-12 md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
            <Target size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-teal-950">
            Your learning roadmap is being prepared
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-600">
            We couldn't find any learning steps for your current goal.
            Update your learning preferences to continue.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/learning-goal")
            }
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            Update learning goal
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f0] px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: pageEase,
          }}
          className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
              <Target size={14} />
              Personalized Learning Journey
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-teal-950 md:text-4xl">
              Your Learning Roadmap
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
              Follow your personalized learning path, complete each stage,
              and build the skills needed to reach your goal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenResources}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            Explore resources
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Roadmap overview */}

        <CursorCard
          className="group mb-7 rounded-2xl border border-teal-900/10 bg-[#073f33] p-6 text-white shadow-[0_16px_45px_rgba(7,63,51,0.10)] md:p-8"
          intensity={1.4}
          cursorColor="rgba(255,255,255,0.06)"
        >
          <div className="relative z-10 grid gap-7 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
                Your learning goal
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                {roadmap.title ||
                  roadmap.domain ||
                  roadmap.name ||
                  "Personalized Learning Path"}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                {roadmap.description ||
                  roadmap.overview ||
                  "Your personalized roadmap is designed to help you develop the skills required for your learning goal."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {(roadmap.targetSkills || []).map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.07] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/70">
                  Overall progress
                </span>

                <span className="text-2xl font-bold text-orange-200">
                  {progressPercentage}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${progressPercentage}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: pageEase,
                  }}
                  className="h-full rounded-full bg-orange-300"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-white/65">
                <span>
                  {completedCount} completed
                </span>

                <span>
                  {steps.length} total steps
                </span>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <BookOpen
                    size={16}
                    className="text-orange-200"
                  />

                  {currentStep
                    ? currentStep.title
                    : "All available steps completed"}
                </div>

                <p className="mt-1 pl-6 text-xs text-white/55">
                  {currentStep
                    ? "Your next learning milestone"
                    : "Great work on your learning journey."}
                </p>
              </div>
            </div>
          </div>
        </CursorCard>

        {/* Roadmap steps */}

        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-teal-950">
              Learning stages
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Complete the stages in order to build your knowledge.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600">
            <Clock3 size={14} />
            {steps.length} learning stages
          </span>
        </div>

        <div className="relative space-y-4">
          <div className="absolute bottom-8 left-[23px] top-8 hidden w-px bg-stone-200 sm:block" />

          {steps.map((step, index) => {
            const status = getStepStatus(
              step,
              index,
              completedSteps
            );

            const isCompleted =
              status === "completed";

            const isCurrent =
              status === "in_progress";

            const isLocked =
              status === "pending" &&
              index > 0 &&
              !steps
                .slice(0, index)
                .every((previousStep, previousIndex) => {
                  return (
                    getStepStatus(
                      previousStep,
                      previousIndex,
                      completedSteps
                    ) === "completed"
                  );
                });

            return (
              <CursorCard
                key={step.id}
                className="group relative rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_4px_18px_rgba(20,45,37,0.035)] transition-all hover:border-teal-900/20 hover:shadow-[0_12px_32px_rgba(20,45,37,0.07)] md:p-6"
                delay={index * 0.06}
                intensity={1}
              >
                <div className="relative z-10 flex flex-col gap-5 sm:flex-row">
                  <div className="relative z-10 flex shrink-0 items-start">
                    <div
                      className={[
                        "flex size-12 items-center justify-center rounded-xl border text-sm font-bold transition-colors",
                        isCompleted
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : isCurrent
                            ? "border-orange-200 bg-orange-50 text-orange-700"
                            : "border-stone-200 bg-stone-50 text-stone-500",
                      ].join(" ")}
                    >
                      {isCompleted ? (
                        <Check size={20} />
                      ) : isLocked ? (
                        <LockKeyhole size={18} />
                      ) : (
                        String(index + 1).padStart(
                          2,
                          "0"
                        )
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700"
                            : isCurrent
                              ? "bg-orange-50 text-orange-700"
                              : "bg-stone-100 text-stone-500",
                        ].join(" ")}
                      >
                        {isCompleted
                          ? "Completed"
                          : isCurrent
                            ? "In progress"
                            : "Upcoming"}
                      </span>

                      {step.estimatedDuration && (
                        <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                          <Clock3 size={12} />
                          {step.estimatedDuration}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-lg font-bold tracking-tight text-teal-950">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      {step.description}
                    </p>

                    {step.technologies.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
                          Skills covered
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {step.technologies.map(
                            (technology) => (
                              <span
                                key={technology}
                                className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-600"
                              >
                                {technology}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {step.prerequisites.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
                          Prerequisites
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {step.prerequisites.map(
                            (prerequisite) => (
                              <span
                                key={prerequisite}
                                className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800"
                              >
                                {prerequisite}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleComplete(
                            step,
                            index
                          )
                        }
                        disabled={isLocked}
                        className={[
                          "inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors",
                          isCompleted
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            : isLocked
                              ? "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400"
                              : "bg-teal-900 text-white hover:bg-teal-800",
                        ].join(" ")}
                      >
                        {isCompleted ? (
                          <>
                            <Check size={14} />
                            Completed
                          </>
                        ) : isLocked ? (
                          <>
                            <LockKeyhole size={14} />
                            Locked
                          </>
                        ) : (
                          <>
                            Mark as completed
                            <ChevronRight size={14} />
                          </>
                        )}
                      </button>

                      {step.resources.length > 0 && (
                        <button
                          type="button"
                          onClick={handleOpenResources}
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-stone-200 px-4 text-xs font-semibold text-teal-900 transition-colors hover:bg-stone-50"
                        >
                          <BookOpen size={14} />
                          Explore resources
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CursorCard>
            );
          })}
        </div>

        {/* Footer */}

        <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-bold text-teal-950">
              Keep building your skills
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              Explore curated courses and learning resources for your journey.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenResources}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            Courses & Resources
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
};

export default LearningRoadmap;