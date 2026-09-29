import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  FileSearch,
  Map,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const stats = [
  {
    label: "Career readiness",
    value: "68%",
    note: "You are building a solid foundation.",
    dark: true,
    icon: Target,
  },
  {
    label: "Resume readiness",
    value: "72%",
    note: "Strong base · 3 improvements",
    icon: FileSearch,
  },
  {
    label: "Current plan",
    value: "2 / 5",
    note: "Milestones completed",
    icon: Map,
  },
  {
    label: "Skill evidence",
    value: "82%",
    note: "Analysis",
    icon: BarChart3,
  },
];

const roadmapSteps = [
  {
    title: "Know your baseline",
    time: "This week",
    complete: true,
  },
  {
    title: "Build SQL foundations",
    time: "Weeks 2–4",
    complete: true,
  },
  {
    title: "Create a case study",
    time: "Weeks 5–8",
    complete: false,
  },
];

const Overview = () => {
  const prefersReducedMotion = useReducedMotion();
  const quoteRef = useRef(null);

  const handleQuoteMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !quoteRef.current
    ) {
      return;
    }

    const rect = quoteRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 1.8;
    const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 1.8;

    quoteRef.current.style.transform = `
      perspective(900px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-2px)
    `;
  };

  const resetQuote = () => {
    if (!quoteRef.current || prefersReducedMotion) return;

    quoteRef.current.style.transform = `
      perspective(900px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0)
    `;
  };

  const handleSurfaceMove = (event, intensity = 2.2) => {
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

  const reveal = {
    hidden: prefersReducedMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* PAGE INTRO */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={reveal}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.65,
          ease: [0.22, 1, 0.36, 1],
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
          Good to see you, Lakshmi.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
          Here is what matters today. You do not need to solve your whole
          future at once.
        </p>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            delay: prefersReducedMotion ? 0 : 0.18,
          }}
          className="mt-6"
        >
          <a
            href="/resume-analysis"
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
          </a>
        </motion.div>
      </motion.section>

      {/* SUMMARY CARDS */}
      <section
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Career summary"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.article
              key={stat.label}
              initial={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 22 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.55,
                delay: prefersReducedMotion ? 0 : 0.25 + index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={[
                "group relative min-h-[154px] overflow-hidden rounded-lg border p-5",
                "transition-[border-color,box-shadow] duration-300",
                stat.dark
                  ? "border-teal-950 bg-teal-950 text-white shadow-[0_14px_36px_rgba(6,78,59,0.12)]"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-[0_14px_36px_rgba(28,25,23,0.06)]",
              ].join(" ")}
              onPointerMove={(event) => handleSurfaceMove(event, 2.2)}
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
                    strokeWidth={1.7}
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
                  stat.dark ? "text-white/60" : "text-stone-500",
                ].join(" ")}
              >
                {stat.note}
              </p>

              {stat.dark && (
                <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={
                      prefersReducedMotion
                        ? { width: "68%" }
                        : { width: "0%" }
                    }
                    animate={{ width: "68%" }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 1,
                      delay: prefersReducedMotion ? 0 : 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full rounded-full bg-orange-300"
                  />
                </div>
              )}
            </motion.article>
          );
        })}
      </section>

      {/* NEXT STEP + QUOTE */}
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.75fr]">
        <motion.article
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 22 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.65,
            delay: prefersReducedMotion ? 0 : 0.55,
          }}
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] transition-[box-shadow,border-color] duration-300 hover:border-stone-300 hover:shadow-[0_14px_34px_rgba(28,25,23,0.05)] sm:p-7 transition-[transform,box-shadow] duration-300 ease-out will-change-transform"
              onPointerMove={(event) => handleSurfaceMove(event, 2.2)}
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
                    "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.38), transparent 72%)",
                }}
              />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                Your next useful step
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#10231f]">
                Complete your career baseline
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                Four thoughtful answers will help sharpen your role matches
                and learning priorities.
              </p>
            </div>

            <motion.span
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -2, 0],
                    }
              }
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-full bg-[#dcefe9] px-3 py-1 text-[11px] font-semibold text-teal-950"
            >
              4 minutes
            </motion.span>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-500">
              <span>Resume preparation</span>
              <span>72%</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { width: "72%" }
                    : { width: "0%" }
                }
                animate={{ width: "72%" }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 1.15,
                  delay: prefersReducedMotion ? 0 : 0.75,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-full bg-teal-950"
              />
            </div>
          </div>

          <a
            href="/assessment"
            className="group mt-6 inline-flex min-h-10 items-center gap-2 rounded-md bg-teal-950 px-4 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(6,78,59,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-900 hover:shadow-[0_10px_24px_rgba(6,78,59,0.13)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800 active:translate-y-0"
          >
            Choose my next direction

            <ArrowRight
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>
        </motion.article>

        <motion.aside
          ref={quoteRef}
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 22 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.7,
            delay: prefersReducedMotion ? 0 : 0.68,
          }}
          onPointerMove={handleQuoteMove}
          onPointerLeave={resetQuote}
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

      {/* LOWER CONTENT */}
      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* ROADMAP */}
        <motion.article
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 22 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.65,
            delay: prefersReducedMotion ? 0 : 0.8,
          }}
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7 transition-[transform,box-shadow] duration-300 ease-out will-change-transform"
              onPointerMove={(event) => handleSurfaceMove(event, 2.2)}
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
                    "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.38), transparent 72%)",
                }}
              />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                Learning roadmap
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                Your path to data analysis
              </h2>
            </div>

            <a
              href="/learning-roadmap"
              className="group inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
            >
              View plan
              <ArrowRight
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>
          </div>

          <ol className="mt-7 space-y-5">
            {roadmapSteps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -12 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  delay: prefersReducedMotion ? 0 : 1 + index * 0.1,
                }}
                className="flex items-start gap-3"
              >
                <span
                  className={[
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-transform duration-200 hover:scale-105",
                    step.complete
                      ? "bg-teal-950 text-white"
                      : "border border-stone-300 bg-white text-stone-500",
                  ].join(" ")}
                >
                  {step.complete ? (
                    <Check size={13} strokeWidth={2.3} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>

                <div>
                  <p className="text-sm font-semibold text-[#10231f]">
                    {step.title}
                  </p>

                  <p className="mt-0.5 text-[11px] text-stone-500">
                    {step.time}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </motion.article>

        {/* RECOMMENDED COURSE */}
        <motion.article
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 22 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.65,
            delay: prefersReducedMotion ? 0 : 0.9,
          }}
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7 transition-[transform,box-shadow] duration-300 ease-out will-change-transform"
              onPointerMove={(event) => handleSurfaceMove(event, 2.2)}
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
                    "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.38), transparent 72%)",
                }}
              />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                Keep learning
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                Recommended for your next step
              </h2>
            </div>

            <BookOpen
              size={20}
              strokeWidth={1.7}
              className="text-teal-950"
              aria-hidden="true"
            />
          </div>

          <motion.div
            className="mt-6 rounded-md bg-[#f2eee5] p-5 transition-shadow duration-300 hover:shadow-[0_10px_26px_rgba(28,25,23,0.05)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Micro course · 4 weeks
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              SQL for Data Science
            </h3>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              Build the query skills most entry-level analyst roles ask for.
            </p>

            <div className="mt-5 h-1.5 w-24 overflow-hidden rounded-full bg-teal-950/10">
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { width: "100%" }
                    : { width: "0%" }
                }
                animate={{ width: "100%" }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.8,
                  delay: prefersReducedMotion ? 0 : 1.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-full bg-teal-950"
              />
            </div>
          </motion.div>

          <a
            href="/courses-resources"
            className="group mt-4 inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-800/30 hover:text-teal-950 hover:shadow-[0_6px_18px_rgba(28,25,23,0.05)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          >
            Explore resources

            <ArrowRight
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>
        </motion.article>
      </section>
    </div>
  );
};

export default Overview;