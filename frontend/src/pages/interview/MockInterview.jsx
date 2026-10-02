import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import GeminiLiveInterviewTest from "./GeminiLiveInterviewTest.jsx";

const pageEase = [0.22, 1, 0.36, 1];

const ROLE_OPTIONS = [
  "Software Developer",
  "Web Developer",
  "Frontend Developer",
  "Backend Developer",
  "AI Engineer",
  "ML Engineer",
  "Data Scientist",
  "Data Analyst",
  "Data Engineer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "Business Analyst",
];

const DIFFICULTY_OPTIONS = [
  {
    value: "easy",
    label: "Easy",
    description: "Fundamentals and confidence building",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Practical technical interview level",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Deeper reasoning and probing",
  },
];

const FeatureCard = ({ icon: Icon, title, text }) => (
  <div className="flex gap-3 rounded-md border border-stone-200 bg-[#fffdf9] px-4 py-4">
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#dcefe9] text-teal-950">
      <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
    </div>

    <div>
      <h3 className="text-xs font-semibold text-[#10231f]">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-5 text-stone-500">
        {text}
      </p>
    </div>
  </div>
);

const MockInterview = () => {
  const prefersReducedMotion = useReducedMotion();

  const [started, setStarted] = useState(false);
  const [targetRole, setTargetRole] = useState(
    "Software Developer"
  );
  const [difficulty, setDifficulty] = useState("medium");

  if (started) {
    return (
      <GeminiLiveInterviewTest
        embedded
        targetRole={targetRole}
        difficulty={difficulty}
      />
    );
  }

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
          AI Mock Interview
        </p>

        <h1
          id="mock-interview-title"
          className="mt-2 font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl"
        >
          Practice before it counts.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
          Have a real-time voice interview with AI, answer as many
          questions as you want, and end the session whenever you
          are ready. Your final report is generated from the answers
          you actually completed.
        </p>
      </motion.section>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.55,
            delay: prefersReducedMotion ? 0 : 0.12,
            ease: pageEase,
          }}
          className="rounded-lg border border-teal-950 bg-teal-950 p-6 text-white shadow-[0_18px_45px_rgba(6,78,59,0.13)] sm:p-8"
        >
          <div className="flex size-11 items-center justify-center rounded-md bg-white/10 text-orange-300 ring-1 ring-white/10">
            <BrainCircuit
              size={20}
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </div>

          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-300">
            Live AI interview
          </p>

          <h2 className="mt-2 max-w-xl font-['Newsreader'] text-4xl font-semibold tracking-[-0.03em]">
            One question at a time. No fixed limit.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-stone-300">
            Gemini asks the next question after each completed answer.
            The session stays active until you explicitly end it.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <Mic
                size={17}
                className="text-orange-300"
                aria-hidden="true"
              />
              <p className="mt-3 text-xs font-semibold">
                Voice first
              </p>
              <p className="mt-1 text-[11px] leading-5 text-stone-400">
                Speak naturally with live transcription.
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <Target
                size={17}
                className="text-orange-300"
                aria-hidden="true"
              />
              <p className="mt-3 text-xs font-semibold">
                Role focused
              </p>
              <p className="mt-1 text-[11px] leading-5 text-stone-400">
                Questions stay relevant to your selected role.
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <CheckCircle2
                size={17}
                className="text-orange-300"
                aria-hidden="true"
              />
              <p className="mt-3 text-xs font-semibold">
                Final report
              </p>
              <p className="mt-1 text-[11px] leading-5 text-stone-400">
                Scores and actionable feedback at the end.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.55,
            delay: prefersReducedMotion ? 0 : 0.2,
            ease: pageEase,
          }}
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
            Configure your session
          </p>

          <div className="mt-5">
            <label
              htmlFor="interview-role"
              className="block text-xs font-semibold text-[#10231f]"
            >
              Target role
            </label>

            <select
              id="interview-role"
              value={targetRole}
              onChange={(event) =>
                setTargetRole(event.target.value)
              }
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-[#fffdf9] px-3 text-sm text-stone-700 outline-none transition-[border-color,box-shadow] duration-200 focus:border-teal-800/50 focus:ring-4 focus:ring-teal-800/5"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-[#10231f]">
              Difficulty
            </p>

            <div className="mt-2 space-y-2">
              {DIFFICULTY_OPTIONS.map((option) => {
                const active =
                  difficulty === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setDifficulty(option.value)
                    }
                    className={[
                      "flex w-full items-center justify-between rounded-md border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200",
                      active
                        ? "border-teal-800/40 bg-[#eef8f4] shadow-[0_4px_14px_rgba(6,78,59,0.05)]"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50",
                    ].join(" ")}
                  >
                    <span>
                      <span className="block text-xs font-semibold text-[#10231f]">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-stone-500">
                        {option.description}
                      </span>
                    </span>

                    <span
                      className={[
                        "size-3 rounded-full border",
                        active
                          ? "border-teal-800 bg-teal-800 ring-4 ring-teal-800/10"
                          : "border-stone-300 bg-white",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[11px] text-stone-500">
            <Clock3 size={13} aria-hidden="true" />
            No fixed duration — end the interview when you are ready.
          </div>

          <button
            type="button"
            onClick={() => setStarted(true)}
            className="group mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-950 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(6,78,59,0.10)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-teal-900 hover:shadow-[0_12px_25px_rgba(6,78,59,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800 active:translate-y-0"
          >
            Start AI interview
            <ArrowRight
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </motion.section>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <FeatureCard
          icon={Mic}
          title="Speak naturally"
          text="Start and stop each answer manually so you stay in control of the interview turn."
        />
        <FeatureCard
          icon={Sparkles}
          title="Adaptive questioning"
          text="The next AI question is generated from the ongoing interview conversation."
        />
        <FeatureCard
          icon={CheckCircle2}
          title="Evidence-based report"
          text="The final report uses only the answers actually recorded in the session."
        />
      </div>
    </div>
  );
};

export default MockInterview;
