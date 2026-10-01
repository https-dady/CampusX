import env from "../../config/env.js";

const RESUME_REQUEST_TIMEOUT = 60_000;

const buildAbortSignal = () => {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    RESUME_REQUEST_TIMEOUT
  );

  return {
    controller,
    timeout,
  };
};

export const analyzeResume = async ({
  buffer,
  mimetype,
  originalname,
}) => {
  if (!env.ML_SERVICE_URL) {
    const error = new Error(
      "ML service URL is not configured."
    );

    error.statusCode = 503;

    throw error;
  }

  const {
    controller,
    timeout,
  } = buildAbortSignal();

  try {
    const form = new FormData();

    const file = new Blob(
      [buffer],
      {
        type: mimetype,
      }
    );

    form.append(
      "file",
      file,
      originalname
    );

    const response = await fetch(
      `${env.ML_SERVICE_URL}/resume/check`,
      {
        method: "POST",
        body: form,
        signal: controller.signal,
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      const error = new Error(
        "Resume analysis service returned an invalid response."
      );

      error.statusCode = 503;

      throw error;
    }

    if (!response.ok) {
      const error = new Error(
        result?.detail ||
          result?.message ||
          "Resume analysis failed."
      );

      error.statusCode =
        response.status >= 500
          ? 503
          : response.status;

      throw error;
    }

    if (
      result?.success !== true ||
      !result?.data
    ) {
      const error = new Error(
        "Resume analysis service returned an invalid result."
      );

      error.statusCode = 503;

      throw error;
    }

    return result.data;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "Resume analysis timed out. Please try again."
      );

      timeoutError.statusCode = 504;

      throw timeoutError;
    }

    if (error.statusCode) {
      throw error;
    }

    const serviceError = new Error(
      "Unable to connect to the resume analysis service."
    );

    serviceError.statusCode = 503;
    serviceError.cause = error;

    throw serviceError;
  } finally {
    clearTimeout(timeout);
  }
};