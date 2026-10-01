import "dotenv/config";

import connectDB from "../config/db.js";
import Community from "../models/community.model.js";

const communities = [
  {
    name: "Web Development",

    slug: "web-development",

    domain: "Web Development",

    description:
      "Discuss frontend, backend, full-stack development, APIs and modern web technologies.",

    topics: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "APIs",
    ],
  },

  {
    name: "Data Science",

    slug: "data-science",

    domain: "Data Science",

    description:
      "Learn and discuss data analysis, statistics, visualization and data science workflows.",

    topics: [
      "Python",
      "Statistics",
      "Pandas",
      "SQL",
      "Visualization",
    ],
  },

  {
    name: "AI & Machine Learning",

    slug: "ai-machine-learning",

    domain: "AI & Machine Learning",

    description:
      "Discuss machine learning, deep learning, generative AI and practical AI projects.",

    topics: [
      "Machine Learning",
      "Deep Learning",
      "NLP",
      "GenAI",
      "Computer Vision",
    ],
  },

  {
    name: "Cyber Security",

    slug: "cyber-security",

    domain: "Cyber Security",

    description:
      "Discuss application security, networks, ethical security practices and cybersecurity careers.",

    topics: [
      "Network Security",
      "Web Security",
      "OWASP",
      "Ethical Security",
    ],
  },

  {
    name: "Cloud & DevOps",

    slug: "cloud-devops",

    domain: "Cloud & DevOps",

    description:
      "Discuss cloud platforms, CI/CD, containers, infrastructure and deployment workflows.",

    topics: [
      "AWS",
      "Azure",
      "Docker",
      "Kubernetes",
      "CI/CD",
    ],
  },

  {
    name: "Mobile Development",

    slug: "mobile-development",

    domain: "Mobile Development",

    description:
      "Discuss Android, iOS, cross-platform development and mobile application engineering.",

    topics: [
      "Android",
      "iOS",
      "Flutter",
      "React Native",
    ],
  },

  {
    name: "UI/UX",

    slug: "ui-ux",

    domain: "UI/UX",

    description:
      "Discuss interface design, user experience, design systems and product design workflows.",

    topics: [
      "Figma",
      "UX Research",
      "Design Systems",
      "Prototyping",
    ],
  },

  {
    name: "Blockchain & Web3",

    slug: "blockchain-web3",

    domain: "Blockchain & Web3",

    description:
      "Discuss blockchain fundamentals, smart contracts and Web3 application development.",

    topics: [
      "Blockchain",
      "Solidity",
      "Smart Contracts",
      "Web3",
    ],
  },

  {
    name: "Game Development",

    slug: "game-development",

    domain: "Game Development",

    description:
      "Discuss game programming, engines, gameplay systems and interactive experiences.",

    topics: [
      "Unity",
      "Unreal Engine",
      "Game Programming",
      "3D",
    ],
  },
];

const seedCommunities = async () => {
  try {
    await connectDB();

    for (const community of communities) {
      await Community.updateOne(
        {
          slug: community.slug,
        },

        {
          $set: {
            name: community.name,
            domain: community.domain,
            description:
              community.description,
            topics: community.topics,
            isActive: true,
          },

          $setOnInsert: {
            slug: community.slug,
            memberCount: 0,
          },
        },

        {
          upsert: true,
        }
      );
    }

    console.log(
      `Community seed completed: ${communities.length} communities processed.`
    );
  } catch (error) {
    console.error(
      "Community seed failed:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

seedCommunities();