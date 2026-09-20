import CareerRequirement from "../../models/career-requirement.model.js";

const buildCareerRequirementUpdate = (
  requirementData
) => {
  const update = {};

  Object.entries(requirementData).forEach(
    ([field, value]) => {
      update[field] = value;
    }
  );

  return update;
};

export const createCareerRequirement = async (
  requirementData
) => {
  const {
    career,
    domain,
  } = requirementData;

  const existingRequirement =
    await CareerRequirement.exists({
      career,
      domain,
    });

  if (existingRequirement) {
    const error = new Error(
      "Career requirement already exists for this career and domain."
    );

    error.statusCode = 409;

    throw error;
  }

  try {
    const requirement =
      await CareerRequirement.create(
        requirementData
      );

    return requirement.toObject();
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateError = new Error(
        "Career requirement already exists for this career and domain."
      );

      duplicateError.statusCode = 409;

      throw duplicateError;
    }

    throw error;
  }
};

export const getCareerRequirement = async (
  career,
  domain
) => {
  const requirement =
    await CareerRequirement.findOne({
      career,
      domain,
      isActive: true,
    })
      .select(
        "_id career domain requiredSkills isActive createdAt updatedAt"
      )
      .lean();

  if (!requirement) {
    const error = new Error(
      "Career requirement not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return requirement;
};

export const getActiveCareerRequirements =
  async () => {
    return CareerRequirement.find({
      isActive: true,
    })
      .select(
        "_id career domain requiredSkills isActive createdAt updatedAt"
      )
      .sort({
        career: 1,
        domain: 1,
      })
      .lean();
  };

export const updateCareerRequirement =
  async (
    requirementId,
    requirementData
  ) => {
    const update =
      buildCareerRequirementUpdate(
        requirementData
      );

    if (
      Object.keys(update).length === 0
    ) {
      const error = new Error(
        "At least one career requirement field is required."
      );

      error.statusCode = 400;

      throw error;
    }

    try {
      const requirement =
        await CareerRequirement.findByIdAndUpdate(
          requirementId,
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        ).lean();

      if (!requirement) {
        const error = new Error(
          "Career requirement not found."
        );

        error.statusCode = 404;

        throw error;
      }

      return requirement;
    } catch (error) {
      if (error?.code === 11000) {
        const duplicateError = new Error(
          "Career requirement already exists for this career and domain."
        );

        duplicateError.statusCode = 409;

        throw duplicateError;
      }

      throw error;
    }
  };