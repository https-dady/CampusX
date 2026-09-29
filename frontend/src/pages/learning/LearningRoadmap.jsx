import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Target,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const roadmapSteps = [
  {
    id: 1,
    phase: "Foundation",
    title: "Strengthen your SQL foundations",
    description:
      "Build the query skills that support practical data analysis work.",
    duration: "2 weeks",
    skills: ["SQL", "Queries", "Data handling"],
    status: "complete",
  },
  {
    id: 2,
    phase: "Core skills",
    title: "Learn data analysis with Python",
    description:
      "Move from individual queries to analysing and working with real datasets.",
    duration: "3 weeks",
    skills: ["Python", "Pandas", "Data analysis"],
    status: "current",
  },
  {
    id: 3,
    phase: "Visualisation",
    title: "Turn analysis into clear stories",
    description:
      "Learn how to communicate findings through useful visualisations and dashboards.",
    duration: "3 weeks",
    skills: ["Power BI", "Visualisation", "Storytelling"],
    status: "upcoming",
  },
  {
    id: 4,
    phase: "Proof of work",
    title: "Build a practical case study",
    description:
      "Bring your skills together in a project that demonstrates how you solve a real problem.",
    duration: "4 weeks",
    skills: ["Projects", "Case study", "Presentation"],
    status: "upcoming",
  },
];

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

      <div className="relative z-10">{children}</div>
    </motion.article>
  );
};

const LearningRoadmap = () => {
  const prefersReducedMotion = useReducedMotion();

  const [activeStep, setActiveStep] = useState(2);

  const completedCount = useMemo(
    () =>
      roadmapSteps.filter(
        (step) => step.status === "complete"
      ).length,
    []
  );

  const progress = Math.round(
    (completedCount / roadmapSteps.length) * 100
  );

  const selectedStep =
    roadmapSteps.find((step) => step.id === activeStep) ??
    roadmapSteps[0];

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
              Follow a focused sequence instead of trying to learn
              everything at once. Each step builds towards your
              career direction.
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

            <span>Data Analyst path</span>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* PROGRESS SNAPSHOT                                                 */}
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
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-300">
              Your current path
            </p>

            <h2 className="mt-2 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              Build towards data analysis.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
              You have a focused sequence of four milestones.
              Start with the foundations and build proof as you go.
            </p>
          </div>

          <div className="shrink-0 sm:min-w-40">
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-300">
              <span>Roadmap progress</span>
              <span>{progress}%</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { width: `${progress}%` }
                    : { width: "0%" }
                }
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 1,
                  delay: prefersReducedMotion ? 0 : 0.5,
                  ease: pageEase,
                }}
                className="h-full rounded-full bg-orange-300"
              />
            </div>
          </div>
        </div>
      </CursorCard>

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
            Four focused steps.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ============================================================ */}
          {/* STEP LIST                                                      */}
          {/* ============================================================ */}

          <div className="space-y-4">
            {roadmapSteps.map((step, index) => {
              const isSelected = activeStep === step.id;
              const isComplete = step.status === "complete";
              const isCurrent = step.status === "current";

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
                    onClick={() => setActiveStep(step.id)}
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
                            isComplete
                              ? "bg-teal-950 text-white"
                              : isCurrent
                                ? "bg-orange-200 text-teal-950"
                                : "bg-stone-100 text-stone-400"
                          }
                        `}
                      >
                        {isComplete ? (
                          <Check
                            size={17}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        ) : isCurrent ? (
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
                            {step.duration}
                          </span>
                        </div>

                        <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-[#10231f]">
                          {step.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-stone-500">
                          {step.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {step.skills.map((skill) => (
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
                          ))}
                        </div>
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
                  {selectedStep.duration}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {selectedStep.skills.map((skill, index) => (
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
                      duration: prefersReducedMotion ? 0 : 0.35,
                      delay: prefersReducedMotion
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
                ))}
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/courses"
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
        </div>
      </section>
    </div>
  );
};

export default LearningRoadmap;