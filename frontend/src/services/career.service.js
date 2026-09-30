import api from "./api";

export const predictCareer = async () => {
  const response = await api.post("/career/predict");
  return response.data;
};

export const getMySkillGap = async () => {
  const response = await api.get("/skill-gap/me");
  return response.data;
};