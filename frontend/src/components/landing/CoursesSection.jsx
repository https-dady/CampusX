import { useRef } from "react";
import { ArrowUpRight, BookOpen, Clock3, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import ScrollReveal from "../common/ScrollReveal";

const courses = [
  {
    provider: "NPTEL",
    title: "Introduction to Data Analytics",
    description:
      "Build a stronger foundation in analytical thinking, data handling, and practical problem solving.",
    category: "Data Analytics",
    duration: "8 weeks",
    level: "Beginner",
    accent: "teal",
    href: "#",
  },
  {
    provider: "SWAYAM",
    title: "Data Analysis with Python",
    description:
      "Move from concepts to practical analysis using Python, data manipulation, and visualization.",
    category: "Python",
    duration: "6 weeks",
    level: "Beginner",
    accent: "orange",
    href: "#",
  },
  {
    provider: "NPTEL",
    title: "Business Analytics",
    description:
      "Understand how analytical methods connect with business problems and real-world decisions.",
    category: "Analytics",
    duration: "12 weeks",
    level: "Intermediate",
    accent: "teal",
    href: "#",
  },
];

const CourseCard = ({ course, index }) => {
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

    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 1.7;
    const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 1.7;

    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-4px)
    `;
  };

  const resetCard = () => {
    if (!cardRef.current || prefersReducedMotion) return;

    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0)
    `;
  };

  const isOrange = course.accent === "orange";

  return (
    <motion.article
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 28 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetCard}
        className="group relative h-full transform-gpu transition-transform duration-300 ease-out will-change-transform"
      >
        {/* Depth layer */}
        <div
          aria-hidden="true"
          className={[
            "absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl border transition-transform duration-300",
            isOrange
              ? "border-orange-200/40 bg-orange-50/40 group-hover:translate-x-2 group-hover:translate-y-2"
              : "border-teal-100/70 bg-teal-50/40 group-hover:translate-x-2 group-hover:translate-y-2",
          ].join(" ")}
        />

        {/* Main card */}
        <div className="relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_30px_rgba(15,59,55,0.045)] transition-all duration-300 group-hover:border-stone-300 group-hover:shadow-[0_20px_45px_rgba(15,59,55,0.09)]">
          {/* Visual header */}
          <div
            className={[
              "relative h-[145px] overflow-hidden border-b",
              isOrange
                ? "border-orange-100 bg-orange-50"
                : "border-teal-100 bg-[#edf5f1]",
            ].join(" ")}
          >
            {/* Grid */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.055]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            {/* Glow */}
            <div
              aria-hidden="true"
              className={[
                "absolute -right-12 -top-16 size-44 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125",
                isOrange ? "bg-orange-300/25" : "bg-teal-300/25",
              ].join(" ")}
            />

            {/* Abstract course visual */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={[
                  "relative flex size-16 items-center justify-center rounded-2xl border shadow-[0_12px_30px_rgba(15,59,55,0.08)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-2",
                  isOrange
                    ? "border-orange-200 bg-white text-orange-700"
                    : "border-teal-100 bg-white text-teal-800",
                ].join(" ")}
              >
                <BookOpen
                  size={25}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <span
                  aria-hidden="true"
                  className={[
                    "absolute -right-2 -top-2 size-4 rounded-full border-2 border-white",
                    isOrange ? "bg-orange-300" : "bg-teal-700",
                  ].join(" ")}
                />
              </div>

              {/* Floating mini cards */}
              <motion.span
                aria-hidden="true"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -4, 0] }
                }
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-[22%] top-[30%] flex size-7 items-center justify-center rounded-lg border border-white/80 bg-white/80 text-[8px] font-bold text-teal-900 shadow-sm backdrop-blur-sm"
              >
                01
              </motion.span>

              <motion.span
                aria-hidden="true"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, 4, 0] }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                className="absolute right-[22%] bottom-[25%] flex size-7 items-center justify-center rounded-lg border border-white/80 bg-white/80 text-[8px] font-bold text-teal-900 shadow-sm backdrop-blur-sm"
              >
                ✓
              </motion.span>
            </div>

            {/* Provider */}
            <div className="absolute left-4 top-4">
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em]",
                  isOrange
                    ? "bg-white/80 text-orange-800"
                    : "bg-white/80 text-teal-900",
                ].join(" ")}
              >
                {course.provider}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-stone-400">
                {course.category}
              </p>

              <h3 className="mt-2 font-['Newsreader'] text-[25px] font-semibold leading-[1.08] tracking-[-0.015em] text-teal-950">
                {course.title}
              </h3>

              <p className="mt-3 text-xs leading-5 text-stone-500">
                {course.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[9px] font-medium text-stone-500">
                <Clock3
                  size={11}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                {course.duration}
              </span>

              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[9px] font-medium text-stone-500">
                {course.level}
              </span>
            </div>

            {/* Bottom action */}
            <div className="mt-auto border-t border-stone-200 pt-5">
              <a
                href={course.href}
                className="group/link inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-teal-900 transition-colors duration-200 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
                aria-label={`Explore ${course.title}`}
              >
                Explore course

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
              </a>

              <ExternalLink
                size={11}
                strokeWidth={1.7}
                aria-hidden="true"
                className="ml-2 inline-block text-stone-300"
              />
            </div>
          </div>

          {/* Bottom accent */}
          <div
            aria-hidden="true"
            className={[
              "absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
              isOrange ? "bg-orange-300" : "bg-teal-800",
            ].join(" ")}
          />
        </div>
      </div>
    </motion.article>
  );
};

const CoursesSection = () => {
  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
      aria-labelledby="courses-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/4 size-72 rounded-full bg-teal-900/[0.025] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1216px] px-5 lg:px-0">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[590px]">
            <ScrollReveal
              y={20}
              duration={0.8}
              amount={0.3}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800 sm:text-[11px]">
                Courses picked for Data Analyst
              </p>
            </ScrollReveal>

            <ScrollReveal
              y={38}
              delay={0.1}
              duration={0.9}
              amount={0.3}
            >
              <h2
                id="courses-heading"
                className="mt-4 font-['Newsreader'] text-[38px] font-semibold leading-[1.06] tracking-[-0.025em] text-teal-950 sm:text-[46px]"
              >
                Learn what moves
                <br />
                your roadmap forward.
              </h2>
            </ScrollReveal>
          </div>

          <ScrollReveal
            y={22}
            delay={0.2}
            duration={0.8}
            amount={0.3}
          >
            <p className="max-w-[370px] text-sm leading-6 text-stone-500 lg:pb-1">
              Your learning path should follow your career goal. Start with
              resources selected around the skills you actually need next.
            </p>
          </ScrollReveal>
        </div>

        {/* Course cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <CourseCard
              key={course.title}
              course={course}
              index={index}
            />
          ))}
        </div>

        {/* Source note */}
        <ScrollReveal
          y={18}
          delay={0.15}
          duration={0.75}
          amount={0.25}
        >
          <div className="mt-8 flex flex-col gap-2 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] leading-5 text-stone-400">
              Curated learning sources can change as your roadmap evolves.
            </p>

            <a
              href="#career-roadmap"
              className="inline-flex w-fit items-center gap-1.5 text-[10px] font-semibold text-teal-900 transition-colors duration-200 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
            >
              Back to roadmap
              <ArrowUpRight
                size={12}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CoursesSection;