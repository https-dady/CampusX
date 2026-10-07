import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, MapPin, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { getMyProfile } from "../../services/profile.service";
import { searchJobs } from "../../services/jobs.service";

const getJobValue = (job, keys) => {
  for (const key of keys) {
    const value = job?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

const getSkills = (job) => {
  const skills = getJobValue(job, [
    "skills",
    "requiredSkills",
    "tags",
  ]);

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
  const prefersReducedMotion = useReducedMotion();

  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [location, setLocation] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const skillQuery = useMemo(
    () => skills.join(", ").slice(0, 150),
    [skills]
  );

  useEffect(() => {
    let mounted = true;

    const loadProfileAndJobs = async () => {
      setIsLoadingProfile(true);
      setError("");

      try {
        const profileResult = await getMyProfile();
        const profile = profileResult?.data?.profile?.profile || {};
        const technicalSkills = Array.isArray(profile.technicalSkills)
          ? profile.technicalSkills.filter(Boolean)
          : [];

        if (!mounted) {
          return;
        }

        setSkills(technicalSkills);

        if (technicalSkills.length === 0) {
          setError(
            "No technical skills are available in your profile yet. Add your skills before searching profile-based jobs."
          );
          return;
        }

        setIsSearching(true);
        setHasSearched(true);

        const result = await searchJobs({
          targetRole: technicalSkills.join(", ").slice(0, 150),
          location,
        });

        if (!mounted) {
          return;
        }

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Unable to search for jobs using your current profile skills."
          );
        }

        setJobs(
          Array.isArray(result?.data?.jobs)
            ? result.data.jobs
            : []
        );
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        console.error(
          "CampusX profile-based job search error:",
          requestError
        );

        setJobs([]);
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to search for profile-based jobs right now."
        );
      } finally {
        if (mounted) {
          setIsLoadingProfile(false);
          setIsSearching(false);
        }
      }
    };

    loadProfileAndJobs();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();

    if (skills.length === 0) {
      return;
    }

    setError("");
    setIsSearching(true);
    setHasSearched(true);

    try {
      const result = await searchJobs({
        targetRole: skillQuery,
        location,
      });

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to search for profile-based jobs."
        );
      }

      setJobs(
        Array.isArray(result?.data?.jobs)
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
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to search for profile-based jobs right now."
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Jobs on my current profile skills
        </p>

        <h1 className="mt-2 font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl">
          Opportunities that match what you already know.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
          CampusX uses the technical skills already present in your profile to search external job opportunities. No dream role is required for this journey.
        </p>
      </section>

      <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[#eef6f3] px-3 py-1.5 text-xs font-semibold text-teal-950"
            >
              {skill}
            </span>
          ))}
        </div>

        {skills.length > 0 && (
          <p className="mt-4 text-xs leading-5 text-stone-400">
            Search context: {skillQuery}
          </p>
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
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, country or remote"
                className="min-h-11 w-full rounded-md border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm text-stone-700 outline-none transition focus:border-teal-800/40 focus:bg-white focus:ring-4 focus:ring-teal-800/5"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSearching || isLoadingProfile || skills.length === 0}
            className="self-end inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Search size={16} aria-hidden="true" />
            )}
            Search profile jobs
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

      {isLoadingProfile || isSearching ? (
        <section className="mt-5 rounded-lg border border-stone-200 bg-white p-10 text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-teal-950"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-semibold text-stone-700">
            Finding opportunities from your current skills...
          </p>
        </section>
      ) : null}

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
              Try adding more technical skills to your profile or changing the location filter.
            </p>
          </section>
        )}

      {!isLoadingProfile &&
        !isSearching &&
        jobs.length > 0 && (
          <section className="mt-5 space-y-4" aria-label="Profile-based job results">
            {jobs.map((job, index) => {
              const title =
                getJobValue(job, [
                  "title",
                  "jobTitle",
                  "role",
                  "position",
                ]) || "Job opportunity";

              const company =
                getJobValue(job, [
                  "company",
                  "companyName",
                  "employer",
                ]) || "Company information unavailable";

              const jobLocation =
                getJobValue(job, [
                  "location",
                  "jobLocation",
                ]) || "Location unavailable";

              const description =
                getJobValue(job, [
                  "description",
                  "summary",
                ]) || "No job description available.";

              const applyUrl = getJobValue(job, [
                "applyUrl",
                "applicationUrl",
                "url",
                "link",
              ]);

              const jobSkills = getSkills(job);

              return (
                <motion.article
                  key={`${title}-${company}-${index}`}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 14 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
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
                        href={String(applyUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal-950 px-4 text-sm font-semibold text-white hover:bg-teal-900"
                      >
                        Apply now
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-stone-500">
                    {description}
                  </p>

                  {jobSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {jobSkills.map((skill, skillIndex) => (
                        <span
                          key={`${skill}-${skillIndex}`}
                          className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </section>
        )}
    </main>
  );
};

export default ProfileJobs;
