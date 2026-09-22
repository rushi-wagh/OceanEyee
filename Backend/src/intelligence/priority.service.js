import { ApiError } from "../utils/ApiError.js";

const RAW_SCORE_MAXIMUM = 90;
const VALID_CONSISTENCY_VALUES = [
  "consistent",
  "uncertain",
  "contradictory",
];

const isObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const validateStringArray = (value, fieldName) => {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new ApiError(400, `${fieldName} must be an array of strings.`);
  }
};

const validateInputs = ({
  visionAnalysis,
  nlpAnalysis,
  geoAnalysis,
  duplicateAnalysis,
  historicalRecurrence,
  evidenceConsistency,
}) => {
  if (!isObject(visionAnalysis)) {
    throw new ApiError(400, "Vision analysis is required.");
  }

  validateStringArray(
    visionAnalysis.severityIndicators,
    "Vision severityIndicators",
  );
  validateStringArray(
    visionAnalysis.visibleHazardEvidence,
    "Vision visibleHazardEvidence",
  );

  if (!isObject(nlpAnalysis)) {
    throw new ApiError(400, "NLP analysis is required.");
  }

  validateStringArray(
    nlpAnalysis.severityIndicators,
    "NLP severityIndicators",
  );

  if (
    !isObject(geoAnalysis) ||
    typeof geoAnalysis.riskScore !== "number" ||
    !Number.isFinite(geoAnalysis.riskScore)
  ) {
    throw new ApiError(400, "Geo analysis must include a finite riskScore.");
  }

  if (
    !isObject(duplicateAnalysis) ||
    typeof duplicateAnalysis.possibleDuplicate !== "boolean" ||
    typeof duplicateAnalysis.similarity !== "number" ||
    !Number.isFinite(duplicateAnalysis.similarity) ||
    duplicateAnalysis.similarity < 0 ||
    duplicateAnalysis.similarity > 1
  ) {
    throw new ApiError(400, "Duplicate analysis contains invalid values.");
  }

  if (
    !isObject(historicalRecurrence) ||
    typeof historicalRecurrence.previousIncidents !== "number" ||
    !Number.isFinite(historicalRecurrence.previousIncidents) ||
    historicalRecurrence.previousIncidents < 0
  ) {
    throw new ApiError(400, "Historical recurrence contains an invalid incident count.");
  }

  if (
    !isObject(evidenceConsistency) ||
    !VALID_CONSISTENCY_VALUES.includes(evidenceConsistency.consistency)
  ) {
    throw new ApiError(400, "Evidence consistency contains an invalid value.");
  }
};

const getPriorityLevel = (score) => {
  if (score <= 24) return "LOW";
  if (score <= 49) return "MEDIUM";
  if (score <= 74) return "HIGH";
  return "CRITICAL";
};

const calculatePriority = (inputs) => {
  if (!isObject(inputs)) {
    throw new ApiError(400, "Priority inputs are required.");
  }

  validateInputs(inputs);

  const {
    visionAnalysis,
    nlpAnalysis,
    geoAnalysis,
    duplicateAnalysis,
    historicalRecurrence,
    evidenceConsistency,
  } = inputs;

  const visionSeverityPoints = Math.min(
    visionAnalysis.severityIndicators.length * 3,
    15,
  );
  const nlpSeverityPoints = Math.min(
    nlpAnalysis.severityIndicators.length * 2,
    10,
  );
  const visibleHazardEvidencePoints = Math.min(
    visionAnalysis.visibleHazardEvidence.length,
    5,
  );
  const clampedRiskScore = Math.min(Math.max(geoAnalysis.riskScore, 0), 0.8);
  const geoRiskPoints = (clampedRiskScore / 0.8) * 20;
  const clampedSimilarity = Math.min(
    Math.max(duplicateAnalysis.similarity, 0),
    1,
  );
  const duplicateDetectionPoints = duplicateAnalysis.possibleDuplicate
    ? 10 + (clampedSimilarity * 5)
    : 0;
  const historicalRecurrencePoints = Math.min(
    historicalRecurrence.previousIncidents * 3,
    15,
  );
  const evidenceConsistencyPoints = {
    consistent: 0,
    uncertain: 3,
    contradictory: 10,
  }[evidenceConsistency.consistency];

  const rawScore =
    visionSeverityPoints +
    nlpSeverityPoints +
    visibleHazardEvidencePoints +
    geoRiskPoints +
    duplicateDetectionPoints +
    historicalRecurrencePoints +
    evidenceConsistencyPoints;
  const score = Math.min(
    Math.max(Math.round((rawScore / RAW_SCORE_MAXIMUM) * 100), 0),
    100,
  );

  return {
    score,
    level: getPriorityLevel(score),
    factors: [
      {
        name: "visionSeverity",
        points: visionSeverityPoints,
        maxPoints: 15,
        details: {
          indicatorCount: visionAnalysis.severityIndicators.length,
          confidence: visionAnalysis.confidence,
        },
      },
      {
        name: "nlpSeverity",
        points: nlpSeverityPoints,
        maxPoints: 10,
        details: {
          indicatorCount: nlpAnalysis.severityIndicators.length,
          confidence: nlpAnalysis.confidence,
        },
      },
      {
        name: "visibleHazardEvidence",
        points: visibleHazardEvidencePoints,
        maxPoints: 5,
        details: {
          evidenceCount: visionAnalysis.visibleHazardEvidence.length,
          confidence: visionAnalysis.confidence,
        },
      },
      {
        name: "geoRisk",
        points: geoRiskPoints,
        maxPoints: 20,
        details: {
          riskScore: geoAnalysis.riskScore,
          clampedRiskScore,
        },
      },
      {
        name: "duplicateDetection",
        points: duplicateDetectionPoints,
        maxPoints: 15,
        details: {
          possibleDuplicate: duplicateAnalysis.possibleDuplicate,
          similarity: duplicateAnalysis.similarity,
        },
      },
      {
        name: "historicalRecurrence",
        points: historicalRecurrencePoints,
        maxPoints: 15,
        details: {
          previousIncidents: historicalRecurrence.previousIncidents,
          recurring: historicalRecurrence.recurring,
        },
      },
      {
        name: "evidenceConsistency",
        points: evidenceConsistencyPoints,
        maxPoints: 10,
        details: {
          consistency: evidenceConsistency.consistency,
          contradiction: evidenceConsistency.contradiction,
          reliable: evidenceConsistency.reliable,
          confidence: evidenceConsistency.confidence,
          reason: evidenceConsistency.reason,
        },
      },
    ],
  };
};

export { calculatePriority };