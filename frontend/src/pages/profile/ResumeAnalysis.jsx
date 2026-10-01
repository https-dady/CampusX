import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { checkResume } from "../../services/resume.service.js";

const pageEase = [0.22, 1, 0.36, 1];
const RESUME_BUILDER_ANALYSIS_KEY = "campusx_resume_builder_analysis";

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
    if (prefersReducedMotion) {
      return;
    }

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
        duration: prefersReducedMotion
          ? 0
          : 0.55,
        delay: prefersReducedMotion
          ? 0
          : delay,
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

const formatProbability = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${Math.round(number * 100)}%`;
};

const severityClass = (severity) => {
  if (severity === "error") {
    return "border-red-100 bg-red-50 text-red-800";
  }

  if (severity === "warning") {
    return "border-amber-100 bg-amber-50 text-amber-800";
  }

  return "border-emerald-100 bg-emerald-50 text-emerald-800";
};

const ResumeReport = ({
  result,
  onReset,
  onBuildResume,
}) => {
  const careerPredictions =
    result?.career?.predictions || [];

  const detectedSkills =
    result?.skills?.detected || [];

  const missingSkills =
    result?.skills?.missingForTopCareer || [];

  const checks =
    result?.checks || [];

  const extracted =
    result?.extracted || {};

  const summary =
    result?.summary || {};

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        ease: pageEase,
      }}
      className="mt-8"
      aria-labelledby="resume-report-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
            Analysis complete
          </p>

          <h2
            id="resume-report-title"
            className="mt-2 font-['Newsreader'] text-4xl font-semibold tracking-[-0.035em] text-[#10231f]"
          >
            Your resume report.
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Review the extracted information, career direction, skill gaps, and resume issues below.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
        >
          <RotateCcw size={14} />
          Analyze another resume
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
            Career direction
          </p>

          <p className="mt-3 text-xl font-semibold text-[#10231f]">
            {result?.career?.topMatch ||
              "Not available"}
          </p>

          <p className="mt-1 text-xs text-stone-400">
            Top model prediction
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
            Detected skills
          </p>

          <p className="mt-3 text-2xl font-semibold text-[#10231f]">
            {detectedSkills.length}
          </p>

          <p className="mt-1 text-xs text-stone-400">
            Skills found in the resume
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
            Issues found
          </p>

          <p className="mt-3 text-2xl font-semibold text-[#10231f]">
            {summary.totalIssues ?? 0}
          </p>

          <p className="mt-1 text-xs text-stone-400">
            Structure, content, and formatting checks
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles
              size={17}
              className="text-teal-800"
            />

            <h3 className="text-sm font-bold text-[#10231f]">
              Career predictions
            </h3>
          </div>

          <div className="mt-4 space-y-2">
            {careerPredictions.length > 0 ? (
              careerPredictions.map(
                (prediction) => (
                  <div
                    key={prediction.career}
                    className="flex items-center gap-3 rounded-md border border-stone-100 bg-[#fffdf9] px-3.5 py-3"
                  >
                    <span className="min-w-0 flex-1 text-xs font-semibold text-stone-700">
                      {prediction.career}
                    </span>

                    <span className="text-xs font-bold text-teal-900">
                      {formatProbability(
                        prediction.probability
                      )}
                    </span>
                  </div>
                )
              )
            ) : (
              <p className="text-xs text-stone-400">
                No career predictions were returned.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6">
          <h3 className="text-sm font-bold text-[#10231f]">
            Skill gap for top career
          </h3>

          <p className="mt-1 text-xs text-stone-400">
            {result?.career?.topMatch ||
              "Top career"}
          </p>

          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
              Detected
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {detectedSkills.length > 0 ? (
                detectedSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#dcefe9] px-2.5 py-1 text-[10px] font-semibold text-teal-950"
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-stone-400">
                  No known skills detected.
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
              Missing / recommended
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {missingSkills.length > 0 ? (
                missingSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-100"
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-stone-400">
                  No missing skills were identified from the model's career mapping.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6">
          <h3 className="text-sm font-bold text-[#10231f]">
            Extracted resume data
          </h3>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between gap-4 border-b border-stone-100 pb-2">
              <span className="text-stone-400">
                Name
              </span>

              <span className="text-right font-medium text-stone-700">
                {extracted?.personal?.name ||
                  "Not detected"}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-stone-100 pb-2">
              <span className="text-stone-400">
                Degree
              </span>

              <span className="text-right font-medium text-stone-700">
                {extracted?.education?.degree ||
                  "Not detected"}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-stone-100 pb-2">
              <span className="text-stone-400">
                Branch
              </span>

              <span className="text-right font-medium text-stone-700">
                {extracted?.education?.branch ||
                  "Not detected"}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-stone-100 pb-2">
              <span className="text-stone-400">
                CGPA
              </span>

              <span className="text-right font-medium text-stone-700">
                {extracted?.education?.cgpa ??
                  "Not detected"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-stone-400">
                Word count
              </span>

              <span className="text-right font-medium text-stone-700">
                {extracted?.wordCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-[#10231f]">
              Resume issues & suggestions
            </h3>

            <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-500">
              {checks.length} checks
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {checks.length > 0 ? (
              checks.map(
                (check, index) => (
                  <div
                    key={`${check.type}-${index}-${check.message}`}
                    className={`rounded-md border px-3.5 py-3 text-xs ${severityClass(
                      check.severity
                    )}`}
                  >
                    <div className="flex items-start gap-2">
                      {check.severity ===
                      "success" ? (
                        <CheckCircle2
                          size={15}
                          className="mt-0.5 shrink-0"
                        />
                      ) : (
                        <AlertCircle
                          size={15}
                          className="mt-0.5 shrink-0"
                        />
                      )}

                      <div>
                        <p className="font-semibold capitalize">
                          {check.type}
                        </p>

                        <p className="mt-0.5 leading-5">
                          {check.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-xs text-stone-400">
                No additional checks were returned.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-teal-100 bg-[#f1f8f5] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-900">
              Next step
            </p>

            <h3 className="mt-1 text-base font-bold text-[#10231f]">
              Build an improved resume from this analysis.
            </h3>

            <p className="mt-1 text-xs leading-5 text-stone-500">
              The template-based Resume Builder will use this structured data in the next phase.
            </p>
          </div>

          <button
            type="button"
            onClick={onBuildResume}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-teal-950 px-4 text-xs font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
          >
            Build improved resume
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.section>
  );
};

const ResumeAnalysis = () => {
  const navigate = useNavigate();

  const prefersReducedMotion =
    useReducedMotion();

  const inputRef = useRef(null);

  const [file, setFile] =
    useState(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const validateFile = (
    selectedFile
  ) => {
    if (!selectedFile) {
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const maxSize =
      5 * 1024 * 1024;

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Please upload a PDF or DOCX resume."
      );

      return false;
    }

    if (
      selectedFile.size >
      maxSize
    ) {
      setError(
        "Resume size must be 5 MB or smaller."
      );

      return false;
    }

    setError("");

    return true;
  };

  const handleFile = (
    selectedFile
  ) => {
    if (
      validateFile(
        selectedFile
      )
    ) {
      setFile(
        selectedFile
      );

      setResult(null);
    }
  };

  const handleInputChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (selectedFile) {
      handleFile(
        selectedFile
      );
    }
  };

  const handleDrop = (
    event
  ) => {
    event.preventDefault();

    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(
        droppedFile
      );
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  };

  const analyze = async () => {
    if (
      !file ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await checkResume(
          file
        );

      setResult(
        response?.data ||
          null
      );
    } catch (
      requestError
    ) {
      setError(
        requestError?.response?.data
          ?.message ||
          requestError?.message ||
          "Unable to analyze the resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const buildResume = () => {
    if (!result) {
      return;
    }

    try {
      sessionStorage.setItem(
        RESUME_BUILDER_ANALYSIS_KEY,
        JSON.stringify(result)
      );
    } catch (storageError) {
      console.error(
        "Unable to store resume analysis for the builder.",
        storageError
      );
    }

    navigate("/resume-builder", {
      state: {
        analysis: result,
      },
    });
  };

  const resetAnalysis = () => {
    setFile(null);
    setResult(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  };

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
        aria-labelledby="resume-analysis-title"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
          Resume analysis
        </p>

        <h1
          id="resume-analysis-title"
          className="mt-2 font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl"
        >
          Make your resume work harder.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-[15px]">
          Upload your resume to extract its structure and skills, compare it with career requirements, and identify areas that need attention.
        </p>
      </motion.section>

      {!result && (
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <CursorCard
            intensity={2.4}
            delay={0.2}
            cursorColor="rgba(15,118,110,0.07)"
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] hover:border-stone-300 hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                  Step 01
                </p>

                <h2 className="mt-2 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] text-[#10231f]">
                  Upload your resume.
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Use your latest version so the analysis reflects the document you actually plan to use.
                </p>
              </div>

              <div className="hidden size-10 shrink-0 items-center justify-center rounded-md bg-[#dcefe9] text-teal-950 sm:flex">
                <FileText
                  size={18}
                  strokeWidth={1.7}
                />
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              aria-label="Choose resume file"
              onClick={() =>
                inputRef.current?.click()
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" ||
                  event.key ===
                    " "
                ) {
                  event.preventDefault();

                  inputRef.current?.click();
                }
              }}
              onDragEnter={(
                event
              ) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(
                event
              ) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(
                event
              ) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={
                handleDrop
              }
              className={`mt-7 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 py-8 text-center transition-[background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800 ${
                dragActive
                  ? "border-teal-800 bg-[#f1f8f5]"
                  : "border-stone-200 bg-[#fffdf9] hover:border-teal-800/40 hover:bg-[#fcfffd]"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={
                  handleInputChange
                }
                className="sr-only"
                aria-label="Upload resume"
              />

              <div className="flex size-14 items-center justify-center rounded-full bg-[#dcefe9] text-teal-950">
                <Upload
                  size={23}
                  strokeWidth={1.6}
                />
              </div>

              <h3 className="mt-5 text-base font-semibold text-[#10231f]">
                {file
                  ? file.name
                  : "Drop your resume here"}
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-5 text-stone-400">
                {file
                  ? "Your resume is ready for analysis."
                  : "or click to browse from your device"}
              </p>

              <span className="mt-5 inline-flex min-h-9 items-center rounded-md border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-600 shadow-[0_2px_8px_rgba(28,25,23,0.04)]">
                PDF or DOCX · Max 5 MB
              </span>
            </div>

            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-md border border-stone-200 bg-[#fffdf9] px-3.5 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-[#dcefe9] text-teal-950">
                  <FileText size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-stone-700">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-stone-400">
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    removeFile
                  }
                  aria-label="Remove selected resume"
                  className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-teal-800"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-md border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-red-800"
              >
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={
                  analyze
                }
                disabled={
                  !file ||
                  loading
                }
                className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-950 px-5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(6,78,59,0.10)] transition hover:bg-teal-900 hover:shadow-[0_12px_25px_rgba(6,78,59,0.15)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Analyzing resume...
                  </>
                ) : (
                  <>
                    Analyze my resume
                    <ArrowRight
                      size={15}
                    />
                  </>
                )}
              </button>
            </div>
          </CursorCard>

          <div className="space-y-5">
            <CursorCard
              intensity={2.2}
              delay={0.3}
              className="rounded-lg border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                Step 02
              </p>

              <h2 className="mt-2 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] text-[#10231f]">
                Understand your resume.
              </h2>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                The first implementation connects your uploaded resume to structured extraction, the existing career model, skill-gap information, and concrete resume checks.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Extract resume information",
                  "Detect relevant technical skills",
                  "Predict career direction",
                  "Identify skill gaps",
                  "Check resume structure and content",
                ].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-md border border-stone-200 bg-white px-3.5 py-3"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#dcefe9] text-teal-950">
                        <Check
                          size={12}
                          strokeWidth={2}
                        />
                      </span>

                      <span className="text-xs font-medium leading-5 text-stone-600">
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CursorCard>

            <CursorCard
              intensity={2.2}
              delay={0.4}
              cursorColor="rgba(234,88,12,0.07)"
              className="rounded-lg border border-orange-100 bg-orange-50/60 p-6 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-800">
                Next phase
              </p>

              <h2 className="mt-2 font-['Newsreader'] text-2xl font-semibold tracking-[-0.025em] text-[#10231f]">
                Turn the report into a better resume.
              </h2>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                After the checker is stable, the locked Resume Builder flow will add six template options, automatic data population, preview, and PDF download.
              </p>
            </CursorCard>
          </div>
        </div>
      )}

      {result && (
        <ResumeReport
          result={result}
          onReset={resetAnalysis}
          onBuildResume={buildResume}
        />
      )}
    </div>
  );
};

export default ResumeAnalysis;