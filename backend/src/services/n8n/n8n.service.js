import axios from "axios";
import env from "../../config/env.js";

export const triggerFoundationWorkflow = async (payload = {}) => {
  if (!env.N8N_WEBHOOK_URL) {
    throw new Error("N8N_WEBHOOK_URL is not configured");
  }

  const response = await axios.post(
    env.N8N_WEBHOOK_URL,
    payload,
    {
      timeout: 15000,
    }
  );

  return response.data;
};