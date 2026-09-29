import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MessageSquare,
  Mic,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const pageEase = [0.22, 1, 0.36, 1];

const questions = [
  {
    id: 1,
    category: "Introduction",
    title: "Tell me about yourself.",
    hint: "Keep your answer focused on your education, relevant skills, projects, and career direction.",
    duration: "2 min",
  },
  {
    id: 2,
    category: "Technical",
    title: "What is the difference between WHERE and HAVING in SQL?",
    hint: "Explain when each clause is applied and give a simple example from data analysis.",
    duration: "2 min",
  },
  {
    id: 3,
    category: "Problem solving",
    title: "How would you approach a dataset with missing values?",
    hint: "Talk through how you would inspect the data before deciding how to handle missing values.",
    duration: "3 min",
  },
  {
    id: 4,
    category: "Project",
    title: "Tell me about a project you are proud of.",
    hint: "Explain the problem, your contribution, the technologies you used, and what you learned.",
    duration: "3 min",
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

const MockInterview = () => {
  const prefersReducedMotion = useReducedMotion();

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const progress = Math.round(
    (currentIndex / questions.length) * 100
  );

  const saveCurrentAnswer = () => {
    const trimmedAnswer = answer.trim();

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: trimmedAnswer,
    }));
  };

  const handleNext = () => {
    saveCurrentAnswer();

    if (currentIndex === questions.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setAnswer("");
  };

  const handleBack = () => {
    saveCurrentAnswer();

    if (currentIndex === 0) return;

    const previousIndex = currentIndex - 1;

    setCurrentIndex(previousIndex);
    setAnswer(answers[questions[previousIndex].id] || "");
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setAnswer("");
    setAnswers({});
    setCompleted(false);
  };

  const handleStart = () => {
    setStarted(true);
    setCurrentIndex(0);
    setAnswer("");
    setCompleted(false);
  };

  if (!started) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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
          aria-labelledby="mock-interview-title"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
            Mock interview
          </p>

          <h1
            id="mock-interview-title"
            className="mt-2 font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl"
          >
            Practice before it counts.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
            Work through a short interview simulation built around
            the skills and direction you are developing.
          </p>
        </motion.section>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <CursorCard
            intensity={2.4}
            delay={0.2}
            cursorColor="rgba(255,255,255,0.13)"
            className="rounded-lg border border-teal-950 bg-teal-950 p-6 text-white shadow-[0_18px_45px_rgba(6,78,59,0.13)] sm:p-8"
          >
            <div className="flex size-11 items-center justify-center rounded-md bg-white/10 text-orange-300 ring-1 ring-white/10">
              <MessageSquare
                size={20}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </div>

            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-300">
              Data Analyst interview
            </p>

            <h2 className="mt-2 max-w-xl font-['Newsreader'] text-4xl font-semibold tracking-[-0.03em]">
              Four questions. One useful practice session.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-300">
              Take your time, structure your thoughts, and answer
              as if you were speaking with an interviewer.
            </p>

            <button
              type="button"
              onClick={handleStart}
              className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-orange-300 px-5 text-sm font-semibold text-teal-950 shadow-[0_8px_20px_rgba(0,0,0,0.10)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-orange-200 hover:shadow-[0_12px_25px_rgba(0,0,0,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-200 active:translate-y-0"
            >
              Start interview
              <ArrowRight
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </CursorCard>

          <CursorCard
            intensity={2.1}
            delay={0.3}
            className="rounded-lg border border-stone-200 bg-white p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Before you begin
            </p>

            <div className="mt-5 space-y-3">
              {[
                {
                  icon: Clock3,
                  title: "About 10 minutes",
                  text: "Give yourself enough time to think through each answer.",
                },
                {
                  icon: Target,
                  title: "Career focused",
                  text: "Questions cover introduction, technical thinking, projects, and problem solving.",
                },
                {
                  icon: Mic,
                  title: "Speak naturally",
                  text: "Treat each response like a real interview answer.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-md border border-stone-200 bg-[#fffdf9] px-3.5 py-3.5"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#dcefe9] text-teal-950">
                      <Icon
                        size={15}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-[#10231f]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CursorCard>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <CursorCard
          intensity={2.4}
          delay={0.1}
          cursorColor="rgba(255,255,255,0.12)"
          className="rounded-lg border border-teal-950 bg-teal-950 p-7 text-white shadow-[0_20px_50px_rgba(6,78,59,0.14)] sm:p-10"
        >
          <motion.div
            initial={
              prefersReducedMotion
                ? { scale: 1, opacity: 1 }
                : { scale: 0.8, opacity: 0 }
            }
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: pageEase,
            }}
            className="flex size-14 items-center justify-center rounded-full bg-orange-300 text-teal-950"
          >
            <Check
              size={26}
              strokeWidth={2}
              aria-hidden="true"
            />
          </motion.div>

          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-300">
            Interview complete
          </p>

          <h1 className="mt-2 font-['Newsreader'] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Good practice starts with showing up.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300">
            You completed all four questions. Your answers are kept
            in this session while the interview analysis layer is
            not connected yet.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">
                Questions
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {questions.length}
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">
                Completed
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {answeredCount}
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">
                Status
              </p>
              <p className="mt-1 text-2xl font-semibold">
                Complete
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="group mt-7 inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-xs font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-0"
          >
            <RotateCcw
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Practice again
          </button>
        </CursorCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1050px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* INTERVIEW HEADER */}
      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 15 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: pageEase,
        }}
        aria-labelledby="question-title"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Mock interview
            </p>

            <p className="mt-2 text-sm font-medium text-stone-500">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="w-full sm:w-48">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em] text-stone-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { width: `${Math.max(progress, 25)}%` }
                    : { width: "0%" }
                }
                animate={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.5,
                  ease: pageEase,
                }}
                className="h-full rounded-full bg-teal-950"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* QUESTION */}
        <CursorCard
          key={currentQuestion.id}
          intensity={2.5}
          delay={0.1}
          cursorColor="rgba(15,118,110,0.07)"
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-[0_10px_32px_rgba(28,25,23,0.04)] sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex min-h-7 items-center rounded-full bg-[#dcefe9] px-2.5 text-[10px] font-bold text-teal-950">
              {currentQuestion.category}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
              <Clock3
                size={13}
                strokeWidth={1.7}
                aria-hidden="true"
              />
              {currentQuestion.duration}
            </span>
          </div>

          <motion.h1
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 10 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: pageEase,
            }}
            id="question-title"
            className="mt-7 font-['Newsreader'] text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#10231f] sm:text-4xl"
          >
            {currentQuestion.title}
          </motion.h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500">
            {currentQuestion.hint}
          </p>

          <div className="mt-7">
            <label
              htmlFor="interview-answer"
              className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-teal-950"
            >
              Your answer
            </label>

            <textarea
              id="interview-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Write how you would answer this in an interview..."
              rows={9}
              className="
                w-full resize-y
                rounded-md
                border border-stone-200
                bg-[#fffdf9]
                px-4 py-3.5
                text-sm leading-6
                text-stone-700
                outline-none
                transition-[border-color,box-shadow]
                duration-200
                placeholder:text-stone-300
                focus:border-teal-800/50
                focus:ring-4
                focus:ring-teal-800/5
              "
            />

            <div className="mt-2 flex justify-end">
              <span className="text-[10px] text-stone-400">
                {answer.length} characters
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="
                inline-flex min-h-10
                items-center justify-center
                gap-2 rounded-md
                border border-stone-200
                bg-white px-4
                text-xs font-semibold
                text-stone-600
                transition-[background-color,border-color,opacity]
                duration-200
                hover:border-stone-300
                hover:bg-stone-50
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
                disabled:cursor-not-allowed
                disabled:opacity-35
              "
            >
              <ArrowLeft
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="
                group
                inline-flex min-h-10
                items-center justify-center
                gap-2 rounded-md
                bg-teal-950 px-5
                text-xs font-semibold
                text-white
                shadow-[0_7px_18px_rgba(6,78,59,0.10)]
                transition-[background-color,box-shadow,transform]
                duration-200
                hover:-translate-y-0.5
                hover:bg-teal-900
                hover:shadow-[0_12px_25px_rgba(6,78,59,0.15)]
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
                active:translate-y-0
              "
            >
              {currentIndex === questions.length - 1
                ? "Complete interview"
                : "Next question"}

              <ArrowRight
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>
        </CursorCard>

        {/* SIDEBAR */}
        <aside className="space-y-4" aria-label="Interview overview">
          <CursorCard
            intensity={2}
            delay={0.25}
            className="rounded-lg border border-stone-200 bg-[#fffdf9] p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Interview map
            </p>

            <div className="mt-4 space-y-2">
              {questions.map((question, index) => {
                const isCurrent = index === currentIndex;
                const isAnswered =
                  answers[question.id] !== undefined ||
                  (index < currentIndex && answers[question.id] !== undefined);

                return (
                  <div
                    key={question.id}
                    className={`
                      flex items-center gap-2.5
                      rounded-md px-2.5 py-2
                      ${
                        isCurrent
                          ? "bg-teal-950 text-white"
                          : "text-stone-500"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex size-6 shrink-0
                        items-center justify-center
                        rounded-full text-[10px] font-bold
                        ${
                          isCurrent
                            ? "bg-white/15 text-white"
                            : isAnswered
                              ? "bg-[#dcefe9] text-teal-950"
                              : "bg-stone-100 text-stone-400"
                        }
                      `}
                    >
                      {isAnswered ? (
                        <Check
                          size={12}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      ) : (
                        index + 1
                      )}
                    </span>

                    <span className="truncate text-[11px] font-semibold">
                      {question.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </CursorCard>

          <CursorCard
            intensity={2}
            delay={0.35}
            cursorColor="rgba(234,88,12,0.07)"
            className="rounded-lg border border-orange-100 bg-orange-50/60 p-5"
          >
            <div className="flex size-9 items-center justify-center rounded-md bg-orange-200 text-orange-900">
              <Sparkles
                size={16}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#10231f]">
              A useful rule
            </h2>

            <p className="mt-2 text-xs leading-5 text-stone-500">
              Be specific. Mention what you did, why you did it,
              and what you learned from the experience.
            </p>
          </CursorCard>
        </aside>
      </div>
    </div>
  );
};

export default MockInterview;