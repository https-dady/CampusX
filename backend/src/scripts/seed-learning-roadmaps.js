import dotenv from "dotenv";
import dns from "node:dns";
import mongoose from "mongoose";

import LearningRoadmap from "../models/learning-roadmap.model.js";

dotenv.config();

/*
 * MongoDB Atlas SRV resolution:
 * Use reliable public DNS resolvers for this seed script.
 */
dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env");
  process.exit(1);
}

const webDevelopmentRoadmap = {
  domain: "Web Development",

  techStack: [
    "HTML",
    "CSS",
    "JavaScript",
    "Git",
    "GitHub",
    "TypeScript",
    "React",
    "Node.js",
    "Express.js",
    "REST APIs",
    "MongoDB",
    "Authentication",
    "Testing",
    "Deployment",
  ],

  steps: [
    {
      title: "Learn HTML",
      description:
        "Learn HTML fundamentals, semantic elements, forms, tables, media, accessibility, and modern HTML structure.",
      technologies: ["HTML"],
      order: 1,
    },

    {
      title: "Learn CSS",
      description:
        "Learn CSS fundamentals, selectors, box model, positioning, Flexbox, Grid, responsive design, and modern layouts.",
      technologies: ["CSS"],
      order: 2,
    },

    {
      title: "Learn JavaScript",
      description:
        "Learn JavaScript fundamentals including variables, functions, arrays, objects, DOM, events, ES6+, asynchronous JavaScript, promises, and modules.",
      technologies: ["JavaScript"],
      order: 3,
    },

    {
      title: "Learn Git",
      description:
        "Learn version control fundamentals including repositories, commits, branches, merging, rebasing, and working with remote repositories.",
      technologies: ["Git"],
      order: 4,
    },

    {
      title: "Learn GitHub",
      description:
        "Learn how to use GitHub for remote repositories, collaboration, pull requests, issues, project management, and portfolio projects.",
      technologies: ["GitHub"],
      order: 5,
    },

    {
      title: "Learn TypeScript",
      description:
        "Learn TypeScript fundamentals including types, interfaces, type aliases, generics, functions, objects, modules, and TypeScript configuration.",
      technologies: ["TypeScript"],
      order: 6,
    },

    {
      title: "Learn React",
      description:
        "Learn React fundamentals including components, JSX, props, state, hooks, forms, routing, API integration, and reusable component architecture.",
      technologies: ["React"],
      order: 7,
    },

    {
      title: "Learn Node.js",
      description:
        "Learn Node.js fundamentals including modules, npm, filesystem, environment variables, asynchronous programming, and backend application structure.",
      technologies: ["Node.js"],
      order: 8,
    },

    {
      title: "Learn Express.js",
      description:
        "Learn Express.js for building backend applications, routes, middleware, controllers, error handling, validation, and API architecture.",
      technologies: ["Express.js"],
      order: 9,
    },

    {
      title: "Learn REST APIs",
      description:
        "Learn REST API concepts including HTTP methods, status codes, request and response structure, authentication, validation, pagination, and API integration.",
      technologies: ["REST APIs"],
      order: 10,
    },

    {
      title: "Learn MongoDB",
      description:
        "Learn MongoDB fundamentals including databases, collections, documents, CRUD operations, queries, indexes, and MongoDB integration with Node.js.",
      technologies: ["MongoDB"],
      order: 11,
    },

    {
      title: "Learn Authentication",
      description:
        "Learn web authentication and authorization including password hashing, JWT, sessions, protected routes, roles, permissions, and secure authentication practices.",
      technologies: ["Authentication"],
      order: 12,
    },

    {
      title: "Learn Testing",
      description:
        "Learn application testing fundamentals including unit testing, API testing, integration testing, test cases, mocking, and debugging.",
      technologies: ["Testing"],
      order: 13,
    },

    {
      title: "Learn Deployment",
      description:
        "Learn how to deploy frontend and backend applications, configure environment variables, connect production databases, and manage production builds.",
      technologies: ["Deployment"],
      order: 14,
    },
  ],
};

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeRoadmap = (roadmap) => {
  return {
    domain: normalizeText(roadmap.domain),

    techStack: roadmap.techStack.map(normalizeText),

    steps: roadmap.steps
      .map((step) => ({
        title: normalizeText(step.title),
        description: normalizeText(step.description),
        technologies: Array.isArray(step.technologies)
          ? step.technologies.map(normalizeText)
          : [],
        order: step.order,
      }))
      .sort((a, b) => a.order - b.order),
  };
};

const mergeRoadmap = (existingRoadmap, newRoadmap) => {
  const existingSteps = Array.isArray(existingRoadmap.steps)
    ? existingRoadmap.steps
    : [];

  const existingStepByOrder = new Map(
    existingSteps.map((step) => [
      step.order,
      {
        title: step.title,
        description: step.description,
        technologies: step.technologies || [],
        order: step.order,
      },
    ])
  );

  const mergedSteps = newRoadmap.steps.map((newStep) => {
    const existingStep = existingStepByOrder.get(newStep.order);

    if (!existingStep) {
      return newStep;
    }

    return {
      ...newStep,
      _id: existingStep._id,
    };
  });

  return {
    domain: newRoadmap.domain,
    techStack: newRoadmap.techStack,
    steps: mergedSteps,
    isActive: true,
  };
};

const seedLearningRoadmaps = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected.");

    const roadmap = normalizeRoadmap(
      webDevelopmentRoadmap
    );

    /*
     * IMPORTANT:
     * Do NOT use create() here.
     *
     * The LearningRoadmap model has a unique index on:
     * domain + techStack
     *
     * Since techStack is an array, inserting another
     * Web Development roadmap containing CSS/HTML/etc.
     * causes E11000 duplicate key errors.
     *
     * Therefore we find the existing Web Development
     * roadmap and update that same document.
     */

    const existingRoadmap =
      await LearningRoadmap.findOne({
        domain: roadmap.domain,
      });

    if (existingRoadmap) {
      const mergedRoadmap = mergeRoadmap(
        existingRoadmap,
        roadmap
      );

      existingRoadmap.domain = mergedRoadmap.domain;
      existingRoadmap.techStack =
        mergedRoadmap.techStack;
      existingRoadmap.steps = mergedRoadmap.steps;
      existingRoadmap.isActive = true;

      await existingRoadmap.save();

      console.log(
        "Existing Web Development roadmap updated successfully."
      );

      console.log(
        `Roadmap ID: ${existingRoadmap._id}`
      );

      console.log(
        `Tech stack skills: ${existingRoadmap.techStack.length}`
      );

      console.log(
        `Roadmap steps: ${existingRoadmap.steps.length}`
      );
    } else {
      const createdRoadmap =
        await LearningRoadmap.create({
          ...roadmap,
          isActive: true,
        });

      console.log(
        "Web Development roadmap created successfully."
      );

      console.log(
        `Roadmap ID: ${createdRoadmap._id}`
      );

      console.log(
        `Tech stack skills: ${createdRoadmap.techStack.length}`
      );

      console.log(
        `Roadmap steps: ${createdRoadmap.steps.length}`
      );
    }

    console.log(
      "Learning roadmap seed completed successfully."
    );
  } catch (error) {
    console.error(
      "Failed to seed learning roadmaps:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  }
};

seedLearningRoadmaps();