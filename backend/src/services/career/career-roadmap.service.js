import CareerRoadmap from "../../models/career-roadmap.model.js";

const buildCareerRoadmapUpdate = (roadmapData) => {
  const update = {};

  Object.entries(roadmapData).forEach(
    ([field, value]) => {
      update[field] = value;
    }
  );

  return update;
};

export const createCareerRoadmap = async (
  roadmapData
) => {
  const { career, domain } = roadmapData;

  const existingRoadmap =
    await CareerRoadmap.exists({
      career,
      domain,
    });

  if (existingRoadmap) {
    const error = new Error(
      "Career roadmap already exists for this career and domain."
    );

    error.statusCode = 409;
    throw error;
  }

  try {
    const roadmap =
      await CareerRoadmap.create(
        roadmapData
      );

    return roadmap.toObject();
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateError = new Error(
        "Career roadmap already exists for this career and domain."
      );

      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};

export const getCareerRoadmap = async (
  career,
  domain
) => {
  const roadmap =
    await CareerRoadmap.findOne({
      career,
      domain,
      isActive: true,
    })
      .select(
        "_id career domain steps isActive createdAt updatedAt"
      )
      .lean();

  if (!roadmap) {
    const error = new Error(
      "Career roadmap not found."
    );

    error.statusCode = 404;
    throw error;
  }

  return roadmap;
};

export const getActiveCareerRoadmaps =
  async () => {
    return CareerRoadmap.find({
      isActive: true,
    })
      .select(
        "_id career domain steps isActive createdAt updatedAt"
      )
      .sort({
        career: 1,
        domain: 1,
      })
      .lean();
  };

export const updateCareerRoadmap = async (
  roadmapId,
  roadmapData
) => {
  const update =
    buildCareerRoadmapUpdate(
      roadmapData
    );

  if (Object.keys(update).length === 0) {
    const error = new Error(
      "At least one roadmap field is required."
    );

    error.statusCode = 400;
    throw error;
  }

  try {
    const roadmap =
      await CareerRoadmap.findByIdAndUpdate(
        roadmapId,
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!roadmap) {
      const error = new Error(
        "Career roadmap not found."
      );

      error.statusCode = 404;
      throw error;
    }

    return roadmap;
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateError = new Error(
        "Career roadmap already exists for this career and domain."
      );

      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};