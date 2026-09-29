import { useRef } from "react";
import {
  BarChart3,
  BookOpen,
  FileText,
  Route,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import ScrollReveal from "../common/ScrollReveal";

const startingPoints = [
  {
    number: "01",
    title: "Know your strengths",
    description:
      "See where your skills stand today and understand which areas need focused improvement.",
    icon: BarChart3,
  },
  {
    number: "02",
    title: "Follow your roadmap",
    description:
      "Turn your target role into clear milestones and know what to work on next.",
    icon: Route,
  },
  {
    number: "03",
    title: "Improve your resume",
    description:
      "Understand which skills, projects, and proof can make your profile stronger.",
    icon: FileText,
  },
  {
    number: "04",
    title: "Learn what matters",
    description:
      "Find relevant learning resources without spending hours searching for what to study.",
    icon: BookOpen,
  },
];

const StartingPointCard = ({ item, index }) => {
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

    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 3;
    const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 3;

    cardRef.current.style.transform = `
      perspective(900px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(6px)
    `;
  };

  const resetCard = () => {
    if (!cardRef.current || prefersReducedMotion) {
      return;
    }

    cardRef.current.style.transform = `
      perspective(900px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0)
    `;
  };

  const Icon = item.icon;

  return (
    <ScrollReveal
      delay={0.12 + index * 0.12}
      y={36}
      duration={0.85}
      amount={0.12}
      className={[
        index < 2 ? "border-b border-stone-200" : "",
        index % 2 === 0
          ? "sm:border-r sm:border-stone-200"
          : "",
      ].join(" ")}
    >
      <article
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetCard}
        className="group relative min-h-[218px] overflow-hidden bg-white p-6 transition-[transform,background-color,box-shadow] duration-300 ease-out hover:z-10 hover:bg-[#f7faf8] hover:shadow-[0_18px_40px_rgba(15,59,55,0.09)] sm:p-7"
      >
        {/* Cursor-following light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-32 rounded-full bg-orange-300/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Vertical accent */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.5 origin-bottom scale-y-0 bg-orange-300 transition-transform duration-400 ease-out group-hover:scale-y-100"
        />

        {/* Icon */}
        <motion.div
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -3,
                  rotate: -3,
                  scale: 1.05,
                }
          }
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative flex size-10 items-center justify-center rounded-xl border border-teal-900/5 bg-[#dcece5] text-teal-900 shadow-[0_5px_12px_rgba(15,59,55,0.04)] transition-colors duration-300 group-hover:bg-[#cfe5dc] group-hover:text-teal-950"
        >
          <Icon
            size={18}
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </motion.div>

        {/* Number */}
        <p className="relative mt-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-400 transition-colors duration-300 group-hover:text-teal-700">
          {item.number}
        </p>

        {/* Title */}
        <h3 className="relative mt-1.5 text-sm font-semibold leading-5 text-teal-950 transition-colors duration-300 group-hover:text-teal-800">
          {item.title}
        </h3>

        {/* Description */}
        <p className="relative mt-2 max-w-[245px] text-xs leading-[1.6] text-stone-500 transition-colors duration-300 group-hover:text-stone-600">
          {item.description}
        </p>

        {/* Bottom decorative line */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-6 h-px w-0 bg-teal-900/10 transition-all duration-500 ease-out group-hover:w-[calc(100%-3rem)]"
        />
      </article>
    </ScrollReveal>
  );
};

const StartingPointSection = () => {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#faf7f0] py-20 sm:py-24 lg:py-28"
      aria-labelledby="starting-point-heading"
    >
      {/* Ambient depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 size-96 rounded-full bg-teal-900/[0.035] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-10 size-80 rounded-full bg-orange-300/[0.04] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1216px] px-5 lg:px-0">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Section Introduction */}
          <div className="max-w-[430px]">
            {/* Eyebrow */}
            <ScrollReveal
              y={22}
              duration={0.85}
              amount={0.35}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800 sm:text-[11px]">
                One clear starting point
              </p>
            </ScrollReveal>

            {/* Heading */}
            <ScrollReveal
              y={40}
              delay={0.12}
              duration={1}
              amount={0.35}
            >
              <h2
                id="starting-point-heading"
                className="mt-4 font-['Newsreader'] text-[38px] font-semibold leading-[1.06] tracking-[-0.025em] text-teal-950 sm:text-[44px] lg:text-[46px]"
              >
                Everything you need
                <br className="hidden sm:block" />
                to move forward—
                <br className="hidden sm:block" />
                with purpose.
              </h2>
            </ScrollReveal>

            {/* Description */}
            <ScrollReveal
              y={30}
              delay={0.25}
              duration={0.9}
              amount={0.35}
            >
              <p className="mt-5 max-w-[390px] text-sm leading-6 text-stone-600 sm:text-[15px]">
                Not another personality quiz. CampusX connects what you can do
                now with the roles, proof, and learning you need next.
              </p>
            </ScrollReveal>
          </div>

          {/* Feature Cards */}
          <ScrollReveal
            y={30}
            delay={0.15}
            duration={0.9}
            amount={0.12}
            className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_8px_30px_rgba(15,59,55,0.045)]"
          >
            <div className="grid sm:grid-cols-2">
              {startingPoints.map((item, index) => (
                <StartingPointCard
                  key={item.number}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default StartingPointSection;