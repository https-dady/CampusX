import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CircleHelp,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const faqItems = [
  {
    question: "Where should I begin?",
    answer:
      "Start with resume analysis. It gives CampusX a practical picture of your current skills, projects, and gaps before you choose job suggestions or a roadmap.",
  },
  {
    question: "Do I need to know my dream job already?",
    answer:
      "No. CampusX is designed to help you explore suitable career directions based on your current skills, interests, and goals. You can refine your direction as you learn more about yourself.",
  },
  {
    question: "What does the assessment measure?",
    answer:
      "The assessment looks at your current skills and career readiness to help identify strengths, gaps, and useful next steps for your selected direction.",
  },
  {
    question: "Are the course recommendations paid?",
    answer:
      "CampusX can recommend both free and paid learning resources. Recommendations are based on relevance to your roadmap rather than requiring a specific paid platform.",
  },
  {
    question: "Is my resume uploaded anywhere?",
    answer:
      "Your resume is used to support your profile and career analysis. CampusX is designed to use the information you provide only for the features and recommendations associated with your account.",
  },
  {
    question: "Can I change my roadmap later?",
    answer:
      "Yes. Your career direction can change as your skills, interests, and goals evolve. Your roadmap should be treated as a guide that can be refined over time.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    document.title = "FAQ | CampusX";
  }, []);

  const toggleQuestion = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <main className="min-h-screen bg-[#faf7f0] text-teal-950">
      {/* Top Header */}
      <header className="mx-auto w-full max-w-[1100px] px-5 pt-8 sm:pt-10 lg:px-0">
        <motion.div
          initial={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 0, y: -14 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            flex min-h-[58px] items-center justify-between
            bg-teal-950 px-5
            sm:min-h-[68px] sm:px-7
          "
        >
          <a
            href="/"
            aria-label="CampusX home"
            className="
              group inline-flex items-center gap-2.5 rounded-sm
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-orange-300
            "
          >
            <span
              className="
                flex size-8 items-center justify-center rounded-[5px]
                bg-orange-300 text-teal-950
                transition-transform duration-200
                group-hover:scale-[1.04]
              "
            >
              <Sparkles
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:rotate-6"
              />
            </span>

            <span className="text-[15px] font-bold tracking-[-0.03em] text-white sm:text-base">
              campus<span className="text-orange-300">X</span>
            </span>
          </a>

          <a
            href="/"
            className="
              group inline-flex min-h-9 items-center gap-2 rounded-sm
              text-[11px] font-medium text-white/75
              transition-colors duration-200
              hover:text-white
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-orange-300
              sm:text-xs
            "
          >
            <ArrowLeft
              size={13}
              strokeWidth={1.7}
              aria-hidden="true"
              className="
                transition-transform duration-200
                group-hover:-translate-x-0.5
              "
            />
            Back home
          </a>
        </motion.div>
      </header>

      {/* Hero */}
      <section
        className="
          mx-auto w-full max-w-[1100px]
          border-x border-b border-[#dfe8e0]
          bg-[#eaf4ed]
        "
        aria-labelledby="faq-title"
      >
        <div className="px-5 py-20 text-center sm:px-10 sm:py-24 lg:px-16 lg:py-28">
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.65,
              delay: prefersReducedMotion ? 0 : 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto flex size-10 items-center justify-center rounded-md bg-teal-950 text-white shadow-[0_8px_24px_rgba(6,78,59,0.12)]"
            aria-hidden="true"
          >
            <CircleHelp size={19} strokeWidth={1.6} />
          </motion.div>

          <motion.p
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              delay: prefersReducedMotion ? 0 : 0.15,
            }}
            className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-900"
          >
            Clear answers first
          </motion.p>

          <motion.h1
            id="faq-title"
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 22 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.8,
              delay: prefersReducedMotion ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mx-auto mt-3 max-w-[680px]
              font-['Newsreader']
              text-[42px] font-semibold leading-[0.98]
              tracking-[-0.035em] text-[#09251e]
              sm:text-[52px]
              lg:text-[60px]
            "
          >
            Questions students usually ask
          </motion.h1>

          <motion.p
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 18 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              delay: prefersReducedMotion ? 0 : 0.34,
            }}
            className="
              mx-auto mt-6 max-w-[620px]
              text-sm leading-6 text-teal-950/65
              sm:text-[15px]
            "
          >
            Simple explanations about how CampusX supports your career
            decisions and handles the information you share.
          </motion.p>
        </div>
      </section>

      {/* FAQ Content */}
      <section
        className="
          mx-auto w-full max-w-[1100px]
          bg-[#faf7f0]
          px-5 py-14
          sm:px-10 sm:py-16
          lg:px-16 lg:py-20
        "
        aria-labelledby="faq-list-title"
      >
        <h2 id="faq-list-title" className="sr-only">
          Frequently asked questions
        </h2>

        <div className="mx-auto max-w-[650px]">
          <div className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-[0_12px_40px_rgba(20,50,40,0.035)]">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              const answerId = `faq-answer-${index}`;
              const buttonId = `faq-question-${index}`;

              return (
                <div
                  key={item.question}
                  className="border-b border-stone-200 last:border-b-0"
                >
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => toggleQuestion(index)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="
                      group flex min-h-[58px] w-full
                      items-center justify-between gap-5
                      px-5 py-4 text-left
                      transition-colors duration-200
                      hover:bg-stone-50
                      focus-visible:outline-2
                      focus-visible:outline-offset-[-2px]
                      focus-visible:outline-teal-800
                      sm:px-6
                    "
                  >
                    <span className="text-[12px] font-semibold leading-5 text-teal-950 sm:text-[13px]">
                      {item.question}
                    </span>

                    <span
                      className="
                        flex size-6 shrink-0 items-center justify-center
                        rounded-full bg-[#dcefe8] text-teal-900
                        transition-all duration-200
                        group-hover:bg-[#cfe7de]
                      "
                      aria-hidden="true"
                    >
                      {isOpen ? (
                        <Minus size={13} strokeWidth={1.8} />
                      ) : (
                        <Plus size={13} strokeWidth={1.8} />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={answerId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={
                          prefersReducedMotion
                            ? { opacity: 1, height: "auto" }
                            : { opacity: 0, height: 0 }
                        }
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        exit={
                          prefersReducedMotion
                            ? { opacity: 1, height: "auto" }
                            : { opacity: 0, height: 0 }
                        }
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-[12px] leading-6 text-stone-500 sm:px-6">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 24 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mt-6 overflow-hidden rounded-md
              bg-teal-950 px-6 py-9 text-center
              sm:px-10 sm:py-10
            "
          >
            <h2 className="font-['Newsreader'] text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              A good question is already a form of direction.
            </h2>

            <p className="mx-auto mt-3 max-w-[500px] text-[11px] leading-5 text-white/55 sm:text-xs">
              If something still feels unclear, share it through the feedback
              page in your student workspace.
            </p>

            <a
              href="/signup"
              className="
                group mt-6 inline-flex min-h-10 items-center gap-2
                rounded-md bg-orange-300 px-4
                text-[11px] font-semibold text-teal-950
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-orange-200
                hover:shadow-[0_10px_28px_rgba(251,191,36,0.16)]
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-orange-300
                active:translate-y-0
              "
            >
              Share a question
              <ArrowUpRight
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default FAQ;