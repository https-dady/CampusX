import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Target,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const questions = [
  {
    id: 1,
    question: "Where are you in your career journey?",
    description:
      "Choose the option that feels closest to where you are today.",
    options: [
      "Just getting started",
      "Building my foundations",
      "Developing practical skills",
      "Preparing for opportunities",
    ],
  },
  {
    id: 2,
    question: "What kind of work sounds most interesting?",
    description:
      "Think about the type of problems you would enjoy working on.",
    options: [
      "Working with data and insights",
      "Building products and applications",
      "Designing experiences and interfaces",
      "Understanding business and strategy",
    ],
  },
  {
    id: 3,
    question: "How do you prefer to learn?",
    description:
      "Pick the learning style that feels most useful to you.",
    options: [
      "Short courses and guided lessons",
      "Building projects by myself",
      "Practice and real-world challenges",
      "A mix of everything",
    ],
  },
  {
    id: 4,
    question: "What would make you feel more career-ready?",
    description:
      "Choose the outcome that matters most to you right now.",
    options: [
      "Knowing which career direction fits me",
      "Building stronger technical skills",
      "Creating better projects and proof of work",
      "Finding relevant opportunities",
    ],
  },
];

const pageEase = [0.22, 1, 0.36, 1];

const Assessment = () => {
  const prefersReducedMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];

  const progress = useMemo(
    () => ((currentIndex + 1) / questions.length) * 100,
    [currentIndex]
  );

  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (option) => {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    if (!isLastQuestion) {
      setCurrentIndex((current) => current + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((current) => current - 1);
  };

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* ================================================================ */}
      {/* PAGE HEADER                                                       */}
      {/* ================================================================ */}

      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.65,
          ease: pageEase,
        }}
        aria-labelledby="assessment-title"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Career assessment
            </p>

            <motion.h1
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 14 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.08,
                ease: pageEase,
              }}
              id="assessment-title"
              className="
                mt-2
                font-['Newsreader']
                text-4xl font-semibold
                leading-[1.02]
                tracking-[-0.035em]
                text-[#10231f]
                sm:text-5xl
              "
            >
              A clearer picture starts here.
            </motion.h1>

            <motion.p
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 12 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.55,
                delay: prefersReducedMotion ? 0 : 0.17,
                ease: pageEase,
              }}
              className="
                mt-4 max-w-2xl
                text-sm leading-6
                text-stone-500
                sm:text-[15px]
              "
            >
              There are no perfect answers. Share what feels closest
              to you so CampusX can understand where you are today.
            </motion.p>
          </div>

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: 12 }
            }
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.55,
              delay: prefersReducedMotion ? 0 : 0.24,
              ease: pageEase,
            }}
            className="
              inline-flex min-h-10
              shrink-0 items-center gap-2
              self-start rounded-md
              border border-stone-200
              bg-white px-3.5
              text-xs font-semibold
              text-stone-600
              shadow-[0_3px_12px_rgba(28,25,23,0.04)]
              sm:self-auto
            "
            aria-label={`Question ${currentIndex + 1} of ${questions.length}`}
          >
            <CircleHelp
              size={15}
              strokeWidth={1.7}
              className="text-teal-900"
              aria-hidden="true"
            />

            <span>
              {currentIndex + 1} / {questions.length}
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* PROGRESS                                                          */}
      {/* ================================================================ */}

      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 16 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.55,
          delay: prefersReducedMotion ? 0 : 0.25,
          ease: pageEase,
        }}
        className="mt-8"
        aria-label="Assessment progress"
      >
        <div className="flex items-center justify-between text-[11px] font-medium text-stone-500">
          <span>Assessment progress</span>

          <span>{Math.round(progress)}%</span>
        </div>

        <div
          className="
            mt-2 h-1.5
            overflow-hidden rounded-full
            bg-stone-200
          "
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label={`Assessment progress ${Math.round(progress)} percent`}
        >
          <motion.div
            initial={
              prefersReducedMotion
                ? { width: `${progress}%` }
                : { width: "0%" }
            }
            animate={{ width: `${progress}%` }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              ease: pageEase,
            }}
            className="h-full rounded-full bg-teal-950"
          />
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* QUESTION AREA                                                     */}
      {/* ================================================================ */}

      <motion.section
        key={currentQuestion.id}
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 18 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.55,
          ease: pageEase,
        }}
        aria-labelledby={`question-${currentQuestion.id}`}
        className="mt-8"
      >
        <article
          className="
            relative overflow-hidden
            rounded-lg
            border border-stone-200
            bg-white
            p-6
            shadow-[0_10px_32px_rgba(28,25,23,0.045)]
            sm:p-8
            lg:p-10
          "
        >
          {/* Decorative depth */}
          <motion.div
            aria-hidden="true"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    x: [0, 8, 0],
                    y: [0, -5, 0],
                  }
            }
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              pointer-events-none
              absolute -right-16 -top-16
              size-40 rounded-full
              bg-[#dcefe9]/70
              blur-3xl
            "
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                  Question {currentIndex + 1}
                </p>

                <h2
                  id={`question-${currentQuestion.id}`}
                  className="
                    mt-3
                    max-w-3xl
                    font-['Newsreader']
                    text-3xl font-semibold
                    leading-tight
                    tracking-[-0.025em]
                    text-[#10231f]
                    sm:text-4xl
                  "
                >
                  {currentQuestion.question}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                  {currentQuestion.description}
                </p>
              </div>

              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, -3, 0],
                      }
                }
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  hidden size-10
                  shrink-0 items-center
                  justify-center
                  rounded-md
                  bg-[#dcefe9]
                  text-teal-950
                  sm:flex
                "
              >
                <Target
                  size={18}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.div>
            </div>

            {/* ========================================================== */}
            {/* ANSWER OPTIONS                                              */}
            {/* ========================================================== */}

            <div
              className="mt-8 space-y-3"
              role="radiogroup"
              aria-label={currentQuestion.question}
            >
              {currentQuestion.options.map((option, index) => {
                const selected = selectedAnswer === option;

                return (
                  <motion.button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handleSelect(option)}
                    initial={
                      prefersReducedMotion
                        ? false
                        : {
                            opacity: 0,
                            x: 12,
                          }
                    }
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.4,
                      delay: prefersReducedMotion
                        ? 0
                        : 0.08 + index * 0.05,
                      ease: pageEase,
                    }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            x: 3,
                            y: -1,
                          }
                    }
                    whileTap={
                      prefersReducedMotion
                        ? undefined
                        : {
                            scale: 0.995,
                          }
                    }
                    className={[
                      "group flex min-h-14 w-full items-center justify-between gap-4 rounded-md border px-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 sm:px-5",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                      selected
                        ? "border-teal-950 bg-teal-950 text-white shadow-[0_10px_24px_rgba(6,78,59,0.12)]"
                        : "border-stone-200 bg-[#fffdf9] text-stone-700 hover:border-teal-800/25 hover:bg-[#f7faf8] hover:text-teal-950 hover:shadow-[0_7px_18px_rgba(28,25,23,0.05)]",
                    ].join(" ")}
                  >
                    <span className="text-sm font-medium">
                      {option}
                    </span>

                    <span
                      className={[
                        "flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                        selected
                          ? "border-orange-300 bg-orange-300 text-teal-950"
                          : "border-stone-300 bg-white text-transparent group-hover:border-teal-800/30",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <Check
                        size={14}
                        strokeWidth={2}
                      />
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* ========================================================== */}
            {/* NAVIGATION                                                   */}
            {/* ========================================================== */}

            <div className="
              mt-8
              flex flex-col-reverse
              gap-3
              border-t border-stone-100
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <motion.button
                type="button"
                onClick={handleBack}
                disabled={currentIndex === 0}
                whileHover={
                  prefersReducedMotion || currentIndex === 0
                    ? undefined
                    : { x: -2 }
                }
                whileTap={
                  prefersReducedMotion || currentIndex === 0
                    ? undefined
                    : { scale: 0.98 }
                }
                className="
                  inline-flex min-h-10
                  items-center justify-center
                  gap-2 rounded-md
                  border border-stone-300
                  bg-white px-4
                  text-sm font-semibold
                  text-stone-600
                  transition-[border-color,background-color,color,box-shadow]
                  duration-200
                  hover:border-stone-400
                  hover:bg-stone-50
                  hover:text-teal-950
                  hover:shadow-[0_6px_16px_rgba(28,25,23,0.05)]
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-teal-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <ArrowLeft
                  size={15}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                Back
              </motion.button>

              <motion.button
                type="button"
                onClick={handleNext}
                disabled={!selectedAnswer}
                whileHover={
                  prefersReducedMotion || !selectedAnswer
                    ? undefined
                    : { y: -2 }
                }
                whileTap={
                  prefersReducedMotion || !selectedAnswer
                    ? undefined
                    : { scale: 0.98 }
                }
                className="
                  group
                  inline-flex min-h-10
                  items-center justify-center
                  gap-2 rounded-md
                  bg-teal-950 px-5
                  text-sm font-semibold
                  text-white
                  shadow-[0_7px_18px_rgba(6,78,59,0.10)]
                  transition-[background-color,box-shadow,transform]
                  duration-200
                  hover:bg-teal-900
                  hover:shadow-[0_12px_25px_rgba(6,78,59,0.15)]
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-teal-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:bg-teal-950
                "
              >
                {isLastQuestion ? "Complete assessment" : "Next"}

                <ArrowRight
                  size={15}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </motion.button>
            </div>
          </div>
        </article>
      </motion.section>
    </div>
  );
};

export default Assessment;