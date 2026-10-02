import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileUp,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Sparkles,
  Target,
  UploadCloud,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  analyzeResumeForOnboarding,
  completeOnboardingProfile,
  getOnboarding,
  selectOnboardingJourney,
} from "../../services/onboarding.service";

import {
  predictCareer,
} from "../../services/career.service";

import {
  updateMyProfile,
} from "../../services/profile.service";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const initialForm = {
  degree: "",
  branch: "",
  university: "",
  academicYear: "",
  cgpa: "",
  technicalSkills: "",
  hasInternship: false,
};

const JOURNEYS = [
  {
    id: "learn",
    title: "I WANT TO LEARN",
    description:
      "Choose a technology or skill you want to learn. CampusX will compare it with your current skills and build a personalized learning path.",
    icon: GraduationCap,
    accent:
      "bg-emerald-50 text-emerald-800",
  },
  {
    id: "dream_job",
    title: "MY DREAM JOB",
    description:
      "Choose the role you want to target. CampusX will identify the skills required for that role and build your preparation journey.",
    icon: Target,
    accent:
      "bg-blue-50 text-blue-800",
  },
  {
    id: "profile_jobs",
    title:
      "JOBS ON MY CURRENT PROFILE SKILLS",
    description:
      "Explore external job opportunities based directly on the skills already present in your CampusX profile.",
    icon: BriefcaseBusiness,
    accent:
      "bg-amber-50 text-amber-800",
  },
];

const normalizeList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter(
      (item, index, array) =>
        array.findIndex(
          (candidate) =>
            candidate.toLowerCase() ===
            item.toLowerCase()
        ) === index
    );

const getJourneyLabel = (journeyType) => {
  const journey =
    JOURNEYS.find(
      (item) => item.id === journeyType
    );

  return journey?.title || journeyType;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [analyzingCareer, setAnalyzingCareer] =
    useState(false);

  const [selectingJourney, setSelectingJourney] =
    useState(false);

  const [state, setState] =
    useState(null);

  const [draft, setDraft] =
    useState(null);

  const [careerAnalysis, setCareerAnalysis] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [fileName, setFileName] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const missingFields = useMemo(
    () =>
      state?.onboarding
        ?.profileCompletion
        ?.missingFields || [],
    [state]
  );

  const isComplete =
    state?.onboarding
      ?.profileCompletion
      ?.isComplete === true;

  const onboardingStatus =
    state?.onboarding?.status ||
    "profile_incomplete";

  const selectedJourney =
    state?.onboarding?.journeyType ||
    null;

  const isCareerAnalyzed =
    onboardingStatus ===
    "career_analyzed";

  const isJourneySelected =
    onboardingStatus ===
    "journey_selected";

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const result =
          await getOnboarding();

        if (!mounted) {
          return;
        }

        setState(
          result?.data || null
        );
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(
          requestError?.response?.data
            ?.message ||
            requestError?.message ||
            "Unable to load onboarding."
        );
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

  const handleFile = async (file) => {
    setError("");
    setSuccess("");

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      setError(
        "Only PDF and DOCX resumes are supported."
      );

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Resume size must be 5 MB or smaller."
      );

      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      const result =
        await analyzeResumeForOnboarding(
          file
        );

      const nextDraft =
        result?.data?.profileDraft || {};

      const education =
        nextDraft.education || {};

      setDraft(nextDraft);

      setForm({
        degree:
          education.degree || "",

        branch:
          education.branch || "",

        university: "",

        academicYear:
          education.academicYear ===
            undefined ||
          education.academicYear === null
            ? ""
            : String(
                education.academicYear
              ),

        cgpa:
          education.cgpa ===
            undefined ||
          education.cgpa === null
            ? ""
            : String(
                education.cgpa
              ),

        technicalSkills:
          Array.isArray(
            nextDraft.technicalSkills
          )
            ? nextDraft.technicalSkills.join(
                ", "
              )
            : "",

        hasInternship:
          nextDraft.hasInternship ===
          true,
      });

      const completion =
        result?.data?.completion;

      if (completion) {
        setState((current) => ({
          ...(current || {}),

          onboarding: {
            ...(current?.onboarding ||
              {}),

            profileCompletion:
              completion,
          },
        }));
      }

      setSuccess(
        "Resume analyzed. Review the extracted details and complete the remaining required fields."
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data
          ?.message ||
          requestError?.message ||
          "Unable to analyze this resume right now."
      );
    } finally {
      setUploading(false);
    }
  };

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleComplete = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const required = [
      ["degree", "Degree"],
      ["branch", "Branch"],
      [
        "university",
        "University",
      ],
      [
        "academicYear",
        "Academic year",
      ],
      ["cgpa", "CGPA"],
    ];

    for (
      const [field, label] of required
    ) {
      if (
        !String(
          form[field]
        ).trim()
      ) {
        setError(
          `${label} is required.`
        );

        return;
      }
    }

    const academicYear =
      Number(
        form.academicYear
      );

    const cgpa =
      Number(form.cgpa);

    if (
      !Number.isInteger(
        academicYear
      ) ||
      academicYear < 1 ||
      academicYear > 6
    ) {
      setError(
        "Academic year must be between 1 and 6."
      );

      return;
    }

    if (
      !Number.isFinite(cgpa) ||
      cgpa < 0 ||
      cgpa > 10
    ) {
      setError(
        "CGPA must be between 0 and 10."
      );

      return;
    }

    setSaving(true);

    try {
      await updateMyProfile({
        education: {
          degree:
            form.degree.trim(),

          branch:
            form.branch.trim(),

          university:
            form.university.trim(),

          academicYear,

          cgpa,
        },

        technicalSkills:
          normalizeList(
            form.technicalSkills
          ),

        hasInternship:
          form.hasInternship,
      });

      const completionResult =
        await completeOnboardingProfile();

      setState((current) => ({
        ...(current || {}),

        onboarding:
          completionResult?.data
            ?.onboarding || {
            status:
              "profile_completed",

            profileCompletion: {
              isComplete: true,
              missingFields: [],
            },
          },
      }));

      setSuccess(
        "Profile completed successfully. Your career analysis is ready to begin."
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data
          ?.message ||
          requestError?.message ||
          "Unable to complete your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCareerAnalysis =
    async () => {
      setError("");
      setSuccess("");
      setAnalyzingCareer(true);

      try {
        const result =
          await predictCareer();

        const analysis =
          result?.data?.analysis ||
          null;

        setCareerAnalysis(
          analysis
        );

        const onboardingResult =
          await getOnboarding();

        const nextState =
          onboardingResult?.data ||
          null;

        setState(nextState);

        if (
          nextState?.onboarding
            ?.status !==
          "career_analyzed"
        ) {
          setSuccess(
            "Career analysis completed. Refreshing your onboarding state..."
          );

          return;
        }

        setSuccess(
          "Career analysis completed successfully. Choose your career journey."
        );
      } catch (requestError) {
        setError(
          requestError?.response?.data
            ?.message ||
          requestError?.message ||
          "Unable to complete career analysis right now."
        );
      } finally {
        setAnalyzingCareer(false);
      }
    };

  const handleJourneySelect =
    async (journeyType) => {
      setError("");
      setSuccess("");
      setSelectingJourney(true);

      try {
        const result =
          await selectOnboardingJourney(
            journeyType
          );

        setState((current) => ({
          ...(current || {}),

          onboarding:
            result?.data?.onboarding ||
            current?.onboarding ||
            {},
        }));

        setSuccess(
          `${getJourneyLabel(
            journeyType
          )} selected successfully.`
        );
      } catch (requestError) {
        setError(
          requestError?.response?.data
            ?.message ||
          requestError?.message ||
          "Unable to select your career journey."
        );
      } finally {
        setSelectingJourney(false);
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

          Preparing your career journey...
        </div>
      </main>
    );
  }

  if (error && !state) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f0] px-5">
        <section className="w-full max-w-xl rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 min-h-11 rounded-lg bg-teal-950 px-5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Journey already selected
   * --------------------------------------------------------------------------
   */

  if (isJourneySelected) {
    return (
      <main className="min-h-screen bg-[#faf7f0] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-3xl">
          <section className="rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_14px_45px_rgba(28,25,23,0.06)] sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check size={27} />
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-950">
              CampusX · Career journey
            </p>

            <h1 className="mt-3 font-['Newsreader'] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10231f] sm:text-5xl">
              Your journey is selected.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base">
              You selected{" "}
              <span className="font-semibold text-stone-800">
                {getJourneyLabel(
                  selectedJourney
                )}
              </span>
              . CampusX will use this choice to personalize the next part of your career journey.
            </p>

            <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-bold text-emerald-900">
                Journey status
              </p>

              <p className="mt-1 text-sm text-emerald-800/80">
                Profile complete → Career analyzed → Journey selected
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Career journey selection
   * --------------------------------------------------------------------------
   */

  if (isCareerAnalyzed) {
    const primaryCareer =
      careerAnalysis?.primaryCareer
        ?.career || null;

    return (
      <main className="min-h-screen bg-[#faf7f0] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <header className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-950">
              CampusX · Career journey
            </p>

            <h1 className="mt-3 max-w-3xl font-['Newsreader'] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10231f] sm:text-5xl">
              What do you want to do next?
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
              Your profile and career analysis are ready. Choose the path that matches what you want to achieve.
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

          {primaryCareer && (
            <section className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-900">
                  <Sparkles size={19} />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-900">
                    Career analysis
                  </p>

                  <p className="mt-1 text-lg font-semibold text-teal-950">
                    Your primary career prediction is{" "}
                    {primaryCareer}
                  </p>

                  <p className="mt-1 text-sm text-teal-900/70">
                    Choose your journey below to decide how CampusX should use your profile.
                  </p>
                </div>
              </div>
            </section>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            {JOURNEYS.map(
              ({
                id,
                title,
                description,
                icon: Icon,
                accent,
              }) => (
                <button
                  key={id}
                  type="button"
                  disabled={
                    selectingJourney
                  }
                  onClick={() =>
                    handleJourneySelect(
                      id
                    )
                  }
                  className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-[0_14px_45px_rgba(28,25,23,0.05)] transition duration-200 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_18px_50px_rgba(28,25,23,0.09)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}
                    >
                      <Icon size={22} />
                    </div>

                    <ArrowRight
                      size={19}
                      className="mt-1 text-stone-300 transition group-hover:translate-x-1 group-hover:text-teal-800"
                    />
                  </div>

                  <h2 className="mt-6 text-base font-bold tracking-wide text-stone-900">
                    {title}
                  </h2>

                  <p className="mt-3 flex-1 text-sm leading-6 text-stone-500">
                    {description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-950">
                    {selectingJourney ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        Select journey
                        <ArrowRight size={15} />
                      </>
                    )}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Resume + profile completion
   * --------------------------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#faf7f0] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-950">
            CampusX · Career onboarding
          </p>

          <h1 className="mt-3 max-w-2xl font-['Newsreader'] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10231f] sm:text-5xl">
            Let&apos;s build your career profile.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
            Upload your resume first. CampusX will extract what it can, then ask you only for the profile information that still needs to be completed.
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

        {!draft && !isComplete && (
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_14px_45px_rgba(28,25,23,0.06)] sm:p-8">
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 px-5 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-900">
                <UploadCloud size={25} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-stone-900">
                Upload your resume
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
                PDF or DOCX · Maximum 5 MB
              </p>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <FileUp size={16} />
                )}

                {uploading
                  ? "Analyzing resume..."
                  : "Choose resume"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(event) =>
                  handleFile(
                    event.target
                      .files?.[0]
                  )
                }
              />

              {fileName && (
                <p className="mt-4 text-xs text-stone-500">
                  {fileName}
                </p>
              )}

              <div className="mt-7 flex items-center gap-2 text-xs text-stone-400">
                <LockKeyhole size={13} />
                Your resume is processed through the existing CampusX resume-analysis flow.
              </div>
            </div>
          </section>
        )}

        {(draft || isComplete) && (
          <form
            onSubmit={
              handleComplete
            }
            className="space-y-5"
          >
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-900">
                    Profile details
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-stone-900">
                    Review what CampusX extracted
                  </h2>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {draft
                    ? "Resume analyzed"
                    : "Profile complete"}
                </span>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {[
                  [
                    "degree",
                    "Degree",
                    "e.g. B.Tech",
                  ],
                  [
                    "branch",
                    "Branch",
                    "e.g. Computer Science",
                  ],
                  [
                    "university",
                    "University",
                    "Your university",
                  ],
                  [
                    "academicYear",
                    "Academic year",
                    "1–6",
                  ],
                  [
                    "cgpa",
                    "CGPA",
                    "0–10",
                  ],
                ].map(
                  ([
                    field,
                    label,
                    placeholder,
                  ]) => (
                    <label
                      key={field}
                      className="block"
                    >
                      <span className="text-sm font-semibold text-stone-800">
                        {label}{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </span>

                      <input
                        value={
                          form[field]
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            field,
                            event
                              .target
                              .value
                          )
                        }
                        placeholder={
                          placeholder
                        }
                        inputMode={
                          field ===
                            "academicYear" ||
                          field === "cgpa"
                            ? "decimal"
                            : "text"
                        }
                        className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-100"
                        required
                      />
                    </label>
                  )
                )}

                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-stone-800">
                    Technical skills
                  </span>

                  <input
                    value={
                      form.technicalSkills
                    }
                    onChange={(event) =>
                      updateField(
                        "technicalSkills",
                        event.target
                          .value
                      )
                    }
                    placeholder="Python, SQL, React, Java..."
                    className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-teal-800 focus:ring-2 focus:ring-teal-100"
                  />

                  <span className="mt-1 block text-xs text-stone-400">
                    Separate skills with commas.
                  </span>
                </label>

                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={
                      form.hasInternship
                    }
                    onChange={(event) =>
                      updateField(
                        "hasInternship",
                        event.target
                          .checked
                      )
                    }
                    className="h-4 w-4 accent-teal-900"
                  />

                  <span className="text-sm font-medium text-stone-800">
                    I have internship experience
                  </span>
                </label>
              </div>

              {missingFields.length >
                0 &&
                !draft && (
                  <p className="mt-5 text-xs text-stone-500">
                    Missing required fields:{" "}
                    {missingFields.join(
                      ", "
                    )}
                  </p>
                )}
            </section>

            {!isComplete && (
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-950 px-6 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Check size={16} />
                  )}

                  {saving
                    ? "Saving profile..."
                    : "Complete profile"}
                </button>
              </div>
            )}

            {isComplete &&
              onboardingStatus ===
                "profile_completed" && (
                <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-teal-950">
                        Profile complete
                      </p>

                      <p className="mt-1 text-sm leading-6 text-teal-900/70">
                        Your profile is ready for the existing CampusX career-analysis flow.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleCareerAnalysis
                      }
                      disabled={
                        analyzingCareer
                      }
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-950 px-5 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {analyzingCareer ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Sparkles
                          size={16}
                        />
                      )}

                      {analyzingCareer
                        ? "Analyzing career..."
                        : "Analyze my career"}

                      {!analyzingCareer && (
                        <ArrowRight
                          size={16}
                        />
                      )}
                    </button>
                  </div>
                </section>
              )}
          </form>
        )}
      </div>
    </main>
  );
};

export default Onboarding;