import { useRef } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Compass,
  Layers3,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import ScrollReveal from "../common/ScrollReveal";

const roles = [
  {
    title: "Data Analyst",
    description:
      "Turn data into decisions with a practical path through analysis, visualization, and business thinking.",
    skills: ["SQL", "Excel", "Power BI"],
    icon: BarChart3,
    accent: "orange",
    metric: "12 weeks",
    metricLabel: "to job-ready",
  },
  {
    title: "UX Designer",
    description:
      "Learn to understand users, shape better experiences, and build a portfolio that shows how you think.",
    skills: ["Figma", "Research", "Prototyping"],
    icon: Compass,
    accent: "teal",
    metric: "14 weeks",
    metricLabel: "guided roadmap",
  },
  {
    title: "Product Manager",
    description:
      "Build product thinking, research, and communication skills around real-world product decisions.",
    skills: ["Strategy", "Research", "Analytics"],
    icon: Layers3,
    accent: "orange",
    metric: "16 weeks",
    metricLabel: "guided roadmap",
  },
];

const RoleCard = ({ role, index }) => {
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

    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 2.2;
    const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 2.2;

    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-5px)
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

  const Icon = role.icon;

  const isOrange = role.accent === "orange";

  return (
    <motion.article
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 30 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
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
        {/* Back depth layer */}
        <div
          aria-hidden="true"
          className={[
            "absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border transition-all duration-300",
            isOrange
              ? "border-orange-200/50 bg-orange-50/50 group-hover:translate-x-3 group-hover:translate-y-3"
              : "border-teal-100 bg-teal-50/50 group-hover:translate-x-3 group-hover:translate-y-3",
          ].join(" ")}
        />

        {/* Main card */}
        <div
          className={[
            "relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-[0_8px_30px_rgba(15,59,55,0.055)] transition-all duration-300 sm:p-7",
            "group-hover:shadow-[0_22px_55px_rgba(15,59,55,0.11)]",
            isOrange
              ? "border-stone-200 group-hover:border-orange-200"
              : "border-stone-200 group-hover:border-teal-200",
          ].join(" ")}
        >
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute -right-16 -top-16 size-44 rounded-full blur-3xl transition-opacity duration-500",
              isOrange
                ? "bg-orange-300/10 opacity-50 group-hover:opacity-100"
                : "bg-teal-300/10 opacity-50 group-hover:opacity-100",
            ].join(" ")}
          />

          {/* Decorative grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-32 w-32 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />

          {/* Icon */}
          <div className="relative flex items-start justify-between">
            <motion.div
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { rotate: -4, scale: 1.05 }
              }
              transition={{ duration: 0.25 }}
              className={[
                "flex size-11 items-center justify-center rounded-xl border transition-all duration-300",
                isOrange
                  ? "border-orange-200 bg-orange-50 text-orange-700 group-hover:bg-orange-100"
                  : "border-teal-100 bg-teal-50 text-teal-800 group-hover:bg-teal-100",
              ].join(" ")}
            >
              <Icon
                size={20}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </motion.div>

            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em]",
                isOrange
                  ? "bg-orange-50 text-orange-700"
                  : "bg-teal-50 text-teal-800",
              ].join(" ")}
            >
              <Sparkles size={10} strokeWidth={1.8} aria-hidden="true" />
              Career path
            </span>
          </div>

          {/* Content */}
          <div className="relative mt-8">
            <h3 className="font-['Newsreader'] text-[30px] font-semibold leading-none tracking-[-0.02em] text-teal-950">
              {role.title}
            </h3>

            <p className="mt-4 max-w-[330px] text-sm leading-6 text-stone-500">
              {role.description}
            </p>
          </div>

          {/* Skills */}
          <div className="relative mt-7">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-400">
              Core skills
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {role.skills.map((skill, skillIndex) => (
                <motion.span
                  key={skill}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0, y: 6 }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.1 + skillIndex * 0.06,
                  }}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[10px] font-medium text-teal-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Bottom metric */}
          <div className="relative mt-auto pt-8">
            <div className="border-t border-stone-200 pt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-['Newsreader'] text-2xl font-semibold leading-none text-teal-950">
                    {role.metric}
                  </p>

                  <p className="mt-1.5 text-[10px] text-stone-400">
                    {role.metricLabel}
                  </p>
                </div>

                <a
                  href="#career-roadmap"
                  aria-label={`Explore ${role.title} career roadmap`}
                  className={[
                    "group/link inline-flex size-10 items-center justify-center rounded-full border transition-all duration-300",
                    isOrange
                      ? "border-orange-200 text-orange-700 hover:bg-orange-300 hover:text-teal-950"
                      : "border-teal-200 text-teal-800 hover:bg-teal-900 hover:text-white",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                  ].join(" ")}
                >
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div
            aria-hidden="true"
            className={[
              "absolute bottom-0 left-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
              isOrange ? "w-full bg-orange-300" : "w-full bg-teal-800",
            ].join(" ")}
          />
        </div>
      </div>
    </motion.article>
  );
};

const RoleMatchesSection = () => {
  return (
    <section
      id="job-matches"
      className="relative overflow-hidden bg-[#faf7f0] py-20 sm:py-24 lg:py-28"
      aria-labelledby="role-matches-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-stone-200 to-transparent"
      />

      <div className="relative mx-auto max-w-[1216px] px-5 lg:px-0">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[590px]">
            <ScrollReveal
              y={22}
              duration={0.8}
              amount={0.3}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800 sm:text-[11px]">
                Roles that make sense for your skills
              </p>
            </ScrollReveal>

            <ScrollReveal
              y={38}
              delay={0.1}
              duration={0.9}
              amount={0.3}
            >
              <h2
                id="role-matches-heading"
                className="mt-4 font-['Newsreader'] text-[38px] font-semibold leading-[1.06] tracking-[-0.025em] text-teal-950 sm:text-[46px]"
              >
                Your skills can lead
                <br />
                somewhere specific.
              </h2>
            </ScrollReveal>
          </div>

          <ScrollReveal
            y={24}
            delay={0.2}
            duration={0.8}
            amount={0.3}
          >
            <p className="max-w-[370px] text-sm leading-6 text-stone-500 lg:pb-1">
              Instead of guessing what to learn next, see how your existing
              strengths connect to real career directions.
            </p>
          </ScrollReveal>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, index) => (
            <RoleCard
              key={role.title}
              role={role}
              index={index}
            />
          ))}
        </div>

        {/* Supporting line */}
        <ScrollReveal
          y={20}
          delay={0.15}
          duration={0.75}
          amount={0.25}
        >
          <div className="mt-8 flex flex-col gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-stone-400">
              Explore a role to see the skills, learning path, and next steps
              behind it.
            </p>

            <a
              href="#career-roadmap"
              className="group inline-flex w-fit items-center gap-2 text-xs font-semibold text-teal-900 transition-colors duration-200 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
            >
              Explore career roadmaps
              <ArrowUpRight
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default RoleMatchesSection;