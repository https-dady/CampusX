import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const pageEase = [0.22, 1, 0.36, 1];

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

    card.style.setProperty("--cursor-opacity", "1");
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

    card.style.setProperty("--cursor-opacity", "0");
  };

  return (
    <motion.article
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 20 }
      }
      animate={{ opacity: 1, y: 0 }}
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

      <div className="relative z-10">{children}</div>
    </motion.article>
  );
};

const ResumeAnalysis = () => {
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or DOCX resume.");
      return false;
    }

    if (selectedFile.size > maxSize) {
      setError("Resume size must be 5 MB or smaller.");
      return false;
    }

    setError("");
    return true;
  };

  const handleFile = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* PAGE HEADER */}
      <motion.section
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.6,
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
          Upload your resume and use your career direction as
          context for understanding what is already working and
          what may need attention.
        </p>
      </motion.section>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        {/* UPLOAD AREA */}
        <CursorCard
          intensity={2.4}
          delay={0.2}
          cursorColor="rgba(15,118,110,0.07)"
          className="
            rounded-lg
            border border-stone-200
            bg-white
            p-5
            shadow-[0_8px_28px_rgba(28,25,23,0.025)]
            hover:border-stone-300
            hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
            sm:p-7
          "
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
                Use your latest version so your analysis reflects
                where you are right now.
              </p>
            </div>

            <motion.div
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: -4,
                      scale: 1.06,
                    }
              }
              className="hidden size-10 shrink-0 items-center justify-center rounded-md bg-[#dcefe9] text-teal-950 sm:flex"
            >
              <FileText
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </motion.div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            className={`
              mt-7
              flex min-h-[280px]
              cursor-pointer
              flex-col items-center
              justify-center
              rounded-lg
              border-2 border-dashed
              px-5 py-8
              text-center
              transition-[background-color,border-color,transform]
              duration-200
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-teal-800
              ${
                dragActive
                  ? "border-teal-800 bg-[#f1f8f5]"
                  : "border-stone-200 bg-[#fffdf9] hover:border-teal-800/40 hover:bg-[#fcfffd]"
              }
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleInputChange}
              className="sr-only"
              aria-label="Upload resume"
            />

            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -4, 0],
                    }
              }
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex size-14 items-center justify-center rounded-full bg-[#dcefe9] text-teal-950"
            >
              <Upload
                size={23}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </motion.div>

            <h3 className="mt-5 text-base font-semibold text-[#10231f]">
              {file ? file.name : "Drop your resume here"}
            </h3>

            <p className="mt-2 max-w-sm text-xs leading-5 text-stone-400">
              {file
                ? "Your resume is ready for analysis."
                : "or click to browse from your device"}
            </p>

            <span className="mt-5 inline-flex min-h-9 items-center rounded-md border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-600 shadow-[0_2px_8px_rgba(28,25,23,0.04)]">
              {file ? "Choose another file" : "Choose file"}
            </span>

            <p className="mt-4 text-[10px] font-medium text-stone-400">
              PDF or DOCX · Maximum 5 MB
            </p>
          </div>

          {error && (
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.35,
              }}
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700"
            >
              <AlertCircle
                size={15}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <span>{error}</span>
            </motion.div>
          )}

          {file && !error && (
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.4,
                ease: pageEase,
              }}
              className="mt-4 flex items-center justify-between gap-3 rounded-md border border-teal-100 bg-[#f5faf8] px-3.5 py-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <CheckCircle2
                  size={16}
                  strokeWidth={1.8}
                  className="shrink-0 text-teal-800"
                  aria-hidden="true"
                />

                <span className="truncate text-xs font-semibold text-teal-950">
                  Resume selected
                </span>
              </div>

              <motion.button
                type="button"
                onClick={removeFile}
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: 4,
                        scale: 1.04,
                      }
                }
                whileTap={
                  prefersReducedMotion
                    ? undefined
                    : { scale: 0.96 }
                }
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-white hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                aria-label="Remove selected resume"
              >
                <X
                  size={15}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </motion.button>
            </motion.div>
          )}

          <div className="mt-6">
            <motion.button
              type="button"
              disabled={!file}
              whileHover={
                prefersReducedMotion || !file
                  ? undefined
                  : {
                      y: -2,
                    }
              }
              whileTap={
                prefersReducedMotion || !file
                  ? undefined
                  : {
                      scale: 0.98,
                    }
              }
              className="
                group
                inline-flex min-h-11
                w-full items-center
                justify-center gap-2
                rounded-md
                bg-teal-950
                px-5
                text-sm font-semibold
                text-white
                shadow-[0_7px_18px_rgba(6,78,59,0.10)]
                transition-[background-color,box-shadow,transform,opacity]
                duration-200
                hover:bg-teal-900
                hover:shadow-[0_12px_25px_rgba(6,78,59,0.15)]
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-teal-800
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:shadow-[0_7px_18px_rgba(6,78,59,0.10)]
              "
            >
              Analyze my resume

              <ArrowRight
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </motion.button>
          </div>
        </CursorCard>

        {/* WHAT TO EXPECT */}
        <div className="space-y-5">
          <CursorCard
            intensity={2.2}
            delay={0.3}
            className="
              rounded-lg
              border border-stone-200
              bg-[#fffdf9]
              p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-stone-300
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
                  Step 02
                </p>

                <h2 className="mt-2 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] text-[#10231f]">
                  Understand your resume.
                </h2>
              </div>

              <motion.div
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: 5,
                        scale: 1.06,
                      }
                }
                className="hidden size-9 shrink-0 items-center justify-center rounded-md bg-[#edf5f1] text-teal-950 sm:flex"
              >
                <FileText
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.div>
            </div>

            <p className="mt-3 text-sm leading-6 text-stone-500">
              Your analysis will help connect your resume with the
              career direction you are working towards.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Resume structure and presentation",
                "Relevant skills and experience",
                "Alignment with your career direction",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={
                    prefersReducedMotion
                      ? false
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
                    duration: prefersReducedMotion ? 0 : 0.4,
                    delay: prefersReducedMotion
                      ? 0
                      : 0.65 + index * 0.08,
                    ease: pageEase,
                  }}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          x: 3,
                        }
                  }
                  className="flex items-start gap-3 rounded-md border border-stone-200 bg-white px-3.5 py-3 transition-shadow duration-200 hover:shadow-[0_6px_18px_rgba(28,25,23,0.04)]"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#dcefe9] text-teal-950">
                    <Check
                      size={12}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>

                  <span className="text-xs font-medium leading-5 text-stone-600">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </CursorCard>

          <CursorCard
            intensity={2.2}
            delay={0.4}
            cursorColor="rgba(234,88,12,0.07)"
            className="
              rounded-lg
              border border-orange-100
              bg-orange-50/60
              p-6
              shadow-[0_8px_28px_rgba(28,25,23,0.025)]
              hover:border-orange-200
              hover:shadow-[0_18px_38px_rgba(28,25,23,0.07)]
              sm:p-7
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-800">
                  Keep it useful
                </p>

                <h2 className="mt-2 font-['Newsreader'] text-2xl font-semibold tracking-[-0.025em] text-[#10231f]">
                  Your resume is part of the bigger picture.
                </h2>
              </div>

              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, -3, 0],
                      }
                }
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="hidden size-9 shrink-0 items-center justify-center rounded-md bg-[#fff0e7] text-orange-700 sm:flex"
              >
                <ArrowRight
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </motion.div>
            </div>

            <p className="mt-3 text-sm leading-6 text-stone-500">
              Keep your profile, skills, career direction, and
              resume aligned as you continue through your roadmap.
            </p>
          </CursorCard>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;