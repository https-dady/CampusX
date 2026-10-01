import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Download,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useResumeBuilder } from "../../hooks/useResumeBuilder.js";

import {
  RESUME_TEMPLATE_OPTIONS,
  ResumeTemplateRenderer,
} from "../../components/resume/ResumeTemplateRenderer.jsx";

import { downloadResumePdf } from "../../utils/resumePDF.js";

const STORAGE_KEY =
"campusx_resume_builder_analysis";

const readStoredAnalysis = () => {
  try {
    const raw =
      sessionStorage.getItem(STORAGE_KEY);

    return raw
      ? JSON.parse(raw)
      : null;
  } catch {
    return null;
  }
};

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition placeholder:text-stone-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10";

const SectionCard = ({
  title,
  description,
  children,
}) => {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-[#10231f]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-stone-400">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) => {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={fieldClassName}
      />
    </label>
  );
};

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
}) => {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">
        {label}
      </span>

      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`${fieldClassName} resize-y`}
      />
    </label>
  );
};

const ResumeBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const resumePreviewRef =
    useRef(null);

  const previewViewportRef =
    useRef(null);

  const [previewScale, setPreviewScale] =
    useState(1);

  const [previewHeight, setPreviewHeight] =
    useState(1122);

  const [isExporting, setIsExporting] =
    useState(false);

  const [exportError, setExportError] =
    useState("");

  const analysis = useMemo(
    () =>
      location.state?.analysis ||
      readStoredAnalysis(),
    [location.state]
  );

  const {
    resumeData,
    updateSection,
    addItem,
    updateItem,
    removeItem,
    changeTemplate,
  } = useResumeBuilder(analysis);

  useEffect(() => {
    const viewport = previewViewportRef.current;
    const preview = resumePreviewRef.current;

    if (!viewport || !preview) {
      return undefined;
    }

    const updatePreviewScale = () => {
      const previewWidth =
        preview.offsetWidth ||
        794;

      const availableWidth =
        viewport.clientWidth;

      const nextScale = Math.min(
        1,
        Math.max(0.35, availableWidth / previewWidth)
      );

      setPreviewScale((current) =>
        Math.abs(current - nextScale) < 0.005
          ? current
          : nextScale
      );

      const contentHeight =
        preview.scrollHeight ||
        preview.offsetHeight ||
        1122;

      setPreviewHeight(
        Math.max(1122, contentHeight)
      );
    };

    updatePreviewScale();

    const resizeObserver =
      new ResizeObserver(updatePreviewScale);

    resizeObserver.observe(viewport);
    resizeObserver.observe(preview);

    window.addEventListener(
      "resize",
      updatePreviewScale
    );

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener(
        "resize",
        updatePreviewScale
      );
    };
  }, [resumeData]);

  const personal =
    resumeData.personal || {};

  const education =
    resumeData.education || [];

  const experience =
    resumeData.experience || [];

  const projects =
    resumeData.projects || [];

  const certifications =
    resumeData.certifications || [];

  const achievements =
    resumeData.achievements || [];

  const interests =
    resumeData.interests || [];

  const skills =
    resumeData.skills || [];

  const firstEducation =
    education[0] || {};

  const updatePersonal = (
    field,
    value
  ) => {
    updateSection("personal", {
      ...personal,
      [field]: value,
    });
  };

  const updateEducation = (
    field,
    value
  ) => {
    if (education.length === 0) {
      addItem("education", {
        institution: "",
        degree: "",
        branch: "",
        cgpa: "",
        academicYear: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
        [field]: value,
      });

      return;
    }

    updateItem(
      "education",
      0,
      {
        [field]: value,
      }
    );
  };

  const updateSkills = (value) => {
    const parsed = value
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

    updateSection(
      "skills",
      parsed
    );
  };

  const addSimpleItem = (
    section,
    value = ""
  ) => {
    addItem(section, value);
  };

  const handleDownloadPdf = async () => {
  if (
    isExporting ||
    !resumePreviewRef.current
  ) {
    return;
  }

  setIsExporting(true);
  setExportError("");

  try {
    const name =
      personal.name ||
      "resume";

    await downloadResumePdf({
      element:
        resumePreviewRef.current,
      fileName: `${name}-resume`,
    });

    // PDF successfully generated.
    // Clear any previous export error.
    setExportError("");
  } catch (error) {
    console.error(
      "Resume PDF export failed:",
      error
    );

    setExportError(
      error?.message ||
        "Unable to generate the PDF. Please try again."
    );
  } finally {
    setIsExporting(false);
  }
};

  if (!analysis) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">
            Resume Builder
          </p>

          <h1 className="mt-2 font-['Newsreader'] text-3xl font-semibold tracking-[-0.025em] text-[#10231f]">
            Start from your resume
            analysis.
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
            Open the Resume Checker,
            analyze a resume, and then
            choose “Build improved
            resume” to populate the
            builder.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/resume-analysis"
              )
            }
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-teal-950 px-4 text-xs font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
          >
            <ArrowLeft size={14} />
            Back to Resume Checker
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* =============================================================== */}
      {/* PAGE HEADER                                                     */}
      {/* =============================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-950">
            Resume Builder
          </p>

          <h1 className="mt-2 font-['Newsreader'] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#10231f] sm:text-5xl">
            Build your improved
            resume.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
            Edit your information,
            choose a professional
            template, preview the final
            resume, and download it as
            an A4 PDF.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/resume-analysis"
            )
          }
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
        >
          <ArrowLeft size={14} />
          Back to analysis
        </button>
      </div>

      {/* =============================================================== */}
      {/* TEMPLATE SELECTOR                                               */}
      {/* =============================================================== */}

      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_28px_rgba(28,25,23,0.025)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-teal-950">
              Template
            </p>

            <h2 className="mt-1 text-base font-bold text-[#10231f]">
              Choose your resume
              style.
            </h2>
          </div>

          <p className="text-xs text-stone-400">
            You can switch templates
            without losing your data.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {RESUME_TEMPLATE_OPTIONS.map(
            (template) => {
              const selected =
                resumeData.templateId ===
                template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() =>
                    changeTemplate(
                      template.id
                    )
                  }
                  className={[
                    "rounded-lg border p-4 text-left transition",
                    selected
                      ? "border-teal-800 bg-[#f1f8f5] ring-2 ring-teal-800/10"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block h-1.5 w-12 rounded-full",
                      selected
                        ? "bg-teal-900"
                        : "bg-stone-200",
                    ].join(" ")}
                  />

                  <span className="mt-3 block text-xs font-bold text-[#10231f]">
                    {template.name}
                  </span>

                  {template.description && (
                    <span className="mt-1 block text-[10px] leading-4 text-stone-400">
                      {
                        template.description
                      }
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* =============================================================== */}
      {/* MAIN BUILDER                                                    */}
      {/* =============================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
        {/* ============================================================= */}
        {/* EDITOR                                                        */}
        {/* ============================================================= */}

        <div className="space-y-5">
          {/* PERSONAL */}

          <SectionCard
            title="Personal information"
            description="These details appear in the resume header."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={
                  personal.name
                }
                onChange={(value) =>
                  updatePersonal(
                    "name",
                    value
                  )
                }
              />

              <Field
                label="Email"
                type="email"
                value={
                  personal.email
                }
                onChange={(value) =>
                  updatePersonal(
                    "email",
                    value
                  )
                }
              />

              <Field
                label="Phone"
                value={
                  personal.phone
                }
                onChange={(value) =>
                  updatePersonal(
                    "phone",
                    value
                  )
                }
              />

              <Field
                label="Location"
                value={
                  personal.location
                }
                onChange={(value) =>
                  updatePersonal(
                    "location",
                    value
                  )
                }
              />

              <Field
                label="LinkedIn"
                value={
                  personal.linkedin
                }
                onChange={(value) =>
                  updatePersonal(
                    "linkedin",
                    value
                  )
                }
                placeholder="https://linkedin.com/in/..."
              />

              <Field
                label="GitHub"
                value={
                  personal.github
                }
                onChange={(value) =>
                  updatePersonal(
                    "github",
                    value
                  )
                }
                placeholder="https://github.com/..."
              />

              <Field
                label="Portfolio"
                value={
                  personal.portfolio
                }
                onChange={(value) =>
                  updatePersonal(
                    "portfolio",
                    value
                  )
                }
                placeholder="https://..."
              />

              <Field
                label="Website"
                value={
                  personal.website
                }
                onChange={(value) =>
                  updatePersonal(
                    "website",
                    value
                  )
                }
                placeholder="https://..."
              />
            </div>
          </SectionCard>

          {/* SUMMARY */}

          <SectionCard
            title="Professional summary"
            description="Keep this concise and focused on your profile."
          >
            <TextAreaField
              label="Summary"
              rows={6}
              value={
                resumeData.summary
              }
              onChange={(value) =>
                updateSection(
                  "summary",
                  value
                )
              }
              placeholder="Write a concise professional summary..."
            />
          </SectionCard>

          {/* EDUCATION */}

          <SectionCard
            title="Education"
            description="Add your academic qualifications."
          >
            {education.length ===
            0 ? (
              <button
                type="button"
                onClick={() =>
                  addItem(
                    "education",
                    {
                      institution:
                        "",
                      degree: "",
                      branch: "",
                      cgpa: "",
                      academicYear:
                        "",
                      startDate:
                        "",
                      endDate: "",
                      location: "",
                      description:
                        "",
                    }
                  )
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-700 transition hover:border-teal-700 hover:text-teal-900"
              >
                <Plus size={14} />
                Add education
              </button>
            ) : (
              <div className="space-y-4">
                {education.map(
                  (item, index) => (
                    <div
                      key={`education-${index}`}
                      className="rounded-lg border border-stone-100 bg-[#fffdf9] p-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Institution"
                          value={
                            item.institution
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                institution:
                                  value,
                              }
                            )
                          }
                        />

                        <Field
                          label="Degree"
                          value={
                            item.degree
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                degree:
                                  value,
                              }
                            )
                          }
                        />

                        <Field
                          label="Branch / specialization"
                          value={
                            item.branch
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                branch:
                                  value,
                              }
                            )
                          }
                        />

                        <Field
                          label="CGPA"
                          value={
                            item.cgpa
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                cgpa: value,
                              }
                            )
                          }
                        />

                        <Field
                          label="Academic year"
                          value={
                            item.academicYear
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                academicYear:
                                  value,
                              }
                            )
                          }
                        />

                        <Field
                          label="Location"
                          value={
                            item.location
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                location:
                                  value,
                              }
                            )
                          }
                        />

                        <Field
                          label="Start date"
                          value={
                            item.startDate
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                startDate:
                                  value,
                              }
                            )
                          }
                        />

                        <Field
                          label="End date"
                          value={
                            item.endDate
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                endDate:
                                  value,
                              }
                            )
                          }
                        />
                      </div>

                      <div className="mt-4">
                        <TextAreaField
                          label="Description"
                          rows={3}
                          value={
                            item.description
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              "education",
                              index,
                              {
                                description:
                                  value,
                              }
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            "education",
                            index
                          )
                        }
                        className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2
                          size={13}
                        />
                        Remove
                      </button>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    addItem(
                      "education",
                      {
                        institution:
                          "",
                        degree: "",
                        branch: "",
                        cgpa: "",
                        academicYear:
                          "",
                        startDate:
                          "",
                        endDate: "",
                        location: "",
                        description:
                          "",
                      }
                    )
                  }
                  className="inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-teal-700 hover:text-teal-900"
                >
                  <Plus size={13} />
                  Add education
                </button>
              </div>
            )}
          </SectionCard>

          {/* EXPERIENCE */}

          <SectionCard
            title="Experience"
            description="Add internships, work experience, or other professional experience."
          >
            <div className="space-y-4">
              {experience.map(
                (item, index) => (
                  <div
                    key={`experience-${index}`}
                    className="rounded-lg border border-stone-100 bg-[#fffdf9] p-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Company"
                        value={
                          item.company
                        }
                        onChange={(
                          value
                        ) =>
                          updateItem(
                            "experience",
                            index,
                            {
                              company:
                                value,
                            }
                          )
                        }
                      />

                      <Field
                        label="Role"
                        value={
                          item.role
                        }
                        onChange={(
                          value
                        ) =>
                          updateItem(
                            "experience",
                            index,
                            {
                              role:
                                value,
                            }
                          )
                        }
                      />

                      <Field
                        label="Start date"
                        value={
                          item.startDate
                        }
                        onChange={(
                          value
                        ) =>
                          updateItem(
                            "experience",
                            index,
                            {
                              startDate:
                                value,
                            }
                          )
                        }
                      />

                      <Field
                        label="End date"
                        value={
                          item.endDate
                        }
                        onChange={(
                          value
                        ) =>
                          updateItem(
                            "experience",
                            index,
                            {
                              endDate:
                                value,
                            }
                          )
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <TextAreaField
                        label="Description"
                        rows={5}
                        value={
                          item.description
                        }
                        onChange={(
                          value
                        ) =>
                          updateItem(
                            "experience",
                            index,
                            {
                              description:
                                value,
                            }
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "experience",
                          index
                        )
                      }
                      className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2
                        size={13}
                      />
                      Remove
                    </button>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  addItem(
                    "experience",
                    {
                      company: "",
                      role: "",
                      startDate:
                        "",
                      endDate: "",
                      description:
                        "",
                    }
                  )
                }
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-teal-700 hover:text-teal-900"
              >
                <Plus size={13} />
                Add experience
              </button>
            </div>
          </SectionCard>

          {/* PROJECTS */}

          <SectionCard
            title="Projects"
            description="Add projects with a clear description of your work."
          >
            <div className="space-y-4">
              {projects.map(
                (item, index) => (
                  <div
                    key={`project-${index}`}
                    className="rounded-lg border border-stone-100 bg-[#fffdf9] p-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Project name"
                        value={
                          item.name
                        }
                        onChange={(
                          value
                        ) =>
                          updateItem(
                            "projects",
                            index,
                            {
                              name: value,
                            }
                          )
                        }
                      />

                      <Field
                        label="Technologies"
                        value={
                          item.technologies
                        }
                        onChange={(
                          value
                        ) =>
                          updateItem(
                            "projects",
                            index,
                            {
                              technologies:
                                value,
                            }
                          )
                        }
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>

                    <div className="mt-4">
                      <TextAreaField
                        label="Description"
                        rows={5}
                        value={
                          item.description
                        }
                        onChange={(
                          value
                        ) =>
                          updateItem(
                            "projects",
                            index,
                            {
                              description:
                                value,
                            }
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "projects",
                          index
                        )
                      }
                      className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2
                        size={13}
                      />
                      Remove
                    </button>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  addItem(
                    "projects",
                    {
                      name: "",
                      technologies:
                        "",
                      description:
                        "",
                    }
                  )
                }
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-teal-700 hover:text-teal-900"
              >
                <Plus size={13} />
                Add project
              </button>
            </div>
          </SectionCard>

          {/* SKILLS */}

          <SectionCard
            title="Skills"
            description="Separate skills with commas."
          >
            <TextAreaField
              label="Technical skills"
              rows={4}
              value={skills.join(
                ", "
              )}
              onChange={
                updateSkills
              }
              placeholder="JavaScript, React, Node.js, MongoDB, Git"
            />
          </SectionCard>

          {/* CERTIFICATIONS */}

          <SectionCard
            title="Certifications"
            description="Add relevant certifications and training."
          >
            <div className="space-y-3">
              {certifications.map(
                (
                  certification,
                  index
                ) => (
                  <div
                    key={`certification-${index}`}
                    className="flex items-start gap-2"
                  >
                    <input
                      type="text"
                      value={
                        typeof certification ===
                        "string"
                          ? certification
                          : certification?.name ||
                            ""
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          "certifications",
                          index,
                          event.target.value
                        )
                      }
                      className={fieldClassName}
                      placeholder="Certification name"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "certifications",
                          index
                        )
                      }
                      className="mt-1.5 flex size-10 shrink-0 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-100"
                      aria-label="Remove certification"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  addSimpleItem(
                    "certifications"
                  )
                }
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-teal-700 hover:text-teal-900"
              >
                <Plus size={13} />
                Add certification
              </button>
            </div>
          </SectionCard>

          {/* ACHIEVEMENTS */}

          <SectionCard
            title="Achievements"
            description="Add notable academic, technical, or competition achievements."
          >
            <div className="space-y-3">
              {achievements.map(
                (
                  achievement,
                  index
                ) => (
                  <div
                    key={`achievement-${index}`}
                    className="flex items-start gap-2"
                  >
                    <input
                      type="text"
                      value={
                        typeof achievement ===
                        "string"
                          ? achievement
                          : achievement?.title ||
                            ""
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          "achievements",
                          index,
                          event.target.value
                        )
                      }
                      className={fieldClassName}
                      placeholder="Achievement"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "achievements",
                          index
                        )
                      }
                      className="mt-1.5 flex size-10 shrink-0 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-100"
                      aria-label="Remove achievement"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  addSimpleItem(
                    "achievements"
                  )
                }
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-teal-700 hover:text-teal-900"
              >
                <Plus size={13} />
                Add achievement
              </button>
            </div>
          </SectionCard>

          {/* INTERESTS */}

          <SectionCard
            title="Interests"
            description="Optional interests that you want to show on the resume."
          >
            <div className="space-y-3">
              {interests.map(
                (
                  interest,
                  index
                ) => (
                  <div
                    key={`interest-${index}`}
                    className="flex items-start gap-2"
                  >
                    <input
                      type="text"
                      value={
                        typeof interest ===
                        "string"
                          ? interest
                          : interest?.name ||
                            ""
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          "interests",
                          index,
                          event.target.value
                        )
                      }
                      className={fieldClassName}
                      placeholder="Interest"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "interests",
                          index
                        )
                      }
                      className="mt-1.5 flex size-10 shrink-0 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-100"
                      aria-label="Remove interest"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  addSimpleItem(
                    "interests"
                  )
                }
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-teal-700 hover:text-teal-900"
              >
                <Plus size={13} />
                Add interest
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ============================================================= */}
        {/* PREVIEW                                                        */}
        {/* ============================================================= */}

        <div className="min-w-0">
          <div className="sticky top-5">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-teal-950">
                  Live preview
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  The preview below is the
                  same document used for
                  PDF export.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleDownloadPdf
                }
                disabled={
                  isExporting
                }
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal-950 px-4 text-xs font-semibold text-white shadow-[0_7px_18px_rgba(6,78,59,0.10)] transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <LoaderCircle
                      size={14}
                      className="animate-spin"
                    />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download
                      size={14}
                    />
                    Download PDF
                  </>
                )}
              </button>
            </div>

            {exportError && (
              <div
                role="alert"
                className="mb-3 rounded-md border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-red-800"
              >
                {exportError}
              </div>
            )}

            <div
              ref={previewViewportRef}
              className="overflow-hidden rounded-xl border border-stone-200 bg-[#e9e7e2] p-3 shadow-[0_12px_35px_rgba(28,25,23,0.06)] sm:p-5"
            >
              <div
                data-resume-preview-shell="true"
                className="mx-auto overflow-hidden"
                style={{
                  width: `${794 * previewScale}px`,
                  height: `${previewHeight * previewScale}px`,
                }}
              >
                <div
                  ref={resumePreviewRef}
                  data-resume-preview="true"
                  className="origin-top-left bg-white shadow-[0_5px_20px_rgba(28,25,23,0.08)]"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <ResumeTemplateRenderer
                    templateId={
                      resumeData.templateId
                    }
                    resumeData={
                      resumeData
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;