import dotenv from "dotenv";
import dns from "node:dns";
import mongoose from "mongoose";

import CareerRequirement from "../models/career-requirement.model.js";

dotenv.config();

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env");
  process.exit(1);
}

const careerRequirements = [
  {
    career: "Web Developer",
    domain: "Full Stack Developer",
    requiredSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "REST APIs",
      "Git",
    ],
  },
  {
    career: "Web Developer",
    domain: "Frontend Development",
    requiredSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Responsive Design",
      "Tailwind CSS",
      "Git",
      "REST APIs",
    ],
  },
  {
    career: "Web Developer",
    domain: "Backend Development",
    requiredSkills: [
      "JavaScript",
      "Node.js",
      "Express",
      "MongoDB",
      "REST APIs",
      "Authentication",
      "Database Design",
      "Git",
    ],
  },
  {
    career: "Software Developer",
    domain: "Software Engineering",
    requiredSkills: [
      "Programming Fundamentals",
      "Data Structures",
      "Algorithms",
      "Object-Oriented Programming",
      "Database Management",
      "Git",
      "Problem Solving",
      "Software Testing",
    ],
  },
  {
    career: "Data Scientist",
    domain: "Data Science",
    requiredSkills: [
      "Python",
      "Statistics",
      "Probability",
      "NumPy",
      "Pandas",
      "Data Visualization",
      "Machine Learning",
      "SQL",
    ],
  },
  {
    career: "Data Analyst",
    domain: "Data Analytics",
    requiredSkills: [
      "SQL",
      "Excel",
      "Python",
      "Pandas",
      "Statistics",
      "Power BI",
      "Data Visualization",
      "Data Cleaning",
    ],
  },
  {
    career: "Machine Learning Engineer",
    domain: "Machine Learning",
    requiredSkills: [
      "Python",
      "Statistics",
      "Linear Algebra",
      "NumPy",
      "Pandas",
      "Scikit-learn",
      "Machine Learning",
      "Model Deployment",
    ],
  },
  {
    career: "AI Engineer",
    domain: "Artificial Intelligence",
    requiredSkills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Neural Networks",
      "Natural Language Processing",
      "LLMs",
      "TensorFlow",
      "PyTorch",
    ],
  },
  {
    career: "Python Developer",
    domain: "Python Development",
    requiredSkills: [
      "Python",
      "Object-Oriented Programming",
      "Data Structures",
      "SQL",
      "REST APIs",
      "FastAPI",
      "Git",
      "Testing",
    ],
  },
  {
    career: "Java Developer",
    domain: "Java Development",
    requiredSkills: [
      "Java",
      "Object-Oriented Programming",
      "Data Structures",
      "Algorithms",
      "Spring Boot",
      "SQL",
      "REST APIs",
      "Git",
    ],
  },
  {
    career: "Android Developer",
    domain: "Android Development",
    requiredSkills: [
      "Kotlin",
      "Java",
      "Android SDK",
      "Android Studio",
      "REST APIs",
      "SQLite",
      "Git",
      "Mobile UI Development",
    ],
  },
  {
    career: "Cybersecurity Analyst",
    domain: "Cybersecurity",
    requiredSkills: [
      "Networking",
      "Linux",
      "Operating Systems",
      "Network Security",
      "Cryptography",
      "Security Fundamentals",
      "Vulnerability Assessment",
      "Incident Response",
    ],
  },
  {
    career: "Cloud Engineer",
    domain: "Cloud Computing",
    requiredSkills: [
      "Linux",
      "Networking",
      "AWS",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Cloud Architecture",
      "Git",
    ],
  },
  {
    career: "DevOps Engineer",
    domain: "DevOps",
    requiredSkills: [
      "Linux",
      "Git",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Jenkins",
      "Cloud Computing",
      "Infrastructure as Code",
    ],
  },
  {
    career: "UI UX Designer",
    domain: "UI UX Design",
    requiredSkills: [
      "Design Fundamentals",
      "Figma",
      "Wireframing",
      "Prototyping",
      "User Research",
      "Interaction Design",
      "Visual Design",
      "Usability Testing",
    ],
  },
  {
    career: "Database Administrator",
    domain: "Database Management",
    requiredSkills: [
      "SQL",
      "Database Design",
      "Database Administration",
      "Database Optimization",
      "MySQL",
      "MongoDB",
      "Backup and Recovery",
      "Database Security",
    ],
  },
];

const normalizeRequirement = (requirement) => {
  const normalizedSkills = [
    ...new Set(
      requirement.requiredSkills
        .map((skill) =>
          skill.trim().replace(/\s+/g, " ")
        )
        .filter(Boolean)
    ),
  ];

  return {
    career: requirement.career.trim(),
    domain: requirement.domain.trim(),
    requiredSkills: normalizedSkills,
    isActive: true,
  };
};

const seedCareerRequirements = async () => {
  let created = 0;
  let updated = 0;

  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully.");

    console.log(
      `Preparing ${careerRequirements.length} career requirements.`
    );

    for (const source of careerRequirements) {
      const requirement =
        normalizeRequirement(source);

      const result =
        await CareerRequirement.updateOne(
          {
            career: requirement.career,
            domain: requirement.domain,
          },
          {
            $set: {
              requiredSkills:
                requirement.requiredSkills,
              isActive: true,
            },
            $setOnInsert: {
              career: requirement.career,
              domain: requirement.domain,
            },
          },
          {
            upsert: true,
            runValidators: true,
          }
        );

      if (result.upsertedCount > 0) {
        created += 1;
      } else if (result.modifiedCount > 0) {
        updated += 1;
      }

      console.log(
        `${result.upsertedCount > 0 ? "Created" : result.modifiedCount > 0 ? "Updated" : "Already up to date"}: ${requirement.career} / ${requirement.domain}`
      );
    }

    console.log("\nCareer requirement seed completed.");

    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(
      `Total configured: ${careerRequirements.length}`
    );
  } catch (error) {
    console.error(
      "Career requirement seeding failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();

      console.log("MongoDB connection closed.");
    }
  }
};

seedCareerRequirements();