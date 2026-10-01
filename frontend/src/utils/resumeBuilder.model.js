const RESUME_BUILDER_VERSION =
  "resume-builder-v1";

export const RESUME_TEMPLATE_IDS = [
  "modern",
  "professional",
  "minimal",
  "classic",
  "creative",
  "executive",
];

export const DEFAULT_RESUME_TEMPLATE =
  "modern";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

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

const cloneArray = (value) => {
  return safeArray(value).map((item) => {
    if (
      item &&
      typeof item === "object"
    ) {
      return {
        ...item,
      };
    }

    return item;
  });
};

const normalizeUrl = (value) => {
  const text = safeText(value);

  if (!text) {
    return "";
  }

  if (
    text.startsWith("http://") ||
    text.startsWith("https://") ||
    text.startsWith("mailto:") ||
    text.startsWith("tel:")
  ) {
    return text;
  }

  return `https://${text}`;
};

/* -------------------------------------------------------------------------- */
/* EMPTY DATA                                                                  */
/* -------------------------------------------------------------------------- */

export const createEmptyResumeBuilderData =
  () => {
    return {
      version:
        RESUME_BUILDER_VERSION,

      templateId:
        DEFAULT_RESUME_TEMPLATE,

      personal: {
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
        website: "",
      },

      summary: "",

      education: [],

      experience: [],

      projects: [],

      skills: [],

      certifications: [],

      achievements: [],

      interests: [],

      source: {
        modelVersion: "",
        fileType: "",
        hasInternship: false,

        sectionPresence: {
          contact: false,
          education: false,
          experience: false,
          skills: false,
          projects: false,
          certifications: false,
          summary: false,
        },

        sectionText: {
          summary: "",
          education: "",
          experience: "",
          skills: "",
          projects: "",
          certifications: "",
        },

        detectedSkills: [],

        topCareer: "",

        missingSkills: [],
      },
    };
  };

/* -------------------------------------------------------------------------- */
/* PERSONAL                                                                    */
/* -------------------------------------------------------------------------- */

const normalizePersonal = (
  personal
) => {
  const source =
    personal &&
    typeof personal === "object"
      ? personal
      : {};

  return {
    name: safeText(
      source.name
    ),

    email: safeText(
      source.email
    ),

    phone: safeText(
      source.phone
    ),

    location: safeText(
      source.location
    ),

    linkedin: normalizeUrl(
      source.linkedin ||
        source.linkedIn
    ),

    github: normalizeUrl(
      source.github
    ),

    portfolio: normalizeUrl(
      source.portfolio
    ),

    website: normalizeUrl(
      source.website
    ),
  };
};

/* -------------------------------------------------------------------------- */
/* EDUCATION                                                                   */
/* -------------------------------------------------------------------------- */

const normalizeEducationItem = (
  item
) => {
  const source =
    item &&
    typeof item === "object"
      ? item
      : {};

  return {
    institution: safeText(
      source.institution ||
        source.college ||
        source.university
    ),

    degree: safeText(
      source.degree
    ),

    branch: safeText(
      source.branch ||
        source.specialization
    ),

    cgpa: safeText(
      source.cgpa
    ),

    academicYear: safeText(
      source.academicYear ||
        source.year
    ),

    startDate: safeText(
      source.startDate
    ),

    endDate: safeText(
      source.endDate
    ),

    location: safeText(
      source.location
    ),

    description: safeText(
      source.description
    ),
  };
};

const normalizeEducation = (
  education
) => {
  if (
    Array.isArray(education)
  ) {
    return education
      .map(normalizeEducationItem)
      .filter(
        (item) =>
          item.institution ||
          item.degree ||
          item.branch ||
          item.cgpa ||
          item.description
      );
  }

  if (
    education &&
    typeof education === "object"
  ) {
    const normalized =
      normalizeEducationItem(
        education
      );

    if (
      normalized.institution ||
      normalized.degree ||
      normalized.branch ||
      normalized.cgpa ||
      normalized.description
    ) {
      return [normalized];
    }
  }

  return [];
};

/* -------------------------------------------------------------------------- */
/* EXPERIENCE                                                                  */
/* -------------------------------------------------------------------------- */

const normalizeExperienceItem = (
  item
) => {
  const source =
    item &&
    typeof item === "object"
      ? item
      : {};

  return {
    company: safeText(
      source.company ||
        source.organization
    ),

    role: safeText(
      source.role ||
        source.position ||
        source.title
    ),

    location: safeText(
      source.location
    ),

    startDate: safeText(
      source.startDate
    ),

    endDate: safeText(
      source.endDate
    ),

    current: Boolean(
      source.current
    ),

    description: safeText(
      source.description
    ),

    bullets: cloneArray(
      source.bullets ||
        source.responsibilities
    ),
  };
};

/* -------------------------------------------------------------------------- */
/* PROJECTS                                                                    */
/* -------------------------------------------------------------------------- */

const normalizeProjectItem = (
  item
) => {
  const source =
    item &&
    typeof item === "object"
      ? item
      : {};

  return {
    name: safeText(
      source.name ||
        source.title
    ),

    description: safeText(
      source.description
    ),

    technologies: cloneArray(
      source.technologies ||
        source.techStack
    ),

    date: safeText(
      source.date
    ),

    github: normalizeUrl(
      source.github
    ),

    liveUrl: normalizeUrl(
      source.liveUrl ||
        source.url
    ),

    bullets: cloneArray(
      source.bullets
    ),
  };
};

/* -------------------------------------------------------------------------- */
/* CERTIFICATIONS                                                              */
/* -------------------------------------------------------------------------- */

const normalizeCertificationItem = (
  item
) => {
  if (
    typeof item === "string"
  ) {
    return item.trim();
  }

  const source =
    item &&
    typeof item === "object"
      ? item
      : {};

  return {
    name: safeText(
      source.name ||
        source.title
    ),

    issuer: safeText(
      source.issuer
    ),

    date: safeText(
      source.date
    ),
  };
};

/* -------------------------------------------------------------------------- */
/* GENERIC LISTS                                                               */
/* -------------------------------------------------------------------------- */

const normalizeTextList = (
  value
) => {
  return safeArray(value)
    .map((item) => {
      if (
        typeof item === "string"
      ) {
        return item.trim();
      }

      if (
        item &&
        typeof item === "object"
      ) {
        return (
          safeText(
            item.name
          ) ||
          safeText(
            item.title
          ) ||
          safeText(
            item.description
          )
        );
      }

      return "";
    })
    .filter(Boolean);
};

/* -------------------------------------------------------------------------- */
/* SECTION TEXT                                                                */
/* -------------------------------------------------------------------------- */

const normalizeSectionText = (
  sectionText
) => {
  const source =
    sectionText &&
    typeof sectionText === "object"
      ? sectionText
      : {};

  return {
    summary: safeText(
      source.summary
    ),

    education: safeText(
      source.education
    ),

    experience: safeText(
      source.experience
    ),

    skills: safeText(
      source.skills
    ),

    projects: safeText(
      source.projects
    ),

    certifications: safeText(
      source.certifications
    ),
  };
};

/* -------------------------------------------------------------------------- */
/* ANALYSIS → BUILDER                                                          */
/* -------------------------------------------------------------------------- */

export const createResumeBuilderDataFromAnalysis =
  (analysisResult) => {
    const empty =
      createEmptyResumeBuilderData();

    if (
      !analysisResult ||
      typeof analysisResult !==
        "object"
    ) {
      return empty;
    }

    const extracted =
      analysisResult.extracted ||
      {};

    const sectionText =
      normalizeSectionText(
        extracted.sectionText
      );

    const sections =
      extracted.sections &&
      typeof extracted.sections ===
        "object"
        ? extracted.sections
        : {};

    const detectedSkills =
      safeArray(
        analysisResult?.skills
          ?.detected
      );

    const extractedSkills =
      safeArray(
        extracted.skills
      );

    const skills =
      detectedSkills.length > 0
        ? detectedSkills
        : extractedSkills;

    const normalizedSkills =
      skills
        .map((skill) => {
          if (
            typeof skill ===
            "string"
          ) {
            return skill.trim();
          }

          if (
            skill &&
            typeof skill ===
              "object"
          ) {
            return (
              safeText(
                skill.name
              ) ||
              safeText(
                skill.skill
              ) ||
              safeText(
                skill.title
              )
            );
          }

          return "";
        })
        .filter(Boolean);

    const education =
      normalizeEducation(
        extracted.education
      );

    const experienceText =
      sectionText.experience;

    const projectText =
      sectionText.projects;

    const certificationText =
      sectionText.certifications;

    /*
     * The extraction service currently returns
     * section text rather than fully structured
     * experience/project/certification objects.
     *
     * Therefore we preserve the extracted text
     * as description content instead of inventing
     * company names, project names, dates, etc.
     */

    const experience =
      experienceText
        ? [
            {
              company: "",
              role: "",
              location: "",
              startDate: "",
              endDate: "",
              current: false,
              description:
                experienceText,
              bullets: [],
            },
          ]
        : [];

    const projects =
      projectText
        ? [
            {
              name: "",
              description:
                projectText,
              technologies: [],
              date: "",
              github: "",
              liveUrl: "",
              bullets: [],
            },
          ]
        : [];

    const certifications =
      certificationText
        ? [
            certificationText,
          ]
        : [];

    return {
      ...empty,

      personal:
        normalizePersonal(
          extracted.personal
        ),

      summary:
        sectionText.summary,

      education,

      experience,

      projects,

      skills:
        normalizedSkills,

      certifications,

      source: {
        ...empty.source,

        modelVersion:
          safeText(
            analysisResult.modelVersion
          ),

        fileType: safeText(
          analysisResult?.file
            ?.type
        ),

        hasInternship: Boolean(
          extracted.hasInternship
        ),

        sectionPresence: {
          contact: Boolean(
            sections.contact
          ),

          education: Boolean(
            sections.education
          ),

          experience: Boolean(
            sections.experience
          ),

          skills: Boolean(
            sections.skills
          ),

          projects: Boolean(
            sections.projects
          ),

          certifications:
            Boolean(
              sections.certifications
            ),

          summary: Boolean(
            sections.summary
          ),
        },

        sectionText,

        detectedSkills:
          normalizedSkills,

        topCareer: safeText(
          analysisResult?.career
            ?.topMatch
        ),

        missingSkills:
          safeArray(
            analysisResult?.skills
              ?.missingForTopCareer
          ).map((skill) =>
            safeText(skill)
          ),
      },
    };
  };

/* -------------------------------------------------------------------------- */
/* NORMALIZATION                                                               */
/* -------------------------------------------------------------------------- */

export const normalizeResumeBuilderData =
  (data) => {
    const empty =
      createEmptyResumeBuilderData();

    if (
      !data ||
      typeof data !==
        "object"
    ) {
      return empty;
    }

    const normalizedEducation =
      normalizeEducation(
        data.education
      );

    const normalizedExperience =
      safeArray(
        data.experience
      )
        .map(
          normalizeExperienceItem
        )
        .filter(
          (item) =>
            item.company ||
            item.role ||
            item.description ||
            item.bullets.length > 0
        );

    const normalizedProjects =
      safeArray(
        data.projects
      )
        .map(
          normalizeProjectItem
        )
        .filter(
          (item) =>
            item.name ||
            item.description ||
            item.technologies.length >
              0 ||
            item.bullets.length > 0
        );

    const normalizedCertifications =
      safeArray(
        data.certifications
      )
        .map(
          normalizeCertificationItem
        )
        .filter((item) => {
          if (
            typeof item ===
            "string"
          ) {
            return Boolean(item);
          }

          return Boolean(
            item.name ||
              item.issuer ||
              item.date
          );
        });

    return {
      ...empty,

      version:
        RESUME_BUILDER_VERSION,

      templateId:
        RESUME_TEMPLATE_IDS.includes(
          data.templateId
        )
          ? data.templateId
          : DEFAULT_RESUME_TEMPLATE,

      personal:
        normalizePersonal(
          data.personal
        ),

      summary: safeText(
        data.summary
      ),

      education:
        normalizedEducation,

      experience:
        normalizedExperience,

      projects:
        normalizedProjects,

      skills:
        normalizeTextList(
          data.skills
        ),

      certifications:
        normalizedCertifications,

      achievements:
        normalizeTextList(
          data.achievements
        ),

      interests:
        normalizeTextList(
          data.interests
        ),

      source: {
        ...empty.source,

        ...(data.source || {}),

        sectionPresence: {
          ...empty.source
            .sectionPresence,

          ...(data.source
            ?.sectionPresence ||
            {}),
        },

        sectionText: {
          ...empty.source
            .sectionText,

          ...(data.source
            ?.sectionText ||
            {}),
        },

        detectedSkills:
          normalizeTextList(
            data.source
              ?.detectedSkills
          ),

        missingSkills:
          normalizeTextList(
            data.source
              ?.missingSkills
          ),

        modelVersion:
          safeText(
            data.source
              ?.modelVersion
          ),

        fileType:
          safeText(
            data.source
              ?.fileType
          ),

        topCareer:
          safeText(
            data.source
              ?.topCareer
          ),

        hasInternship:
          Boolean(
            data.source
              ?.hasInternship
          ),
      },
    };
  };

/* -------------------------------------------------------------------------- */
/* SECTION UPDATE                                                              */
/* -------------------------------------------------------------------------- */

export const updateResumeBuilderSection =
  (
    currentData,
    section,
    value
  ) => {
    const normalized =
      normalizeResumeBuilderData(
        currentData
      );

    return {
      ...normalized,

      [section]: value,
    };
  };

/* -------------------------------------------------------------------------- */
/* ITEM UPDATE                                                                 */
/* -------------------------------------------------------------------------- */

export const addResumeBuilderItem =
  (
    currentData,
    section,
    item = {}
  ) => {
    const normalized =
      normalizeResumeBuilderData(
        currentData
      );

    if (
      !Array.isArray(
        normalized[section]
      )
    ) {
      return normalized;
    }

    return {
      ...normalized,

      [section]: [
        ...normalized[section],
        item,
      ],
    };
  };

export const removeResumeBuilderItem =
  (
    currentData,
    section,
    index
  ) => {
    const normalized =
      normalizeResumeBuilderData(
        currentData
      );

    if (
      !Array.isArray(
        normalized[section]
      )
    ) {
      return normalized;
    }

    if (
      index < 0 ||
      index >=
        normalized[section]
          .length
    ) {
      return normalized;
    }

    return {
      ...normalized,

      [section]:
        normalized[section].filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    };
  };

export const updateResumeBuilderItem =
  (
    currentData,
    section,
    index,
    field,
    value
  ) => {
    const normalized =
      normalizeResumeBuilderData(
        currentData
      );

    if (
      !Array.isArray(
        normalized[section]
      )
    ) {
      return normalized;
    }

    if (
      index < 0 ||
      index >=
        normalized[section]
          .length
    ) {
      return normalized;
    }

    const items = [
      ...normalized[section],
    ];

    const currentItem =
      items[index];

    if (
      !currentItem ||
      typeof currentItem !==
        "object"
    ) {
      return normalized;
    }

    items[index] = {
      ...currentItem,
      [field]: value,
    };

    return {
      ...normalized,

      [section]: items,
    };
  };

/* -------------------------------------------------------------------------- */
/* TEMPLATE                                                                    */
/* -------------------------------------------------------------------------- */

export const setResumeBuilderTemplate =
  (
    currentData,
    templateId
  ) => {
    const normalized =
      normalizeResumeBuilderData(
        currentData
      );

    if (
      !RESUME_TEMPLATE_IDS.includes(
        templateId
      )
    ) {
      return normalized;
    }

    return {
      ...normalized,
      templateId,
    };
  };

/* -------------------------------------------------------------------------- */
/* SERIALIZATION                                                               */
/* -------------------------------------------------------------------------- */

export const serializeResumeBuilderData =
  (data) => {
    return JSON.stringify(
      normalizeResumeBuilderData(
        data
      )
    );
  };

export const parseResumeBuilderData =
  (value) => {
    if (
      typeof value !==
      "string"
    ) {
      return createEmptyResumeBuilderData();
    }

    try {
      const parsed =
        JSON.parse(value);

      return normalizeResumeBuilderData(
        parsed
      );
    } catch {
      return createEmptyResumeBuilderData();
    }
  };

export {
  RESUME_BUILDER_VERSION,
};