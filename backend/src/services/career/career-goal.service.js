import CareerGoal from "../../models/career-goal.model.js";

const buildCareerGoalUpdate = (goalData) => {
  const update = {};

  Object.entries(goalData).forEach(
    ([field, value]) => {
      update[field] = value;
    }
  );

  return update;
};

export const getMyCareerGoal = async (userId) => {
  const careerGoal = await CareerGoal.findOne({
    user: userId,
  })
    .select(
      "_id user targetCareer targetDomain targetLevel targetTimeline additionalGoals createdAt updatedAt"
    )
    .lean();

  if (!careerGoal) {
    return null;
  }

  return careerGoal;
};

export const createCareerGoal = async (
  userId,
  goalData
) => {
  const existingGoal =
    await CareerGoal.exists({
      user: userId,
    });

  if (existingGoal) {
    const error = new Error(
      "Career goal already exists. Update the existing goal instead."
    );

    error.statusCode = 409;

    throw error;
  }

  const careerGoal =
    await CareerGoal.create({
      user: userId,
      ...goalData,
    });

  return careerGoal.toObject();
};

export const updateCareerGoal = async (
  userId,
  goalData
) => {
  const update =
    buildCareerGoalUpdate(goalData);

  if (
    Object.keys(update).length === 0
  ) {
    const error = new Error(
      "At least one career goal field is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const careerGoal =
    await CareerGoal.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

  if (!careerGoal) {
    const error = new Error(
      "Career goal not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return careerGoal;
};

export const upsertCareerGoal = async (
  userId,
  goalData
) => {
  const careerGoal =
    await CareerGoal.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $set: goalData,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

  return careerGoal;
};