import {
  ML_CONFIDENCE_THRESHOLDS,
  ML_MODEL_VERSION,
} from "../ml/ml.constants.js";

const getConfidenceLevel = (probability) => {
  if (
    probability >=
    ML_CONFIDENCE_THRESHOLDS.HIGH
  ) {
    return "high";
  }

  if (
    probability >=
    ML_CONFIDENCE_THRESHOLDS.MODERATE
  ) {
    return "moderate";
  }

  return "low";
};

const validatePredictions = (predictions) => {
  if (!Array.isArray(predictions)) {
    throw new Error(
      "Invalid career prediction data."
    );
  }

  if (predictions.length === 0) {
    throw new Error(
      "No career predictions available."
    );
  }

  for (const prediction of predictions) {
    if (
      !prediction ||
      typeof prediction.career !== "string" ||
      !prediction.career.trim()
    ) {
      throw new Error(
        "Invalid career prediction career."
      );
    }

    if (
      typeof prediction.probability !== "number" ||
      !Number.isFinite(
        prediction.probability
      ) ||
      prediction.probability < 0 ||
      prediction.probability > 1
    ) {
      throw new Error(
        "Invalid career prediction probability."
      );
    }
  }
};

export const analyzeCareerPrediction = (
  predictionResponse
) => {
  if (
    !predictionResponse ||
    predictionResponse.success !== true
  ) {
    throw new Error(
      "Invalid ML prediction response."
    );
  }

  validatePredictions(
    predictionResponse.predictions
  );

  const predictions =
    [...predictionResponse.predictions]
      .sort(
        (a, b) =>
          b.probability -
          a.probability
      );

  const topPrediction =
    predictions[0];

  const analyzedPredictions =
    predictions.map((prediction) => ({
      career: prediction.career,
      probability: prediction.probability,
      confidence: getConfidenceLevel(
        prediction.probability
      ),
    }));

  return {
    modelVersion:
      predictionResponse.modelVersion ||
      ML_MODEL_VERSION,

    primaryCareer: {
      career: topPrediction.career,
      probability:
        topPrediction.probability,
      confidence:
        getConfidenceLevel(
          topPrediction.probability
        ),
    },

    predictions:
      analyzedPredictions,
  };
};