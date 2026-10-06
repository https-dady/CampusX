import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  FileText,
  Globe2,
  GraduationCap,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMyLearningGoal,
  getMyLearningPreference,
  saveLearningGoal,
  saveLearningPreference,
} from "../../services/learningJourney.service.js";

const pageEase = [
  0.22,
  1,
  0.36,
  1,
];

const SOURCE_OPTIONS = [
  {
    id: "government",

    title:
      "Government / Academic",

    description:
      "Trusted public and academic learning sources.",

    icon: Building2,
  },

  {
    id:
      "official_documentation",

    title:
      "Official documentation",

    description:
      "First-party documentation and official references.",

    icon: FileText,
  },

  {
    id: "courses",

    title:
      "Courses & tutorials",

    description:
      "Structured courses, tutorials and lecture resources.",

    icon: BookOpen,
  },
];

const DEFAULT_SOURCES = [
  "government",
  "official_documentation",
  "courses",
];

const normalizeSkills = (
  value
) => {
  if (
    typeof value !==
    "string"
  ) {
    return [];
  }

  const seen =
    new Set();

  return value
    .split(",")
    .map(
      (item) =>
        item.trim()
    )
    .filter(Boolean)
    .filter((item) => {
      const key =
        item.toLowerCase();

      if (
        seen.has(key)
      ) {
        return false;
      }

      seen.add(key);

      return true;
    });
};

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data
    ?.message ||
  error?.message ||
  fallback;

const LearningGoal = () => {
  const navigate =
    useNavigate();

  const prefersReducedMotion =
    useReducedMotion();

  const [step, setStep] =
    useState(1);

  const [domain, setDomain] =
    useState("");

  const [skillsInput, setSkillsInput] =
    useState("");

  const [skillGap, setSkillGap] =
    useState(null);

  const [language, setLanguage] =
    useState("English");

  const [
    selectedSources,
    setSelectedSources,
  ] = useState(
    DEFAULT_SOURCES
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const targetSkills =
    useMemo(
      () =>
        normalizeSkills(
          skillsInput
        ),
      [skillsInput]
    );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [
          goalResult,
          preferenceResult,
        ] =
          await Promise.allSettled([
            getMyLearningGoal(),
            getMyLearningPreference(),
          ]);

        if (!mounted) {
          return;
        }

        /*
         * Existing learning goal
         */
        if (
          goalResult.status ===
          "fulfilled"
        ) {
          const goal =
            goalResult.value
              ?.data?.goal;

          const existingGap =
            goalResult.value
              ?.data?.skillGap;

          if (goal) {
            setDomain(
              goal.domain ||
                ""
            );

            setSkillsInput(
              Array.isArray(
                goal.targetSkills
              )
                ? goal.targetSkills.join(
                    ", "
                  )
                : ""
            );

            setSkillGap(
              existingGap ||
                null
            );
          }
        } else if (
          goalResult.reason
            ?.response?.status !==
          404
        ) {
          setError(
            getErrorMessage(
              goalResult.reason,
              "Unable to load your learning goal."
            )
          );
        }

        /*
         * Existing learning preference
         */
        if (
          preferenceResult.status ===
          "fulfilled"
        ) {
          const preference =
            preferenceResult
              .value
              ?.data
              ?.preference;

          if (preference) {
            setLanguage(
              preference.language ||
                "English"
            );

            setSelectedSources(
              Array.isArray(
                preference.preferredSources
              ) &&
                preference
                  .preferredSources
                  .length > 0
                ? preference.preferredSources
                : DEFAULT_SOURCES
            );
          }
        } else if (
          preferenceResult.reason
            ?.response?.status !==
          404
        ) {
          setError(
            getErrorMessage(
              preferenceResult.reason,
              "Unable to load your learning preferences."
            )
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGoalSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const normalizedDomain =
        domain.trim();

      if (
        !normalizedDomain
      ) {
        setError(
          "Tell us what learning domain you want to focus on."
        );

        return;
      }

      if (
        targetSkills.length ===
        0
      ) {
        setError(
          "Add at least one skill you want to learn."
        );

        return;
      }

      setSaving(true);

      try {
        const response =
          await saveLearningGoal({
            domain:
              normalizedDomain,

            targetSkills,
          });

        if (
          !response?.success
        ) {
          throw new Error(
            response?.message ||
              "Unable to save your learning goal."
          );
        }

        setSkillGap(
          response?.data
            ?.skillGap ||
            null
        );

        setStep(2);
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
            "Unable to save your learning goal."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  const toggleSource =
    (sourceId) => {
      setSelectedSources(
        (current) => {
          if (
            current.includes(
              sourceId
            )
          ) {
            return current.length ===
              1
              ? current
              : current.filter(
                  (source) =>
                    source !==
                    sourceId
                );
          }

          return [
            ...current,
            sourceId,
          ];
        }
      );
    };

  const handlePreferenceSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        !language.trim()
      ) {
        setError(
          "Choose a language for your learning resources."
        );

        return;
      }

      if (
        selectedSources.length ===
        0
      ) {
        setError(
          "Select at least one preferred resource source."
        );

        return;
      }

      setSaving(true);

      try {
        const response =
          await saveLearningPreference(
            {
              language:
                language.trim(),

              preferredSources:
                selectedSources,
            }
          );

        if (
          !response?.success
        ) {
          throw new Error(
            response?.message ||
              "Unable to save your learning preferences."
          );
        }

        navigate(
          "/learning-roadmap",
          {
            replace: true,
          }
        );
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
            "Unable to save your learning preferences."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f0] px-5">
        <div
          className="flex items-center gap-2 text-sm font-medium text-stone-500"
          role="status"
          aria-live="polite"
        >
          <Loader2
            size={16}
            className="animate-spin"
          />

          Preparing your learning path...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f0] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <motion.section
          initial={
            prefersReducedMotion
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 18,
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

            ease: pageEase,
          }}
          className="rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_14px_45px_rgba(28,25,23,0.06)] sm:p-10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            {step === 1 ? (
              <GraduationCap
                size={27}
                strokeWidth={1.8}
              />
            ) : (
              <Globe2
                size={27}
                strokeWidth={1.8}
              />
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-950">
            <span>
              CampusX · I WANT TO LEARN
            </span>

            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] tracking-[0.08em] text-stone-500">
              Step {step} of 2
            </span>
          </div>

          {step === 1 ? (
            <>
              <h1 className="mt-3 max-w-3xl font-['Newsreader'] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10231f] sm:text-5xl">
                What do you want to learn?
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
                Tell CampusX the learning
                direction and skills you want
                to build. We will compare them
                with the skills already present
                in your profile instead of
                making you relearn everything
                from the beginning.
              </p>

              {error && (
                <div
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={
                  handleGoalSubmit
                }
                className="mt-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="learning-domain"
                    className="text-sm font-semibold text-stone-800"
                  >
                    Learning domain
                  </label>

                  <input
                    id="learning-domain"
                    type="text"
                    value={domain}
                    onChange={(event) =>
                      setDomain(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Web Development, Data Science, AI"
                    maxLength={100}
                    className="mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-4 text-sm text-stone-800 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-800/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="learning-skills"
                    className="text-sm font-semibold text-stone-800"
                  >
                    Skills you want to learn
                  </label>

                  <input
                    id="learning-skills"
                    type="text"
                    value={skillsInput}
                    onChange={(event) =>
                      setSkillsInput(
                        event.target.value
                      )
                    }
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-4 text-sm text-stone-800 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-800/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-stone-400">
                    Separate multiple skills with commas.
                  </p>
                </div>

                {targetSkills.length >
                  0 && (
                  <div className="rounded-2xl border border-stone-200 bg-[#fffdf9] p-5">
                    <div className="flex items-center gap-2">
                      <Target
                        size={16}
                        className="text-teal-900"
                      />

                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-950">
                        Your learning target
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {targetSkills.map(
                        (skill) => (
                          <span
                            key={skill.toLowerCase()}
                            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Comparing your skills...
                    </>
                  ) : (
                    <>
                      Compare my skills

                      <ArrowRight
                        size={17}
                      />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-3 max-w-3xl font-['Newsreader'] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10231f] sm:text-5xl">
                Make your learning path feel like yours.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
                Choose the language and source
                types you prefer. These
                preferences will be passed into
                the learning-resource workflow.
              </p>

              {error && (
                <div
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {skillGap && (
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-900">
                      You already have
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(
                        skillGap.matchedSkills ||
                        []
                      ).length >
                      0 ? (
                        skillGap.matchedSkills.map(
                          (skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-900"
                            >
                              <Check
                                size={13}
                              />

                              {skill}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-sm text-emerald-800/80">
                          No selected target skill is matched yet.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-900">
                      You need to learn
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(
                        skillGap.missingSkills ||
                        []
                      ).length >
                      0 ? (
                        skillGap.missingSkills.map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-amber-900"
                            >
                              {skill}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-sm text-amber-800/80">
                          You already cover the selected target.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form
                onSubmit={
                  handlePreferenceSubmit
                }
                className="mt-8 space-y-8"
              >
                <div>
                  <label
                    htmlFor="learning-language"
                    className="text-sm font-semibold text-stone-800"
                  >
                    Preferred learning language
                  </label>

                  <div className="relative mt-2">
                    <Globe2
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    />

                    <input
                      id="learning-language"
                      type="text"
                      value={language}
                      onChange={(event) =>
                        setLanguage(
                          event.target.value
                        )
                      }
                      placeholder="e.g. English, Hindi, Hinglish"
                      maxLength={50}
                      className="min-h-12 w-full rounded-xl border border-stone-300 bg-[#fffdf9] pl-11 pr-4 text-sm text-stone-800 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-800/10"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    Preferred resource sources
                  </p>

                  <p className="mt-1 text-xs leading-5 text-stone-400">
                    Select one or more sources.
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {SOURCE_OPTIONS.map(
                      (source) => {
                        const Icon =
                          source.icon;

                        const selected =
                          selectedSources.includes(
                            source.id
                          );

                        return (
                          <button
                            key={
                              source.id
                            }
                            type="button"
                            onClick={() =>
                              toggleSource(
                                source.id
                              )
                            }
                            aria-pressed={
                              selected
                            }
                            className={`group relative rounded-2xl border p-5 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800 ${
                              selected
                                ? "border-teal-800/30 bg-teal-50/60 shadow-[0_8px_24px_rgba(15,118,110,0.08)]"
                                : "border-stone-200 bg-[#fffdf9] hover:border-stone-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-900 shadow-sm">
                                <Icon
                                  size={18}
                                  strokeWidth={
                                    1.8
                                  }
                                />
                              </div>

                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-teal-800 bg-teal-800 text-white"
                                    : "border-stone-300 text-transparent"
                                }`}
                                aria-hidden="true"
                              >
                                <Check
                                  size={13}
                                  strokeWidth={
                                    2.2
                                  }
                                />
                              </span>
                            </div>

                            <h2 className="mt-5 text-sm font-semibold text-stone-800">
                              {
                                source.title
                              }
                            </h2>

                            <p className="mt-2 text-xs leading-5 text-stone-500">
                              {
                                source.description
                              }
                            </p>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving preferences...
                    </>
                  ) : (
                    <>
                      Build my learning roadmap

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.section>
      </div>
    </main>
  );
};

export default LearningGoal;