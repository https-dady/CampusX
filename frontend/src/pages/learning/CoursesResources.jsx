import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  Filter,
  PlayCircle,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const resources = [
  {
    id: 1,
    title: "SQL for Data Analysis",
    description:
      "Build practical SQL foundations for querying, filtering, joining, and analysing structured data.",
    provider: "NPTEL",
    type: "Course",
    duration: "8 weeks",
    skill: "SQL",
    level: "Foundation",
    accent: "teal",
  },
  {
    id: 2,
    title: "Python for Data Analysis",
    description:
      "Learn the Python foundations needed to work with datasets and perform practical analysis.",
    provider: "SWAYAM",
    type: "Course",
    duration: "6 weeks",
    skill: "Python",
    level: "Core skills",
    accent: "orange",
  },
  {
    id: 3,
    title: "Data Analysis with Pandas",
    description:
      "Work with tabular datasets and turn raw data into useful analytical insights.",
    provider: "Learning source",
    type: "Learning",
    duration: "4 weeks",
    skill: "Pandas",
    level: "Core skills",
    accent: "teal",
  },
  {
    id: 4,
    title: "Power BI Fundamentals",
    description:
      "Understand dashboards, visualisation, and how to communicate analytical findings clearly.",
    provider: "Microsoft Learn",
    type: "Learning",
    duration: "3 weeks",
    skill: "Power BI",
    level: "Visualisation",
    accent: "orange",
  },
  {
    id: 5,
    title: "Data Storytelling",
    description:
      "Develop the ability to present analytical findings through clear and meaningful visual stories.",
    provider: "Learning source",
    type: "Learning",
    duration: "2 weeks",
    skill: "Storytelling",
    level: "Visualisation",
    accent: "teal",
  },
  {
    id: 6,
    title: "Build a Data Analyst Case Study",
    description:
      "Bring your analysis, visualisation, and communication skills together in a practical project.",
    provider: "CampusX roadmap",
    type: "Project",
    duration: "4 weeks",
    skill: "Projects",
    level: "Proof of work",
    accent: "orange",
  },
];

const filters = ["All", "SQL", "Python", "Power BI", "Projects"];

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

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    card.style.transform = `
      perspective(1100px)
      translate3d(${px * 4}px, ${py * 4 - 1}px, 0)
      rotateX(${-py * intensity}deg)
      rotateY(${px * intensity}deg)
    `;

    card.style.setProperty("--cursor-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--cursor-y", `${(y / rect.height) * 100}%`);
    card.style.setProperty("--cursor-opacity", "1");
  };

  const resetCard = (event) => {
    if (prefersReducedMotion) return;

    const card = event.currentTarget;

    card.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    card.style.setProperty("--cursor-opacity", "0");
  };

  return (
    <motion.article
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 20 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.55,
        delay: prefersReducedMotion ? 0 : delay,
        ease: pageEase,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
      className={`relative overflow-hidden transition-[transform,box-shadow,border-color] duration-300 ease-out ${className}`}
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

const CoursesResources = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredResources = useMemo(() => {
    if (activeFilter === "All") return resources;

    return resources.filter(
      (resource) => resource.skill === activeFilter
    );
  }, [activeFilter]);

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* PAGE HEADER */}
      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.6,
          ease: pageEase,
        }}
        aria-labelledby="courses-title"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Courses & resources
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1
              id="courses-title"
              className="font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl"
            >
              Learn what moves you forward.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
              Explore learning resources mapped to your current Data
              Analyst roadmap, so every course has a reason to be
              here.
            </p>
          </div>

          <div className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-600 shadow-[0_3px_12px_rgba(28,25,23,0.04)] lg:self-auto">
            <BookOpen
              size={15}
              strokeWidth={1.7}
              className="text-teal-900"
              aria-hidden="true"
            />
            Data Analyst path
          </div>
        </div>
      </motion.section>

      {/* FEATURED RESOURCE */}
      <CursorCard
        intensity={2.3}
        delay={0.2}
        cursorColor="rgba(255,255,255,0.13)"
        className="mt-8 rounded-lg border border-teal-950 bg-teal-950 p-6 text-white shadow-[0_18px_45px_rgba(6,78,59,0.13)] sm:p-8"
      >
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-300 px-2.5 py-1 text-[10px] font-bold text-teal-950">
                NEXT SKILL
              </span>

              <span className="text-[11px] font-medium text-stone-300">
                From your roadmap
              </span>
            </div>

            <h2 className="mt-4 max-w-2xl font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              Build your Python analysis foundation.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
              Your next step is to move beyond individual queries
              and start working with real datasets using Python.
            </p>
          </div>

          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
            <PlayCircle
              size={27}
              strokeWidth={1.5}
              className="text-orange-300"
              aria-hidden="true"
            />
          </div>
        </div>
      </CursorCard>

      {/* FILTERS */}
      <section
        className="mt-9"
        aria-labelledby="resource-library-title"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Resource library
            </p>

            <h2
              id="resource-library-title"
              className="mt-2 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] text-[#10231f]"
            >
              Pick your next skill.
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Filter
              size={14}
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <span>{filteredResources.length} resources</span>
          </div>
        </div>

        <div
          className="mt-5 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter resources by skill"
        >
          {filters.map((filter) => {
            const active = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={active}
                className={`
                  min-h-9 rounded-full
                  border px-3.5
                  text-xs font-semibold
                  transition-[background-color,border-color,color,transform]
                  duration-200
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-teal-800
                  ${
                    active
                      ? "border-teal-950 bg-teal-950 text-white"
                      : "border-stone-200 bg-white text-stone-500 hover:-translate-y-0.5 hover:border-stone-300 hover:text-teal-950"
                  }
                `}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      {/* RESOURCE GRID */}
      <motion.section
        layout
        className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        aria-label="Learning resources"
      >
        {filteredResources.map((resource, index) => (
          <CursorCard
            key={resource.id}
            intensity={2.1}
            delay={0.1 + index * 0.07}
            cursorColor={
              resource.accent === "orange"
                ? "rgba(234,88,12,0.08)"
                : "rgba(15,118,110,0.08)"
            }
            className="flex h-full flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] hover:border-stone-300 hover:shadow-[0_16px_34px_rgba(28,25,23,0.07)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <span
                className={`
                  inline-flex min-h-7
                  items-center rounded-full
                  px-2.5
                  text-[10px] font-bold
                  ${
                    resource.accent === "orange"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-[#dcefe9] text-teal-950"
                  }
                `}
              >
                {resource.level}
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">
                {resource.type}
              </span>
            </div>

            <div className="mt-5 flex-1">
              <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#10231f]">
                {resource.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                {resource.description}
              </p>
            </div>

            <div className="mt-6 border-t border-stone-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                    <Clock3
                      size={13}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    {resource.duration}
                  </span>

                  <span className="h-3.5 w-px bg-stone-200" />

                  <span className="text-[11px] font-semibold text-stone-500">
                    {resource.skill}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-400">
                  {resource.provider}
                </span>

                <a
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="group inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-teal-950 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                  aria-label={`Open ${resource.title}`}
                >
                  Explore
                  <ExternalLink
                    size={13}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </div>
          </CursorCard>
        ))}
      </motion.section>

      {/* ROADMAP CONNECTION */}
      <CursorCard
        intensity={2.2}
        delay={0.55}
        cursorColor="rgba(15,118,110,0.07)"
        className="mt-8 rounded-lg border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#dcefe9] text-teal-950">
              <Check
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                Stay on track
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#10231f]">
                Your courses follow your roadmap.
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500">
                Use the roadmap to understand the order, then use
                these resources to build each skill.
              </p>
            </div>
          </div>

          <a
            href="/learning"
            className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-xs font-semibold text-stone-700 shadow-[0_3px_10px_rgba(28,25,23,0.04)] transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-800/30 hover:bg-[#fcfffd] hover:text-teal-950 hover:shadow-[0_7px_16px_rgba(28,25,23,0.07)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
          >
            View roadmap
            <ArrowRight
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>
        </div>
      </CursorCard>
    </div>
  );
};

export default CoursesResources;