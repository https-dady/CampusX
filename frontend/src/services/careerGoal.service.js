import api from "./api";

export const getMyCareerGoal = async () => {
  const response = await api.get("/career-goal/me");
  return response.data;
};

export const createCareerGoal = async (payload) => {
  const response = await api.post("/career-goal", payload);
  return response.data;
};

export const updateMyCareerGoal = async (payload) => {
  const response = await api.patch("/career-goal/me", payload);
  return response.data;
};