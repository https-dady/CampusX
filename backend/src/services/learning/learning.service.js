import env from "../../config/env.js";

const REQUEST_TIMEOUT_MS = 15000;

const buildLearningRequest = (learningData) => {
  return {
    domain: learningData.domain,
    techStack: learningData.techStack,
  };
};

const validateLearningResponse = (response) => {
  if (!response || typeof response !== "object") {
    const error = new Error(
      "Invalid response received from learning workflow."
    );

    error.statusCode = 502;
    throw error;
  }

  if (response.success !== true) {
    const error = new Error(
      "Learning workflow did not return a successful response."
    );

    error.statusCode = 502;
    throw error;
  }

  if (!Array.isArray(response.resources)) {
    const error = new Error(
      "Learning workflow returned an invalid resources list."
    );

    error.statusCode = 502;
    throw error;
  }

  if (
    response.cacheKey !== undefined &&
    typeof response.cacheKey !== "string"
  ) {
    const error = new Error(
      "Learning workflow returned an invalid cache key."
    );

    error.statusCode = 502;
    throw error;
  }

  if (
    response.hasMore !== undefined &&
    typeof response.hasMore !== "boolean"
  ) {
    const error = new Error(
      "Learning workflow returned an invalid hasMore value."
    );

    error.statusCode = 502;
    throw error;
  }

  const resources = response.resources.filter(
    (resource) =>
      resource &&
      typeof resource.title === "string" &&
      typeof resource.url === "string" &&
      typeof resource.type === "string" &&
      typeof resource.description === "string"
  );

  return {
    success: true,
    cacheKey: response.cacheKey || null,
    hasMore: response.hasMore === true,
    resources,
    total: resources.length,
  };
};

export const prepareLearningRequest = (learningData) => {
  if (!learningData) {
    const error = new Error("Learning request is required.");

    error.statusCode = 400;
    throw error;
  }

  const request = buildLearningRequest(learningData);

  if (!request.domain || !request.techStack?.length) {
    const error = new Error(
      "Domain and at least one technology are required."
    );

    error.statusCode = 400;
    throw error;
  }

  return request;
};

export const getLearningResources = async (learningData) => {
  const request = prepareLearningRequest(learningData);

  if (!env.N8N_LEARNING_WEBHOOK_URL) {
    const error = new Error(
      "Learning workflow URL is not configured."
    );

    error.statusCode = 500;
    throw error;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      env.N8N_LEARNING_WEBHOOK_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      const error = new Error(
        "Learning workflow returned an invalid JSON response."
      );

      error.statusCode = 502;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
          `Learning workflow failed with status ${response.status}.`
      );

      error.statusCode = 502;
      throw error;
    }

    return validateLearningResponse(data);
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "Learning resource search timed out."
      );

      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};