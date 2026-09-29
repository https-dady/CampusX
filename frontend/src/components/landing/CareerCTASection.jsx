import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import ScrollReveal from "../common/ScrollReveal";

const CareerCTASection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative isolate overflow-hidden bg-teal-950 py-20 sm:py-24 lg:py-28"
      aria-labelledby="career-cta-heading"
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-700/20 blur-3xl" />

        <div className="absolute -right-24 top-10 size-72 rounded-full bg-orange-300/[0.07] blur-3xl" />

        <div className="absolute -left-32 bottom-0 size-80 rounded-full bg-teal-400/[0.06] blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(4,47,46,0.3)_75%)]" />
      </div>

      {/* Decorative orbit */}
      <motion.div
        aria-hidden="true"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                rotate: 360,
              }
        }
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 hidden size-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.055] lg:block"
      >
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/60 shadow-[0_0_20px_rgba(251,191,36,0.35)]" />
      </motion.div>

      <div className="relative mx-auto max-w-[900px] px-5 text-center lg:px-0">
        {/* Eyebrow */}
        <ScrollReveal
          y={20}
          duration={0.8}
          amount={0.35}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 backdrop-blur-sm">
            <Sparkles
              size={12}
              strokeWidth={1.8}
              className="text-orange-300"
              aria-hidden="true"
            />

            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
              Your next step starts here
            </span>
          </div>
        </ScrollReveal>

        {/* Quote */}
        <ScrollReveal
          y={42}
          delay={0.1}
          duration={1}
          amount={0.35}
        >
          <blockquote className="mx-auto mt-7 max-w-[820px]">
            <p
              id="career-cta-heading"
              className="font-['Newsreader'] text-[38px] font-medium leading-[1.08] tracking-[-0.03em] text-white sm:text-[48px] lg:text-[58px]"
            >
              A dream job becomes less distant the moment you can name your{" "}
              <span className="text-orange-300">next step.</span>
            </p>
          </blockquote>
        </ScrollReveal>

        {/* Supporting copy */}
        <ScrollReveal
          y={25}
          delay={0.2}
          duration={0.85}
          amount={0.35}
        >
          <p className="mx-auto mt-6 max-w-[540px] text-sm leading-6 text-white/55 sm:text-[15px]">
            Find the skills to build, the roles that fit, and a practical path
            to get there — all in one place.
          </p>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal
          y={22}
          delay={0.3}
          duration={0.8}
          amount={0.35}
        >
          <div className="mt-8 flex justify-center">
            <a
              href="/signup"
              className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md bg-orange-300 px-6 text-sm font-semibold text-teal-950 shadow-[0_12px_35px_rgba(251,191,36,0.12)] transition-all duration-300 hover:-translate-y-1 hover:bg-orange-200 hover:shadow-[0_18px_45px_rgba(251,191,36,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 active:translate-y-0 sm:px-7"
            >
              Find my next step

              <ArrowRight
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </ScrollReveal>

        {/* Trust line */}
        <ScrollReveal
          y={16}
          delay={0.4}
          duration={0.7}
          amount={0.35}
        >
          <p className="mt-5 text-[10px] font-medium tracking-wide text-white/30">
            Free for students · No credit card required
          </p>
        </ScrollReveal>
      </div>

      {/* Bottom edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </section>
  );
};

export default CareerCTASection;