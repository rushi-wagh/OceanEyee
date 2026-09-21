import { ApiError } from "../utils/ApiError.js";

const HIGH_VISION_CONFIDENCE = 0.8;
const MEANINGFUL_NLP_CONFIDENCE = 0.5;

const isConfidence = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
};

const validateInputs = (visionAnalysis, nlpAnalysis) => {
  if (
    !visionAnalysis ||
    typeof visionAnalysis !== "object" ||
    Array.isArray(visionAnalysis) ||
    typeof visionAnalysis.category !== "string" ||
    !visionAnalysis.category.trim() ||
    !isConfidence(visionAnalysis.confidence)
  ) {
    throw new ApiError(400, "Vision analysis is invalid.");
  }

  if (
    !nlpAnalysis ||
    typeof nlpAnalysis !== "object" ||
    Array.isArray(nlpAnalysis) ||
    !Array.isArray(nlpAnalysis.hazardSignals) ||
    !nlpAnalysis.hazardSignals.every((signal) => typeof signal === "string") ||
    !isConfidence(nlpAnalysis.confidence)
  ) {
    throw new ApiError(400, "NLP analysis is invalid.");
  }
};

const assessEvidenceConsistency = ({ visionAnalysis, nlpAnalysis }) => {
  validateInputs(visionAnalysis, nlpAnalysis);

  const visionCategory = visionAnalysis.category.trim();
  const hazardSignals = nlpAnalysis.hazardSignals
    .map((signal) => signal.trim())
    .filter(Boolean);
  const hasMeaningfulHazardClaim =
    hazardSignals.length > 0 &&
    nlpAnalysis.confidence >= MEANINGFUL_NLP_CONFIDENCE;
  const confidence = Math.min(
    visionAnalysis.confidence,
    nlpAnalysis.confidence,
  );

  if (
    visionCategory === "no_hazard_visible" &&
    visionAnalysis.confidence >= HIGH_VISION_CONFIDENCE &&
    hasMeaningfulHazardClaim
  ) {
    return {
      consistency: "contradictory",
      contradiction: true,
      confidence,
      reliable: true,
      reason: "NLP reports a hazard claim, while Vision found no visible hazard with high confidence.",
    };
  }

  if (!hasMeaningfulHazardClaim) {
    return {
      consistency: "uncertain",
      contradiction: false,
      confidence,
      reliable: false,
      reason: "NLP did not provide a sufficiently confident hazard claim for comparison.",
    };
  }

  if (
    visionCategory === "uncertain" ||
    visionAnalysis.confidence < HIGH_VISION_CONFIDENCE
  ) {
    return {
      consistency: "uncertain",
      contradiction: false,
      confidence,
      reliable: false,
      reason: "Vision evidence is not confident enough to confirm or contradict the NLP hazard claim.",
    };
  }

  return {
    consistency: "consistent",
    contradiction: false,
    confidence,
    reliable: true,
    reason: "Vision provides confident visible hazard evidence compatible with the NLP hazard claim.",
  };
};

export { assessEvidenceConsistency };