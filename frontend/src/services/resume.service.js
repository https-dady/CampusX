import api from "./api.js";

export const checkResume = async (file) => {
  if (!(file instanceof File)) {
    throw new Error(
      "A resume file is required."
    );
  }

  const formData = new FormData();

  formData.append(
    "resume",
    file
  );

  const response = await api.post(
    "/resume/check",
    formData,
    {
      timeout: 90_000,
    }
  );

  return response.data;
};