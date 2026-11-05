import {
  useEffect,
  useState,
} from "react";

import {
  ExternalLink,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  getMyProfile,
} from "../../services/profile.service";

import {
  searchProfileJobs,
} from "../../services/jobs.service";

const getJobValue = (
  job,
  keys
) => {
  for (const key of keys) {
    const value = job?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return "";
};

const getSkills = (job) => {
  const skills = getJobValue(
    job,
    [
      "skills",
      "requiredSkills",
      "tags",
    ]
  );

  if (Array.isArray(skills)) {
    return skills.filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const ProfileJobs = () => {
  const prefersReducedMotion =
    useReducedMotion();

  const [
    skills,
    setSkills,
  ] = useState([]);

  const [
    predictedRole,
    setPredictedRole,
  ] = useState("");

  const [
    jobs,
    setJobs,
  ] = useState([]);

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    isLoadingProfile,
    setIsLoadingProfile,
  ] = useState(true);

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const searchProfileBasedJobs =
    async () => {
      setError("");
      setIsSearching(true);
      setHasSearched(true);

      try {
        /*
         * IMPORTANT:
         *
         * The frontend does NOT convert technical
         * skills into targetRole.
         *
         * The backend:
         *
         * Profile
         *   ↓
         * Existing Career Prediction ML
         *   ↓
         * Primary predicted career
         *   ↓
         * Existing searchJobs()
         *   ↓
         * n8n + TinyFish
         *
         * This keeps the existing job-search
         * architecture unchanged.
         */
        const result =
          await searchProfileJobs();

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Unable to search for profile-based jobs."
          );
        }

        const role =
          typeof result?.data
            ?.targetRole === "string"
            ? result.data.targetRole.trim()
            : "";

        setPredictedRole(role);

        setJobs(
          Array.isArray(
            result?.data?.jobs
          )
            ? result.data.jobs
            : []
        );
      } catch (requestError) {
        console.error(
          "CampusX profile-based job search error:",
          requestError
        );

        setJobs([]);

        setError(
          requestError?.response
            ?.data?.message ||
            requestError?.message ||
            "Unable to search for profile-based jobs right now."
        );
      } finally {
        setIsSearching(false);
      }
    };

  useEffect(() => {
    let mounted = true;

    const loadProfile =
      async () => {
        setIsLoadingProfile(true);
        setError("");

        try {
          const result =
            await getMyProfile();

          const profile =
            result?.data?.profile
              ?.profile || {};

          const technicalSkills =
            Array.isArray(
              profile.technicalSkills
            )
              ? profile.technicalSkills.filter(
                  Boolean
                )
              : [];

          if (!mounted) {
            return;
          }

          setSkills(
            technicalSkills
          );
        } catch (requestError) {
          if (!mounted) {
            return;
          }

          console.error(
            "CampusX profile loading error:",
            requestError
          );

          setError(
            requestError?.response
              ?.data?.message ||
              requestError?.message ||
              "Unable to load your profile."
          );
        } finally {
          if (mounted) {
            setIsLoadingProfile(false);
          }
        }
      };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isLoadingProfile) {
      return;
    }

    if (skills.length === 0) {
      setError(
        "No technical skills are available in your profile yet. Add your skills before searching profile-based jobs."
      );

      return;
    }

    searchProfileBasedJobs();
  }, [
    isLoadingProfile,
  ]);

  const handleSearch = async (
    event
  ) => {
    event.preventDefault();

    if (skills.length === 0) {
      setError(
        "No technical skills are available in your profile yet."
      );

      return;
    }

    /*
     * The existing profile-job endpoint currently
     * derives the role from the profile/ML pipeline.
     *
     * Location is kept as a UI filter field, but the
     * role itself must never be replaced by the raw
     * technical-skills list.
     */
    await searchProfileBasedJobs();
  };

  return (
    <main className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Jobs based on my profile skills
        </p>

        <h1 className="mt-2 font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl">
          Opportunities matched to your current profile.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
          CampusX uses the technical skills already
          present in your profile as the input context
          for the existing career prediction model.
          The model identifies your best-fit role, and
          that role is then used to search external jobs.
        </p>
      </section>

      <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
            Current profile skills
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#eef6f3] px-3 py-1.5 text-xs font-semibold text-teal-950"
                  >
                    {skill}
                  </span>
                )
              )
            ) : (
              <span className="text-sm text-stone-400">
                No technical skills found.
              </span>
            )}
          </div>
        </div>

        {predictedRole && (
          <div className="mt-6 rounded-md border border-teal-100 bg-teal-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-teal-800">
              ML predicted best-fit role
            </p>

            <p className="mt-1 text-lg font-semibold text-teal-950">
              {predictedRole}
            </p>

            <p className="mt-1 text-xs leading-5 text-teal-800/70">
              This predicted role is used as the
              target role for the existing external
              job-search workflow.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]"
        >
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-stone-600">
              Location filter
            </span>

            <div className="relative">
              <MapPin
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />

              <input
                value={location}
                onChange={(
                  event
                ) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder="City, country or remote"
                className="min-h-11 w-full rounded-md border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm text-stone-700 outline-none transition focus:border-teal-800/40 focus:bg-white focus:ring-4 focus:ring-teal-800/5"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={
              isSearching ||
              isLoadingProfile ||
              skills.length === 0
            }
            className="self-end inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2
                size={16}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Search
                size={16}
                aria-hidden="true"
              />
            )}

            {isSearching
              ? "Searching..."
              : "Search profile jobs"}
          </button>
        </form>
      </section>

      {error && (
        <section
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-950">
            Profile job search needs attention
          </p>

          <p className="mt-1 text-sm leading-6 text-red-700">
            {error}
          </p>
        </section>
      )}

      {(isLoadingProfile ||
        isSearching) && (
        <section className="mt-5 rounded-lg border border-stone-200 bg-white p-10 text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-teal-950"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm font-semibold text-stone-700">
            {isLoadingProfile
              ? "Loading your profile..."
              : "Finding opportunities from your predicted role..."}
          </p>
        </section>
      )}

      {!isLoadingProfile &&
        !isSearching &&
        hasSearched &&
        !error &&
        jobs.length === 0 && (
          <section className="mt-5 rounded-lg border border-stone-200 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-stone-700">
              No matching opportunities found right now.
            </p>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-stone-500">
              Try updating your technical skills
              or searching again later.
            </p>
          </section>
        )}

      {!isLoadingProfile &&
        !isSearching &&
        jobs.length > 0 && (
          <section
            className="mt-5 space-y-4"
            aria-label="Profile-based job results"
          >
            {jobs.map(
              (job, index) => {
                const title =
                  getJobValue(
                    job,
                    [
                      "title",
                      "jobTitle",
                      "role",
                      "position",
                    ]
                  ) ||
                  "Job opportunity";

                const company =
                  getJobValue(
                    job,
                    [
                      "company",
                      "companyName",
                      "employer",
                    ]
                  ) ||
                  "Company information unavailable";

                const jobLocation =
                  getJobValue(
                    job,
                    [
                      "location",
                      "jobLocation",
                    ]
                  ) ||
                  "Location unavailable";

                const description =
                  getJobValue(
                    job,
                    [
                      "description",
                      "summary",
                    ]
                  ) ||
                  "No job description available.";

                const applyUrl =
                  getJobValue(
                    job,
                    [
                      "applyUrl",
                      "applicationUrl",
                      "url",
                      "link",
                    ]
                  );

                const jobSkills =
                  getSkills(job);

                return (
                  <motion.article
                    key={`${title}-${company}-${index}`}
                    initial={
                      prefersReducedMotion
                        ? {
                            opacity: 1,
                            y: 0,
                          }
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
                          : 0.45,
                    }}
                    className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#10231f]">
                          {title}
                        </h2>

                        <p className="mt-1 text-sm font-medium text-stone-600">
                          {company}
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          {jobLocation}
                        </p>
                      </div>

                      {applyUrl ? (
                        <a
                          href={String(
                            applyUrl
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal-950 px-4 text-sm font-semibold text-white hover:bg-teal-900"
                        >
                          Apply now

                          <ExternalLink
                            size={14}
                            aria-hidden="true"
                          />
                        </a>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-stone-500">
                      {description}
                    </p>

                    {jobSkills.length >
                      0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {jobSkills.map(
                          (
                            skill,
                            skillIndex
                          ) => (
                            <span
                              key={`${skill}-${skillIndex}`}
                              className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </motion.article>
                );
              }
            )}
          </section>
        )}
    </main>
  );
};

export default ProfileJobs;