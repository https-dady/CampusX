import LearningRoadmap from "../../models/learning-roadmap.model.js";

const normalizeLookupValue = (value) => {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
};

const normalizeRoadmapData = (data) => {
  return {
    ...data,
    domain: data.domain?.trim().replace(/\s+/g, " "),
    techStack: data.techStack?.map((item) =>
      item.trim().replace(/\s+/g, " ")
    ),
    steps: data.steps?.map((step) => ({
      ...step,
      title: step.title?.trim().replace(/\s+/g, " "),
      description: step.description
        ?.trim()
        .replace(/\s+/g, " "),
      technologies: step.technologies?.map((item) =>
        item.trim().replace(/\s+/g, " ")
      ),
    })),
  };
};

const validateStepOrder = (steps) => {
  const orders = steps.map((step) => step.order);

  const uniqueOrders = new Set(orders);

  if (uniqueOrders.size !== orders.length) {
    const error = new Error(
      "Roadmap step order values must be unique."
    );

    error.statusCode = 400;
    throw error;
  }
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildRoadmapFilter = (domain, techStack) => {
  const normalizedDomain = domain
    .trim()
    .replace(/\s+/g, " ");

  const normalizedTechStack = techStack.map((technology) =>
    technology.trim().replace(/\s+/g, " ")
  );

  return {
    domain: {
      $regex: `^${escapeRegex(normalizedDomain)}$`,
      $options: "i",
    },
    techStack: {
      $all: normalizedTechStack,
    },
  };
};

export const createLearningRoadmap = async (
  roadmapData
) => {
  const normalizedData =
    normalizeRoadmapData(roadmapData);

  validateStepOrder(normalizedData.steps);

  const existingRoadmap =
    await LearningRoadmap.findOne(
      buildRoadmapFilter(
        normalizedData.domain,
        normalizedData.techStack
      )
    ).lean();

  if (existingRoadmap) {
    const error = new Error(
      "Learning roadmap already exists for this domain and tech stack."
    );

    error.statusCode = 409;
    throw error;
  }

  return LearningRoadmap.create(normalizedData);
};

export const getLearningRoadmap = async (
  domain,
  techStack
) => {
  if (!domain || !Array.isArray(techStack) || !techStack.length) {
    const error = new Error(
      "Domain and tech stack are required."
    );

    error.statusCode = 400;
    throw error;
  }

  const roadmap = await LearningRoadmap.findOne(
    buildRoadmapFilter(domain, techStack)
  )
    .lean();

  if (!roadmap) {
    const error = new Error(
      "Learning roadmap not found."
    );

    error.statusCode = 404;
    throw error;
  }

  roadmap.steps.sort(
    (first, second) =>
      first.order - second.order
  );

  return roadmap;
};

export const getAllLearningRoadmaps = async () => {
  return LearningRoadmap.find({
    isActive: true,
  })
    .sort({
      domain: 1,
      createdAt: -1,
    })
    .lean();
};

export const updateLearningRoadmap = async (
  roadmapId,
  roadmapData
) => {
  const normalizedData =
    normalizeRoadmapData(roadmapData);

  if (normalizedData.steps) {
    validateStepOrder(normalizedData.steps);
  }

  const roadmap =
    await LearningRoadmap.findByIdAndUpdate(
      roadmapId,
      {
        $set: normalizedData,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

  if (!roadmap) {
    const error = new Error(
      "Learning roadmap not found."
    );

    error.statusCode = 404;
    throw error;
  }

  return roadmap;
};

export const deleteLearningRoadmap = async (
  roadmapId
) => {
  const roadmap =
    await LearningRoadmap.findByIdAndDelete(
      roadmapId
    ).lean();

  if (!roadmap) {
    const error = new Error(
      "Learning roadmap not found."
    );

    error.statusCode = 404;
    throw error;
  }

  return roadmap;
};