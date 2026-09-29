import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  MessageSquare,
  Send,
  Star,
  ThumbsUp,
} from "lucide-react";

const pageEase = [0.22, 1, 0.36, 1];

const publicFeedback = [
  {
    id: 1,
    name: "Aarav",
    role: "B.Tech Student",
    rating: 5,
    message:
      "The platform made it much easier to understand what I should focus on next.",
  },
  {
    id: 2,
    name: "Priya",
    role: "Computer Science Student",
    rating: 5,
    message:
      "I liked having my career direction and learning journey in one place.",
  },
  {
    id: 3,
    name: "Rahul",
    role: "B.Tech Student",
    rating: 4,
    message:
      "The roadmap helped me turn a broad career goal into smaller actionable steps.",
  },
];

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
      translate3d(${px * 4}px, ${py * 4 - 2}px, 0)
      rotateX(${-py * intensity}deg)
      rotateY(${px * intensity}deg)
    `;

    card.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    card.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
    );

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
      className={[
        "relative overflow-hidden",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "will-change-transform",
        className,
      ].join(" ")}
      style={{
        "--cursor-x": "50%",
        "--cursor-y": "50%",
        "--cursor-opacity": "0",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
        style={{
          opacity: "var(--cursor-opacity)",
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

const RatingStars = ({ rating, onChange }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Feedback rating"
    >
      {[1, 2, 3, 4, 5].map((value) => {
        const active = value <= rating;

        return (
          <motion.button
            key={value}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onClick={() => onChange(value)}
            whileHover={
              prefersReducedMotion ? undefined : { y: -2, scale: 1.08 }
            }
            whileTap={
              prefersReducedMotion ? undefined : { scale: 0.94 }
            }
            className={[
              "inline-flex size-10 items-center justify-center rounded-lg",
              "transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
              active
                ? "bg-orange-100 text-orange-500"
                : "bg-stone-100 text-stone-300 hover:bg-orange-50 hover:text-orange-400",
            ].join(" ")}
          >
            <Star
              size={19}
              strokeWidth={1.8}
              fill={active ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </motion.button>
        );
      })}
    </div>
  );
};

const Feedback = () => {
  const prefersReducedMotion = useReducedMotion();

  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!rating || !message.trim()) return;

    setSubmitted(true);
  };

  const handleMaybeLater = () => {
    setSubmitted(false);
    setRating(0);
    setMessage("");
  };

  return (
    <div className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-20 size-72 rounded-full bg-teal-900/[0.045] blur-3xl" />
        <div className="absolute right-[-120px] top-[-80px] size-80 rounded-full bg-orange-300/[0.12] blur-3xl" />
        <div className="absolute bottom-[-140px] left-1/3 size-96 rounded-full bg-teal-200/[0.10] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <motion.header
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 14 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            ease: pageEase,
          }}
          className="mb-8 max-w-3xl"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-teal-900 shadow-sm backdrop-blur-xl">
            <MessageSquare size={14} aria-hidden="true" />
            Your feedback
          </div>

          <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.035em] text-teal-950 sm:text-5xl lg:text-[3.5rem]">
            Help us make CampusX{" "}
            <span className="italic text-orange-500">more useful.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            Tell us how your experience felt and what we could improve.
            Your feedback helps us build a better career-readiness experience
            for students.
          </p>
        </motion.header>

        <section
          aria-labelledby="feedback-form-heading"
          className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          {/* Main feedback form */}
          <CursorCard
            delay={0.08}
            intensity={2.4}
            cursorColor="rgba(15,118,110,0.07)"
            className="rounded-[24px] border border-stone-200/80 bg-[#fffdf9] p-6 shadow-[0_18px_50px_rgba(28,25,23,0.07)] sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-950 text-orange-300 shadow-[0_8px_20px_rgba(7,63,51,0.16)]">
                <MessageSquare size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
                  Service feedback
                </p>

                <h2
                  id="feedback-form-heading"
                  className="mt-1 font-serif text-2xl tracking-[-0.025em] text-teal-950"
                >
                  How was your CampusX experience?
                </h2>
              </div>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="mt-8">
                {/* Rating */}
                <fieldset>
                  <legend className="text-sm font-semibold text-stone-800">
                    How would you rate your experience?
                  </legend>

                  <div className="mt-3">
                    <RatingStars
                      rating={rating}
                      onChange={(value) => setRating(value)}
                    />
                  </div>

                  <p className="mt-2 min-h-5 text-xs text-stone-500">
                    {rating === 0
                      ? "Select a rating from 1 to 5."
                      : `${rating} out of 5 stars selected.`}
                  </p>
                </fieldset>

                {/* Message */}
                <div className="mt-6">
                  <label
                    htmlFor="feedback-message"
                    className="text-sm font-semibold text-stone-800"
                  >
                    Tell us what we could improve
                    <span className="ml-1 font-normal text-stone-400">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={6}
                    maxLength={1000}
                    placeholder="Share your feedback..."
                    className="
                      mt-3 w-full resize-none rounded-xl border border-stone-200
                      bg-white px-4 py-3 text-sm leading-6 text-stone-800
                      outline-none transition-all duration-200
                      placeholder:text-stone-400
                      hover:border-stone-300
                      focus:border-teal-800 focus:ring-4 focus:ring-teal-900/10
                    "
                  />

                  <div className="mt-2 flex justify-end text-[11px] text-stone-400">
                    {message.length}/1000
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleMaybeLater}
                    className="
                      inline-flex min-h-11 items-center justify-center rounded-xl
                      border border-stone-200 bg-white px-5 text-sm font-semibold
                      text-stone-600 transition-all duration-200
                      hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800
                      focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-teal-800
                    "
                  >
                    Maybe Later
                  </button>

                  <motion.button
                    type="submit"
                    disabled={!rating || !message.trim()}
                    whileHover={
                      prefersReducedMotion || !rating || !message.trim()
                        ? undefined
                        : { y: -2 }
                    }
                    whileTap={
                      prefersReducedMotion || !rating || !message.trim()
                        ? undefined
                        : { scale: 0.98 }
                    }
                    className="
                      inline-flex min-h-11 items-center justify-center gap-2
                      rounded-xl bg-teal-950 px-5 text-sm font-semibold text-white
                      shadow-[0_10px_22px_rgba(7,63,51,0.16)]
                      transition-all duration-200
                      hover:bg-teal-900
                      disabled:cursor-not-allowed disabled:opacity-40
                      focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-teal-800
                    "
                  >
                    <Send size={16} strokeWidth={1.8} aria-hidden="true" />
                    Submit
                  </motion.button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.97 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.45,
                  ease: pageEase,
                }}
                className="mt-8 rounded-2xl border border-teal-900/10 bg-[#f2f8f5] p-6 text-center sm:p-8"
              >
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal-950 text-orange-300 shadow-[0_8px_22px_rgba(7,63,51,0.16)]">
                  <Check size={25} strokeWidth={2} aria-hidden="true" />
                </div>

                <h3 className="mt-5 font-serif text-2xl text-teal-950">
                  Thank you for your feedback.
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
                  Your response has been recorded for this session.
                </p>

                <button
                  type="button"
                  onClick={handleMaybeLater}
                  className="
                    mt-6 inline-flex min-h-10 items-center justify-center
                    rounded-xl border border-stone-200 bg-white px-4
                    text-sm font-semibold text-stone-700 transition-colors
                    hover:bg-stone-50
                    focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-teal-800
                  "
                >
                  Give different feedback
                </button>
              </motion.div>
            )}
          </CursorCard>

          {/* Supporting card */}
          <CursorCard
            delay={0.16}
            intensity={2.1}
            cursorColor="rgba(251,146,60,0.09)"
            className="rounded-[24px] border border-teal-950/10 bg-teal-950 p-6 text-white shadow-[0_20px_55px_rgba(7,63,51,0.16)] sm:p-8"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-orange-300 text-teal-950">
              <ThumbsUp size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-300">
              Why it matters
            </p>

            <h2 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.025em] text-white">
              Your experience shapes what we build next.
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/65">
              Honest feedback helps us understand what is useful, what feels
              unclear, and where the student experience can become better.
            </p>

            <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
              {[
                "Star rating + comments",
                "Helps improve the platform",
                "Built around student experience",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: 8 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.4,
                    delay: prefersReducedMotion ? 0 : 0.25 + index * 0.07,
                    ease: pageEase,
                  }}
                  className="flex items-center gap-3 text-sm text-white/75"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-orange-300">
                    <Check size={13} strokeWidth={2} aria-hidden="true" />
                  </span>
                  {item}
                </motion.div>
              ))}
            </div>
          </CursorCard>
        </section>

        {/* Public feedback */}
        <section
          aria-labelledby="public-feedback-heading"
          className="mt-12 sm:mt-16"
        >
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              ease: pageEase,
            }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-800">
              From the community
            </p>

            <h2
              id="public-feedback-heading"
              className="mt-2 font-serif text-3xl tracking-[-0.03em] text-teal-950 sm:text-4xl"
            >
              What students are saying.
            </h2>
          </motion.div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {publicFeedback.map((feedback, index) => (
              <CursorCard
                key={feedback.id}
                delay={0.08 + index * 0.08}
                intensity={1.8}
                cursorColor="rgba(15,118,110,0.055)"
                className="flex h-full flex-col rounded-[22px] border border-stone-200/80 bg-[#fffdf9] p-6 shadow-[0_12px_35px_rgba(28,25,23,0.055)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-teal-950">
                      {feedback.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {feedback.role}
                    </p>
                  </div>

                  <div
                    className="flex gap-0.5"
                    aria-label={`${feedback.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        strokeWidth={1.7}
                        fill={star <= feedback.rating ? "currentColor" : "none"}
                        className={
                          star <= feedback.rating
                            ? "text-orange-400"
                            : "text-stone-200"
                        }
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-6 flex-1 text-sm leading-6 text-stone-600">
                  “{feedback.message}”
                </p>

                <div className="mt-6 border-t border-stone-100 pt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-400">
                  CampusX community
                </div>
              </CursorCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Feedback;