import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Loader2,
  Map,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createCareerGoal,
  getMyCareerGoal,
  updateMyCareerGoal,
} from "../../services/careerGoal.service";

import {
  getMySkillGap,
} from "../../services/career.service";

const initialForm = {
  targetCareer: "",
  targetDomain: "",
  targetLevel: "",
  targetTimeline: "",
};

const normalizeText = (value) =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";

const DreamJob = () => {
  const navigate = useNavigate();

  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    hasExistingGoal,
    setHasExistingGoal,
  ] = useState(false);

  const [
    skillGap,
    setSkillGap,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    loadingGap,
    setLoadingGap,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const loadSkillGap = async () => {
    setLoadingGap(true);
    setError("");

    try {
      const response =
        await getMySkillGap();

      setSkillGap(
        response?.data?.skillGap ||
          null
      );
    } catch (requestError) {
      setSkillGap(null);

      setError(
        requestError?.response
          ?.data?.message ||
          requestError?.message ||
          "Unable to calculate the skill gap."
      );
    } finally {
      setLoadingGap(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response =
          await getMyCareerGoal();

        const goal =
          response?.data?.careerGoal ||
          null;

        if (!mounted) {
          return;
        }

        if (goal) {
          setHasExistingGoal(true);

          setForm({
            targetCareer:
              goal.targetCareer || "",

            targetDomain:
              goal.targetDomain || "",

            targetLevel:
              goal.targetLevel || "",

            targetTimeline:
              goal.targetTimeline || "",
          });
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError?.response
              ?.data?.message ||
              requestError?.message ||
              "Unable to load your dream job details."
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

  useEffect(() => {
    if (!hasExistingGoal) {
      return;
    }

    loadSkillGap();
  }, [hasExistingGoal]);

  const missingSkills = useMemo(
    () =>
      Array.isArray(
        skillGap?.missingSkills
      )
        ? skillGap.missingSkills
        : [],
    [skillGap]
  );

  const matchedSkills = useMemo(
    () =>
      Array.isArray(
        skillGap?.matchedSkills
      )
        ? skillGap.matchedSkills
        : [],
    [skillGap]
  );

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const payload = {
      targetCareer:
        normalizeText(
          form.targetCareer
        ),

      targetDomain:
        normalizeText(
          form.targetDomain
        ),

      targetLevel:
        normalizeText(
          form.targetLevel
        ),

      targetTimeline:
        normalizeText(
          form.targetTimeline
        ),
    };

    if (
      !payload.targetCareer ||
      !payload.targetDomain ||
      !payload.targetLevel
    ) {
      setError(
        "Target role, domain and level are required to calculate your dream-job skill gap."
      );

      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    setSkillGap(null);

    try {
      const response =
        hasExistingGoal
          ? await updateMyCareerGoal(
              payload
            )
          : await createCareerGoal(
              payload
            );

      const savedGoal =
        response?.data?.careerGoal;

      if (savedGoal) {
        setForm({
          targetCareer:
            savedGoal.targetCareer ||
            payload.targetCareer,

          targetDomain:
            savedGoal.targetDomain ||
            payload.targetDomain,

          targetLevel:
            savedGoal.targetLevel ||
            payload.targetLevel,

          targetTimeline:
            savedGoal.targetTimeline ||
            payload.targetTimeline,
        });
      }

      setHasExistingGoal(true);

      setSuccess(
        "Dream job saved. Calculating your current skill gap..."
      );

      setLoadingGap(true);

      const gapResponse =
        await getMySkillGap();

      setSkillGap(
        gapResponse?.data?.skillGap ||
          null
      );

      setSuccess(
        "Dream job and skill gap updated successfully."
      );
    } catch (requestError) {
      setError(
        requestError?.response
          ?.data?.message ||
          requestError?.message ||
          "Unable to save your dream job."
      );
    } finally {
      setSaving(false);
      setLoadingGap(false);
    }
  };

  const handleShowJobs = () => {
    const role =
      normalizeText(
        form.targetCareer
      );

    if (!role) {
      setError(
        "Save a dream job role before searching for jobs."
      );

      return;
    }

    navigate(
      `/jobs?role=${encodeURIComponent(
        role
      )}&source=dream-job`
    );
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

          Loading your dream job...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f0] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-5xl">

        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-950">
            CampusX · My dream job
          </p>

          <h1 className="mt-3 max-w-3xl font-['Newsreader'] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10231f] sm:text-5xl">
            Define the role you want to become ready for.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
            CampusX will compare your saved profile skills with the requirements for your selected role.
          </p>
        </header>

        {error && (
          <div
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_14px_45px_rgba(28,25,23,0.06)] sm:p-8">

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              <BriefcaseBusiness
                size={22}
              />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-900">
                Target role
              </p>

              <h2 className="mt-1 text-xl font-semibold text-stone-900">
                {hasExistingGoal
                  ? "Change or update your dream job"
                  : "What is your dream job?"}
              </h2>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 grid gap-5 md:grid-cols-2"
          >

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-stone-800">
                Target role *
              </span>

              <input
                value={
                  form.targetCareer
                }
                onChange={(event) =>
                  updateField(
                    "targetCareer",
                    event.target.value
                  )
                }
                placeholder="e.g. Data Scientist"
                className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-100"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-stone-800">
                Target domain *
              </span>

              <input
                value={
                  form.targetDomain
                }
                onChange={(event) =>
                  updateField(
                    "targetDomain",
                    event.target.value
                  )
                }
                placeholder="e.g. Artificial Intelligence"
                className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-100"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-stone-800">
                Target level *
              </span>

              <input
                value={
                  form.targetLevel
                }
                onChange={(event) =>
                  updateField(
                    "targetLevel",
                    event.target.value
                  )
                }
                placeholder="e.g. Entry Level"
                className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-100"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-stone-800">
                Timeline
              </span>

              <input
                value={
                  form.targetTimeline
                }
                onChange={(event) =>
                  updateField(
                    "targetTimeline",
                    event.target.value
                  )
                }
                placeholder="e.g. 6 months"
                className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <div className="flex items-end md:justify-end">
              <button
                type="submit"
                disabled={
                  saving ||
                  loadingGap
                }
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-950 px-6 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {saving ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw
                    size={16}
                  />
                )}

                {saving
                  ? "Analyzing..."
                  : hasExistingGoal
                    ? "Update & analyze"
                    : "Save & analyze"}
              </button>
            </div>
          </form>
        </section>

        {(loadingGap ||
          skillGap) && (
          <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_14px_45px_rgba(28,25,23,0.06)] sm:p-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-900">
                  Skill gap
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-stone-900">
                  {form.targetCareer ||
                    "Your target role"}
                </h2>
              </div>

              {skillGap && (
                <div className="rounded-2xl bg-teal-50 px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-teal-950">
                    {
                      skillGap.matchPercentage
                    }%
                  </p>

                  <p className="text-xs font-semibold text-teal-800">
                    profile match
                  </p>
                </div>
              )}
            </div>

            {loadingGap ? (
              <div
                className="mt-8 flex items-center gap-2 text-sm text-stone-500"
                role="status"
                aria-live="polite"
              >
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Comparing your profile with the selected career requirement...
              </div>
            ) : skillGap ? (
              <div className="mt-7 grid gap-5 lg:grid-cols-2">

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-2">
                    <Check
                      size={18}
                      className="text-emerald-700"
                    />

                    <h3 className="font-semibold text-emerald-950">
                      Matched skills
                    </h3>
                  </div>

                  {matchedSkills.length >
                  0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {matchedSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-800/70">
                      No matched skills were returned for this requirement.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center gap-2">
                    <Map
                      size={18}
                      className="text-amber-700"
                    />

                    <h3 className="font-semibold text-amber-950">
                      Missing skills
                    </h3>
                  </div>

                  {missingSkills.length >
                  0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {missingSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-800"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-amber-800/70">
                      No missing skills were returned for this requirement.
                    </p>
                  )}
                </div>

              </div>
            ) : null}

            {skillGap && (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                {missingSkills.length >
                  0 && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/learning-roadmap"
                      )
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-900"
                  >
                    Learn missing skills

                    <ArrowRight
                      size={16}
                    />
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    handleShowJobs
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-800 transition hover:border-teal-700 hover:text-teal-900"
                >
                  <BriefcaseBusiness
                    size={16}
                  />

                  Show jobs for this role
                </button>
              </div>
            )}
          </section>
        )}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/career-insights"
            )
          }
          className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-teal-900"
        >
          <ArrowRight
            size={15}
            className="rotate-180"
          />

          Back to Career Insights
        </button>

      </div>
    </main>
  );
};

export default DreamJob;