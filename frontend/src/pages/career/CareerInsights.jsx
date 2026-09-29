import { useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Code2,
  Database,
  Lightbulb,
  Map,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* Cursor-follow surface                                                       */
/* -------------------------------------------------------------------------- */

const CursorCard = ({
  children,
  className = "",
  intensity = 2.2,
  delay = 0,
}) => {
  const cardRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const handlePointerMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !cardRef.current
    ) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    cardRef.current.style.transform = `
      perspective(1100px)
      translate3d(${percentX * 4}px, ${percentY * 4}px, 0)
      rotateX(${-percentY * intensity}deg)
      rotateY(${percentX * intensity}deg)
    `;

    cardRef.current.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    cardRef.current.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
    );

    cardRef.current.style.setProperty(
      "--cursor-opacity",
      "1"
    );
  };

  const resetCard = () => {
    if (!cardRef.current || prefersReducedMotion) {
      return;
    }

    cardRef.current.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    cardRef.current.style.setProperty(
      "--cursor-opacity",
      "0"
    );
  };

  return (
    <motion.article
      ref={cardRef}
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 22 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
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
          pointer-events-none absolute inset-0 z-0
          opacity-[var(--cursor-opacity)]
          transition-opacity duration-200
        "
        style={{
          background:
            "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.42), transparent 72%)",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
};

/* -------------------------------------------------------------------------- */
/* Static career insight data                                                 */
/* -------------------------------------------------------------------------- */

const careerData = {
  role: "Data Analyst",
  fit: 88,
  description:
    "Your current skills line up well with the core foundation expected from a Data Analyst. Strengthening a few practical skills can make this direction more job-ready.",
  strengths: [
    "Problem solving",
    "JavaScript",
    "SQL",
    "Data analysis",
  ],
  nextSkills: [
    {
      name: "Power BI",
      progress: 18,
      icon: BarChart3,
    },
    {
      name: "Advanced SQL",
      progress: 42,
      icon: Database,
    },
    {
      name: "Data storytelling",
      progress: 28,
      icon: TrendingUp,
    },
  ],
};

const alternativeRoles = [
  {
    title: "Data Scientist",
    fit: 74,
    description:
      "A possible longer-term direction if you build deeper statistics, Python and machine learning skills.",
    icon: TrendingUp,
  },
  {
    title: "AI / ML Engineer",
    fit: 68,
    description:
      "A technical path that becomes stronger with Python, machine learning and model-building experience.",
    icon: Sparkles,
  },
  {
    title: "Frontend Developer",
    fit: 81,
    description:
      "Your current web development foundation gives you another practical direction to explore.",
    icon: Code2,
  },
];

const roadmapSteps = [
  {
    number: "01",
    title: "Strengthen SQL",
    description:
      "Move from basic queries toward joins, aggregations and real analytical problems.",
    status: "Current focus",
  },
  {
    number: "02",
    title: "Learn Power BI",
    description:
      "Turn datasets into dashboards and communicate useful patterns visually.",
    status: "Next skill",
  },
  {
    number: "03",
    title: "Build one analysis project",
    description:
      "Apply your skills to a realistic dataset and document the decisions you made.",
    status: "Build",
  },
  {
    number: "04",
    title: "Prepare for roles",
    description:
      "Use your projects, resume and assessment results to prepare for applications.",
    status: "Later",
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

const CareerInsights = () => {
  const prefersReducedMotion = useReducedMotion();

  const [selectedRole, setSelectedRole] =
    useState(careerData.role);

  const pageEase = [0.22, 1, 0.36, 1];

  const handleSurfaceMove = (event, intensity = 2.3) => {
    if (prefersReducedMotion || event.pointerType !== "mouse") return;

    const surface = event.currentTarget;
    const rect = surface.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    surface.style.transform = `
      perspective(1100px)
      translate3d(${percentX * 4}px, ${percentY * 4 - 2}px, 0)
      rotateX(${-percentY * intensity}deg)
      rotateY(${percentX * intensity}deg)
    `;
    surface.style.setProperty("--cursor-x", `${(x / rect.width) * 100}%`);
    surface.style.setProperty("--cursor-y", `${(y / rect.height) * 100}%`);
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

  const selectedAlternative =
    alternativeRoles.find(
      (role) => role.title === selectedRole
    );

  const displayedRole =
    selectedRole === careerData.role
      ? careerData
      : {
          role: selectedAlternative.title,
          fit: selectedAlternative.fit,
          description:
            selectedAlternative.description,
          strengths: careerData.strengths.slice(0, 3),
        };

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* ================================================================== */}
      {/* PAGE HEADER                                                         */}
      {/* ================================================================== */}

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
        aria-labelledby="career-insights-title"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Career insights
        </p>

        <div className="mt-2 flex flex-col gap-4">
          <motion.h1
            id="career-insights-title"
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
            className="
              font-['Newsreader']
              text-4xl font-semibold
              leading-[1.02]
              tracking-[-0.035em]
              text-[#10231f]
              sm:text-5xl
            "
          >
            See where your current profile points.
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
              delay: prefersReducedMotion ? 0 : 0.18,
              ease: pageEase,
            }}
            className="
              max-w-2xl
              text-sm leading-6
              text-stone-500
              sm:text-[15px]
            "
          >
            Your skills, interests and career direction create
            a starting point. These insights help turn that
            starting point into a practical next step.
          </motion.p>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* PRIMARY INSIGHT                                                     */}
      {/* ================================================================== */}

      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 28, scale: 0.985 }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.8,
          delay: prefersReducedMotion ? 0 : 0.25,
          ease: pageEase,
        }}
        className="
          relative mt-8
          overflow-hidden rounded-lg
          border border-teal-950
          bg-teal-950
          p-6 text-white
          shadow-[0_18px_45px_rgba(6,78,59,0.13)]
          sm:p-8
         transition-[transform,box-shadow] duration-300 ease-out will-change-transform"
      
              onPointerMove={(event) => handleSurfaceMove(event, 2.4)}
              onPointerLeave={resetSurface}
              style={{
                "--cursor-x": "50%",
                "--cursor-y": "50%",
                "--cursor-opacity": "0",
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 opacity-[var(--cursor-opacity)] transition-opacity duration-200"
                style={{
                  background:
                    "radial-gradient(circle 220px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.16), transparent 72%)",
                }}
              />

        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 15, 0],
                  y: [0, -8, 0],
                  scale: [1, 1.06, 1],
                }
          }
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute -right-16 -top-20
            size-64 rounded-full
            bg-orange-300/[0.07]
            blur-3xl
          "
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="
                rounded-full
                border border-white/10
                bg-white/[0.06]
                px-3 py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-orange-300
              ">
                Current direction
              </span>

              <span className="
                rounded-full
                bg-white/[0.06]
                px-3 py-1
                text-[10px]
                text-white/45
              ">
                Based on your current profile
              </span>
            </div>

            <motion.h2
              key={displayedRole.role}
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
                duration: prefersReducedMotion ? 0 : 0.4,
              }}
              className="
                mt-4
                font-['Newsreader']
                text-4xl font-semibold
                tracking-[-0.03em]
                sm:text-5xl
              "
            >
              {displayedRole.role}
            </motion.h2>

            <motion.p
              key={`${displayedRole.role}-description`}
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
                duration: prefersReducedMotion ? 0 : 0.4,
                delay: prefersReducedMotion ? 0 : 0.05,
              }}
              className="
                mt-4 max-w-2xl
                text-sm leading-7
                text-white/55
              "
            >
              {displayedRole.description}
            </motion.p>

            <div className="mt-6 flex flex-wrap gap-2">
              {displayedRole.strengths.map(
                (strength, index) => (
                  <motion.span
                    key={strength}
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
                      duration:
                        prefersReducedMotion
                          ? 0
                          : 0.35,
                      delay:
                        prefersReducedMotion
                          ? 0
                          : 0.42 +
                            index * 0.05,
                    }}
                    className="
                      inline-flex
                      items-center gap-1.5
                      rounded-full
                      border border-white/10
                      bg-white/[0.06]
                      px-3 py-1.5
                      text-xs
                      text-white/75
                    "
                  >
                    <Check
                      size={11}
                      className="text-orange-300"
                      aria-hidden="true"
                    />

                    {strength}
                  </motion.span>
                )
              )}
            </div>
          </div>

          {/* FIT SCORE */}

          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.88,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              delay: prefersReducedMotion ? 0 : 0.45,
              ease: pageEase,
            }}
            className="
              relative mx-auto
              flex size-[210px]
              items-center justify-center
              rounded-full
              border border-white/10
              bg-white/[0.035]
              shadow-[inset_0_0_50px_rgba(255,255,255,0.025)]
            "
          >
            <div className="
              absolute inset-4
              rounded-full
              border border-white/[0.06]
            " />

            <svg
              viewBox="0 0 120 120"
              className="absolute inset-0 size-full -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="5"
              />

              <motion.circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#fdba74"
                strokeWidth="5"
                strokeLinecap="round"
                pathLength="100"
                initial={{
                  strokeDasharray: "0 100",
                }}
                animate={{
                  strokeDasharray: `${displayedRole.fit} 100`,
                }}
                transition={{
                  duration:
                    prefersReducedMotion
                      ? 0
                      : 1.1,
                  delay:
                    prefersReducedMotion
                      ? 0
                      : 0.55,
                  ease: "easeOut",
                }}
              />
            </svg>

            <div className="relative text-center">
              <motion.p
                key={displayedRole.fit}
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.8,
                      }
                }
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="
                  text-5xl font-semibold
                  tracking-[-0.04em]
                "
              >
                {displayedRole.fit}%
              </motion.p>

              <p className="
                mt-1 text-[10px]
                uppercase tracking-[0.12em]
                text-white/40
              ">
                Profile fit
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* MAIN GRID                                                           */}
      {/* ================================================================== */}

      <section className="
        mt-5 grid gap-5
        lg:grid-cols-[1.35fr_0.65fr]
      ">
        <div className="space-y-5">
          {/* NEXT SKILLS */}

          <CursorCard
            intensity={2.4}
            delay={0.42}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="
              flex items-start
              justify-between gap-4
            ">
              <div className="flex items-center gap-2.5">
                <motion.span
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          rotate: 5,
                          scale: 1.06,
                        }
                  }
                  className="
                    flex size-9
                    items-center justify-center
                    rounded-md
                    bg-[#edf5f1]
                    text-teal-950
                  "
                >
                  <Target
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </motion.span>

                <div>
                  <p className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-teal-950
                  ">
                    Skill gap
                  </p>

                  <h2 className="
                    mt-1 text-xl
                    font-semibold
                    tracking-[-0.02em]
                  ">
                    Skills that could move you forward.
                  </h2>
                </div>
              </div>

              <span className="
                hidden rounded-full
                bg-[#edf5f1]
                px-3 py-1
                text-[10px]
                font-semibold
                text-teal-950
                sm:inline-flex
              ">
                3 priorities
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {careerData.nextSkills.map(
                (skill, index) => {
                  const Icon = skill.icon;

                  return (
                    <motion.div
                      key={skill.name}
                      initial={
                        prefersReducedMotion
                          ? false
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
                            : 0.45,
                        delay:
                          prefersReducedMotion
                            ? 0
                            : 0.65 +
                              index * 0.08,
                      }}
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { x: 3 }
                      }
                      className="
                        group
                        rounded-md
                        border border-stone-200
                        bg-[#faf7f0]/60
                        p-4
                        transition-[border-color,box-shadow]
                        duration-200
                        hover:border-teal-800/20
                        hover:shadow-[0_7px_18px_rgba(28,25,23,0.045)]
                      "
                    >
                      <div className="
                        flex items-center
                        justify-between gap-4
                      ">
                        <div className="
                          flex min-w-0
                          items-center gap-3
                        ">
                          <span className="
                            flex size-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-md
                            bg-white
                            text-teal-950
                          ">
                            <Icon
                              size={16}
                              strokeWidth={1.7}
                              aria-hidden="true"
                            />
                          </span>

                          <div className="min-w-0">
                            <p className="
                              truncate
                              text-sm
                              font-semibold
                              text-stone-800
                            ">
                              {skill.name}
                            </p>

                            <p className="
                              mt-0.5
                              text-[10px]
                              text-stone-400
                            ">
                              Current familiarity
                            </p>
                          </div>
                        </div>

                        <motion.span
                          key={skill.progress}
                          initial={
                            prefersReducedMotion
                              ? false
                              : {
                                  opacity: 0,
                                  scale: 0.8,
                                }
                          }
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          className="
                            shrink-0
                            text-xs font-semibold
                            text-teal-950
                          "
                        >
                          {skill.progress}%
                        </motion.span>
                      </div>

                      <div className="
                        mt-4 h-1.5
                        overflow-hidden
                        rounded-full
                        bg-stone-200
                      ">
                        <motion.div
                          initial={{
                            width: "0%",
                          }}
                          animate={{
                            width: `${skill.progress}%`,
                          }}
                          transition={{
                            duration:
                              prefersReducedMotion
                                ? 0
                                : 0.85,
                            delay:
                              prefersReducedMotion
                                ? 0
                                : 0.8 +
                                  index * 0.08,
                            ease: "easeOut",
                          }}
                          className="
                            h-full rounded-full
                            bg-teal-900
                          "
                        />
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          </CursorCard>

          {/* ROADMAP PREVIEW */}

          <CursorCard
            intensity={2.2}
            delay={0.54}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: [0, 4, -4, 0],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  flex size-9
                  items-center justify-center
                  rounded-md
                  bg-[#fff0e7]
                  text-orange-700
                "
              >
                <Map
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.span>

              <div>
                <p className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-orange-700
                ">
                  Your direction
                </p>

                <h2 className="
                  mt-1 text-xl
                  font-semibold
                  tracking-[-0.02em]
                ">
                  A practical path from here.
                </h2>
              </div>
            </div>

            <div className="relative mt-7">
              <div
                aria-hidden="true"
                className="
                  absolute left-[15px]
                  top-4 bottom-4
                  w-px bg-stone-200
                "
              />

              <div className="space-y-5">
                {roadmapSteps.map(
                  (step, index) => (
                    <motion.div
                      key={step.number}
                      initial={
                        prefersReducedMotion
                          ? false
                          : {
                              opacity: 0,
                              x: -10,
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
                            : 0.45,
                        delay:
                          prefersReducedMotion
                            ? 0
                            : 0.7 +
                              index * 0.1,
                      }}
                      className="
                        relative flex gap-4
                      "
                    >
                      <motion.div
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : {
                                scale: 1.12,
                              }
                        }
                        className={[
                          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold",
                          index === 0
                            ? "border-teal-950 bg-teal-950 text-orange-300"
                            : "border-stone-200 bg-white text-stone-400",
                        ].join(" ")}
                      >
                        {step.number}
                      </motion.div>

                      <div className="min-w-0 flex-1 pb-1">
                        <div className="
                          flex flex-wrap
                          items-center gap-2
                        ">
                          <h3 className="
                            text-sm
                            font-semibold
                            text-stone-800
                          ">
                            {step.title}
                          </h3>

                          <span className="
                            rounded-full
                            bg-stone-100
                            px-2 py-0.5
                            text-[9px]
                            font-medium
                            text-stone-500
                          ">
                            {step.status}
                          </span>
                        </div>

                        <p className="
                          mt-1.5
                          text-xs leading-5
                          text-stone-500
                        ">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </div>

            <motion.a
              href="/learning"
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { y: -2 }
              }
              className="
                group mt-6
                inline-flex
                items-center gap-2
                text-xs font-semibold
                text-teal-950
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
              "
            >
              Open full roadmap

              <ArrowRight
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1.5
                "
              />
            </motion.a>
          </CursorCard>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN                                                        */}
        {/* ================================================================== */}

        <aside className="space-y-5">
          {/* WHY THIS FITS */}

          <CursorCard
            intensity={2.3}
            delay={0.48}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
            "
          >
            <div className="
              flex items-start
              justify-between gap-4
            ">
              <div>
                <p className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-teal-950
                ">
                  Why this direction
                </p>

                <h2 className="
                  mt-2 text-xl
                  font-semibold
                  tracking-[-0.02em]
                ">
                  What already works.
                </h2>
              </div>

              <Lightbulb
                size={19}
                strokeWidth={1.7}
                className="text-orange-500"
                aria-hidden="true"
              />
            </div>

            <div className="mt-5 space-y-3">
              {[
                "You have a foundation in technical problem solving.",
                "Your current interests overlap with analytical work.",
                "Your next gaps are specific and learnable.",
              ].map((text, index) => (
                <motion.div
                  key={text}
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
                        : 0.4,
                    delay:
                      prefersReducedMotion
                        ? 0
                        : 0.72 +
                          index * 0.07,
                  }}
                  className="
                    flex items-start
                    gap-2.5
                  "
                >
                  <span className="
                    mt-0.5 flex size-5
                    shrink-0 items-center
                    justify-center
                    rounded-full
                    bg-[#edf5f1]
                    text-teal-950
                  ">
                    <Check
                      size={11}
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                  </span>

                  <p className="
                    text-xs leading-5
                    text-stone-600
                  ">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </CursorCard>

          {/* OTHER DIRECTIONS */}

          <CursorCard
            intensity={2}
            delay={0.62}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
            "
          >
            <p className="
              text-[10px]
              font-bold uppercase
              tracking-[0.12em]
              text-teal-950
            ">
              Explore other directions
            </p>

            <h2 className="
              mt-2 text-xl
              font-semibold
              tracking-[-0.02em]
            ">
              Your profile isn't one-dimensional.
            </h2>

            <div className="mt-5 space-y-2">
              {alternativeRoles.map(
                (role, index) => {
                  const Icon = role.icon;
                  const selected =
                    selectedRole === role.title;

                  return (
                    <motion.button
                      key={role.title}
                      type="button"
                      onClick={() =>
                        setSelectedRole(
                          role.title
                        )
                      }
                      initial={
                        prefersReducedMotion
                          ? false
                          : {
                              opacity: 0,
                              x: 10,
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
                            : 0.72 +
                              index * 0.07,
                      }}
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { x: 3 }
                      }
                      className={[
                        "group flex w-full items-center gap-3 rounded-md border p-3 text-left transition-[border-color,background-color,box-shadow] duration-200",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                        selected
                          ? "border-teal-900/20 bg-[#edf5f1] shadow-[0_7px_18px_rgba(6,78,59,0.05)]"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:bg-[#faf7f0]/60",
                      ].join(" ")}
                    >
                      <span className="
                        flex size-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        bg-white
                        text-teal-950
                      ">
                        <Icon
                          size={15}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="
                          block truncate
                          text-xs font-semibold
                          text-stone-800
                        ">
                          {role.title}
                        </span>

                        <span className="
                          mt-0.5 block
                          text-[10px]
                          text-stone-400
                        ">
                          {role.fit}% current fit
                        </span>
                      </span>

                      <ChevronRight
                        size={14}
                        strokeWidth={1.7}
                        className="
                          shrink-0
                          text-stone-300
                          transition-transform
                          duration-200
                          group-hover:translate-x-0.5
                          group-hover:text-teal-900
                        "
                        aria-hidden="true"
                      />
                    </motion.button>
                  );
                }
              )}
            </div>
          </CursorCard>

          {/* CTA */}

          <motion.a
            href="/learning"
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 22 }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration:
                prefersReducedMotion ? 0 : 0.65,
              delay:
                prefersReducedMotion ? 0 : 0.82,
              ease: pageEase,
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { y: -4 }
            }
            className="
              group block
              rounded-lg
              border border-teal-950
              bg-teal-950
              p-6 text-white
              shadow-[0_12px_32px_rgba(6,78,59,0.10)]
              transition-shadow duration-300
              hover:shadow-[0_22px_42px_rgba(6,78,59,0.18)]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-teal-800
             transition-[transform,box-shadow] duration-300 ease-out will-change-transform"
          
              onPointerMove={(event) => handleSurfaceMove(event, 2.4)}
              onPointerLeave={resetSurface}
              style={{
                "--cursor-x": "50%",
                "--cursor-y": "50%",
                "--cursor-opacity": "0",
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 opacity-[var(--cursor-opacity)] transition-opacity duration-200"
                style={{
                  background:
                    "radial-gradient(circle 220px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.16), transparent 72%)",
                }}
              />

            <div className="
              flex size-10
              items-center justify-center
              rounded-md
              bg-white/[0.08]
              text-orange-300
            ">
              <TrendingUp
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <p className="
              mt-5 text-[10px]
              font-bold uppercase
              tracking-[0.12em]
              text-orange-300
            ">
              Turn insight into action
            </p>

            <h2 className="
              mt-2 text-xl
              font-semibold
              tracking-[-0.02em]
            ">
              Start building your next skill.
            </h2>

            <p className="
              mt-2 text-xs
              leading-5 text-white/55
            ">
              Follow a focused learning path
              instead of trying to learn everything
              at once.
            </p>

            <span className="
              mt-5 inline-flex
              items-center gap-2
              text-xs font-semibold
              text-white
            ">
              Explore learning roadmap

              <ArrowRight
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1.5
                "
              />
            </span>
          </motion.a>
        </aside>
      </section>

      {/* ================================================================== */}
      {/* FOOT NOTE                                                            */}
      {/* ================================================================== */}

      <motion.div
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 10 }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration:
            prefersReducedMotion ? 0 : 0.55,
          delay:
            prefersReducedMotion ? 0 : 1.05,
          ease: pageEase,
        }}
        className="
          mt-6 flex items-start
          gap-3 rounded-md
          border border-stone-200
          bg-white/60
          px-5 py-4
        "
      >
        <Sparkles
          size={15}
          strokeWidth={1.7}
          className="
            mt-0.5 shrink-0
            text-teal-900
          "
          aria-hidden="true"
        />

        <p className="
          text-[11px]
          leading-5 text-stone-500
        ">
          These insights are a starting point, not a permanent
          label. Your recommended direction can evolve as your
          skills, projects and interests grow.
        </p>
      </motion.div>
    </div>
  );
};

export default CareerInsights;