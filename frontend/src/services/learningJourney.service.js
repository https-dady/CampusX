import api from "./api.js";

export const getMyLearningGoal = async () => {
  const response = await api.get(
    "/learning-goal/me"
  );

  return response.data;
};

export const saveLearningGoal = async (
  payload
) => {
  const response = await api.post(
    "/learning-goal",
    payload
  );

  return response.data;
};

export const getMyLearningPreference =
  async () => {
    const response = await api.get(
      "/learning-preference/me"
    );

    return response.data;
  };

export const saveLearningPreference =
  async (payload) => {
    const response = await api.post(
      "/learning-preference",
      payload
    );

    return response.data;
  };