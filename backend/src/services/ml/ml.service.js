import axios from "axios";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

export const checkMLService = async () => {
  const response = await axios.get(`${ML_SERVICE_URL}/health`, {
    timeout: 5000,
  });

  return response.data;
};