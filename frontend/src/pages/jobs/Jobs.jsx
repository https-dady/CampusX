import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wifi,
  X,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const pageEase = [0.22, 1, 0.36, 1];

/* ========================================================================== */
/* CURSOR CARD                                                               */
/* ========================================================================== */

const CursorCard = ({
  children,
  className = "",
  intensity = 2.2,
  delay = 0,
  cursorColor = "rgba(15,118,110,0.08)",
}) => {
  const prefersReducedMotion = useReducedMotion();

  const handlePointerMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !event.currentTarget
    ) {
      return;
    }

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    card.style.transform = `
      perspective(1100px)
      translate3d(${px * 4}px, ${py * 4 - 2}px, 0)
      rotateX(${-py * intensity}deg)
      rotateY(${px * intensity}deg)
    `;

    card.style.setProperty(
      "--cursor-x",
      `${(x / rect.width) * 100}%`
    );

    card.style.setProperty(
      "--cursor-y",
      `${(y / rect.height) * 100}%`
    );

    card.style.setProperty(
      "--cursor-opacity",
      "1"
    );
  };

  const resetCard = (event) => {
    if (prefersReducedMotion) return;

    const card = event.currentTarget;

    card.style.transform = `
      perspective(1100px)
      translate3d(0, 0, 0)
      rotateX(0deg)
      rotateY(0deg)
    `;

    card.style.setProperty(
      "--cursor-opacity",
      "0"
    );
  };

  return (
    <motion.article
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 20 }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.55,
        delay: prefersReducedMotion ? 0 : delay,
        ease: pageEase,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
      className={[
        "relative overflow-hidden",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "will-change-transform",
        className,
      ].join(" ")}
      style={{
        "--cursor-x": "50%",
        "--cursor-y": "50%",
        "--cursor-opacity": "0",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
        style={{
          opacity: "var(--cursor-opacity)",
          background: `radial-gradient(
            circle 180px at var(--cursor-x) var(--cursor-y),
            ${cursorColor},
            transparent 72%
          )`,
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

const getJobsFromResponse = (data) => {
  if (Array.isArray(data?.jobs)) {
    return data.jobs;
  }

  if (Array.isArray(data?.data?.jobs)) {
    return data.data.jobs;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getJobValue = (job, keys) => {
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

/* ========================================================================== */
/* JOB CARD                                                                   */
/* ========================================================================== */

const JobCard = ({
  job,
  index,
  prefersReducedMotion,
}) => {
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

  const location =
    getJobValue(job, [
      "location",
      "jobLocation",
    ]) || "Location unavailable";

  const experience =
    getJobValue(job, [
      "experience",
      "experienceLevel",
      "experienceRequired",
    ]);

  const applyUrl =
    getJobValue(job, [
      "applyUrl",
      "applicationUrl",
      "url",
      "link",
    ]);

  const match =
    getJobValue(job, [
      "match",
      "matchScore",
      "fitScore",
    ]);

  const skills = getSkills(job);

  return (
    <CursorCard
      intensity={2}
      delay={prefersReducedMotion ? 0 : 0.12 + index * 0.07}
      className="
        rounded-lg
        border border-stone-200
        bg-white
        p-5
        shadow-[0_8px_28px_rgba(28,25,23,0.025)]
        hover:border-teal-800/20
        hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
        sm:p-6
      "
    >
      <div className="flex flex-col gap-5">
        {/* TOP */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <div
              className="
                flex size-11 shrink-0
                items-center justify-center
                rounded-md
                bg-[#eef6f3]
                text-teal-950
              "
            >
              <BriefcaseBusiness
                size={19}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h3
                className="
                  text-lg font-semibold
                  leading-6
                  tracking-[-0.02em]
                  text-[#10231f]
                "
              >
                {title}
              </h3>

              <div
                className="
                  mt-1.5 flex flex-wrap
                  items-center gap-x-3 gap-y-1
                  text-sm text-stone-500
                "
              >
                <span className="inline-flex items-center gap-1.5">
                  <Building2
                    size={13}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  {company}
                </span>

                <span className="hidden text-stone-300 sm:inline">
                  •
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    size={13}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  {location}
                </span>
              </div>
            </div>
          </div>

          {match !== "" && (
            <div
              className="
                inline-flex w-fit
                shrink-0 items-center
                gap-1.5
                rounded-full
                border border-teal-800/10
                bg-[#eef6f3]
                px-3 py-1.5
                text-xs font-semibold
                text-teal-950
              "
            >
              <Sparkles
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              {typeof match === "number"
                ? `${match}% match`
                : String(match)}
            </div>
          )}
        </div>

        {/* META */}

        {(experience ||
          getJobValue(job, ["remote", "isRemote"])) && (
          <div className="flex flex-wrap gap-2">
            {experience && (
              <span
                className="
                  inline-flex items-center
                  gap-1.5 rounded-md
                  border border-stone-200
                  bg-stone-50
                  px-2.5 py-1.5
                  text-xs font-medium
                  text-stone-600
                "
              >
                <Clock3
                  size={13}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                {String(experience)}
              </span>
            )}

            {Boolean(
              getJobValue(job, [
                "remote",
                "isRemote",
              ])
            ) && (
              <span
                className="
                  inline-flex items-center
                  gap-1.5 rounded-md
                  border border-orange-200
                  bg-orange-50
                  px-2.5 py-1.5
                  text-xs font-medium
                  text-orange-800
                "
              >
                <Wifi
                  size={13}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                Remote
              </span>
            )}
          </div>
        )}

        {/* SKILLS */}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, skillIndex) => (
              <motion.span
                key={`${skill}-${skillIndex}`}
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.94,
                      }
                }
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: prefersReducedMotion
                    ? 0
                    : 0.3,
                  delay: prefersReducedMotion
                    ? 0
                    : 0.25 + index * 0.07,
                }}
                className="
                  inline-flex items-center
                  gap-1.5 rounded-full
                  bg-[#f5f2eb]
                  px-2.5 py-1
                  text-[11px] font-medium
                  text-stone-600
                "
              >
                <Check
                  size={11}
                  strokeWidth={2}
                  className="text-teal-800"
                  aria-hidden="true"
                />

                {skill}
              </motion.span>
            ))}
          </div>
        )}

        {/* FOOTER */}

        <div
          className="
            flex flex-col gap-3
            border-t border-stone-100
            pt-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p className="text-xs text-stone-400">
            Opportunity found from current job search
          </p>

          {applyUrl ? (
            <motion.a
              href={String(applyUrl)}
              target="_blank"
              rel="noopener noreferrer"
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
                inline-flex min-h-10
                items-center justify-center
                gap-2 rounded-md
                bg-teal-950
                px-4
                text-sm font-semibold
                text-white
                transition-colors duration-200
                hover:bg-teal-900
                focus-visible:outline-2
                focus-visible:outline-offset-3
                focus-visible:outline-teal-800
              "
            >
              Apply now

              <ExternalLink
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </motion.a>
          ) : (
            <span
              className="
                inline-flex min-h-10
                items-center justify-center
                rounded-md
                border border-stone-200
                bg-stone-50
                px-4
                text-xs font-medium
                text-stone-400
              "
            >
              Application link unavailable
            </span>
          )}
        </div>
      </div>
    </CursorCard>
  );
};

/* ========================================================================== */
/* MAIN PAGE                                                                  */
/* ========================================================================== */

const Jobs = () => {
  const prefersReducedMotion = useReducedMotion();

  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [remote, setRemote] = useState(false);

  const [activeTab, setActiveTab] =
    useState("recommended");

  const [jobs, setJobs] = useState([]);

  const [isSearching, setIsSearching] =
    useState(false);

  const [hasSearched, setHasSearched] =
    useState(false);

  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");
    setHasSearched(true);

    if (!role.trim()) {
      setError(
        "Please enter the role or area you want to search for."
      );
      setJobs([]);
      return;
    }

    try {
      setIsSearching(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/jobs/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            role: role.trim(),
            location: location.trim(),
            experience: experience.trim(),
            remote,
          }),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to search for jobs right now."
        );
      }

      const nextJobs =
        getJobsFromResponse(data);

      setJobs(nextJobs);
    } catch (searchError) {
      console.error(
        "Job search error:",
        searchError
      );

      setJobs([]);

      setError(
        searchError?.message ||
          "Unable to search for jobs right now."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilters = () => {
    setRole("");
    setLocation("");
    setExperience("");
    setRemote(false);
    setJobs([]);
    setError("");
    setHasSearched(false);
  };

  return (
    <div
      className="
        mx-auto w-full max-w-[1216px]
        px-4 py-8
        sm:px-6
        lg:px-8 lg:py-10
      "
    >
      {/* ================================================================== */}
      {/* HEADER                                                              */}
      {/* ================================================================== */}

      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: prefersReducedMotion
            ? 0
            : 0.65,
          ease: pageEase,
        }}
        aria-labelledby="jobs-title"
      >
        <p
          className="
            text-[10px] font-bold
            uppercase tracking-[0.12em]
            text-teal-950
          "
        >
          Jobs & opportunities
        </p>

        <div
          className="
            mt-2 flex flex-col
            justify-between gap-5
            sm:flex-row sm:items-end
          "
        >
          <div>
            <motion.h1
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
              id="jobs-title"
              className="
                font-['Newsreader']
                text-4xl font-semibold
                leading-[1.02]
                tracking-[-0.035em]
                text-[#10231f]
                sm:text-5xl
              "
            >
              Find opportunities that
              fit your direction.
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
                mt-4 max-w-2xl
                text-sm leading-6
                text-stone-500
                sm:text-[15px]
              "
            >
              Search for current job opportunities
              using your desired role and useful
              filters.
            </motion.p>
          </div>

          <motion.div
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
              duration:
                prefersReducedMotion
                  ? 0
                  : 0.55,
              delay:
                prefersReducedMotion
                  ? 0
                  : 0.25,
              ease: pageEase,
            }}
            className="
              inline-flex w-fit
              items-center gap-2
              rounded-full
              border border-stone-200
              bg-white
              px-3 py-2
              text-xs font-medium
              text-stone-500
            "
          >
            <BriefcaseBusiness
              size={14}
              className="text-teal-800"
              aria-hidden="true"
            />

            Live opportunity search
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* SEARCH PANEL                                                        */}
      {/* ================================================================== */}

      <div className="mt-8">
        <CursorCard
          intensity={2}
          delay={0.3}
          className="
            rounded-lg
            border border-stone-200
            bg-white
            p-5
            shadow-[0_8px_28px_rgba(28,25,23,0.025)]
            sm:p-6
          "
        >
          <form
            onSubmit={handleSearch}
            aria-label="Job search"
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  flex size-9
                  items-center justify-center
                  rounded-md
                  bg-[#eef6f3]
                  text-teal-950
                "
              >
                <SlidersHorizontal
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p
                  className="
                    text-[10px] font-bold
                    uppercase tracking-[0.12em]
                    text-teal-950
                  "
                >
                  Search jobs
                </p>

                <h2
                  className="
                    mt-1 text-xl
                    font-semibold
                    tracking-[-0.02em]
                    text-[#10231f]
                  "
                >
                  What are you looking for?
                </h2>
              </div>
            </div>

            <div
              className="
                mt-6 grid gap-4
                md:grid-cols-2
                xl:grid-cols-[1.4fr_1fr_1fr_auto]
              "
            >
              {/* ROLE */}

              <label className="block">
                <span
                  className="
                    mb-2 block
                    text-xs font-semibold
                    text-stone-600
                  "
                >
                  Desired role or area
                </span>

                <div className="relative">
                  <Search
                    size={16}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-stone-400
                    "
                  />

                  <input
                    type="text"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                    placeholder="e.g. React Developer"
                    className="
                      min-h-11 w-full
                      rounded-md
                      border border-stone-200
                      bg-stone-50
                      pl-10 pr-3
                      text-sm text-stone-700
                      outline-none
                      transition-[border-color,box-shadow,background-color]
                      duration-200
                      placeholder:text-stone-400
                      focus:border-teal-800/40
                      focus:bg-white
                      focus:ring-4
                      focus:ring-teal-800/5
                    "
                  />
                </div>
              </label>

              {/* LOCATION */}

              <label className="block">
                <span
                  className="
                    mb-2 block
                    text-xs font-semibold
                    text-stone-600
                  "
                >
                  Location
                </span>

                <div className="relative">
                  <MapPin
                    size={16}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-stone-400
                    "
                  />

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    placeholder="City, country or remote"
                    className="
                      min-h-11 w-full
                      rounded-md
                      border border-stone-200
                      bg-stone-50
                      pl-10 pr-3
                      text-sm text-stone-700
                      outline-none
                      transition-[border-color,box-shadow,background-color]
                      duration-200
                      placeholder:text-stone-400
                      focus:border-teal-800/40
                      focus:bg-white
                      focus:ring-4
                      focus:ring-teal-800/5
                    "
                  />
                </div>
              </label>

              {/* EXPERIENCE */}

              <label className="block">
                <span
                  className="
                    mb-2 block
                    text-xs font-semibold
                    text-stone-600
                  "
                >
                  Experience
                </span>

                <input
                  type="text"
                  value={experience}
                  onChange={(event) =>
                    setExperience(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Fresher"
                  className="
                    min-h-11 w-full
                    rounded-md
                    border border-stone-200
                    bg-stone-50
                    px-3
                    text-sm text-stone-700
                    outline-none
                    transition-[border-color,box-shadow,background-color]
                    duration-200
                    placeholder:text-stone-400
                    focus:border-teal-800/40
                    focus:bg-white
                    focus:ring-4
                    focus:ring-teal-800/5
                  "
                />
              </label>

              {/* REMOTE */}

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setRemote(
                      (value) => !value
                    )
                  }
                  aria-pressed={remote}
                  className={[
                    `
                      flex min-h-11 w-full
                      items-center justify-center
                      gap-2 rounded-md
                      border px-4
                      text-sm font-semibold
                      transition-[background-color,border-color,color,box-shadow]
                      duration-200
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-teal-800
                      md:w-auto
                    `,
                    remote
                      ? `
                        border-teal-950
                        bg-teal-950
                        text-white
                      `
                      : `
                        border-stone-200
                        bg-stone-50
                        text-stone-600
                        hover:border-teal-800/25
                        hover:text-teal-950
                      `,
                  ].join(" ")}
                >
                  <Wifi
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  Remote
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <motion.div
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        y: -5,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                role="alert"
                className="
                  mt-4 flex items-start
                  gap-2 rounded-md
                  border border-red-200
                  bg-red-50
                  px-3.5 py-3
                  text-sm text-red-700
                "
              >
                <X
                  size={16}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />

                <span>{error}</span>
              </motion.div>
            )}

            {/* ACTIONS */}

            <div
              className="
                mt-5 flex flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <button
                type="button"
                onClick={handleClearFilters}
                className="
                  inline-flex min-h-10
                  items-center
                  justify-center
                  gap-2 rounded-md
                  px-3
                  text-sm font-medium
                  text-stone-500
                  transition-colors duration-200
                  hover:text-teal-950
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-teal-800
                  sm:justify-start
                "
              >
                Clear filters
              </button>

              <motion.button
                type="submit"
                disabled={isSearching}
                whileHover={
                  prefersReducedMotion ||
                  isSearching
                    ? undefined
                    : { y: -2 }
                }
                whileTap={
                  prefersReducedMotion ||
                  isSearching
                    ? undefined
                    : { scale: 0.98 }
                }
                className="
                  inline-flex min-h-11
                  items-center justify-center
                  gap-2 rounded-md
                  bg-teal-950
                  px-5
                  text-sm font-semibold
                  text-white
                  shadow-[0_8px_20px_rgba(6,78,59,0.10)]
                  transition-[background-color,box-shadow]
                  duration-200
                  hover:bg-teal-900
                  hover:shadow-[0_14px_28px_rgba(6,78,59,0.16)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  focus-visible:outline-2
                  focus-visible:outline-offset-3
                  focus-visible:outline-teal-800
                "
              >
                <Search
                  size={15}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />

                {isSearching
                  ? "Finding jobs..."
                  : "Find jobs"}
              </motion.button>
            </div>
          </form>
        </CursorCard>
      </div>

      {/* ================================================================== */}
      {/* RESULTS                                                             */}
      {/* ================================================================== */}

      <section
        className="mt-8"
        aria-labelledby="job-results-title"
      >
        <div
          className="
            flex flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px] font-bold
                uppercase tracking-[0.12em]
                text-teal-950
              "
            >
              Opportunities
            </p>

            <h2
              id="job-results-title"
              className="
                mt-2 text-2xl
                font-semibold
                tracking-[-0.025em]
                text-[#10231f]
              "
            >
              Jobs for your direction
            </h2>
          </div>

          <div
            className="
              inline-flex w-fit
              rounded-md
              border border-stone-200
              bg-white p-1
            "
            role="tablist"
            aria-label="Job result type"
          >
            <button
              type="button"
              role="tab"
              aria-selected={
                activeTab === "recommended"
              }
              onClick={() =>
                setActiveTab("recommended")
              }
              className={[
                "rounded px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                activeTab === "recommended"
                  ? "bg-teal-950 text-white"
                  : "text-stone-500 hover:text-teal-950",
              ].join(" ")}
            >
              Recommended
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={
                activeTab === "all"
              }
              onClick={() =>
                setActiveTab("all")
              }
              className={[
                "rounded px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800",
                activeTab === "all"
                  ? "bg-teal-950 text-white"
                  : "text-stone-500 hover:text-teal-950",
              ].join(" ")}
            >
              All jobs
            </button>
          </div>
        </div>

        {/* LOADING */}

        {isSearching && (
          <div
            className="
              mt-5 rounded-lg
              border border-stone-200
              bg-white p-8
              text-center
            "
            aria-live="polite"
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: 360,
                    }
              }
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                mx-auto flex size-10
                items-center justify-center
                rounded-full
                border-2
                border-stone-200
                border-t-teal-950
              "
              aria-hidden="true"
            />

            <p className="mt-4 text-sm font-semibold text-stone-700">
              Finding relevant opportunities...
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Searching current job information.
            </p>
          </div>
        )}

        {/* EMPTY BEFORE SEARCH */}

        {!isSearching &&
          !hasSearched &&
          jobs.length === 0 && (
            <CursorCard
              intensity={1.8}
              delay={0.4}
              className="
                mt-5 rounded-lg
                border border-stone-200
                bg-white
                p-8
                text-center
                shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              "
            >
              <div
                className="
                  mx-auto flex size-12
                  items-center justify-center
                  rounded-full
                  bg-[#eef6f3]
                  text-teal-950
                "
              >
                <Search
                  size={20}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <h3
                className="
                  mt-4 text-lg
                  font-semibold
                  text-[#10231f]
                "
              >
                Start with the role you want
              </h3>

              <p
                className="
                  mx-auto mt-2 max-w-md
                  text-sm leading-6
                  text-stone-500
                "
              >
                Enter a desired role or area,
                add filters if useful, and
                search for current opportunities.
              </p>
            </CursorCard>
          )}

        {/* NO RESULTS */}

        {!isSearching &&
          hasSearched &&
          jobs.length === 0 &&
          !error && (
            <CursorCard
              intensity={1.8}
              delay={0.4}
              className="
                mt-5 rounded-lg
                border border-stone-200
                bg-white
                p-8
                text-center
              "
            >
              <div
                className="
                  mx-auto flex size-12
                  items-center justify-center
                  rounded-full
                  bg-orange-50
                  text-orange-700
                "
              >
                <BriefcaseBusiness
                  size={20}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <h3
                className="
                  mt-4 text-lg
                  font-semibold
                  text-[#10231f]
                "
              >
                No opportunities found
              </h3>

              <p
                className="
                  mx-auto mt-2 max-w-md
                  text-sm leading-6
                  text-stone-500
                "
              >
                Try a different role, location,
                or filter combination.
              </p>
            </CursorCard>
          )}

        {/* RESULTS */}

        {!isSearching &&
          jobs.length > 0 && (
            <div className="mt-5 space-y-4">
              {jobs.map((job, index) => (
                <JobCard
                  key={
                    job?.id ||
                    job?._id ||
                    job?.url ||
                    index
                  }
                  job={job}
                  index={index}
                  prefersReducedMotion={
                    prefersReducedMotion
                  }
                />
              ))}
            </div>
          )}
      </section>

      {/* ================================================================== */}
      {/* BOTTOM NOTE                                                         */}
      {/* ================================================================== */}

      <motion.div
        initial={
          prefersReducedMotion
            ? false
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
          delay:
            prefersReducedMotion
              ? 0
              : 0.65,
          ease: pageEase,
        }}
        className="
          mt-8 flex flex-col
          gap-3 rounded-lg
          border border-orange-200
          bg-[#fde0cd]
          p-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px] font-bold
              uppercase tracking-[0.12em]
              text-orange-800
            "
          >
            A useful next step
          </p>

          <p
            className="
              mt-1 text-sm
              font-medium leading-6
              text-[#221410]
            "
          >
            Use job opportunities alongside
            your career direction and skill gaps.
          </p>
        </div>

        <motion.span
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 4, 0],
                }
          }
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            hidden text-orange-700
            sm:block
          "
          aria-hidden="true"
        >
          <ChevronRight size={20} />
        </motion.span>
      </motion.div>
    </div>
  );
};

export default Jobs;