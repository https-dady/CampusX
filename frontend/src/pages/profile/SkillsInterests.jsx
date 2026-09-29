import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Heart,
  Plus,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const initialTechnicalSkills = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
];

const initialSoftSkills = [
  "Problem solving",
  "Communication",
];

const initialInterests = [
  "Data analysis",
  "Artificial Intelligence",
  "Web development",
];

const availableTechnicalSkills = [
  "Python",
  "Java",
  "C++",
  "SQL",
  "Node.js",
  "MongoDB",
  "Git",
  "Machine Learning",
];

const availableInterests = [
  "Data Science",
  "Cloud computing",
  "Cybersecurity",
  "Product development",
  "UI/UX",
  "DevOps",
];

const careerDirections = [
  "Data Analyst",
  "Data Scientist",
  "AI / ML Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
];

/* -------------------------------------------------------------------------- */
/* Cursor-follow card                                                          */
/* -------------------------------------------------------------------------- */

const CursorCard = ({
  children,
  className = "",
  intensity = 3,
  delay = 0,
}) => {
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

    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    const rotateY = percentX * intensity;
    const rotateX = -percentY * intensity;

    const moveX = percentX * 4;
    const moveY = percentY * 4;

    const lightX = (x / rect.width) * 100;
    const lightY = (y / rect.height) * 100;

    cardRef.current.style.transform = `
      perspective(1100px)
      translate3d(${moveX}px, ${moveY}px, 0)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;

    cardRef.current.style.setProperty(
      "--cursor-x",
      `${lightX}%`
    );

    cardRef.current.style.setProperty(
      "--cursor-y",
      `${lightY}%`
    );

    cardRef.current.style.setProperty(
      "--cursor-opacity",
      "1"
    );
  };

  const resetCard = () => {
    if (!cardRef.current || prefersReducedMotion) {
      return;
    }

    cardRef.current.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    cardRef.current.style.setProperty(
      "--cursor-x",
      "50%"
    );

    cardRef.current.style.setProperty(
      "--cursor-y",
      "50%"
    );

    cardRef.current.style.setProperty(
      "--cursor-opacity",
      "0"
    );
  };

  return (
    <motion.article
      ref={cardRef}
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 22 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
      className={`
        relative overflow-hidden
        transition-[transform,box-shadow,border-color]
        duration-300 ease-out
        ${className}
      `}
      style={{
        "--cursor-x": "50%",
        "--cursor-y": "50%",
        "--cursor-opacity": "0",
      }}
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-0
          opacity-[var(--cursor-opacity)]
          transition-opacity duration-200
        "
        style={{
          background:
            "radial-gradient(circle at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.42), transparent 32%)",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
};

/* -------------------------------------------------------------------------- */
/* Main page                                                                   */
/* -------------------------------------------------------------------------- */

const SkillsInterests = () => {
  const prefersReducedMotion = useReducedMotion();

  const [technicalSkills, setTechnicalSkills] = useState(
    initialTechnicalSkills
  );

  const [softSkills] = useState(initialSoftSkills);

  const [interests, setInterests] = useState(
    initialInterests
  );

  const [careerDirection, setCareerDirection] =
    useState("Data Analyst");

  const [customSkill, setCustomSkill] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const snapshotRef = useRef(null);

  /* ------------------------------------------------------------------------ */
  /* Snapshot cursor-follow                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSnapshotMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !snapshotRef.current
    ) {
      return;
    }

    const rect =
      snapshotRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    const rotateY = percentX * 2.4;
    const rotateX = -percentY * 2.4;

    snapshotRef.current.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-2px)
    `;

    snapshotRef.current.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    snapshotRef.current.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
    );
  };

  const resetSnapshot = () => {
    if (
      !snapshotRef.current ||
      prefersReducedMotion
    ) {
      return;
    }

    snapshotRef.current.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0)
    `;
  };

  /* ------------------------------------------------------------------------ */
  /* Skills                                                                     */
  /* ------------------------------------------------------------------------ */

  const addTechnicalSkill = (skill) => {
    if (!technicalSkills.includes(skill)) {
      setTechnicalSkills((current) => [
        ...current,
        skill,
      ]);
    }
  };

  const removeTechnicalSkill = (skill) => {
    setTechnicalSkills((current) =>
      current.filter((item) => item !== skill)
    );
  };

  const addInterest = (interest) => {
    if (!interests.includes(interest)) {
      setInterests((current) => [
        ...current,
        interest,
      ]);
    }
  };

  const removeInterest = (interest) => {
    setInterests((current) =>
      current.filter((item) => item !== interest)
    );
  };

  const addCustomSkill = () => {
    const value = customSkill.trim();

    if (!value || technicalSkills.includes(value)) {
      return;
    }

    setTechnicalSkills((current) => [
      ...current,
      value,
    ]);

    setCustomSkill("");
  };

  const addCustomInterest = () => {
    const value = customInterest.trim();

    if (!value || interests.includes(value)) {
      return;
    }

    setInterests((current) => [
      ...current,
      value,
    ]);

    setCustomInterest("");
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomSkill();
    }
  };

  const handleInterestKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomInterest();
    }
  };

  const pageEase = [0.22, 1, 0.36, 1];

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* ================================================================== */}
      {/* PAGE HEADER                                                         */}
      {/* ================================================================== */}

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
        aria-labelledby="skills-title"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Skills & interests
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
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
              id="skills-title"
              className="
                font-['Newsreader']
                text-4xl font-semibold
                leading-[1.02]
                tracking-[-0.035em]
                text-[#10231f]
                sm:text-5xl
              "
            >
              Show us what makes you you.
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
              Your skills and interests help CampusX understand
              your current strengths and the directions that may
              fit you.
            </motion.p>
          </div>

          <motion.button
            type="button"
            onClick={() =>
              setIsEditing((value) => !value)
            }
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, x: 12 }
            }
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.55,
              delay: prefersReducedMotion ? 0 : 0.24,
              ease: pageEase,
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { y: -2 }
            }
            whileTap={
              prefersReducedMotion
                ? undefined
                : { scale: 0.98 }
            }
            className="
              inline-flex min-h-10 shrink-0
              items-center justify-center
              gap-2 rounded-md
              border border-stone-300
              bg-white px-4
              text-sm font-semibold
              text-stone-700
              shadow-[0_3px_12px_rgba(28,25,23,0.04)]
              transition-[border-color,box-shadow,color]
              duration-200
              hover:border-teal-800/30
              hover:text-teal-950
              hover:shadow-[0_8px_20px_rgba(28,25,23,0.07)]
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-teal-800
            "
          >
            <Sparkles
              size={15}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            {isEditing
              ? "Done editing"
              : "Edit skills"}
          </motion.button>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* SNAPSHOT                                                            */}
      {/* ================================================================== */}

      <motion.section
        ref={snapshotRef}
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 28, scale: 0.985 }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.8,
          delay: prefersReducedMotion ? 0 : 0.27,
          ease: pageEase,
        }}
        onPointerMove={handleSnapshotMove}
        onPointerLeave={resetSnapshot}
        className="
          relative mt-8
          overflow-hidden rounded-lg
          border border-teal-950
          bg-teal-950
          p-6 text-white
          shadow-[0_18px_45px_rgba(6,78,59,0.12)]
          transition-transform duration-300 ease-out
          sm:p-8
        "
        style={{
          "--cursor-x": "50%",
          "--cursor-y": "50%",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle 230px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.075), transparent 70%)",
          }}
        />

        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 10, 0],
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1],
                }
          }
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute right-10 top-10
            size-24 rounded-full
            bg-orange-300/[0.06]
            blur-2xl
          "
        />

        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-orange-300">
              Your current snapshot
            </p>

            <h2 className="
              mt-2 max-w-2xl
              font-['Newsreader']
              text-3xl font-semibold
              tracking-[-0.025em]
              sm:text-4xl
            ">
              You already have a useful foundation.
            </h2>

            <p className="
              mt-3 max-w-2xl
              text-sm leading-6
              text-white/55
            ">
              Keep refining this as you learn. Your profile
              should grow with your skills rather than trying
              to describe everything at once.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {[
              ["Technical", technicalSkills.length],
              ["Interests", interests.length],
              ["Direction", careerDirection],
            ].map(([label, value], index) => (
              <motion.div
                key={label}
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, y: 12 }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.45,
                  delay: prefersReducedMotion
                    ? 0
                    : 0.62 + index * 0.08,
                }}
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : { y: -3 }
                }
                className="
                  rounded-md
                  border border-white/10
                  bg-white/[0.06]
                  px-4 py-3
                  transition-colors duration-200
                  hover:bg-white/[0.09]
                "
              >
                <p className="
                  text-[9px]
                  uppercase tracking-[0.12em]
                  text-white/40
                ">
                  {label}
                </p>

                <p
                  className={[
                    "mt-1.5 font-semibold",
                    label === "Direction"
                      ? "truncate text-sm text-orange-300"
                      : "text-xl text-white",
                  ].join(" ")}
                >
                  {value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* CONTENT                                                             */}
      {/* ================================================================== */}

      <section className="
        mt-5 grid gap-5
        lg:grid-cols-[1.35fr_0.65fr]
      ">
        <div className="space-y-5">
          {/* ================================================================ */}
          {/* TECHNICAL SKILLS                                                 */}
          {/* ================================================================ */}

          <CursorCard
            intensity={2.4}
            delay={0.42}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <motion.span
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          rotate: 5,
                          scale: 1.06,
                        }
                  }
                  className="
                    flex size-9
                    items-center justify-center
                    rounded-md
                    bg-[#edf5f1]
                    text-teal-950
                  "
                >
                  <Code2
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </motion.span>

                <div>
                  <p className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-teal-950
                  ">
                    Technical skills
                  </p>

                  <h2 className="
                    mt-1 text-xl
                    font-semibold
                    tracking-[-0.02em]
                  ">
                    What can you work with?
                  </h2>
                </div>
              </div>

              <motion.span
                key={technicalSkills.length}
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        scale: 0.8,
                        opacity: 0,
                      }
                }
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className="
                  rounded-full
                  bg-[#dcefe9]
                  px-3 py-1
                  text-[10px]
                  font-semibold
                  text-teal-950
                "
              >
                {technicalSkills.length} added
              </motion.span>
            </div>

            <motion.div
              layout
              className="mt-6 flex flex-wrap gap-2"
            >
              {technicalSkills.map(
                (skill, index) => (
                  <motion.span
                    key={skill}
                    layout
                    initial={
                      prefersReducedMotion
                        ? false
                        : {
                            opacity: 0,
                            scale: 0.84,
                            y: 6,
                          }
                    }
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.78,
                    }}
                    transition={{
                      duration:
                        prefersReducedMotion
                          ? 0
                          : 0.28,
                      delay:
                        prefersReducedMotion
                          ? 0
                          : index * 0.035,
                    }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            y: -2,
                            scale: 1.025,
                          }
                    }
                    className="
                      group
                      inline-flex
                      items-center gap-2
                      rounded-full
                      border border-teal-900/10
                      bg-[#edf5f1]
                      px-3 py-1.5
                      text-xs font-medium
                      text-teal-950
                    "
                  >
                    <Check
                      size={12}
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />

                    {skill}

                    {isEditing && (
                      <motion.button
                        type="button"
                        initial={
                          prefersReducedMotion
                            ? false
                            : { scale: 0 }
                        }
                        animate={{ scale: 1 }}
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : { scale: 1.15 }
                        }
                        onClick={() =>
                          removeTechnicalSkill(skill)
                        }
                        className="
                          flex size-4
                          items-center justify-center
                          rounded-full
                          text-teal-950/50
                          transition-colors
                          hover:bg-teal-950/10
                          hover:text-teal-950
                          focus-visible:outline-2
                          focus-visible:outline-offset-1
                          focus-visible:outline-teal-800
                        "
                        aria-label={`Remove ${skill}`}
                      >
                        <X
                          size={10}
                          aria-hidden="true"
                        />
                      </motion.button>
                    )}
                  </motion.span>
                )
              )}
            </motion.div>

            <motion.div
              initial={false}
              animate={
                isEditing
                  ? {
                      opacity: 1,
                      height: "auto",
                      marginTop: 24,
                    }
                  : {
                      opacity: 0,
                      height: 0,
                      marginTop: 0,
                    }
              }
              transition={{
                duration:
                  prefersReducedMotion ? 0 : 0.3,
                ease: pageEase,
              }}
              className="overflow-hidden"
            >
              <div className="
                border-t border-stone-200
                pt-5
              ">
                <p className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-stone-400
                ">
                  Add a skill
                </p>

                <div className="
                  mt-3 flex
                  flex-wrap gap-2
                ">
                  {availableTechnicalSkills
                    .filter(
                      (skill) =>
                        !technicalSkills.includes(skill)
                    )
                    .map((skill) => (
                      <motion.button
                        key={skill}
                        type="button"
                        onClick={() =>
                          addTechnicalSkill(skill)
                        }
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : { y: -2 }
                        }
                        whileTap={
                          prefersReducedMotion
                            ? undefined
                            : { scale: 0.97 }
                        }
                        className="
                          inline-flex
                          items-center gap-1.5
                          rounded-full
                          border border-stone-200
                          bg-white
                          px-3 py-1.5
                          text-xs font-medium
                          text-stone-600
                          transition-[border-color,background-color,color]
                          duration-200
                          hover:border-teal-800/30
                          hover:bg-[#f7faf8]
                          hover:text-teal-950
                          focus-visible:outline-2
                          focus-visible:outline-offset-2
                          focus-visible:outline-teal-800
                        "
                      >
                        <Plus
                          size={11}
                          aria-hidden="true"
                        />

                        {skill}
                      </motion.button>
                    ))}
                </div>

                <div className="
                  mt-4 flex gap-2
                ">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(event) =>
                      setCustomSkill(event.target.value)
                    }
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Add another skill"
                    className="
                      min-h-10 min-w-0 flex-1
                      rounded-md
                      border border-stone-300
                      bg-white px-3
                      text-sm text-stone-800
                      outline-none
                      placeholder:text-stone-400
                      transition-[border-color,box-shadow]
                      duration-200
                      focus:border-teal-800
                      focus:ring-2
                      focus:ring-teal-800/10
                    "
                  />

                  <motion.button
                    type="button"
                    onClick={addCustomSkill}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { y: -2 }
                    }
                    whileTap={
                      prefersReducedMotion
                        ? undefined
                        : { scale: 0.97 }
                    }
                    className="
                      inline-flex min-h-10
                      shrink-0 items-center
                      gap-2 rounded-md
                      bg-teal-950 px-4
                      text-sm font-semibold
                      text-white
                      transition-colors duration-200
                      hover:bg-teal-900
                      focus-visible:outline-2
                      focus-visible:outline-offset-4
                      focus-visible:outline-teal-800
                    "
                  >
                    <Plus
                      size={14}
                      aria-hidden="true"
                    />
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </CursorCard>

          {/* ================================================================ */}
          {/* SOFT SKILLS                                                       */}
          {/* ================================================================ */}

          <CursorCard
            intensity={2.2}
            delay={0.54}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: -5,
                        scale: 1.06,
                      }
                }
                className="
                  flex size-9
                  items-center justify-center
                  rounded-md
                  bg-[#fff0e7]
                  text-orange-700
                "
              >
                <Heart
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.span>

              <div>
                <p className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-orange-700
                ">
                  Soft skills
                </p>

                <h2 className="
                  mt-1 text-xl
                  font-semibold
                  tracking-[-0.02em]
                ">
                  How do you work with others?
                </h2>
              </div>
            </div>

            <motion.div
              layout
              className="
                mt-6 flex
                flex-wrap gap-2
              "
            >
              {softSkills.map(
                (skill, index) => (
                  <motion.span
                    key={skill}
                    initial={
                      prefersReducedMotion
                        ? false
                        : {
                            opacity: 0,
                            scale: 0.88,
                          }
                    }
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration:
                        prefersReducedMotion
                          ? 0
                          : 0.35,
                      delay:
                        prefersReducedMotion
                          ? 0
                          : 0.72 +
                            index * 0.06,
                    }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { y: -2 }
                    }
                    className="
                      inline-flex
                      items-center gap-2
                      rounded-full
                      border border-stone-200
                      bg-[#f7f4ed]
                      px-3 py-1.5
                      text-xs font-medium
                      text-stone-700
                    "
                  >
                    <motion.span
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : {
                              scale: [
                                1,
                                1.25,
                                1,
                              ],
                            }
                      }
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: index * 0.4,
                      }}
                      className="
                        size-1.5
                        rounded-full
                        bg-orange-500
                      "
                    />

                    {skill}
                  </motion.span>
                )
              )}
            </motion.div>
          </CursorCard>

          {/* ================================================================ */}
          {/* INTERESTS                                                         */}
          {/* ================================================================ */}

          <CursorCard
            intensity={2.4}
            delay={0.66}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: [0, 4, -4, 0],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  flex size-9
                  items-center justify-center
                  rounded-md
                  bg-[#edf5f1]
                  text-teal-950
                "
              >
                <Sparkles
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.span>

              <div>
                <p className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-teal-950
                ">
                  Interests
                </p>

                <h2 className="
                  mt-1 text-xl
                  font-semibold
                  tracking-[-0.02em]
                ">
                  What are you curious about?
                </h2>
              </div>
            </div>

            <motion.div
              layout
              className="
                mt-6 flex
                flex-wrap gap-2
              "
            >
              {interests.map(
                (interest, index) => (
                  <motion.span
                    key={interest}
                    layout
                    initial={
                      prefersReducedMotion
                        ? false
                        : {
                            opacity: 0,
                            scale: 0.88,
                            y: 5,
                          }
                    }
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    transition={{
                      duration:
                        prefersReducedMotion
                          ? 0
                          : 0.35,
                      delay:
                        prefersReducedMotion
                          ? 0
                          : 0.8 +
                            index * 0.05,
                    }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            y: -2,
                            scale: 1.02,
                          }
                    }
                    className="
                      group
                      inline-flex
                      items-center gap-2
                      rounded-full
                      border border-teal-900/10
                      bg-[#edf5f1]
                      px-3 py-1.5
                      text-xs font-medium
                      text-teal-950
                    "
                  >
                    {interest}

                    {isEditing && (
                      <motion.button
                        type="button"
                        initial={
                          prefersReducedMotion
                            ? false
                            : { scale: 0 }
                        }
                        animate={{ scale: 1 }}
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : { scale: 1.15 }
                        }
                        onClick={() =>
                          removeInterest(
                            interest
                          )
                        }
                        className="
                          flex size-4
                          items-center justify-center
                          rounded-full
                          text-teal-950/50
                          transition-colors
                          hover:bg-teal-950/10
                          hover:text-teal-950
                          focus-visible:outline-2
                          focus-visible:outline-offset-1
                          focus-visible:outline-teal-800
                        "
                        aria-label={`Remove ${interest}`}
                      >
                        <X
                          size={10}
                          aria-hidden="true"
                        />
                      </motion.button>
                    )}
                  </motion.span>
                )
              )}
            </motion.div>

            <motion.div
              initial={false}
              animate={
                isEditing
                  ? {
                      opacity: 1,
                      height: "auto",
                      marginTop: 24,
                    }
                  : {
                      opacity: 0,
                      height: 0,
                      marginTop: 0,
                    }
              }
              transition={{
                duration:
                  prefersReducedMotion ? 0 : 0.3,
                ease: pageEase,
              }}
              className="overflow-hidden"
            >
              <div className="
                border-t border-stone-200
                pt-5
              ">
                <p className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-stone-400
                ">
                  Explore interests
                </p>

                <div className="
                  mt-3 flex
                  flex-wrap gap-2
                ">
                  {availableInterests
                    .filter(
                      (interest) =>
                        !interests.includes(
                          interest
                        )
                    )
                    .map((interest) => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() =>
                          addInterest(
                            interest
                          )
                        }
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : { y: -2 }
                        }
                        whileTap={
                          prefersReducedMotion
                            ? undefined
                            : { scale: 0.97 }
                        }
                        className="
                          inline-flex
                          items-center gap-1.5
                          rounded-full
                          border border-stone-200
                          bg-white
                          px-3 py-1.5
                          text-xs font-medium
                          text-stone-600
                          transition-[border-color,background-color,color]
                          duration-200
                          hover:border-teal-800/30
                          hover:bg-[#f7faf8]
                          hover:text-teal-950
                          focus-visible:outline-2
                          focus-visible:outline-offset-2
                          focus-visible:outline-teal-800
                        "
                      >
                        <Plus
                          size={11}
                          aria-hidden="true"
                        />

                        {interest}
                      </motion.button>
                    ))}
                </div>

                <div className="
                  mt-4 flex gap-2
                ">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(event) =>
                      setCustomInterest(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleInterestKeyDown
                    }
                    placeholder="Add another interest"
                    className="
                      min-h-10 min-w-0 flex-1
                      rounded-md
                      border border-stone-300
                      bg-white px-3
                      text-sm text-stone-800
                      outline-none
                      placeholder:text-stone-400
                      transition-[border-color,box-shadow]
                      duration-200
                      focus:border-teal-800
                      focus:ring-2
                      focus:ring-teal-800/10
                    "
                  />

                  <motion.button
                    type="button"
                    onClick={
                      addCustomInterest
                    }
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { y: -2 }
                    }
                    whileTap={
                      prefersReducedMotion
                        ? undefined
                        : { scale: 0.97 }
                    }
                    className="
                      inline-flex min-h-10
                      shrink-0 items-center
                      gap-2 rounded-md
                      bg-teal-950 px-4
                      text-sm font-semibold
                      text-white
                      transition-colors duration-200
                      hover:bg-teal-900
                      focus-visible:outline-2
                      focus-visible:outline-offset-4
                      focus-visible:outline-teal-800
                    "
                  >
                    <Plus
                      size={14}
                      aria-hidden="true"
                    />

                    Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </CursorCard>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN                                                        */}
        {/* ================================================================== */}

        <aside className="space-y-5">
          {/* CAREER DIRECTION */}

          <CursorCard
            intensity={2.2}
            delay={0.48}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
            "
          >
            <div className="
              flex items-start
              justify-between gap-4
            ">
              <div>
                <p className="
                  text-[10px]
                  font-bold uppercase
                  tracking-[0.12em]
                  text-teal-950
                ">
                  Career direction
                </p>

                <h2 className="
                  mt-2 text-xl
                  font-semibold
                  tracking-[-0.02em]
                ">
                  What sounds interesting?
                </h2>
              </div>

              <motion.span
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, -3, 0],
                      }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Target
                  size={19}
                  strokeWidth={1.7}
                  className="text-orange-500"
                  aria-hidden="true"
                />
              </motion.span>
            </div>

            <p className="
              mt-3 text-sm
              leading-6 text-stone-500
            ">
              This helps CampusX connect your
              current profile with relevant
              career paths.
            </p>

            <div className="mt-5 space-y-2">
              {careerDirections.map(
                (direction, index) => {
                  const selected =
                    careerDirection ===
                    direction;

                  return (
                    <motion.button
                      key={direction}
                      type="button"
                      onClick={() =>
                        setCareerDirection(
                          direction
                        )
                      }
                      initial={
                        prefersReducedMotion
                          ? false
                          : {
                              opacity: 0,
                              x: 10,
                            }
                      }
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration:
                          prefersReducedMotion
                            ? 0
                            : 0.35,
                        delay:
                          prefersReducedMotion
                            ? 0
                            : 0.72 +
                              index * 0.045,
                      }}
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { x: 3 }
                      }
                      whileTap={
                        prefersReducedMotion
                          ? undefined
                          : { scale: 0.99 }
                      }
                      className={[
                        "group flex min-h-10 w-full items-center justify-between rounded-md border px-3.5 text-left text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-200",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                        selected
                          ? "border-teal-950 bg-teal-950 text-white shadow-[0_7px_18px_rgba(6,78,59,0.10)]"
                          : "border-stone-200 bg-white text-stone-600 hover:border-teal-800/25 hover:bg-[#f7faf8] hover:text-teal-950",
                      ].join(" ")}
                    >
                      <span>
                        {direction}
                      </span>

                      <motion.span
                        animate={
                          selected
                            ? {
                                scale: [
                                  0.8,
                                  1.15,
                                  1,
                                ],
                              }
                            : {
                                scale: 1,
                              }
                        }
                        transition={{
                          duration:
                            prefersReducedMotion
                              ? 0
                              : 0.3,
                        }}
                      >
                        {selected ? (
                          <Check
                            size={14}
                            strokeWidth={2}
                            className="text-orange-300"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronRight
                            size={14}
                            strokeWidth={1.7}
                            className="
                              text-stone-300
                              transition-transform
                              duration-200
                              group-hover:translate-x-0.5
                              group-hover:text-teal-900
                            "
                            aria-hidden="true"
                          />
                        )}
                      </motion.span>
                    </motion.button>
                  );
                }
              )}
            </div>
          </CursorCard>

          {/* WHY IT MATTERS */}

          <CursorCard
            intensity={2}
            delay={0.72}
            className="
              rounded-lg
              border border-orange-200
              bg-[#fde0cd] p-6
              hover:shadow-[0_18px_34px_rgba(194,103,52,0.10)]
            "
          >
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
                absolute -right-10 -top-10
                size-28 rounded-full
                bg-orange-200/50
                blur-2xl
              "
            />

            <div className="
              relative flex size-10
              items-center justify-center
              rounded-md
              bg-white/60
              text-teal-950
            ">
              <Target
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <h2 className="
              relative mt-5
              font-['Newsreader']
              text-2xl font-semibold
              leading-tight
              tracking-[-0.02em]
              text-[#221410]
            ">
              Your skills are the starting point,
              not the final answer.
            </h2>

            <p className="
              relative mt-3
              text-sm leading-6
              text-stone-600
            ">
              CampusX uses this information
              alongside your profile and
              assessment to understand possible
              career directions.
            </p>
          </CursorCard>

          {/* NEXT STEP CTA */}

          <motion.a
            href="/career-insights"
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 22 }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration:
                prefersReducedMotion ? 0 : 0.65,
              delay:
                prefersReducedMotion ? 0 : 0.84,
              ease: pageEase,
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    y: -4,
                    rotateX: 1,
                  }
            }
            className="
              group block
              rounded-lg
              border border-teal-950
              bg-teal-950
              p-6 text-white
              shadow-[0_12px_32px_rgba(6,78,59,0.10)]
              transition-shadow duration-300
              hover:shadow-[0_22px_42px_rgba(6,78,59,0.18)]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-teal-800
            "
          >
            <p className="
              text-[10px]
              font-bold uppercase
              tracking-[0.12em]
              text-orange-300
            ">
              Next useful step
            </p>

            <h2 className="
              mt-2 text-xl
              font-semibold
              tracking-[-0.02em]
            ">
              See where your skills could take you.
            </h2>

            <p className="
              mt-2 text-xs
              leading-5 text-white/55
            ">
              Explore career directions based
              on your current profile.
            </p>

            <span className="
              mt-5 inline-flex
              items-center gap-2
              text-xs font-semibold
              text-white
            ">
              Explore career insights

              <ArrowRight
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1.5
                "
              />
            </span>
          </motion.a>
        </aside>
      </section>

      {/* ================================================================== */}
      {/* FOOT NOTE                                                            */}
      {/* ================================================================== */}

      <motion.div
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 10 }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration:
            prefersReducedMotion ? 0 : 0.55,
          delay:
            prefersReducedMotion ? 0 : 1.05,
          ease: pageEase,
        }}
        className="
          mt-6 flex items-center gap-3
          rounded-md
          border border-stone-200
          bg-white/60
          px-4 py-3
        "
      >
        <motion.span
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  rotate: [0, 8, -8, 0],
                }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles
            size={15}
            strokeWidth={1.7}
            className="
              shrink-0 text-teal-900
            "
            aria-hidden="true"
          />
        </motion.span>

        <p className="
          text-[11px]
          leading-5 text-stone-500
        ">
          You can update these details anytime.
          Your career direction can change as
          you learn and gain experience.
        </p>
      </motion.div>
    </div>
  );
};

export default SkillsInterests;