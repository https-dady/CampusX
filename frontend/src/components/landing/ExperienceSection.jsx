import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  Target,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import ScrollReveal from "../common/ScrollReveal";

const roles = {
  "Data Analyst": {
    fit: "88%",
    fitLabel: "role fit",
    skills: ["Excel", "SQL", "Data storytelling"],
    nextSkill: "Power BI",
    duration: "12 weeks",
    description:
      "Build the analytical skills and practical proof needed to move confidently toward a data analyst role.",
    steps: [
      {
        number: "01",
        title: "Strengthen SQL",
        status: "Current focus",
      },
      {
        number: "02",
        title: "Learn Power BI",
        status: "Next up",
      },
      {
        number: "03",
        title: "Build a dashboard",
        status: "Then",
      },
      {
        number: "04",
        title: "Prepare for interviews",
        status: "Final step",
      },
    ],
  },

  "UX Designer": {
    fit: "82%",
    fitLabel: "role fit",
    skills: ["Figma", "Wireframing", "User research"],
    nextSkill: "Design systems",
    duration: "14 weeks",
    description:
      "Build a practical UX foundation with projects and skills that connect directly to the role.",
    steps: [
      {
        number: "01",
        title: "Strengthen Figma",
        status: "Current focus",
      },
      {
        number: "02",
        title: "Learn design systems",
        status: "Next up",
      },
      {
        number: "03",
        title: "Build a case study",
        status: "Then",
      },
      {
        number: "04",
        title: "Prepare your portfolio",
        status: "Final step",
      },
    ],
  },

  "Product Manager": {
    fit: "76%",
    fitLabel: "role fit",
    skills: ["Product thinking", "Research", "Communication"],
    nextSkill: "Product analytics",
    duration: "16 weeks",
    description:
      "Develop product thinking, research, and execution skills through structured practical work.",
    steps: [
      {
        number: "01",
        title: "Strengthen product thinking",
        status: "Current focus",
      },
      {
        number: "02",
        title: "Learn product analytics",
        status: "Next up",
      },
      {
        number: "03",
        title: "Build a product case",
        status: "Then",
      },
      {
        number: "04",
        title: "Prepare for interviews",
        status: "Final step",
      },
    ],
  },
};

const roleNames = Object.keys(roles);

const getPanelId = (roleName) =>
  `role-panel-${roleName.toLowerCase().replaceAll(" ", "-")}`;

const ExperienceSection = () => {
  const [activeRole, setActiveRole] = useState(roleNames[0]);
  const roadmapRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const role = roles[activeRole];

  const handlePointerMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !roadmapRef.current
    ) {
      return;
    }

    const rect = roadmapRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 2.5;
    const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 2.5;

    roadmapRef.current.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(4px)
    `;
  };

  const resetRoadmap = () => {
    if (!roadmapRef.current || prefersReducedMotion) {
      return;
    }

    roadmapRef.current.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0)
    `;
  };

  const changeRole = (roleName) => {
    setActiveRole(roleName);
  };

  const handleTabKeyDown = (event, currentRole) => {
    const currentIndex = roleNames.indexOf(currentRole);

    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % roleNames.length;
    }

    if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + roleNames.length) % roleNames.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = roleNames.length - 1;
    }

    if (nextIndex === currentIndex) {
      return;
    }

    event.preventDefault();

    const nextRole = roleNames[nextIndex];

    changeRole(nextRole);

    requestAnimationFrame(() => {
      document
        .getElementById(`tab-${getPanelId(nextRole)}`)
        ?.focus();
    });
  };

  return (
    <section
      id="career-roadmap"
      className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
      aria-labelledby="experience-heading"
    >
      {/* Ambient depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 size-96 rounded-full bg-teal-900/[0.035] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-20 size-80 rounded-full bg-orange-300/[0.035] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1216px] px-5 lg:px-0">
        {/* Section Header */}
        <div className="max-w-[560px]">
          <ScrollReveal
            y={22}
            duration={0.8}
            amount={0.35}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800 sm:text-[11px]">
              Try the experience
            </p>
          </ScrollReveal>

          <ScrollReveal
            y={40}
            delay={0.12}
            duration={1}
            amount={0.35}
          >
            <h2
              id="experience-heading"
              className="mt-4 font-['Newsreader'] text-[38px] font-semibold leading-[1.06] tracking-[-0.025em] text-teal-950 sm:text-[44px]"
            >
              Choose a direction.
              <br />
              See the path.
            </h2>
          </ScrollReveal>

          <ScrollReveal
            y={28}
            delay={0.24}
            duration={0.9}
            amount={0.35}
          >
            <p className="mt-5 max-w-[480px] text-sm leading-6 text-stone-600 sm:text-[15px]">
              Explore what your career roadmap could look like before you
              commit to a direction.
            </p>
          </ScrollReveal>
        </div>

        {/* Roadmap Experience */}
        <ScrollReveal
          y={34}
          delay={0.15}
          duration={0.95}
          amount={0.12}
          className="mt-10"
        >
          <div
            ref={roadmapRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetRoadmap}
            className="relative overflow-hidden rounded-2xl border border-stone-200 bg-[#faf7f0] shadow-[0_12px_40px_rgba(15,59,55,0.06)] transition-transform duration-300 ease-out will-change-transform"
          >
            {/* Panel highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-32 -top-32 size-72 rounded-full bg-orange-300/[0.06] blur-3xl"
            />

            {/* Role Tabs */}
            <div className="relative border-b border-stone-200 bg-white/90 backdrop-blur-sm">
              <div
                className="flex overflow-x-auto"
                role="tablist"
                aria-label="Career roles"
              >
                {roleNames.map((roleName) => {
                  const isActive = activeRole === roleName;
                  const panelId = getPanelId(roleName);

                  return (
                    <button
                      key={roleName}
                      id={`tab-${panelId}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={panelId}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => changeRole(roleName)}
                      onKeyDown={(event) =>
                        handleTabKeyDown(event, roleName)
                      }
                      className={[
                        "relative min-h-12 min-w-max px-5 py-4 text-xs font-semibold transition-all duration-200 sm:px-7 sm:text-sm",
                        "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-700",
                        isActive
                          ? "bg-[#faf7f0] text-teal-950"
                          : "text-stone-500 hover:bg-stone-50 hover:text-teal-900",
                      ].join(" ")}
                    >
                      {roleName}

                      <span
                        aria-hidden="true"
                        className={[
                          "absolute inset-x-0 bottom-0 h-0.5 origin-center bg-orange-300 transition-transform duration-300",
                          isActive ? "scale-x-100" : "scale-x-0",
                        ].join(" ")}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Role */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                id={getPanelId(activeRole)}
                role="tabpanel"
                aria-labelledby={`tab-${getPanelId(activeRole)}`}
                tabIndex={0}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 16 }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: -10 }
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-800 sm:p-7 lg:p-9"
              >
                <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
                  {/* Role Overview */}
                  <div>
                    <div className="flex items-end gap-3">
                      <motion.span
                        initial={
                          prefersReducedMotion
                            ? { opacity: 1 }
                            : { opacity: 0, y: 15 }
                        }
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.55,
                          delay: 0.05,
                        }}
                        className="font-['Newsreader'] text-[62px] font-semibold leading-none tracking-tight text-teal-950 sm:text-[70px]"
                      >
                        {role.fit}
                      </motion.span>

                      <span className="pb-1.5 text-xs font-medium uppercase tracking-[0.1em] text-stone-500">
                        {role.fitLabel}
                      </span>
                    </div>

                    <div className="mt-5 h-px bg-stone-200" />

                    <motion.p
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: 15 }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.55,
                        delay: 0.12,
                      }}
                      className="mt-5 max-w-[390px] text-sm leading-6 text-stone-600"
                    >
                      {role.description}
                    </motion.p>

                    {/* Skills */}
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: 15 }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.55,
                        delay: 0.19,
                      }}
                      className="mt-6"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                        Your current strengths
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.skills.map((skill, index) => (
                          <motion.span
                            key={skill}
                            initial={
                              prefersReducedMotion
                                ? { opacity: 1 }
                                : { opacity: 0, y: 8 }
                            }
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.35,
                              delay: 0.22 + index * 0.06,
                            }}
                            className="group/skill inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-[#f3f8f5] hover:shadow-[0_5px_15px_rgba(15,59,55,0.06)]"
                          >
                            <Check
                              size={12}
                              strokeWidth={2}
                              className="text-teal-700 transition-transform duration-200 group-hover/skill:scale-110"
                              aria-hidden="true"
                            />

                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Next Skill */}
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: 16 }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.55,
                        delay: 0.32,
                      }}
                      className="group/next mt-6 rounded-xl border border-orange-200 bg-orange-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-[0_10px_25px_rgba(251,146,60,0.08)]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-transform duration-300 group-hover/next:scale-105">
                          <Target
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </div>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-orange-800">
                          Next skill
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-teal-950">
                        {role.nextSkill}
                      </p>
                    </motion.div>

                    {/* Duration */}
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: 12 }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: 0.4,
                      }}
                      className="mt-5 flex items-center gap-2 text-xs text-stone-500"
                    >
                      <CircleCheck
                        size={15}
                        strokeWidth={1.7}
                        className="shrink-0 text-teal-700"
                        aria-hidden="true"
                      />

                      <span>
                        Approximately{" "}
                        <strong className="font-semibold text-teal-950">
                          {role.duration}
                        </strong>{" "}
                        to job-ready
                      </span>
                    </motion.div>
                  </div>

                  {/* Roadmap */}
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                          Your roadmap
                        </p>

                        <h3 className="mt-1.5 font-['Newsreader'] text-2xl font-semibold text-teal-950">
                          Four steps to move forward
                        </h3>
                      </div>

                      <span className="hidden shrink-0 rounded-full bg-[#dcece5] px-3 py-1.5 text-[10px] font-semibold text-teal-900 sm:inline-flex">
                        {role.duration}
                      </span>
                    </div>

                    <ol className="relative mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_5px_20px_rgba(15,59,55,0.035)]">
                      {/* Connecting line */}
                      <span
                        aria-hidden="true"
                        className="absolute bottom-7 left-[29px] top-7 w-px bg-stone-200"
                      />

                      {role.steps.map((step, index) => (
                        <motion.li
                          key={step.number}
                          initial={
                            prefersReducedMotion
                              ? { opacity: 1 }
                              : { opacity: 0, x: 18 }
                          }
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            duration: 0.5,
                            delay: 0.12 + index * 0.1,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="group relative flex items-center gap-4 border-b border-stone-200 px-4 py-4 last:border-b-0 transition-colors duration-200 hover:bg-stone-50 sm:px-5"
                        >
                          {/* Step Number */}
                          <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-950 text-[10px] font-semibold text-white shadow-[0_4px_10px_rgba(15,59,55,0.12)] transition-all duration-200 group-hover:scale-105 group-hover:bg-teal-800">
                            {step.number}
                          </span>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-teal-950 transition-colors duration-200 group-hover:text-teal-800">
                              {step.title}
                            </p>

                            <p className="mt-0.5 text-[11px] text-stone-400">
                              {step.status}
                            </p>
                          </div>

                          {/* Arrow */}
                          <ChevronRight
                            size={16}
                            strokeWidth={1.7}
                            className="shrink-0 text-stone-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-teal-800"
                            aria-hidden="true"
                          />
                        </motion.li>
                      ))}
                    </ol>

                    {/* CTA */}
                    <a
                      href="/signup"
                      className="group/cta mt-5 inline-flex min-h-10 items-center gap-2 rounded-sm text-xs font-semibold text-teal-900 underline decoration-teal-900/30 underline-offset-4 transition-colors duration-200 hover:text-orange-700 hover:decoration-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
                    >
                      Build my own roadmap

                      <ArrowRight
                        size={14}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/cta:translate-x-1"
                      />
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ExperienceSection;