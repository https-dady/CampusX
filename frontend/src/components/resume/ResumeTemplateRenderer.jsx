import {
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const safeText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

const safeArray = (value) => {
  return Array.isArray(value)
    ? value
    : [];
};

const hasValue = (value) => {
  return safeText(value).length > 0;
};

const formatDateRange = (
  startDate,
  endDate
) => {
  const start = safeText(startDate);
  const end = safeText(endDate);

  if (!start && !end) {
    return "";
  }

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start || end;
};

const ContactLinks = ({
  personal = {},
  variant = "default",
}) => {
  const items = [];

  if (hasValue(personal.email)) {
    items.push({
      key: "email",
      label: personal.email,
      href: `mailto:${personal.email}`,
      icon: Mail,
    });
  }

  if (hasValue(personal.phone)) {
    items.push({
      key: "phone",
      label: personal.phone,
      href: `tel:${personal.phone}`,
      icon: Phone,
    });
  }

  if (hasValue(personal.location)) {
    items.push({
      key: "location",
      label: personal.location,
      href: null,
      icon: MapPin,
    });
  }

  if (hasValue(personal.linkedin)) {
    items.push({
      key: "linkedin",
      label: personal.linkedin,
      href: personal.linkedin,
      icon: Globe,
      
    });
  }

  if (hasValue(personal.github)) {
    items.push({
      key: "github",
      label: personal.github,
      href: personal.github,
      icon: Globe,
    });
  }

  if (hasValue(personal.portfolio)) {
    items.push({
      key: "portfolio",
      label: personal.portfolio,
      href: personal.portfolio,
      icon: Globe,
    });
  }

  if (hasValue(personal.website)) {
    items.push({
      key: "website",
      label: personal.website,
      href: personal.website,
      icon: Globe,
    });
  }

  const wrapperClass =
    variant === "light"
      ? "flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/75"
      : "flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-stone-500";

  const itemClass =
    variant === "light"
      ? "inline-flex items-center gap-1.5 transition hover:text-white"
      : "inline-flex items-center gap-1.5 transition hover:text-stone-900";

  return (
    <div className={wrapperClass}>
      {items.map(
        ({
          key,
          label,
          href,
          icon: Icon,
        }) => {
          if (!href) {
            return (
              <span
                key={key}
                className={itemClass}
              >
                <Icon
                  size={11}
                  strokeWidth={1.8}
                />
                <span>{label}</span>
              </span>
            );
          }

          return (
            <a
              key={key}
              href={href}
              target={
                href.startsWith("http")
                  ? "_blank"
                  : undefined
              }
              rel={
                href.startsWith("http")
                  ? "noreferrer"
                  : undefined
              }
              className={itemClass}
            >
              <Icon
                size={11}
                strokeWidth={1.8}
              />
              <span className="break-all">
                {label}
              </span>
            </a>
          );
        }
      )}
    </div>
  );
};

const SectionTitle = ({
  children,
  variant = "default",
}) => {
  const className =
    variant === "dark"
      ? "mb-3 border-b border-stone-200 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-900"
      : variant === "accent"
        ? "mb-3 border-b border-teal-700/30 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-teal-800"
        : "mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500";

  return (
    <h2 className={className}>
      {children}
    </h2>
  );
};

const SummarySection = ({
  summary,
  variant = "default",
}) => {
  if (!hasValue(summary)) {
    return null;
  }

  return (
    <section>
      <SectionTitle variant={variant}>
        Profile
      </SectionTitle>

      <p className="text-[10px] leading-[1.7] text-stone-600">
        {summary}
      </p>
    </section>
  );
};

const EducationSection = ({
  education,
  variant = "default",
}) => {
  const items = safeArray(education).filter(
    (item) =>
      hasValue(item?.institution) ||
      hasValue(item?.degree) ||
      hasValue(item?.branch) ||
      hasValue(item?.description)
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionTitle variant={variant}>
        Education
      </SectionTitle>

      <div className="space-y-4">
        {items.map((item, index) => {
          const dateRange =
            formatDateRange(
              item?.startDate,
              item?.endDate
            );

          const title =
            [
              safeText(item?.degree),
              safeText(item?.branch),
            ]
              .filter(Boolean)
              .join(" — ");

          return (
            <article
              key={`education-${index}`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  {hasValue(title) && (
                    <h3 className="text-[11px] font-semibold text-stone-900">
                      {title}
                    </h3>
                  )}

                  {hasValue(
                    item?.institution
                  ) && (
                    <p className="mt-0.5 text-[10px] font-medium text-stone-600">
                      {item.institution}
                    </p>
                  )}
                </div>

                {hasValue(dateRange) && (
                  <span className="shrink-0 text-[9px] text-stone-400">
                    {dateRange}
                  </span>
                )}
              </div>

              {(hasValue(item?.cgpa) ||
                hasValue(
                  item?.academicYear
                ) ||
                hasValue(item?.location)) && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-stone-500">
                  {hasValue(item?.cgpa) && (
                    <span>
                      CGPA: {item.cgpa}
                    </span>
                  )}

                  {hasValue(
                    item?.academicYear
                  ) && (
                    <span>
                      {item.academicYear}
                    </span>
                  )}

                  {hasValue(
                    item?.location
                  ) && (
                    <span>
                      {item.location}
                    </span>
                  )}
                </div>
              )}

              {hasValue(
                item?.description
              ) && (
                <p className="mt-1.5 whitespace-pre-line text-[10px] leading-[1.65] text-stone-600">
                  {item.description}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

const ExperienceSection = ({
  experience,
  variant = "default",
}) => {
  const items = safeArray(
    experience
  ).filter(
    (item) =>
      hasValue(item?.company) ||
      hasValue(item?.role) ||
      hasValue(item?.description)
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionTitle variant={variant}>
        Experience
      </SectionTitle>

      <div className="space-y-4">
        {items.map((item, index) => {
          const dateRange =
            formatDateRange(
              item?.startDate,
              item?.endDate
            );

          return (
            <article
              key={`experience-${index}`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {hasValue(item?.role) && (
                    <h3 className="text-[11px] font-semibold text-stone-900">
                      {item.role}
                    </h3>
                  )}

                  {hasValue(
                    item?.company
                  ) && (
                    <p className="mt-0.5 text-[10px] font-medium text-stone-600">
                      {item.company}
                    </p>
                  )}
                </div>

                {hasValue(dateRange) && (
                  <span className="shrink-0 text-[9px] text-stone-400">
                    {dateRange}
                  </span>
                )}
              </div>

              {hasValue(
                item?.location
              ) && (
                <p className="mt-1 text-[9px] text-stone-400">
                  {item.location}
                </p>
              )}

              {hasValue(
                item?.description
              ) && (
                <p className="mt-1.5 whitespace-pre-line text-[10px] leading-[1.65] text-stone-600">
                  {item.description}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

const ProjectsSection = ({
  projects,
  variant = "default",
}) => {
  const items = safeArray(
    projects
  ).filter(
    (item) =>
      hasValue(item?.name) ||
      hasValue(item?.description) ||
      hasValue(item?.technologies)
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionTitle variant={variant}>
        Projects
      </SectionTitle>

      <div className="space-y-4">
        {items.map((item, index) => {
          const technologies = safeArray(
            item?.technologies
          );

          return (
            <article
              key={`project-${index}`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  {hasValue(item?.name) && (
                    <h3 className="text-[11px] font-semibold text-stone-900">
                      {item.name}
                    </h3>
                  )}

                  {hasValue(
                    item?.role
                  ) && (
                    <p className="mt-0.5 text-[9px] text-stone-500">
                      {item.role}
                    </p>
                  )}
                </div>

                {hasValue(
                  item?.link
                ) && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] font-medium text-teal-800 hover:underline"
                  >
                    View project
                  </a>
                )}
              </div>

              {technologies.length >
                0 && (
                <p className="mt-1 text-[9px] font-medium text-teal-800">
                  {technologies.join(
                    " • "
                  )}
                </p>
              )}

              {hasValue(
                item?.description
              ) && (
                <p className="mt-1.5 whitespace-pre-line text-[10px] leading-[1.65] text-stone-600">
                  {item.description}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

const SkillsSection = ({
  skills,
  variant = "default",
}) => {
  const items = safeArray(skills)
    .map((skill) =>
      safeText(skill)
    )
    .filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionTitle variant={variant}>
        Skills
      </SectionTitle>

      <div className="flex flex-wrap gap-1.5">
        {items.map((skill, index) => (
          <span
            key={`skill-${index}-${skill}`}
            className="rounded-sm bg-stone-100 px-2 py-1 text-[9px] font-medium text-stone-700"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
};

const CertificationsSection = ({
  certifications,
  variant = "default",
}) => {
  const items = safeArray(
    certifications
  )
    .map((item) => {
      if (
        typeof item === "string"
      ) {
        return {
          name: item,
          issuer: "",
          date: "",
        };
      }

      return item || {};
    })
    .filter(
      (item) =>
        hasValue(item?.name) ||
        hasValue(item?.issuer) ||
        hasValue(item?.date)
    );

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionTitle variant={variant}>
        Certifications
      </SectionTitle>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div
            key={`certification-${index}`}
          >
            {hasValue(item?.name) && (
              <p className="text-[10px] font-semibold text-stone-900">
                {item.name}
              </p>
            )}

            {(hasValue(
              item?.issuer
            ) ||
              hasValue(item?.date)) && (
              <p className="mt-0.5 text-[9px] text-stone-500">
                {[
                  safeText(item?.issuer),
                  safeText(item?.date),
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const SimpleListSection = ({
  title,
  items,
  variant = "default",
}) => {
  const values = safeArray(items)
    .map((item) =>
      safeText(item)
    )
    .filter(Boolean);

  if (values.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionTitle variant={variant}>
        {title}
      </SectionTitle>

      <ul className="space-y-1.5">
        {values.map((item, index) => (
          <li
            key={`${title}-${index}-${item}`}
            className="text-[10px] leading-[1.65] text-stone-600"
          >
            • {item}
          </li>
        ))}
      </ul>
    </section>
  );
};

const ResumeBody = ({
  resumeData,
  sectionVariant = "default",
}) => {
  const personal =
    resumeData?.personal || {};

  return (
    <div className="space-y-5">
      <SummarySection
        summary={resumeData?.summary}
        variant={sectionVariant}
      />

      <ExperienceSection
        experience={
          resumeData?.experience
        }
        variant={sectionVariant}
      />

      <ProjectsSection
        projects={resumeData?.projects}
        variant={sectionVariant}
      />

      <EducationSection
        education={resumeData?.education}
        variant={sectionVariant}
      />

      <SkillsSection
        skills={resumeData?.skills}
        variant={sectionVariant}
      />

      <CertificationsSection
        certifications={
          resumeData?.certifications
        }
        variant={sectionVariant}
      />

      <SimpleListSection
        title="Achievements"
        items={
          resumeData?.achievements
        }
        variant={sectionVariant}
      />

      <SimpleListSection
        title="Interests"
        items={
          resumeData?.interests
        }
        variant={sectionVariant}
      />
    </div>
  );
};

const ResumeHeader = ({
  resumeData,
  align = "left",
  accent = false,
}) => {
  const personal =
    resumeData?.personal || {};

  const alignment =
    align === "center"
      ? "text-center"
      : "text-left";

  return (
    <header
      className={`${alignment} ${
        accent
          ? "border-b border-white/20 pb-5"
          : "border-b border-stone-200 pb-5"
      }`}
    >
      <h1
        className={`break-words font-['Newsreader'] text-3xl font-semibold tracking-[-0.035em] ${
          accent
            ? "text-white"
            : "text-[#10231f]"
        }`}
      >
        {safeText(personal.name) ||
          "Your Name"}
      </h1>

      {hasValue(
        personal.headline
      ) && (
        <p
          className={`mt-1 text-[11px] font-medium ${
            accent
              ? "text-white/75"
              : "text-stone-500"
          }`}
        >
          {personal.headline}
        </p>
      )}

      <div className="mt-3">
        <ContactLinks
          personal={personal}
          variant={
            accent
              ? "light"
              : "default"
          }
        />
      </div>
    </header>
  );
};

const ModernTemplate = ({
  resumeData,
}) => {
  return (
    <div className="mx-auto w-full max-w-[794px] overflow-hidden bg-white p-8 text-stone-800 shadow-[0_12px_40px_rgba(28,25,23,0.08)] sm:p-10">
      <ResumeHeader
        resumeData={resumeData}
        align="left"
        accent={false}
      />

      <div className="mt-6 grid gap-7 md:grid-cols-[minmax(0,1fr)_190px]">
        <main>
          <ResumeBody
            resumeData={resumeData}
            sectionVariant="accent"
          />
        </main>

        <aside className="border-l border-stone-200 pl-5">
          <SkillsSection
            skills={resumeData?.skills}
            variant="accent"
          />

          <div className="mt-6">
            <CertificationsSection
              certifications={
                resumeData?.certifications
              }
              variant="accent"
            />
          </div>

          <div className="mt-6">
            <SimpleListSection
              title="Achievements"
              items={
                resumeData?.achievements
              }
              variant="accent"
            />
          </div>

          <div className="mt-6">
            <SimpleListSection
              title="Interests"
              items={
                resumeData?.interests
              }
              variant="accent"
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

const ProfessionalTemplate = ({
  resumeData,
}) => {
  return (
    <div className="mx-auto w-full max-w-[794px] bg-white p-8 text-stone-800 shadow-[0_12px_40px_rgba(28,25,23,0.08)] sm:p-10">
      <ResumeHeader
        resumeData={resumeData}
        align="center"
      />

      <div className="mt-6 space-y-6">
        <SummarySection
          summary={resumeData?.summary}
          variant="dark"
        />

        <ExperienceSection
          experience={
            resumeData?.experience
          }
          variant="dark"
        />

        <ProjectsSection
          projects={resumeData?.projects}
          variant="dark"
        />

        <EducationSection
          education={resumeData?.education}
          variant="dark"
        />

        <div className="grid gap-6 md:grid-cols-2">
          <SkillsSection
            skills={resumeData?.skills}
            variant="dark"
          />

          <CertificationsSection
            certifications={
              resumeData?.certifications
            }
            variant="dark"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SimpleListSection
            title="Achievements"
            items={
              resumeData?.achievements
            }
            variant="dark"
          />

          <SimpleListSection
            title="Interests"
            items={
              resumeData?.interests
            }
            variant="dark"
          />
        </div>
      </div>
    </div>
  );
};

const MinimalTemplate = ({
  resumeData,
}) => {
  return (
    <div className="mx-auto w-full max-w-[794px] bg-white px-9 py-10 text-stone-800 shadow-[0_12px_40px_rgba(28,25,23,0.08)] sm:px-12">
      <ResumeHeader
        resumeData={resumeData}
        align="left"
      />

      <div className="mt-7 space-y-7">
        <SummarySection
          summary={resumeData?.summary}
        />

        <ExperienceSection
          experience={
            resumeData?.experience
          }
        />

        <EducationSection
          education={resumeData?.education}
        />

        <ProjectsSection
          projects={resumeData?.projects}
        />

        <SkillsSection
          skills={resumeData?.skills}
        />

        <CertificationsSection
          certifications={
            resumeData?.certifications
          }
        />

        <SimpleListSection
          title="Achievements"
          items={
            resumeData?.achievements
          }
        />

        <SimpleListSection
          title="Interests"
          items={
            resumeData?.interests
          }
        />
      </div>
    </div>
  );
};

const ClassicTemplate = ({
  resumeData,
}) => {
  return (
    <div className="mx-auto w-full max-w-[794px] bg-[#fffdf9] p-8 text-stone-800 shadow-[0_12px_40px_rgba(28,25,23,0.08)] sm:p-10">
      <div className="border-2 border-stone-800 p-6 sm:p-8">
        <ResumeHeader
          resumeData={resumeData}
          align="center"
        />

        <div className="mt-6 space-y-5">
          <SummarySection
            summary={resumeData?.summary}
            variant="dark"
          />

          <EducationSection
            education={
              resumeData?.education
            }
            variant="dark"
          />

          <ExperienceSection
            experience={
              resumeData?.experience
            }
            variant="dark"
          />

          <ProjectsSection
            projects={
              resumeData?.projects
            }
            variant="dark"
          />

          <SkillsSection
            skills={resumeData?.skills}
            variant="dark"
          />

          <CertificationsSection
            certifications={
              resumeData?.certifications
            }
            variant="dark"
          />

          <SimpleListSection
            title="Achievements"
            items={
              resumeData?.achievements
            }
            variant="dark"
          />

          <SimpleListSection
            title="Interests"
            items={
              resumeData?.interests
            }
            variant="dark"
          />
        </div>
      </div>
    </div>
  );
};

const CreativeTemplate = ({
  resumeData,
}) => {
  const personal =
    resumeData?.personal || {};

  return (
    <div className="mx-auto w-full max-w-[794px] overflow-hidden bg-white text-stone-800 shadow-[0_12px_40px_rgba(28,25,23,0.08)]">
      <div className="bg-teal-950 px-8 py-8 sm:px-10">
        <div className="max-w-2xl">
          <h1 className="break-words font-['Newsreader'] text-4xl font-semibold tracking-[-0.035em] text-white">
            {safeText(personal.name) ||
              "Your Name"}
          </h1>

          {hasValue(
            personal.headline
          ) && (
            <p className="mt-1 text-[11px] font-medium text-teal-100">
              {personal.headline}
            </p>
          )}

          <div className="mt-4">
            <ContactLinks
              personal={personal}
              variant="light"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-7 p-8 md:grid-cols-[180px_minmax(0,1fr)] sm:p-10">
        <aside className="border-b border-stone-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-5">
          <SkillsSection
            skills={resumeData?.skills}
            variant="accent"
          />

          <div className="mt-6">
            <CertificationsSection
              certifications={
                resumeData?.certifications
              }
              variant="accent"
            />
          </div>

          <div className="mt-6">
            <SimpleListSection
              title="Achievements"
              items={
                resumeData?.achievements
              }
              variant="accent"
            />
          </div>

          <div className="mt-6">
            <SimpleListSection
              title="Interests"
              items={
                resumeData?.interests
              }
              variant="accent"
            />
          </div>
        </aside>

        <main>
          <ResumeBody
            resumeData={resumeData}
            sectionVariant="accent"
          />
        </main>
      </div>
    </div>
  );
};

const ExecutiveTemplate = ({
  resumeData,
}) => {
  return (
    <div className="mx-auto w-full max-w-[794px] bg-white text-stone-800 shadow-[0_12px_40px_rgba(28,25,23,0.08)]">
      <div className="bg-[#10231f] px-8 py-7 sm:px-10">
        <ResumeHeader
          resumeData={resumeData}
          align="left"
          accent
        />
      </div>

      <div className="p-8 sm:p-10">
        <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_180px]">
          <main>
            <SummarySection
              summary={resumeData?.summary}
              variant="accent"
            />

            <div className="mt-6">
              <ExperienceSection
                experience={
                  resumeData?.experience
                }
                variant="accent"
              />
            </div>

            <div className="mt-6">
              <ProjectsSection
                projects={
                  resumeData?.projects
                }
                variant="accent"
              />
            </div>

            <div className="mt-6">
              <EducationSection
                education={
                  resumeData?.education
                }
                variant="accent"
              />
            </div>
          </main>

          <aside className="border-l border-stone-200 pl-5">
            <SkillsSection
              skills={resumeData?.skills}
              variant="accent"
            />

            <div className="mt-6">
              <CertificationsSection
                certifications={
                  resumeData?.certifications
                }
                variant="accent"
              />
            </div>

            <div className="mt-6">
              <SimpleListSection
                title="Achievements"
                items={
                  resumeData?.achievements
                }
                variant="accent"
              />
            </div>

            <div className="mt-6">
              <SimpleListSection
                title="Interests"
                items={
                  resumeData?.interests
                }
                variant="accent"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export const RESUME_TEMPLATE_OPTIONS = [
  {
    id: "modern",
    name: "Modern",
    description:
      "Clean two-column layout with a contemporary visual hierarchy.",
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "Structured, ATS-friendly layout for conventional applications.",
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Simple typography and generous whitespace.",
  },
  {
    id: "classic",
    name: "Classic",
    description:
      "Traditional framed resume with formal visual styling.",
  },
  {
    id: "creative",
    name: "Creative",
    description:
      "Accent header with a distinctive portfolio-oriented layout.",
  },
  {
    id: "executive",
    name: "Executive",
    description:
      "Strong header and compact two-column professional layout.",
  },
];

export const ResumeTemplateRenderer = ({
  templateId = "modern",
  resumeData,
}) => {
  switch (templateId) {
    case "professional":
      return (
        <ProfessionalTemplate
          resumeData={resumeData}
        />
      );

    case "minimal":
      return (
        <MinimalTemplate
          resumeData={resumeData}
        />
      );

    case "classic":
      return (
        <ClassicTemplate
          resumeData={resumeData}
        />
      );

    case "creative":
      return (
        <CreativeTemplate
          resumeData={resumeData}
        />
      );

    case "executive":
      return (
        <ExecutiveTemplate
          resumeData={resumeData}
        />
      );

    case "modern":
    default:
      return (
        <ModernTemplate
          resumeData={resumeData}
        />
      );
  }
};

export default ResumeTemplateRenderer;