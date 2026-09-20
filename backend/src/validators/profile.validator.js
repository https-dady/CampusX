import { z } from "zod";

const normalizeValue = (value) => {
    return value.trim().replace(/\s+/g, " ");
};

const normalizeList = (values) => {
    const normalized = values.map(normalizeValue);

    const seen = new Set();

    return normalized.filter((value) => {
        const key = value.toLowerCase();

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
};

const urlSchema = z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .max(500, "URL is too long");

const dateSchema = z.coerce.date({
    error: "Please enter a valid date",
});

const educationSchema = z
    .object({
        degree: z
            .string()
            .trim()
            .min(1, "Degree is required")
            .max(100, "Degree is too long"),

        branch: z
            .string()
            .trim()
            .min(1, "Branch is required")
            .max(150, "Branch is too long"),

        university: z
            .string()
            .trim()
            .min(1, "University is required")
            .max(200, "University name is too long"),

        graduationYear: z
            .coerce
            .number()
            .int("Graduation year must be a whole number")
            .min(1900, "Invalid graduation year")
            .max(2200, "Invalid graduation year")
            .optional(),

        academicYear: z
            .coerce
            .number()
            .int("Academic year must be a whole number")
            .min(1, "Invalid academic year")
            .max(6, "Invalid academic year")
            .optional(),

        cgpa: z
            .coerce
            .number()
            .min(0, "CGPA cannot be negative")
            .max(10, "CGPA cannot be greater than 10")
            .optional(),
    })
    .strict();

const projectSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, "Project title is required")
            .max(150, "Project title is too long"),

        description: z
            .string()
            .trim()
            .max(2000, "Project description is too long")
            .optional(),

        technologies: z
            .array(
                z
                    .string()
                    .trim()
                    .min(1, "Technology cannot be empty")
                    .max(100, "Technology name is too long")
            )
            .max(50, "Too many technologies")
            .transform(normalizeList)
            .optional(),

        projectUrl: urlSchema.optional(),
    })
    .strict();

const experienceSchema = z
    .object({
        organization: z
            .string()
            .trim()
            .min(1, "Organization is required")
            .max(150, "Organization name is too long"),

        role: z
            .string()
            .trim()
            .min(1, "Role is required")
            .max(150, "Role is too long"),

        startDate: dateSchema.optional(),

        endDate: dateSchema.optional(),

        description: z
            .string()
            .trim()
            .max(2000, "Experience description is too long")
            .optional(),
    })
    .strict()
    .refine(
        (data) => {
            if (!data.startDate || !data.endDate) {
                return true;
            }

            return data.endDate >= data.startDate;
        },
        {
            message:
                "End date must be on or after start date",
            path: ["endDate"],
        }
    );

const certificationSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Certification name is required")
            .max(200, "Certification name is too long"),

        issuer: z
            .string()
            .trim()
            .min(1, "Issuer is required")
            .max(150, "Issuer name is too long"),

        issueDate: dateSchema.optional(),

        credentialUrl: urlSchema.optional(),
    })
    .strict();

const skillSchema = z
    .string()
    .trim()
    .min(1, "Skill cannot be empty")
    .max(100, "Skill name is too long");

const interestSchema = z
    .string()
    .trim()
    .min(1, "Interest cannot be empty")
    .max(100, "Interest name is too long");

export const updateProfileSchema = z
    .object({
        education: educationSchema.optional(),

        technicalSkills: z
            .array(skillSchema)
            .max(100, "Too many technical skills")
            .transform(normalizeList)
            .optional(),

        softSkills: z
            .array(skillSchema)
            .max(50, "Too many soft skills")
            .transform(normalizeList)
            .optional(),

        interests: z
            .array(interestSchema)
            .max(50, "Too many interests")
            .transform(normalizeList)
            .optional(),

        projects: z
            .array(projectSchema)
            .max(50, "Too many projects")
            .optional(),

        experience: z
            .array(experienceSchema)
            .max(50, "Too many experience entries")
            .optional(),

        certifications: z
            .array(certificationSchema)
            .max(50, "Too many certifications")
            .optional(),

        hasInternship: z
            .boolean()
            .optional(),
    })
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message:
                "At least one profile field is required",
        }
    );