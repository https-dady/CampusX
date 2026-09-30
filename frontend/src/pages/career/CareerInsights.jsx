import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Code2,
  Database,
  Lightbulb,
  Loader2,
  Map,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  createCareerGoal,
  getMyCareerGoal,
  updateMyCareerGoal,
} from "../../services/careerGoal.service";

import {
  predictCareer,
  getMySkillGap,
} from "../../services/career.service";

/* -------------------------------------------------------------------------- */
/* Cursor-follow card                                                         */
/* -------------------------------------------------------------------------- */

const CursorCard = ({
  children,
  className = "",
  intensity = 2.2,
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

    cardRef.current.style.transform = `
      perspective(1100px)
      translate3d(${percentX * 4}px, ${percentY * 4}px, 0)
      rotateX(${-percentY * intensity}deg)
      rotateY(${percentX * intensity}deg)
    `;

    cardRef.current.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    cardRef.current.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
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
      animate={{
        opacity: 1,
        y: 0,
      }}
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
            "radial-gradient(circle 180px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.42), transparent 72%)",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getProbabilityPercentage = (probability) => {
  if (
    typeof probability !== "number" ||
    !Number.isFinite(probability)
  ) {
    return 0;
  }

  return Math.round(probability * 100);
};

const getConfidenceLabel = (confidence) => {
  if (!confidence) {
    return "Not available";
  }

  return (
    confidence.charAt(0).toUpperCase() +
    confidence.slice(1)
  );
};

const getRoleIcon = (career = "") => {
  const normalizedCareer = career.toLowerCase();

  if (
    normalizedCareer.includes("data") &&
    !normalizedCareer.includes("scientist")
  ) {
    return Database;
  }

  if (
    normalizedCareer.includes("engineer") ||
    normalizedCareer.includes("developer") ||
    normalizedCareer.includes("software") ||
    normalizedCareer.includes("web")
  ) {
    return Code2;
  }

  if (
    normalizedCareer.includes("analyst")
  ) {
    return BarChart3;
  }

  if (
    normalizedCareer.includes("ai") ||
    normalizedCareer.includes("ml")
  ) {
    return Sparkles;
  }

  return TrendingUp;
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const CareerInsights = () => {
  const prefersReducedMotion = useReducedMotion();

  /* ------------------------------------------------------------------------ */
  /* Career analysis state                                                    */
  /* ------------------------------------------------------------------------ */

  const [careerAnalysis, setCareerAnalysis] =
    useState(null);

  const [skillGap, setSkillGap] =
    useState(null);

  const [isLoadingAnalysis, setIsLoadingAnalysis] =
    useState(true);

  const [isLoadingSkillGap, setIsLoadingSkillGap] =
    useState(true);

  const [analysisError, setAnalysisError] =
    useState("");

  const [skillGapError, setSkillGapError] =
    useState("");

  const [selectedRole, setSelectedRole] =
    useState("");

  /* ------------------------------------------------------------------------ */
  /* Career goal state                                                        */
  /* ------------------------------------------------------------------------ */

  const [careerGoal, setCareerGoal] =
    useState(null);

  const [isLoadingGoal, setIsLoadingGoal] =
    useState(true);

  const [goalError, setGoalError] =
    useState("");

  const [isEditingGoal, setIsEditingGoal] =
    useState(false);

  const [goalDraft, setGoalDraft] =
    useState({
      targetCareer: "",
      targetDomain: "",
      targetLevel: "",
      targetTimeline: "",
    });

  const [isSavingGoal, setIsSavingGoal] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const [saveSuccess, setSaveSuccess] =
    useState("");

  const pageEase = [0.22, 1, 0.36, 1];

  /* ------------------------------------------------------------------------ */
  /* Load career goal                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let isMounted = true;

    const loadCareerGoal = async () => {
      setIsLoadingGoal(true);
      setGoalError("");

      try {
        const result = await getMyCareerGoal();

        const fetchedGoal =
          result?.data?.careerGoal || null;

        if (!isMounted) {
          return;
        }

        setCareerGoal(fetchedGoal);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Failed to fetch CampusX career goal:",
          error
        );

        setGoalError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load your career goal."
        );
      } finally {
        if (isMounted) {
          setIsLoadingGoal(false);
        }
      }
    };

    loadCareerGoal();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Load career analysis + skill gap                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let isMounted = true;

    const loadCareerInsights = async () => {
      setIsLoadingAnalysis(true);
      setIsLoadingSkillGap(true);

      setAnalysisError("");
      setSkillGapError("");

      const [analysisResult, skillGapResult] =
        await Promise.allSettled([
          predictCareer(),
          getMySkillGap(),
        ]);

      if (!isMounted) {
        return;
      }

      /* Career analysis */

      if (
        analysisResult.status === "fulfilled"
      ) {
        const analysis =
          analysisResult.value?.data?.analysis ||
          null;

        setCareerAnalysis(analysis);

        const primaryCareer =
          analysis?.primaryCareer?.career;

        if (primaryCareer) {
          setSelectedRole(primaryCareer);
        }
      } else {
        const error =
          analysisResult.reason;

        console.error(
          "Failed to generate CampusX career analysis:",
          error
        );

        setAnalysisError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to generate career analysis."
        );
      }

      /* Skill gap */

      if (
        skillGapResult.status === "fulfilled"
      ) {
        const currentSkillGap =
          skillGapResult.value?.data?.skillGap ||
          null;

        setSkillGap(currentSkillGap);
      } else {
        const error =
          skillGapResult.reason;

        console.error(
          "Failed to fetch CampusX skill gap:",
          error
        );

        setSkillGapError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to generate skill gap."
        );
      }

      setIsLoadingAnalysis(false);
      setIsLoadingSkillGap(false);
    };

    loadCareerInsights();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Cursor-follow surfaces                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSurfaceMove = (
    event,
    intensity = 2.3
  ) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    const surface = event.currentTarget;

    const rect =
      surface.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    const percentX =
      x / rect.width - 0.5;

    const percentY =
      y / rect.height - 0.5;

    surface.style.transform = `
      perspective(1100px)
      translate3d(
        ${percentX * 4}px,
        ${percentY * 4 - 2}px,
        0
      )
      rotateX(${-percentY * intensity}deg)
      rotateY(${percentX * intensity}deg)
    `;

    surface.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    surface.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
    );

    surface.style.setProperty(
      "--cursor-opacity",
      "1"
    );
  };

  const resetSurface = (event) => {
    if (prefersReducedMotion) {
      return;
    }

    const surface =
      event.currentTarget;

    surface.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    surface.style.setProperty(
      "--cursor-opacity",
      "0"
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Derived career prediction data                                          */
  /* ------------------------------------------------------------------------ */

  const predictions =
    Array.isArray(
      careerAnalysis?.predictions
    )
      ? careerAnalysis.predictions
      : [];

  const primaryPrediction =
    careerAnalysis?.primaryCareer || null;

  const primaryCareer =
    primaryPrediction?.career || "";

  const selectedPrediction =
    predictions.find(
      (prediction) =>
        prediction.career === selectedRole
    ) ||
    primaryPrediction;

  const displayedCareer =
    selectedPrediction?.career ||
    primaryCareer ||
    "Career analysis";

  const displayedProbability =
    getProbabilityPercentage(
      selectedPrediction?.probability
    );

  const displayedConfidence =
    getConfidenceLabel(
      selectedPrediction?.confidence
    );

  const matchedSkills =
    Array.isArray(
      skillGap?.matchedSkills
    )
      ? skillGap.matchedSkills
      : [];

  const missingSkills =
    Array.isArray(
      skillGap?.missingSkills
    )
      ? skillGap.missingSkills
      : [];

  const requiredSkills =
    Array.isArray(
      skillGap?.requiredSkills
    )
      ? skillGap.requiredSkills
      : [];

  const matchPercentage =
    typeof skillGap?.matchPercentage ===
    "number"
      ? skillGap.matchPercentage
      : 0;

  const rolePredictions =
    predictions.filter(
      (prediction) =>
        prediction.career !== primaryCareer
    );

  /* ------------------------------------------------------------------------ */
  /* Career goal modal                                                        */
  /* ------------------------------------------------------------------------ */

  const openEditGoal = () => {
    setGoalDraft({
      targetCareer:
        careerGoal?.targetCareer || "",
      targetDomain:
        careerGoal?.targetDomain || "",
      targetLevel:
        careerGoal?.targetLevel || "",
      targetTimeline:
        careerGoal?.targetTimeline || "",
    });

    setSaveError("");
    setSaveSuccess("");
    setIsEditingGoal(true);
  };

  const closeEditGoal = () => {
    if (isSavingGoal) {
      return;
    }

    setIsEditingGoal(false);
    setSaveError("");
    setSaveSuccess("");
  };

  const handleGoalChange = (
    field,
    value
  ) => {
    setGoalDraft((currentGoal) => ({
      ...currentGoal,
      [field]: value,
    }));
  };

  const handleSaveGoal = async (
    event
  ) => {
    event.preventDefault();

    const payload = {
      targetCareer:
        goalDraft.targetCareer.trim(),

      targetDomain:
        goalDraft.targetDomain.trim(),

      targetLevel:
        goalDraft.targetLevel.trim(),

      targetTimeline:
        goalDraft.targetTimeline.trim(),
    };

    if (
      !payload.targetCareer ||
      !payload.targetDomain ||
      !payload.targetLevel ||
      !payload.targetTimeline
    ) {
      setSaveError(
        "Please fill all career goal fields."
      );

      return;
    }

    setIsSavingGoal(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const result = careerGoal
        ? await updateMyCareerGoal(
            payload
          )
        : await createCareerGoal(
            payload
          );

      const updatedGoal =
        result?.data?.careerGoal || {
          ...(careerGoal || {}),
          ...payload,
        };

      setCareerGoal(updatedGoal);

      setSaveSuccess(
        careerGoal
          ? "Career goal updated successfully."
          : "Career goal created successfully."
      );

      /*
       * Skill gap is based on the career goal.
       * Re-fetch it after a successful goal update.
       */
      try {
        const updatedSkillGap =
          await getMySkillGap();

        setSkillGap(
          updatedSkillGap?.data?.skillGap ||
            null
        );

        setSkillGapError("");
      } catch (skillGapError) {
        console.error(
          "Failed to refresh skill gap:",
          skillGapError
        );

        setSkillGapError(
          skillGapError?.response?.data
            ?.message ||
            skillGapError?.message ||
            "Career goal updated, but skill gap could not be refreshed."
        );
      }

      window.setTimeout(() => {
        setIsEditingGoal(false);
        setSaveSuccess("");
      }, 700);
    } catch (error) {
      console.error(
        "Failed to save CampusX career goal:",
        error
      );

      setSaveError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save your career goal."
      );
    } finally {
      setIsSavingGoal(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Loading state                                                             */
  /* ------------------------------------------------------------------------ */

  if (
    isLoadingAnalysis &&
    isLoadingSkillGap &&
    isLoadingGoal
  ) {
    return (
      <main
        className="
          mx-auto flex min-h-[70vh]
          w-full max-w-[1216px]
          items-center justify-center
          px-4 py-10
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            flex flex-col
            items-center justify-center
            text-center
          "
          role="status"
          aria-live="polite"
        >
          <Loader2
            size={28}
            className="
              animate-spin
              text-teal-950
            "
            aria-hidden="true"
          />

          <p
            className="
              mt-4 text-sm
              font-medium
              text-stone-600
            "
          >
            Building your career insights...
          </p>

          <p
            className="
              mt-1 text-xs
              text-stone-400
            "
          >
            Analyzing your profile and skill gap.
          </p>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Empty/error state                                                        */
  /* ------------------------------------------------------------------------ */

  const hasAnyCareerData =
    Boolean(
      careerAnalysis ||
      skillGap
    );

  return (
    <div
      className="
        mx-auto w-full
        max-w-[1216px]
        px-4 py-8
        sm:px-6
        lg:px-8 lg:py-10
      "
    >
      {/* ================================================================== */}
      {/* PAGE HEADER                                                         */}
      {/* ================================================================== */}

      <motion.section
        initial={
          prefersReducedMotion
            ? {
                opacity: 1,
                y: 0,
              }
            : {
                opacity: 0,
                y: 20,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration:
            prefersReducedMotion
              ? 0
              : 0.65,
          ease: pageEase,
        }}
        aria-labelledby="career-insights-title"
      >
        <p
          className="
            text-[10px]
            font-bold uppercase
            tracking-[0.12em]
            text-teal-950
          "
        >
          Career insights
        </p>

        <div
          className="
            mt-2 flex
            flex-col gap-4
          "
        >
          <motion.h1
            id="career-insights-title"
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 14,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration:
                prefersReducedMotion
                  ? 0
                  : 0.6,
              delay:
                prefersReducedMotion
                  ? 0
                  : 0.08,
              ease: pageEase,
            }}
            className="
              font-['Newsreader']
              text-4xl
              font-semibold
              leading-[1.02]
              tracking-[-0.035em]
              text-[#10231f]
              sm:text-5xl
            "
          >
            See where your current profile points.
          </motion.h1>

          <motion.p
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 12,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration:
                prefersReducedMotion
                  ? 0
                  : 0.55,
              delay:
                prefersReducedMotion
                  ? 0
                  : 0.18,
              ease: pageEase,
            }}
            className="
              max-w-2xl
              text-sm leading-6
              text-stone-500
              sm:text-[15px]
            "
          >
            Your profile is analyzed against the
            career prediction model and your current
            career goal to highlight useful next steps.
          </motion.p>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* ERROR BANNERS                                                       */}
      {/* ================================================================== */}

      {(analysisError ||
        skillGapError ||
        goalError) && (
        <div className="mt-6 space-y-2">
          {analysisError && (
            <div
              role="alert"
              className="
                rounded-md
                border border-red-200
                bg-red-50
                px-4 py-3
                text-xs
                leading-5
                text-red-700
              "
            >
              Career analysis: {analysisError}
            </div>
          )}

          {skillGapError && (
            <div
              role="alert"
              className="
                rounded-md
                border border-orange-200
                bg-orange-50
                px-4 py-3
                text-xs
                leading-5
                text-orange-700
              "
            >
              Skill gap: {skillGapError}
            </div>
          )}

          {goalError && (
            <div
              role="alert"
              className="
                rounded-md
                border border-orange-200
                bg-orange-50
                px-4 py-3
                text-xs
                leading-5
                text-orange-700
              "
            >
              Career goal: {goalError}
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* PRIMARY CAREER ANALYSIS                                             */}
      {/* ================================================================== */}

      <motion.section
        initial={
          prefersReducedMotion
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
              }
            : {
                opacity: 0,
                y: 28,
                scale: 0.985,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration:
            prefersReducedMotion
              ? 0
              : 0.8,
          delay:
            prefersReducedMotion
              ? 0
              : 0.25,
          ease: pageEase,
        }}
        className="
          relative mt-8
          overflow-hidden
          rounded-lg
          border border-teal-950
          bg-teal-950
          p-6 text-white
          shadow-[0_18px_45px_rgba(6,78,59,0.13)]
          sm:p-8
          transition-[transform,box-shadow]
          duration-300 ease-out
          will-change-transform
        "
        onPointerMove={(event) =>
          handleSurfaceMove(
            event,
            2.4
          )
        }
        onPointerLeave={resetSurface}
        style={{
          "--cursor-x": "50%",
          "--cursor-y": "50%",
          "--cursor-opacity": "0",
        }}
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0 z-0
            opacity-[var(--cursor-opacity)]
            transition-opacity
            duration-200
          "
          style={{
            background:
              "radial-gradient(circle 220px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.16), transparent 72%)",
          }}
        />

        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 15, 0],
                  y: [0, -8, 0],
                  scale: [
                    1,
                    1.06,
                    1,
                  ],
                }
          }
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            -right-16 -top-20
            size-64
            rounded-full
            bg-orange-300/[0.07]
            blur-3xl
          "
        />

        <div
          className="
            relative grid
            gap-8
            lg:grid-cols-[1fr_280px]
            lg:items-center
          "
        >
          <div>
            <div
              className="
                flex flex-wrap
                items-center gap-2
              "
            >
              <span
                className="
                  rounded-full
                  border border-white/10
                  bg-white/[0.06]
                  px-3 py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-orange-300
                "
              >
                AI career analysis
              </span>

              <span
                className="
                  rounded-full
                  bg-white/[0.06]
                  px-3 py-1
                  text-[10px]
                  text-white/45
                "
              >
                {careerAnalysis
                  ? `Model ${careerAnalysis.modelVersion || "v1"}`
                  : "Analysis unavailable"}
              </span>

              <button
                type="button"
                onClick={openEditGoal}
                disabled={
                  isLoadingGoal
                }
                className="
                  inline-flex
                  items-center gap-1.5
                  rounded-full
                  border border-white/10
                  bg-white/[0.06]
                  px-3 py-1
                  text-[10px]
                  font-semibold
                  text-white/80
                  transition-colors
                  duration-200
                  hover:bg-white/[0.1]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-orange-300
                "
              >
                {careerGoal
                  ? "Edit goal"
                  : "Set goal"}
              </button>
            </div>

            <motion.h2
              key={displayedCareer}
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 8,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  prefersReducedMotion
                    ? 0
                    : 0.4,
              }}
              className="
                mt-4
                font-['Newsreader']
                text-4xl
                font-semibold
                tracking-[-0.03em]
                sm:text-5xl
              "
            >
              {displayedCareer}
            </motion.h2>

            <motion.p
              key={`${displayedCareer}-description`}
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 8,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  prefersReducedMotion
                    ? 0
                    : 0.4,
                delay:
                  prefersReducedMotion
                    ? 0
                    : 0.05,
              }}
              className="
                mt-4 max-w-2xl
                text-sm leading-7
                text-white/55
              "
            >
              This career direction is generated from
              your current profile by the CampusX career
              prediction model.
            </motion.p>

            <div
              className="
                mt-6 flex flex-wrap
                gap-2
              "
            >
              {matchedSkills
                .slice(0, 6)
                .map(
                  (skill) => (
                    <span
                      key={skill}
                      className="
                        inline-flex
                        items-center gap-1.5
                        rounded-full
                        border border-white/10
                        bg-white/[0.06]
                        px-3 py-1.5
                        text-xs
                        text-white/75
                      "
                    >
                      <Check
                        size={11}
                        className="
                          text-orange-300
                        "
                        aria-hidden="true"
                      />

                      {skill}
                    </span>
                  )
                )}

              {matchedSkills.length === 0 &&
                skillGap && (
                  <span
                    className="
                      rounded-full
                      border border-white/10
                      bg-white/[0.06]
                      px-3 py-1.5
                      text-xs
                      text-white/55
                    "
                  >
                    No matched technical skills yet
                  </span>
                )}
            </div>

            {/* Goal summary */}

            <div
              className="
                mt-6 grid
                gap-2
                sm:grid-cols-3
              "
            >
              <div
                className="
                  rounded-md
                  border border-white/10
                  bg-white/[0.045]
                  px-3 py-2.5
                "
              >
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.1em]
                    text-white/35
                  "
                >
                  Domain
                </p>

                <p
                  className="
                    mt-1 truncate
                    text-xs
                    font-semibold
                    text-white/80
                  "
                >
                  {careerGoal?.targetDomain ||
                    "Not set"}
                </p>
              </div>

              <div
                className="
                  rounded-md
                  border border-white/10
                  bg-white/[0.045]
                  px-3 py-2.5
                "
              >
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.1em]
                    text-white/35
                  "
                >
                  Level
                </p>

                <p
                  className="
                    mt-1 truncate
                    text-xs
                    font-semibold
                    text-white/80
                  "
                >
                  {careerGoal?.targetLevel ||
                    "Not set"}
                </p>
              </div>

              <div
                className="
                  rounded-md
                  border border-white/10
                  bg-white/[0.045]
                  px-3 py-2.5
                "
              >
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.1em]
                    text-white/35
                  "
                >
                  Timeline
                </p>

                <p
                  className="
                    mt-1 truncate
                    text-xs
                    font-semibold
                    text-white/80
                  "
                >
                  {careerGoal?.targetTimeline ||
                    "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Career probability */}

          <motion.div
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
                  : 0.7,
              delay:
                prefersReducedMotion
                  ? 0
                  : 0.45,
              ease: pageEase,
            }}
            className="
              relative mx-auto
              flex size-[210px]
              items-center
              justify-center
              rounded-full
              border border-white/10
              bg-white/[0.035]
              shadow-[inset_0_0_50px_rgba(255,255,255,0.025)]
            "
          >
            <div
              className="
                absolute inset-4
                rounded-full
                border border-white/[0.06]
              "
            />

            <svg
              viewBox="0 0 120 120"
              className="
                absolute inset-0
                size-full
                -rotate-90
              "
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="5"
              />

              <motion.circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#fdba74"
                strokeWidth="5"
                strokeLinecap="round"
                pathLength="100"
                initial={{
                  strokeDasharray:
                    "0 100",
                }}
                animate={{
                  strokeDasharray: `${displayedProbability} 100`,
                }}
                transition={{
                  duration:
                    prefersReducedMotion
                      ? 0
                      : 1.1,
                  delay:
                    prefersReducedMotion
                      ? 0
                      : 0.55,
                  ease: "easeOut",
                }}
              />
            </svg>

            <div
              className="
                relative text-center
              "
            >
              <motion.p
                key={
                  displayedProbability
                }
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.8,
                      }
                }
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="
                  text-5xl
                  font-semibold
                  tracking-[-0.04em]
                "
              >
                {careerAnalysis
                  ? `${displayedProbability}%`
                  : "—"}
              </motion.p>

              <p
                className="
                  mt-1
                  text-[10px]
                  uppercase
                  tracking-[0.12em]
                  text-white/40
                "
              >
                Model probability
              </p>

              <p
                className="
                  mt-1 text-[10px]
                  text-white/35
                "
              >
                {displayedConfidence}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* MAIN GRID                                                           */}
      {/* ================================================================== */}

      <section
        className="
          mt-5 grid gap-5
          lg:grid-cols-[1.35fr_0.65fr]
        "
      >
        <div className="space-y-5">
          {/* ================================================================ */}
          {/* SKILL GAP                                                        */}
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
            <div
              className="
                flex items-start
                justify-between gap-4
              "
            >
              <div
                className="
                  flex items-center gap-2.5
                "
              >
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
                    items-center
                    justify-center
                    rounded-md
                    bg-[#edf5f1]
                    text-teal-950
                  "
                >
                  <Target
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </motion.span>

                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold uppercase
                      tracking-[0.12em]
                      text-teal-950
                    "
                  >
                    Skill gap
                  </p>

                  <h2
                    className="
                      mt-1 text-xl
                      font-semibold
                      tracking-[-0.02em]
                    "
                  >
                    Skills that could move you forward.
                  </h2>
                </div>
              </div>

              <span
                className="
                  hidden
                  rounded-full
                  bg-[#edf5f1]
                  px-3 py-1
                  text-[10px]
                  font-semibold
                  text-teal-950
                  sm:inline-flex
                "
              >
                {skillGap
                  ? `${matchPercentage}% match`
                  : "Analyzing"}
              </span>
            </div>

            {/* Skill gap loading */}

            {isLoadingSkillGap ? (
              <div
                className="
                  mt-8 flex
                  items-center
                  gap-2
                  text-xs
                  text-stone-400
                "
                role="status"
                aria-live="polite"
              >
                <Loader2
                  size={15}
                  className="animate-spin"
                  aria-hidden="true"
                />

                Calculating your skill gap...
              </div>
            ) : skillGap ? (
              <>
                <div
                  className="
                    mt-6 grid
                    gap-3
                    sm:grid-cols-3
                  "
                >
                  <div
                    className="
                      rounded-md
                      border
                      border-stone-200
                      bg-[#faf7f0]/60
                      p-4
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.1em]
                        text-stone-400
                      "
                    >
                      Required
                    </p>

                    <p
                      className="
                        mt-1
                        text-xl
                        font-semibold
                        text-stone-800
                      "
                    >
                      {requiredSkills.length}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-md
                      border
                      border-stone-200
                      bg-[#faf7f0]/60
                      p-4
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.1em]
                        text-stone-400
                      "
                    >
                      Matched
                    </p>

                    <p
                      className="
                        mt-1
                        text-xl
                        font-semibold
                        text-teal-950
                      "
                    >
                      {matchedSkills.length}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-md
                      border
                      border-stone-200
                      bg-[#faf7f0]/60
                      p-4
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.1em]
                        text-stone-400
                      "
                    >
                      Missing
                    </p>

                    <p
                      className="
                        mt-1
                        text-xl
                        font-semibold
                        text-orange-700
                      "
                    >
                      {missingSkills.length}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div
                    className="
                      flex items-center
                      justify-between gap-3
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-stone-700
                      "
                    >
                      Current skill match
                    </p>

                    <span
                      className="
                        text-xs
                        font-semibold
                        text-teal-950
                      "
                    >
                      {matchPercentage}%
                    </span>
                  </div>

                  <div
                    className="
                      mt-2 h-2
                      overflow-hidden
                      rounded-full
                      bg-stone-200
                    "
                  >
                    <motion.div
                      initial={{
                        width: "0%",
                      }}
                      animate={{
                        width: `${Math.min(
                          Math.max(
                            matchPercentage,
                            0
                          ),
                          100
                        )}%`,
                      }}
                      transition={{
                        duration:
                          prefersReducedMotion
                            ? 0
                            : 0.9,
                        ease: "easeOut",
                      }}
                      className="
                        h-full
                        rounded-full
                        bg-teal-900
                      "
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {missingSkills.length > 0 ? (
                    missingSkills.map(
                      (skill, index) => (
                        <motion.div
                          key={skill}
                          initial={
                            prefersReducedMotion
                              ? false
                              : {
                                  opacity: 0,
                                  x: -12,
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
                                : 0.45,
                            delay:
                              prefersReducedMotion
                                ? 0
                                : 0.1 +
                                  index *
                                    0.06,
                          }}
                          whileHover={
                            prefersReducedMotion
                              ? undefined
                              : {
                                  x: 3,
                                }
                          }
                          className="
                            group
                            rounded-md
                            border
                            border-stone-200
                            bg-[#faf7f0]/60
                            p-4
                            transition-[border-color,box-shadow]
                            duration-200
                            hover:border-teal-800/20
                            hover:shadow-[0_7px_18px_rgba(28,25,23,0.045)]
                          "
                        >
                          <div
                            className="
                              flex items-center
                              justify-between
                              gap-4
                            "
                          >
                            <div
                              className="
                                flex min-w-0
                                items-center gap-3
                              "
                            >
                              <span
                                className="
                                  flex size-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-md
                                  bg-white
                                  text-orange-700
                                "
                              >
                                <Target
                                  size={16}
                                  strokeWidth={
                                    1.7
                                  }
                                  aria-hidden="true"
                                />
                              </span>

                              <div
                                className="
                                  min-w-0
                                "
                              >
                                <p
                                  className="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-stone-800
                                  "
                                >
                                  {skill}
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    text-[10px]
                                    text-stone-400
                                  "
                                >
                                  Missing skill
                                </p>
                              </div>
                            </div>

                            <span
                              className="
                                shrink-0
                                rounded-full
                                bg-orange-50
                                px-2.5 py-1
                                text-[10px]
                                font-semibold
                                text-orange-700
                              "
                            >
                              Priority
                            </span>
                          </div>
                        </motion.div>
                      )
                    )
                  ) : (
                    <div
                      className="
                        rounded-md
                        border
                        border-teal-200
                        bg-[#edf5f1]
                        px-4 py-3
                        text-xs
                        leading-5
                        text-teal-900
                      "
                    >
                      No missing skills were returned for
                      this career requirement.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                className="
                  mt-6 rounded-md
                  border border-stone-200
                  bg-[#faf7f0]/60
                  px-4 py-3
                  text-xs
                  leading-5
                  text-stone-500
                "
              >
                Skill gap data is not available yet.
              </div>
            )}
          </CursorCard>

          {/* ================================================================ */}
          {/* PRACTICAL NEXT STEPS                                             */}
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
            <div
              className="
                flex items-center gap-2.5
              "
            >
              <motion.span
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: [
                          0,
                          4,
                          -4,
                          0,
                        ],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  flex size-9
                  items-center
                  justify-center
                  rounded-md
                  bg-[#fff0e7]
                  text-orange-700
                "
              >
                <Map
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.span>

              <div>
                <p
                  className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-orange-700
                  "
                >
                  Your direction
                </p>

                <h2
                  className="
                    mt-1 text-xl
                    font-semibold
                    tracking-[-0.02em]
                  "
                >
                  A practical path from your skill gap.
                </h2>
              </div>
            </div>

            <div className="relative mt-7">
              <div
                aria-hidden="true"
                className="
                  absolute
                  left-[15px]
                  top-4 bottom-4
                  w-px
                  bg-stone-200
                "
              />

              <div className="space-y-5">
                {missingSkills
                  .slice(0, 4)
                  .map(
                    (skill, index) => (
                      <motion.div
                        key={skill}
                        initial={
                          prefersReducedMotion
                            ? false
                            : {
                                opacity: 0,
                                x: -10,
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
                              : 0.45,
                          delay:
                            prefersReducedMotion
                              ? 0
                              : 0.7 +
                                index *
                                  0.1,
                        }}
                        className="
                          relative
                          flex gap-4
                        "
                      >
                        <motion.div
                          whileHover={
                            prefersReducedMotion
                              ? undefined
                              : {
                                  scale: 1.12,
                                }
                          }
                          className="
                            relative z-10
                            flex size-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-teal-950
                            bg-teal-950
                            text-[9px]
                            font-bold
                            text-orange-300
                          "
                        >
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </motion.div>

                        <div
                          className="
                            min-w-0
                            flex-1 pb-1
                          "
                        >
                          <div
                            className="
                              flex flex-wrap
                              items-center
                              gap-2
                            "
                          >
                            <h3
                              className="
                                text-sm
                                font-semibold
                                text-stone-800
                              "
                            >
                              Build {skill}
                            </h3>

                            <span
                              className="
                                rounded-full
                                bg-stone-100
                                px-2 py-0.5
                                text-[9px]
                                font-medium
                                text-stone-500
                              "
                            >
                              Skill gap
                            </span>
                          </div>

                          <p
                            className="
                              mt-1.5
                              text-xs leading-5
                              text-stone-500
                            "
                          >
                            This skill is currently
                            missing from the returned
                            career requirement match.
                          </p>
                        </div>
                      </motion.div>
                    )
                  )}

                {missingSkills.length ===
                  0 && (
                  <div
                    className="
                      relative
                      flex gap-4
                    "
                  >
                    <div
                      className="
                        relative z-10
                        flex size-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-teal-950
                        bg-teal-950
                        text-orange-300
                      "
                    >
                      <Check
                        size={14}
                        aria-hidden="true"
                      />
                    </div>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <h3
                        className="
                          text-sm
                          font-semibold
                          text-stone-800
                        "
                      >
                        No current skill gap
                      </h3>

                      <p
                        className="
                          mt-1.5
                          text-xs
                          leading-5
                          text-stone-500
                        "
                      >
                        The current career requirement
                        returned no missing skills.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <motion.a
              href="/learning-roadmap"
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: -2,
                    }
              }
              className="
                group mt-6
                inline-flex
                items-center gap-2
                text-xs font-semibold
                text-teal-950
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
              "
            >
              Open learning roadmap

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
            </motion.a>
          </CursorCard>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN                                                       */}
        {/* ================================================================== */}

        <aside className="space-y-5">
          {/* ================================================================ */}
          {/* CURRENT MATCH                                                    */}
          {/* ================================================================ */}

          <CursorCard
            intensity={2.3}
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
            <div
              className="
                flex items-start
                justify-between gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-teal-950
                  "
                >
                  Current match
                </p>

                <h2
                  className="
                    mt-2 text-xl
                    font-semibold
                    tracking-[-0.02em]
                  "
                >
                  What your skill profile shows.
                </h2>
              </div>

              <Lightbulb
                size={19}
                strokeWidth={1.7}
                className="
                  text-orange-500
                "
                aria-hidden="true"
              />
            </div>

            <div className="mt-5 space-y-3">
              {matchedSkills.length > 0 ? (
                matchedSkills
                  .slice(0, 6)
                  .map(
                    (skill, index) => (
                      <motion.div
                        key={skill}
                        initial={
                          prefersReducedMotion
                            ? false
                            : {
                                opacity: 0,
                                x: 8,
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
                              : 0.4,
                          delay:
                            prefersReducedMotion
                              ? 0
                              : 0.72 +
                                index *
                                  0.07,
                        }}
                        className="
                          flex items-start
                          gap-2.5
                        "
                      >
                        <span
                          className="
                            mt-0.5
                            flex size-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#edf5f1]
                            text-teal-950
                          "
                        >
                          <Check
                            size={11}
                            strokeWidth={2.2}
                            aria-hidden="true"
                          />
                        </span>

                        <p
                          className="
                            text-xs
                            leading-5
                            text-stone-600
                          "
                        >
                          {skill}
                        </p>
                      </motion.div>
                    )
                  )
              ) : (
                <p
                  className="
                    text-xs
                    leading-5
                    text-stone-500
                  "
                >
                  No matched skills were returned
                  for the current requirement.
                </p>
              )}
            </div>
          </CursorCard>

          {/* ================================================================ */}
          {/* OTHER MODEL PREDICTIONS                                          */}
          {/* ================================================================ */}

          <CursorCard
            intensity={2}
            delay={0.62}
            className="
              rounded-lg
              border border-stone-200
              bg-white p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
            "
          >
            <p
              className="
                text-[10px]
                font-bold uppercase
                tracking-[0.12em]
                text-teal-950
              "
            >
              Model predictions
            </p>

            <h2
              className="
                mt-2 text-xl
                font-semibold
                tracking-[-0.02em]
              "
            >
              Other directions detected.
            </h2>

            <p
              className="
                mt-2 text-xs
                leading-5 text-stone-500
              "
            >
              These are the other career predictions
              returned by the current model.
            </p>

            <div className="mt-5 space-y-2">
              {rolePredictions.length > 0 ? (
                rolePredictions
                  .slice(0, 5)
                  .map(
                    (role, index) => {
                      const Icon =
                        getRoleIcon(
                          role.career
                        );

                      const selected =
                        selectedRole ===
                        role.career;

                      const percentage =
                        getProbabilityPercentage(
                          role.probability
                        );

                      return (
                        <motion.button
                          key={
                            role.career
                          }
                          type="button"
                          onClick={() =>
                            setSelectedRole(
                              role.career
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
                                : 0.4,
                            delay:
                              prefersReducedMotion
                                ? 0
                                : 0.72 +
                                  index *
                                    0.07,
                          }}
                          whileHover={
                            prefersReducedMotion
                              ? undefined
                              : {
                                  x: 3,
                                }
                          }
                          className={[
                            "group flex w-full items-center gap-3 rounded-md border p-3 text-left transition-[border-color,background-color,box-shadow] duration-200",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                            selected
                              ? "border-teal-900/20 bg-[#edf5f1] shadow-[0_7px_18px_rgba(6,78,59,0.05)]"
                              : "border-stone-200 bg-white hover:border-stone-300 hover:bg-[#faf7f0]/60",
                          ].join(" ")}
                        >
                          <span
                            className="
                              flex size-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              bg-white
                              text-teal-950
                            "
                          >
                            <Icon
                              size={15}
                              strokeWidth={1.7}
                              aria-hidden="true"
                            />
                          </span>

                          <span
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <span
                              className="
                                block truncate
                                text-xs
                                font-semibold
                                text-stone-800
                              "
                            >
                              {role.career}
                            </span>

                            <span
                              className="
                                mt-0.5 block
                                text-[10px]
                                text-stone-400
                              "
                            >
                              {percentage}% probability
                              {" · "}
                              {getConfidenceLabel(
                                role.confidence
                              )}
                            </span>
                          </span>

                          <ChevronRight
                            size={14}
                            strokeWidth={1.7}
                            className="
                              shrink-0
                              text-stone-300
                              transition-transform
                              duration-200
                              group-hover:translate-x-0.5
                              group-hover:text-teal-900
                            "
                            aria-hidden="true"
                          />
                        </motion.button>
                      );
                    }
                  )
              ) : (
                <div
                  className="
                    rounded-md
                    border
                    border-stone-200
                    bg-[#faf7f0]/60
                    px-4 py-3
                    text-xs
                    leading-5
                    text-stone-500
                  "
                >
                  No additional career predictions
                  were returned.
                </div>
              )}
            </div>
          </CursorCard>

          {/* ================================================================ */}
          {/* LEARNING CTA                                                     */}
          {/* ================================================================ */}

          <motion.a
            href="/learning-roadmap"
            initial={
              prefersReducedMotion
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {
                    opacity: 0,
                    y: 22,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration:
                prefersReducedMotion
                  ? 0
                  : 0.65,
              delay:
                prefersReducedMotion
                  ? 0
                  : 0.82,
              ease: pageEase,
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    y: -4,
                  }
            }
            className="
              group relative block
              overflow-hidden
              rounded-lg
              border border-teal-950
              bg-teal-950
              p-6 text-white
              shadow-[0_12px_32px_rgba(6,78,59,0.10)]
              transition-[transform,box-shadow]
              duration-300
              hover:shadow-[0_22px_42px_rgba(6,78,59,0.18)]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-teal-800
              will-change-transform
            "
            onPointerMove={(event) =>
              handleSurfaceMove(
                event,
                2.4
              )
            }
            onPointerLeave={resetSurface}
            style={{
              "--cursor-x": "50%",
              "--cursor-y": "50%",
              "--cursor-opacity": "0",
            }}
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute inset-0 z-0
                opacity-[var(--cursor-opacity)]
                transition-opacity duration-200
              "
              style={{
                background:
                  "radial-gradient(circle 220px at var(--cursor-x) var(--cursor-y), rgba(255,255,255,0.16), transparent 72%)",
              }}
            />

            <div
              className="
                relative z-10
                flex size-10
                items-center
                justify-center
                rounded-md
                bg-white/[0.08]
                text-orange-300
              "
            >
              <TrendingUp
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <p
              className="
                relative z-10
                mt-5 text-[10px]
                font-bold uppercase
                tracking-[0.12em]
                text-orange-300
              "
            >
              Turn insight into action
            </p>

            <h2
              className="
                relative z-10
                mt-2 text-xl
                font-semibold
                tracking-[-0.02em]
              "
            >
              Build the skills your gap highlights.
            </h2>

            <p
              className="
                relative z-10
                mt-2 text-xs
                leading-5 text-white/55
              "
            >
              Use your current skill gap as a focused
              starting point for the learning roadmap.
            </p>

            <span
              className="
                relative z-10
                mt-5 inline-flex
                items-center gap-2
                text-xs font-semibold
                text-white
              "
            >
              Explore learning roadmap

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
      {/* FOOT NOTE                                                           */}
      {/* ================================================================== */}

      <motion.div
        initial={
          prefersReducedMotion
            ? {
                opacity: 1,
                y: 0,
              }
            : {
                opacity: 0,
                y: 10,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration:
            prefersReducedMotion
              ? 0
              : 0.55,
          delay:
            prefersReducedMotion
              ? 0
              : 1.05,
          ease: pageEase,
        }}
        className="
          mt-6 flex
          items-start gap-3
          rounded-md
          border border-stone-200
          bg-white/60
          px-5 py-4
        "
      >
        <Sparkles
          size={15}
          strokeWidth={1.7}
          className="
            mt-0.5 shrink-0
            text-teal-900
          "
          aria-hidden="true"
        />

        <p
          className="
            text-[11px]
            leading-5 text-stone-500
          "
        >
          Career probabilities come from the configured
          CampusX prediction model. Skill-gap values come
          from the career requirement matched against your
          current technical skills.
        </p>
      </motion.div>

      {/* ================================================================== */}
      {/* CAREER GOAL MODAL                                                   */}
      {/* ================================================================== */}

      {isEditingGoal && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center
            justify-center
            bg-[#10231f]/55
            p-4
            backdrop-blur-sm
          "
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditGoal();
            }
          }}
        >
          <motion.div
            initial={
              prefersReducedMotion
                ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }
                : {
                    opacity: 0,
                    y: 16,
                    scale: 0.98,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration:
                prefersReducedMotion
                  ? 0
                  : 0.35,
              ease: pageEase,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="career-goal-modal-title"
            className="
              w-full max-w-lg
              overflow-hidden
              rounded-xl
              border border-stone-200
              bg-[#faf7f0]
              shadow-[0_28px_80px_rgba(0,0,0,0.2)]
            "
          >
            <div
              className="
                flex items-start
                justify-between gap-4
                border-b border-stone-200
                bg-white
                px-6 py-5
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold uppercase
                    tracking-[0.12em]
                    text-teal-950
                  "
                >
                  Career direction
                </p>

                <h2
                  id="career-goal-modal-title"
                  className="
                    mt-1
                    font-['Newsreader']
                    text-2xl
                    font-semibold
                    tracking-[-0.025em]
                    text-[#10231f]
                  "
                >
                  {careerGoal
                    ? "Update your career goal"
                    : "Set your career goal"}
                </h2>

                <p
                  className="
                    mt-1 text-xs
                    leading-5
                    text-stone-500
                  "
                >
                  Keep your target specific so your
                  career analysis and skill gap stay
                  aligned.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeEditGoal
                }
                disabled={
                  isSavingGoal
                }
                aria-label="
                  Close career goal dialog
                "
                className="
                  flex size-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  text-stone-400
                  transition-colors
                  duration-200
                  hover:bg-stone-100
                  hover:text-stone-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-teal-800
                "
              >
                <X
                  size={17}
                  aria-hidden="true"
                />
              </button>
            </div>

            <form
              onSubmit={
                handleSaveGoal
              }
              className="
                space-y-4 p-6
              "
            >
              {/* Target career */}

              <div>
                <label
                  htmlFor="targetCareer"
                  className="
                    block text-xs
                    font-semibold
                    text-stone-700
                  "
                >
                  Target career
                </label>

                <input
                  id="targetCareer"
                  type="text"
                  value={
                    goalDraft.targetCareer
                  }
                  onChange={(event) =>
                    handleGoalChange(
                      "targetCareer",
                      event.target.value
                    )
                  }
                  placeholder="
                    e.g. AI Engineer
                  "
                  disabled={
                    isSavingGoal
                  }
                  className="
                    mt-1.5 w-full
                    rounded-md
                    border
                    border-stone-200
                    bg-white
                    px-3 py-2.5
                    text-sm
                    text-stone-800
                    outline-none
                    transition-[border-color,box-shadow]
                    duration-200
                    placeholder:text-stone-300
                    focus:border-teal-800
                    focus:ring-2
                    focus:ring-teal-800/10
                    disabled:cursor-not-allowed
                    disabled:bg-stone-100
                  "
                />
              </div>

              {/* Target domain */}

              <div>
                <label
                  htmlFor="targetDomain"
                  className="
                    block text-xs
                    font-semibold
                    text-stone-700
                  "
                >
                  Target domain
                </label>

                <input
                  id="targetDomain"
                  type="text"
                  value={
                    goalDraft.targetDomain
                  }
                  onChange={(event) =>
                    handleGoalChange(
                      "targetDomain",
                      event.target.value
                    )
                  }
                  placeholder="
                    e.g. Artificial Intelligence
                  "
                  disabled={
                    isSavingGoal
                  }
                  className="
                    mt-1.5 w-full
                    rounded-md
                    border
                    border-stone-200
                    bg-white
                    px-3 py-2.5
                    text-sm
                    text-stone-800
                    outline-none
                    transition-[border-color,box-shadow]
                    duration-200
                    placeholder:text-stone-300
                    focus:border-teal-800
                    focus:ring-2
                    focus:ring-teal-800/10
                    disabled:cursor-not-allowed
                    disabled:bg-stone-100
                  "
                />
              </div>

              {/* Level + timeline */}

              <div
                className="
                  grid gap-4
                  sm:grid-cols-2
                "
              >
                <div>
                  <label
                    htmlFor="targetLevel"
                    className="
                      block text-xs
                      font-semibold
                      text-stone-700
                    "
                  >
                    Target level
                  </label>

                  <input
                    id="targetLevel"
                    type="text"
                    value={
                      goalDraft.targetLevel
                    }
                    onChange={(event) =>
                      handleGoalChange(
                        "targetLevel",
                        event.target.value
                      )
                    }
                    placeholder="
                      e.g. Entry Level
                    "
                    disabled={
                      isSavingGoal
                    }
                    className="
                      mt-1.5 w-full
                      rounded-md
                      border
                      border-stone-200
                      bg-white
                      px-3 py-2.5
                      text-sm
                      text-stone-800
                      outline-none
                      transition-[border-color,box-shadow]
                      duration-200
                      placeholder:text-stone-300
                      focus:border-teal-800
                      focus:ring-2
                      focus:ring-teal-800/10
                      disabled:cursor-not-allowed
                      disabled:bg-stone-100
                    "
                  />
                </div>

                <div>
                  <label
                    htmlFor="targetTimeline"
                    className="
                      block text-xs
                      font-semibold
                      text-stone-700
                    "
                  >
                    Target timeline
                  </label>

                  <input
                    id="targetTimeline"
                    type="text"
                    value={
                      goalDraft.targetTimeline
                    }
                    onChange={(event) =>
                      handleGoalChange(
                        "targetTimeline",
                        event.target.value
                      )
                    }
                    placeholder="
                      e.g. 3 months
                    "
                    disabled={
                      isSavingGoal
                    }
                    className="
                      mt-1.5 w-full
                      rounded-md
                      border
                      border-stone-200
                      bg-white
                      px-3 py-2.5
                      text-sm
                      text-stone-800
                      outline-none
                      transition-[border-color,box-shadow]
                      duration-200
                      placeholder:text-stone-300
                      focus:border-teal-800
                      focus:ring-2
                      focus:ring-teal-800/10
                      disabled:cursor-not-allowed
                      disabled:bg-stone-100
                    "
                  />
                </div>
              </div>

              {/* Save error */}

              {saveError && (
                <div
                  className="
                    rounded-md
                    border border-red-200
                    bg-red-50
                    px-3 py-2.5
                    text-xs
                    leading-5
                    text-red-700
                  "
                  role="alert"
                >
                  {saveError}
                </div>
              )}

              {/* Save success */}

              {saveSuccess && (
                <div
                  className="
                    rounded-md
                    border border-teal-200
                    bg-[#edf5f1]
                    px-3 py-2.5
                    text-xs
                    leading-5
                    text-teal-900
                  "
                  role="status"
                  aria-live="polite"
                >
                  {saveSuccess}
                </div>
              )}

              {/* Actions */}

              <div
                className="
                  flex flex-col-reverse
                  gap-2
                  border-t
                  border-stone-200
                  pt-4
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={
                    closeEditGoal
                  }
                  disabled={
                    isSavingGoal
                  }
                  className="
                    rounded-md
                    border
                    border-stone-200
                    bg-white
                    px-4 py-2.5
                    text-xs
                    font-semibold
                    text-stone-600
                    transition-colors
                    duration-200
                    hover:bg-stone-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-teal-800
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSavingGoal
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-md
                    bg-teal-950
                    px-4 py-2.5
                    text-xs
                    font-semibold
                    text-white
                    transition-[transform,box-shadow]
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[0_8px_18px_rgba(6,78,59,0.16)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-teal-800
                  "
                >
                  {isSavingGoal ? (
                    <>
                      <Loader2
                        size={14}
                        className="
                          animate-spin
                        "
                        aria-hidden="true"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      Save career goal

                      <ArrowRight
                        size={14}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CareerInsights;