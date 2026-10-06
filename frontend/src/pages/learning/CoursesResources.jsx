import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Circle,
  CircleCheck,
  ExternalLink,
  Filter,
  Layers3,
  LoaderCircle,
  PlayCircle,
  RefreshCw,
  Target,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  getLearningCache,
  getLearningResources,
  getMyPersonalizedRoadmap,
} from "../../services/learning.service";

const pageEase = [0.22, 1, 0.36, 1];

const normalizeText = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const getHostname = (url = "") => {
  if (!url) return "";

  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

const getSourceLabel = (resource) => {
  const sourceName = normalizeText(resource?.sourceName);

  if (sourceName && sourceName !== "Learning Resource") {
    return sourceName;
  }

  const hostname = getHostname(resource?.url);

  if (hostname === "youtube.com" || hostname === "youtu.be") {
    return "YouTube";
  }

  if (hostname === "classcentral.com") {
    return "Class Central";
  }

  if (
    hostname === "nptel.ac.in" ||
    hostname.endsWith(".nptel.ac.in")
  ) {
    return "NPTEL";
  }

  if (hostname === "onlinecourses.nptel.ac.in") {
    return "NPTEL";
  }

  if (
    hostname === "swayam.gov.in" ||
    hostname.endsWith(".swayam.gov.in")
  ) {
    return "SWAYAM";
  }

  if (
    [
      "typescriptlang.org",
      "react.dev",
      "reactjs.org",
      "nodejs.org",
      "expressjs.com",
      "mongodb.com",
      "developer.mozilla.org",
      "python.org",
      "scikit-learn.org",
      "pandas.pydata.org",
      "numpy.org",
    ].includes(hostname)
  ) {
    return "Official Documentation";
  }

  return "Learning Resource";
};

const getResourceType = (resource) => {
  const explicitType = normalizeText(
    resource?.type
  ).toLowerCase();

  const title = normalizeText(
    resource?.title
  ).toLowerCase();

  const url = normalizeText(
    resource?.url
  ).toLowerCase();

  if (
    explicitType &&
    explicitType !== "resource"
  ) {
    return explicitType;
  }

  if (
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  ) {
    return "video";
  }

  if (
    title.includes("documentation") ||
    title.includes("docs") ||
    url.includes("/docs")
  ) {
    return "documentation";
  }

  if (
    title.includes("tutorial") ||
    title.includes("guide")
  ) {
    return "tutorial";
  }

  if (
    title.includes("course") ||
    title.includes("courses") ||
    title.includes("certification") ||
    title.includes("specialization")
  ) {
    return "course";
  }

  return "learning";
};

const formatResourceType = (type) =>
  normalizeText(type || "Learning")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );

const isGovernmentResource = (resource) =>
  Number(resource?.sourcePriority) <= 2 ||
  resource?.sourceCategory === "government" ||
  resource?.sourceName === "NPTEL" ||
  resource?.sourceName === "SWAYAM" ||
  resource?.sourceName === "Government / Academic";

const getSourceCategoryLabel = (resource) => {
  const category = normalizeText(
    resource?.sourceCategory
  ).toLowerCase();

  if (category === "government") {
    return "Government / Academic";
  }

  if (category === "official") {
    return "Official";
  }

  if (category === "other") {
    return "Learning Platform";
  }

  return isGovernmentResource(resource)
    ? "Government / Academic"
    : "";
};

const isGenericYouTubeDescription = (
  description = ""
) => {
  const text = normalizeText(
    description
  ).toLowerCase();

  if (!text) {
    return true;
  }

  return [
    "enjoy the videos and music you love",
    "upload original content",
    "share it all with friends",
    "the world on youtube",
    "youtube is a video-sharing",
    "enjoy the videos",
  ].some((pattern) =>
    text.includes(pattern)
  );
};

const buildResourceDescription = (
  resource
) => {
  const rawDescription = normalizeText(
    resource?.description
  );

  const source = getSourceLabel(resource);
  const title = normalizeText(
    resource?.title
  );

  const hostname = getHostname(
    resource?.url
  );

  if (
    rawDescription &&
    !isGenericYouTubeDescription(
      rawDescription
    )
  ) {
    return rawDescription;
  }

  if (
    hostname === "youtube.com" ||
    hostname === "youtu.be"
  ) {
    return title
      ? `${title} — video learning resource on YouTube.`
      : "Video learning resource available on YouTube.";
  }

  if (
    source === "Official Documentation"
  ) {
    return title
      ? `${title} — official documentation and learning reference.`
      : "Official documentation and learning reference.";
  }

  if (
    source === "NPTEL" ||
    source === "SWAYAM"
  ) {
    return title
      ? `${title} — structured learning resource from ${source}.`
      : `Structured learning resource from ${source}.`;
  }

  if (source === "Class Central") {
    return title
      ? `${title} — learning resource discovered through Class Central.`
      : "Learning resource discovered through Class Central.";
  }

  return title
    ? `${title} — learning resource connected to your roadmap.`
    : "Learning resource connected to your roadmap.";
};

const CursorCard = ({
  children,
  className = "",
  intensity = 2.2,
  delay = 0,
  cursorColor = "rgba(15,118,110,0.08)",
}) => {
  const prefersReducedMotion =
    useReducedMotion();

  const handlePointerMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType !== "mouse" ||
      !event.currentTarget
    ) {
      return;
    }

    const card = event.currentTarget;
    const rect =
      card.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    const px =
      x / rect.width - 0.5;

    const py =
      y / rect.height - 0.5;

    card.style.transform = `
      perspective(1100px)
      translate3d(
        ${px * 4}px,
        ${py * 4 - 1}px,
        0
      )
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
    if (prefersReducedMotion) {
      return;
    }

    event.currentTarget.style.transform =
      "perspective(1100px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)";

    event.currentTarget.style.setProperty(
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
        duration:
          prefersReducedMotion
            ? 0
            : 0.55,
        delay:
          prefersReducedMotion
            ? 0
            : delay,
        ease: pageEase,
      }}
      onPointerMove={
        handlePointerMove
      }
      onPointerLeave={
        resetCard
      }
      className={`relative overflow-hidden transition-[transform,box-shadow,border-color] duration-300 ease-out ${className}`}
      style={{
        "--cursor-x": "50%",
        "--cursor-y": "50%",
        "--cursor-opacity": "0",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[var(--cursor-opacity)] transition-opacity duration-200"
        style={{
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

const ResourceCard = ({
  resource,
  index,
  variant = "other",
}) => {
  const source =
    getSourceLabel(resource);

  const type =
    getResourceType(resource);

  const category =
    getSourceCategoryLabel(resource);

  return (
    <CursorCard
      intensity={2.1}
      delay={0.08 + index * 0.06}
      cursorColor={
        variant === "government"
          ? "rgba(15,118,110,0.08)"
          : "rgba(234,88,12,0.07)"
      }
      className={`flex h-full flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] hover:border-stone-300 hover:shadow-[0_16px_34px_rgba(28,25,23,0.07)] sm:p-6 ${
        variant === "government"
          ? "ring-1 ring-teal-950/5"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-7 items-center rounded-full bg-[#dcefe9] px-2.5 text-[10px] font-bold text-teal-950">
            {formatResourceType(type)}
          </span>

          {source !==
            "Learning Resource" && (
            <span className="inline-flex min-h-7 items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 text-[10px] font-semibold text-stone-600">
              {source}
            </span>
          )}
        </div>

        <ExternalLink
          size={15}
          strokeWidth={1.7}
          className="shrink-0 text-stone-400"
          aria-hidden="true"
        />
      </div>

      <div className="mt-5 flex-1">
        <h4 className="text-xl font-semibold tracking-[-0.025em] text-[#10231f]">
          {resource.title}
        </h4>

        <p className="mt-3 text-sm leading-6 text-stone-500">
          {buildResourceDescription(
            resource
          )}
        </p>
      </div>

      <div className="mt-6 border-t border-stone-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {category && (
              <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">
                {category}
              </span>
            )}

            <span className="mt-0.5 block truncate text-[11px] font-medium text-stone-500">
              {source}
            </span>
          </div>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${resource.title}`}
            className="group inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-teal-950 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          >
            Explore

            <ArrowRight
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </CursorCard>
  );
};

const CoursesResources = () => {
  const prefersReducedMotion =
    useReducedMotion();

  const [roadmap, setRoadmap] =
    useState(null);

  const [resources, setResources] =
    useState([]);

  const [
    learningContext,
    setLearningContext,
  ] = useState({
    targetSkills: [],
    availableSkills: [],
    missingSkills: [],
  });

  const [cacheKey, setCacheKey] =
    useState("");

  const [hasMore, setHasMore] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isLoadingResources,
    setIsLoadingResources,
  ] = useState(false);

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    resourceError,
    setResourceError,
  ] = useState("");

  const [
    loadMoreError,
    setLoadMoreError,
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState("All");

  const loadCoursesAndResources =
    async () => {
      setIsLoading(true);
      setError("");
      setResourceError("");
      setLoadMoreError("");

      try {
        const roadmapResponse =
          await getMyPersonalizedRoadmap();

        if (
          !roadmapResponse?.success
        ) {
          throw new Error(
            roadmapResponse?.message ||
              "Unable to load your personalized roadmap."
          );
        }

        const personalizedRoadmap =
          roadmapResponse?.data?.roadmap;

        if (!personalizedRoadmap) {
          throw new Error(
            "Personalized roadmap data is unavailable."
          );
        }

        setRoadmap(
          personalizedRoadmap
        );

        const domain =
          personalizedRoadmap.domain;

        const missingSkills =
          Array.isArray(
            personalizedRoadmap.missingSkills
          )
            ? personalizedRoadmap.missingSkills
            : [];

        const roadmapSkills =
          Array.isArray(
            personalizedRoadmap.steps
          )
            ? personalizedRoadmap.steps.flatMap(
                (step) =>
                  Array.isArray(
                    step.skills
                  )
                    ? step.skills
                    : []
              )
            : [];

        const uniqueTechStack = [
          ...new Map(
            [
              ...missingSkills,
              ...roadmapSkills,
            ]
              .filter(
                (skill) =>
                  typeof skill ===
                    "string" &&
                  skill.trim()
              )
              .map((skill) => [
                skill
                  .trim()
                  .toLowerCase(),
                skill.trim(),
              ])
          ).values(),
        ];

        if (
          !domain ||
          uniqueTechStack.length === 0
        ) {
          setResources([]);

          setLearningContext({
            targetSkills: [],
            availableSkills: [],
            missingSkills: [],
          });

          setCacheKey("");
          setHasMore(false);

          setResourceError(
            "No roadmap skills are available to find learning resources yet."
          );

          return;
        }

        setIsLoadingResources(
          true
        );

        const resourceResponse =
          await getLearningResources({
            domain,
            techStack:
              uniqueTechStack,
          });

        if (
          !resourceResponse?.success
        ) {
          throw new Error(
            resourceResponse?.message ||
              "Unable to load learning resources."
          );
        }

        const resourceData =
          resourceResponse?.data;

        const apiResources =
          resourceData?.resources;

        if (
          !Array.isArray(
            apiResources
          )
        ) {
          throw new Error(
            "Learning resources response is invalid."
          );
        }

        setResources(
          apiResources
        );

        const personalization =
          resourceData?.personalization ||
          {};

        setLearningContext({
          targetSkills:
            Array.isArray(
              personalization.targetSkills
            )
              ? personalization.targetSkills
              : [],

          availableSkills:
            Array.isArray(
              personalization.availableSkills
            )
              ? personalization.availableSkills
              : [],

          missingSkills:
            Array.isArray(
              personalization.missingSkills
            )
              ? personalization.missingSkills
              : [],
        });

        setCacheKey(
          typeof resourceData?.cacheKey ===
            "string"
            ? resourceData.cacheKey
            : ""
        );

        setHasMore(
          resourceData?.hasMore === true
        );
      } catch (err) {
        console.error(
          "Failed to load CampusX courses and resources:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load your learning resources.";

        if (!roadmap) {
          setError(message);
        } else {
          setResourceError(message);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingResources(
          false
        );
      }
    };

  const handleLoadMore =
    async () => {
      if (
        !cacheKey ||
        !hasMore ||
        isLoadingMore
      ) {
        return;
      }

      setIsLoadingMore(true);
      setLoadMoreError("");

      try {
        const cacheResponse =
          await getLearningCache(
            cacheKey
          );

        if (
          !cacheResponse?.success
        ) {
          throw new Error(
            cacheResponse?.message ||
              "Unable to load more learning resources."
          );
        }

        const cacheData =
          cacheResponse?.data;

        const cachedResources =
          Array.isArray(
            cacheData?.resources
          )
            ? cacheData.resources
            : [];

        if (
          cachedResources.length > 0
        ) {
          setResources(
            (currentResources) => {
              const merged = [
                ...currentResources,
                ...cachedResources,
              ];

              const seen =
                new Set();

              return merged.filter(
                (resource) => {
                  const identifier =
                    resource?.url ||
                    resource?.title ||
                    JSON.stringify(
                      resource
                    );

                  if (
                    seen.has(
                      identifier
                    )
                  ) {
                    return false;
                  }

                  seen.add(
                    identifier
                  );

                  return true;
                }
              );
            }
          );
        }

        if (
          typeof cacheData?.cacheKey ===
            "string" &&
          cacheData.cacheKey
        ) {
          setCacheKey(
            cacheData.cacheKey
          );
        }

        setHasMore(
          cacheData?.hasMore === true
        );
      } catch (err) {
        console.error(
          "Failed to load more CampusX learning resources:",
          err
        );

        const message =
          String(
            err?.response?.data
              ?.message ||
              err?.message ||
              ""
          ).toLowerCase();

        const cacheNotReady =
          err?.response?.status ===
            404 ||
          message.includes(
            "cache not found"
          ) ||
          message.includes(
            "cache expired"
          ) ||
          message.includes(
            "learning resource cache"
          );

        setLoadMoreError(
          cacheNotReady
            ? "CACHE_NOT_READY"
            : err?.response?.data
                ?.message ||
                err?.message ||
                "Unable to load more learning resources."
        );
      } finally {
        setIsLoadingMore(
          false
        );
      }
    };

  useEffect(() => {
    loadCoursesAndResources();
  }, []);

  const governmentResources =
    useMemo(
      () =>
        resources.filter(
          isGovernmentResource
        ),
      [resources]
    );

  const otherResources =
    useMemo(
      () =>
        resources.filter(
          (resource) =>
            !isGovernmentResource(
              resource
            )
        ),
      [resources]
    );

  const resourceTypes =
    useMemo(() => {
      const types =
        resources
          .map(
            getResourceType
          )
          .filter(Boolean);

      return [
        "All",
        ...Array.from(
          new Set(types)
        ),
      ];
    }, [resources]);

  const filteredResources =
    useMemo(() => {
      if (
        activeFilter ===
        "All"
      ) {
        return resources;
      }

      return resources.filter(
        (resource) =>
          getResourceType(
            resource
          ).toLowerCase() ===
          activeFilter.toLowerCase()
      );
    }, [
      activeFilter,
      resources,
    ]);

  const filteredGovernmentResources =
    useMemo(
      () =>
        governmentResources.filter(
          (resource) =>
            filteredResources.includes(
              resource
            )
        ),
      [
        governmentResources,
        filteredResources,
      ]
    );

  const filteredOtherResources =
    useMemo(
      () =>
        otherResources.filter(
          (resource) =>
            filteredResources.includes(
              resource
            )
        ),
      [
        otherResources,
        filteredResources,
      ]
    );

  const featuredResource =
    governmentResources[0] ||
    resources[0] ||
    null;

  const targetSkills =
    learningContext.targetSkills;

  const availableSkills =
    learningContext.availableSkills;

  const missingSkills =
    learningContext.missingSkills;

  const skillCoverage =
    targetSkills.length > 0
      ? Math.round(
          (availableSkills.length /
            targetSkills.length) *
            100
        )
      : 0;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex min-h-[520px] items-center justify-center">
          <div
            className="text-center"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-950 text-orange-300">
              <BookOpen
                size={21}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <p className="mt-5 text-sm font-semibold text-teal-950">
              Building your learning resources...
            </p>

            <p className="mt-2 text-xs text-stone-500">
              Connecting your roadmap with relevant resources.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[520px] w-full max-w-[900px] items-center px-4 py-10 sm:px-6">
        <div className="w-full rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
            <BookOpen
              size={21}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 font-['Newsreader'] text-3xl font-semibold text-red-950">
            Your learning resources aren't available yet.
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadCoursesAndResources
            }
            className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-md bg-teal-950 px-4 text-xs font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
          >
            <RefreshCw
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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
              : 0.6,
          ease: pageEase,
        }}
        aria-labelledby="courses-title"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Courses & resources
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1
              id="courses-title"
              className="font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl"
            >
              Learn what moves you forward.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
              Explore learning resources connected to your current{" "}
              <span className="font-semibold text-stone-700">
                {roadmap?.career ||
                  "career"}
              </span>{" "}
              roadmap.
            </p>
          </div>

          <div className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-600 shadow-[0_3px_12px_rgba(28,25,23,0.04)] lg:self-auto">
            <BookOpen
              size={15}
              strokeWidth={1.7}
              className="text-teal-900"
              aria-hidden="true"
            />

            {roadmap?.domain ||
              "Learning path"}
          </div>
        </div>
      </motion.section>

      {targetSkills.length > 0 && (
        <CursorCard
          intensity={1.8}
          delay={0.12}
          cursorColor="rgba(234,88,12,0.06)"
          className="mt-8 rounded-lg border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-md bg-[#dcefe9] text-teal-950">
                  <Target
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                  Your learning focus
                </p>
              </div>

              <h2 className="mt-3 font-['Newsreader'] text-2xl font-semibold tracking-[-0.025em] text-[#10231f] sm:text-3xl">
                Build the skills your goal needs.
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                CampusX keeps your existing skills in view and highlights the skills you still need to learn.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4 rounded-lg border border-stone-200 bg-white px-4 py-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-teal-950 text-orange-300">
                <Award
                  size={20}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-2xl font-semibold tracking-[-0.03em] text-[#10231f]">
                  {skillCoverage}%
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">
                  Skill coverage
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-6 h-2 overflow-hidden rounded-full bg-stone-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              skillCoverage
            }
            aria-label={`Skill coverage ${skillCoverage}%`}
          >
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${skillCoverage}%`,
              }}
              transition={{
                duration: 0.7,
                ease: pageEase,
              }}
              className="h-full rounded-full bg-teal-950"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2">
                <CircleCheck
                  size={15}
                  strokeWidth={1.9}
                  className="text-teal-800"
                  aria-hidden="true"
                />

                <p className="text-xs font-semibold text-stone-700">
                  You already have
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {availableSkills.length >
                0 ? (
                  availableSkills.map(
                    (skill) => (
                      <span
                        key={`available-${skill}`}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#dcefe9] px-3 text-[11px] font-semibold text-teal-950"
                      >
                        <CircleCheck
                          size={12}
                          strokeWidth={2}
                          aria-hidden="true"
                        />

                        {skill}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-xs text-stone-400">
                    Your goal skills are still being mapped.
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Layers3
                  size={15}
                  strokeWidth={1.8}
                  className="text-orange-700"
                  aria-hidden="true"
                />

                <p className="text-xs font-semibold text-stone-700">
                  You need to learn
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {missingSkills.length >
                0 ? (
                  missingSkills.map(
                    (skill) => (
                      <span
                        key={`missing-${skill}`}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 text-[11px] font-semibold text-orange-900"
                      >
                        <Circle
                          size={12}
                          strokeWidth={2}
                          aria-hidden="true"
                        />

                        {skill}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-xs text-stone-400">
                    You are currently covered for the selected learning goal.
                  </span>
                )}
              </div>
            </div>
          </div>
        </CursorCard>
      )}

      {featuredResource && (
        <CursorCard
          intensity={2.3}
          delay={0.2}
          cursorColor="rgba(255,255,255,0.13)"
          className="mt-8 rounded-lg border border-teal-950 bg-teal-950 p-6 text-white shadow-[0_18px_45px_rgba(6,78,59,0.13)] sm:p-8"
        >
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-300 px-2.5 py-1 text-[10px] font-bold text-teal-950">
                  RECOMMENDED RESOURCE
                </span>

                <span className="text-[11px] font-medium text-stone-300">
                  {getSourceLabel(
                    featuredResource
                  )}
                </span>
              </div>

              <h2 className="mt-4 max-w-2xl font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                {featuredResource.title}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
                {buildResourceDescription(
                  featuredResource
                )}
              </p>

              <a
                href={
                  featuredResource.url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-4 text-xs font-semibold text-teal-950 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
              >
                Open resource

                <ExternalLink
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
            </div>

            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
              <PlayCircle
                size={27}
                strokeWidth={1.5}
                className="text-orange-300"
                aria-hidden="true"
              />
            </div>
          </div>
        </CursorCard>
      )}

      <section
        className="mt-9"
        aria-labelledby="resource-library-title"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
              Resource library
            </p>

            <h2
              id="resource-library-title"
              className="mt-2 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] text-[#10231f]"
            >
              Pick your next resource.
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-400">
            <Filter
              size={14}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <span>
              {filteredResources.length} of{" "}
              {resources.length} resources
            </span>
          </div>
        </div>

        {resourceTypes.length >
          1 && (
          <div
            className="mt-5 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter resources by type"
          >
            {resourceTypes.map(
              (filter) => {
                const active =
                  activeFilter ===
                  filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setActiveFilter(
                        filter
                      )
                    }
                    aria-pressed={active}
                    className={`min-h-9 rounded-full border px-3.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 ${
                      active
                        ? "border-teal-950 bg-teal-950 text-white"
                        : "border-stone-200 bg-white text-stone-500 hover:-translate-y-0.5 hover:border-stone-300 hover:text-teal-950"
                    }`}
                  >
                    {filter ===
                    "All"
                      ? "All"
                      : formatResourceType(
                          filter
                        )}
                  </button>
                );
              }
            )}
          </div>
        )}

        {isLoadingResources && (
          <div
            className="mt-6 rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-500"
            role="status"
            aria-live="polite"
          >
            Loading learning resources...
          </div>
        )}

        {resourceError &&
          !isLoadingResources && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-semibold text-red-950">
                Unable to load learning resources.
              </p>

              <p className="mt-1 text-sm text-red-700">
                {resourceError}
              </p>

              <button
                type="button"
                onClick={
                  loadCoursesAndResources
                }
                className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-md bg-teal-950 px-3.5 text-xs font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
              >
                <RefreshCw
                  size={13}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                Try again
              </button>
            </div>
          )}

        {!resourceError &&
          !isLoadingResources &&
          filteredResources.length ===
            0 && (
            <div className="mt-6 rounded-lg border border-stone-200 bg-white p-8 text-center">
              <BookOpen
                size={25}
                className="mx-auto text-teal-900"
                strokeWidth={1.6}
                aria-hidden="true"
              />

              <h3 className="mt-4 font-['Newsreader'] text-2xl font-semibold text-[#10231f]">
                No resources found yet.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                Your roadmap is available, but there are no matching learning resources at the moment.
              </p>
            </div>
          )}

        {!resourceError &&
          filteredResources.length >
            0 && (
            <div className="mt-7 space-y-10">
              {filteredGovernmentResources.length >
                0 && (
                <section aria-labelledby="government-resources-title">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-md bg-[#dcefe9] text-teal-950">
                          <Award
                            size={15}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </span>

                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                          Priority learning
                        </p>
                      </div>

                      <h3
                        id="government-resources-title"
                        className="mt-2 font-['Newsreader'] text-2xl font-semibold tracking-[-0.025em] text-[#10231f]"
                      >
                        Government & academic resources.
                      </h3>

                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500">
                        Start with structured resources from NPTEL, SWAYAM and verified academic or government sources.
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-stone-400">
                      {
                        filteredGovernmentResources.length
                      }{" "}
                      resources
                    </span>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredGovernmentResources.map(
                      (
                        resource,
                        index
                      ) => (
                        <ResourceCard
                          key={`${resource.url}-${resource.title}-government-${index}`}
                          resource={
                            resource
                          }
                          index={
                            index
                          }
                          variant="government"
                        />
                      )
                    )}
                  </div>
                </section>
              )}

              {filteredOtherResources.length >
                0 && (
                <section aria-labelledby="other-resources-title">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                        More ways to learn
                      </p>

                      <h3
                        id="other-resources-title"
                        className="mt-2 font-['Newsreader'] text-2xl font-semibold tracking-[-0.025em] text-[#10231f]"
                      >
                        Other learning resources.
                      </h3>

                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500">
                        Tutorials, videos, courses and official documentation that complement your learning path.
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-stone-400">
                      {
                        filteredOtherResources.length
                      }{" "}
                      resources
                    </span>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredOtherResources.map(
                      (
                        resource,
                        index
                      ) => (
                        <ResourceCard
                          key={`${resource.url}-${resource.title}-other-${index}`}
                          resource={
                            resource
                          }
                          index={
                            index
                          }
                          variant="other"
                        />
                      )
                    )}
                  </div>
                </section>
              )}
            </div>
          )}

        {loadMoreError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-950">
              {loadMoreError ===
              "CACHE_NOT_READY"
                ? "More resources are still preparing."
                : "Unable to load more resources."}
            </p>

            <p className="mt-1 text-sm text-red-700">
              {loadMoreError ===
              "CACHE_NOT_READY"
                ? "The background resource cache is still being prepared. Please try again shortly."
                : loadMoreError}
            </p>

            <button
              type="button"
              onClick={
                handleLoadMore
              }
              disabled={
                isLoadingMore
              }
              className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-md bg-teal-950 px-3.5 text-xs font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
            >
              <RefreshCw
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              Try again
            </button>
          </div>
        )}

        {!resourceError &&
          !isLoadingResources &&
          hasMore &&
          cacheKey &&
          filteredResources.length >
            0 && (
            <div className="mt-8 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={
                  handleLoadMore
                }
                disabled={
                  isLoadingMore
                }
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-950 bg-white px-5 text-sm font-semibold text-teal-950 shadow-[0_5px_16px_rgba(28,25,23,0.05)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-[0_9px_22px_rgba(28,25,23,0.08)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
                aria-busy={
                  isLoadingMore
                }
              >
                {isLoadingMore ? (
                  <>
                    <LoaderCircle
                      size={16}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="animate-spin"
                    />

                    Loading more...
                  </>
                ) : (
                  <>
                    <RefreshCw
                      size={15}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:rotate-90"
                    />

                    Load more resources
                  </>
                )}
              </button>

              <p className="mt-2 text-[11px] text-stone-400">
                More resources are available from your learning cache.
              </p>
            </div>
          )}

        {!resourceError &&
          !isLoadingResources &&
          !hasMore &&
          resources.length > 0 && (
            <p className="mt-8 text-center text-xs text-stone-400">
              You've reached the end of your learning resources.
            </p>
          )}
      </section>

      <CursorCard
        intensity={2.2}
        delay={0.55}
        cursorColor="rgba(15,118,110,0.07)"
        className="mt-8 rounded-lg border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#dcefe9] text-teal-950">
              <Check
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                Stay on track
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#10231f]">
                Your resources follow your roadmap.
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500">
                Use your roadmap to understand the order, then use these resources to build the skills you need next.
              </p>
            </div>
          </div>

          <a
            href="/learning-roadmap"
            className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-xs font-semibold text-stone-700 shadow-[0_3px_10px_rgba(28,25,23,0.04)] transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-800/30 hover:bg-[#fcfffd] hover:text-teal-950 hover:shadow-[0_7px_16px_rgba(28,25,23,0.07)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
          >
            View roadmap

            <ArrowRight
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>
        </div>
      </CursorCard>
    </div>
  );
};

export default CoursesResources;