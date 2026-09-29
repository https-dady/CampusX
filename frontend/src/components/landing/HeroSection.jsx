import { useRef } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import heroImage from "../../assets/hero.png";

const trustPoints = [
  "12-min skill check",
  "Dream-job roadmap",
  "Free for students",
];

const roadmapSteps = [
  {
    number: "01",
    title: "Strengthen SQL",
    status: "Current focus",
    complete: true,
  },
  {
    number: "02",
    title: "Learn Power BI",
    status: "Next up",
    complete: false,
  },
  {
    number: "03",
    title: "Build a dashboard",
    status: "Then",
    complete: false,
  },
];

const HeroSection = () => {
  const visualRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const handlePointerMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !visualRef.current
    ) {
      return;
    }

    const rect = visualRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 4;
    const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 4;

    visualRef.current.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-4px)
    `;
  };

  const resetVisual = () => {
    if (!visualRef.current || prefersReducedMotion) {
      return;
    }

    visualRef.current.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0)
    `;
  };

  return (
    <section
      className="relative isolate min-h-[700px] overflow-hidden bg-teal-950 sm:min-h-[760px] lg:min-h-[820px]"
      aria-labelledby="hero-title"
    >
      {/* Background Image */}
      <motion.div
  initial={
    prefersReducedMotion
      ? { opacity: 1, scale: 1 }
      : { opacity: 0, scale: 1.04 }
  }
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 1.4,
    delay: prefersReducedMotion ? 0 : 0.05,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="absolute inset-0 -z-30 origin-center"
  aria-hidden="true"
>
  <img
    src={heroImage}
    alt=""
    fetchPriority="high"
    className="h-full w-full object-cover object-center"
  />
</motion.div>

      {/* Base Overlay */}
      <div
        className="absolute inset-0 -z-20 bg-teal-950/50"
        aria-hidden="true"
      />

      {/* Directional Gradient */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-950/90 via-teal-950/65 to-teal-950/20"
        aria-hidden="true"
      />

      {/* Bottom Depth */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-teal-950/70 to-transparent"
        aria-hidden="true"
      />

      {/* Decorative light */}
      <div
        aria-hidden="true"
        className="absolute -right-40 top-20 -z-10 size-[520px] rounded-full bg-orange-300/5 blur-3xl"
      />

      <div className="mx-auto flex min-h-[700px] max-w-[1216px] items-center px-5 pb-16 pt-28 sm:min-h-[760px] sm:pb-20 sm:pt-32 lg:min-h-[820px] lg:px-0 lg:pb-20 lg:pt-28">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          {/* Hero Copy */}
          <div className="relative z-10 w-full max-w-[570px]">
            {/* Eyebrow */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 22 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-teal-950/25 px-3 py-1.5 backdrop-blur-md transition-colors duration-200 hover:border-white/30 hover:bg-teal-950/40"
            >
              <Sparkles
                size={13}
                strokeWidth={1.8}
                className="shrink-0 text-orange-300"
                aria-hidden="true"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/90 sm:text-[11px]">
                Career clarity, built around you
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              id="hero-title"
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 42 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="max-w-[560px] font-['Newsreader'] text-[42px] font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:text-[52px] lg:text-[60px]"
            >
              Your campus
              <br />
              years deserve
              <br />
              a{" "}
              <span className="text-orange-300 transition-colors duration-300 hover:text-orange-200">
                real
                <br />
                direction.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 28 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.34,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-6 max-w-[500px] text-sm leading-6 text-white/75 sm:text-[15px] sm:leading-6"
            >
              Map your dream role, assess where you stand, and follow a clear
              plan built for students stepping into the professional world.
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 24 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.46,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <a
                href="/signup"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-orange-300 px-5 text-sm font-semibold text-teal-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-200 hover:shadow-[0_12px_30px_rgba(251,191,36,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 active:translate-y-0"
              >
                Build my career roadmap

                <ArrowRight
                  size={15}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 bg-teal-950/15 px-5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-0"
              >
                See how it works
              </a>
            </motion.div>

            {/* Trust Points */}
            <motion.ul
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 20 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.58,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5"
            >
              {trustPoints.map((point) => (
                <li
                  key={point}
                  className="group flex items-center gap-1.5 text-xs text-white/70 transition-colors duration-200 hover:text-white/90"
                >
                  <span className="flex size-4 items-center justify-center rounded-full bg-white/5 transition-colors duration-200 group-hover:bg-orange-300/15">
                    <Check
                      size={11}
                      strokeWidth={2.2}
                      className="text-orange-300"
                      aria-hidden="true"
                    />
                  </span>

                  <span>{point}</span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Interactive 3D Visual */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, x: 45, y: 25, scale: 0.96 }
            }
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={{
              duration: 1.15,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative hidden min-h-[500px] items-center justify-center lg:flex"
          >
            {/* Floating glow */}
            <div
              aria-hidden="true"
              className="absolute right-[8%] top-[8%] size-72 rounded-full bg-orange-300/10 blur-3xl"
            />

            {/* Decorative floating element */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -10, 0],
                      rotate: [0, 2, 0],
                    }
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-[8%] top-[5%] z-20 flex size-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-orange-300 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl"
              aria-hidden="true"
            >
              <TrendingUp
                size={23}
                strokeWidth={1.7}
              />
            </motion.div>

            {/* Main 3D card */}
            <div
              ref={visualRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetVisual}
              className="relative w-full max-w-[470px] transform-gpu transition-transform duration-300 ease-out"
            >
              {/* Back layer */}
              <div
                aria-hidden="true"
                className="absolute -right-4 -top-4 h-full w-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm"
              />

              {/* Main glass card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.10] p-5 shadow-[0_35px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                {/* Card shine */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-white/10 blur-3xl"
                />

                {/* Header */}
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
                      Your career roadmap
                    </p>

                    <h2 className="mt-1.5 font-['Newsreader'] text-2xl font-semibold text-white">
                      Data Analyst
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1.5">
                    <span
                      className="size-1.5 rounded-full bg-emerald-300"
                      aria-hidden="true"
                    />

                    <span className="text-[9px] font-semibold text-emerald-200">
                      88% fit
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="relative mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-medium text-white/45">
                      Roadmap progress
                    </span>

                    <span className="text-[9px] font-semibold text-white/70">
                      32%
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? { width: "32%" }
                          : { width: "0%" }
                      }
                      animate={{ width: "32%" }}
                      transition={{
                        duration: 1.4,
                        delay: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-full rounded-full bg-orange-300"
                    />
                  </div>
                </div>

                {/* Skill cards */}
                <div className="relative mt-6 grid grid-cols-3 gap-2.5">
                  {["Excel", "SQL", "Storytelling"].map((skill) => (
                    <div
                      key={skill}
                      className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                    >
                      <Check
                        size={13}
                        strokeWidth={2}
                        className="text-orange-300"
                        aria-hidden="true"
                      />

                      <p className="mt-2 text-[9px] font-medium text-white/70">
                        {skill}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Next skill */}
                <div className="relative mt-5 flex items-center gap-3 rounded-xl border border-orange-300/20 bg-orange-300/[0.07] p-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-300/10 text-orange-300">
                    <Target
                      size={17}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-orange-200/70">
                      Next skill
                    </p>

                    <p className="mt-0.5 text-xs font-semibold text-white">
                      Power BI
                    </p>
                  </div>

                  <span className="ml-auto shrink-0 text-[9px] text-white/40">
                    2 weeks
                  </span>
                </div>

                {/* Roadmap */}
                <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/10">
                  {roadmapSteps.map((step) => (
                    <div
                      key={step.number}
                      className="group flex items-center gap-3 border-b border-white/10 px-3.5 py-3 last:border-b-0 transition-colors duration-200 hover:bg-white/[0.05]"
                    >
                      <span
                        className={[
                          "flex size-7 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold",
                          step.complete
                            ? "bg-orange-300 text-teal-950"
                            : "border border-white/15 bg-white/5 text-white/60",
                        ].join(" ")}
                      >
                        {step.complete ? (
                          <Check
                            size={11}
                            strokeWidth={2.2}
                            aria-hidden="true"
                          />
                        ) : (
                          step.number
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-white/85">
                          {step.title}
                        </p>

                        <p className="mt-0.5 text-[8px] text-white/35">
                          {step.status}
                        </p>
                      </div>

                      <CircleCheck
                        size={14}
                        strokeWidth={1.5}
                        className="text-white/20 transition-colors duration-200 group-hover:text-orange-300/60"
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>

                {/* Bottom stats */}
                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
                    <div className="flex items-center gap-2">
                      <BarChart3
                        size={14}
                        strokeWidth={1.7}
                        className="text-orange-300"
                        aria-hidden="true"
                      />

                      <span className="text-[8px] uppercase tracking-[0.12em] text-white/40">
                        Skills
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm font-semibold text-white">
                      6 / 9
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
                    <div className="flex items-center gap-2">
                      <Target
                        size={14}
                        strokeWidth={1.7}
                        className="text-orange-300"
                        aria-hidden="true"
                      />

                      <span className="text-[8px] uppercase tracking-[0.12em] text-white/40">
                        Timeline
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm font-semibold text-white">
                      12 weeks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating mini card */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, 8, 0],
                      rotate: [0, -1, 0],
                    }
              }
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-1 left-[2%] z-30 rounded-xl border border-white/15 bg-teal-950/70 p-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl"
            >
              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/40">
                Next milestone
              </p>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-orange-300/10 text-orange-300">
                  <Target
                    size={12}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>

                <span className="text-[10px] font-semibold text-white">
                  Power BI
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;