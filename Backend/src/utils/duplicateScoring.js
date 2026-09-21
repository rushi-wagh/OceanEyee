import { ApiError } from "./ApiError.js";

const validateNonNegativeFiniteNumber = (value, fieldName) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new ApiError(400, `${fieldName} must be a non-negative finite number`);
  }

  return value;
};

const validateScore = (value, fieldName) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new ApiError(400, `${fieldName} must be a number between 0 and 1`);
  }

  return value;
};

const calculateLocationScore = (distanceKm) => {
  const distance = validateNonNegativeFiniteNumber(distanceKm, "Distance");

  if (distance <= 1) return 1.0;
  if (distance <= 2) return 0.8;
  if (distance <= 5) return 0.5;
  if (distance <= 10) return 0.2;
  return 0;
};

const calculateTemporalScore = (differenceHours) => {
  const difference = validateNonNegativeFiniteNumber(differenceHours, "Time difference");

  if (difference <= 6) return 1.0;
  if (difference <= 24) return 0.8;
  if (difference <= 72) return 0.5;
  if (difference <= 168) return 0.2;
  return 0;
};

const normalizeCategory = (category) => {
  if (typeof category !== "string") return null;

  const normalizedCategory = category.trim().toLowerCase();
  return normalizedCategory && normalizedCategory !== "unknown"
    ? normalizedCategory
    : null;
};

const calculateHazardScore = (categoryA, categoryB) => {
  const normalizedCategoryA = normalizeCategory(categoryA);
  const normalizedCategoryB = normalizeCategory(categoryB);

  if (!normalizedCategoryA || !normalizedCategoryB) return 0.5;
  return normalizedCategoryA === normalizedCategoryB ? 1.0 : 0;
};

const calculateDuplicateScore = ({
  semanticScore,
  locationScore,
  temporalScore,
  hazardScore,
}) => {
  const semantic = validateScore(semanticScore, "Semantic score");
  const location = validateScore(locationScore, "Location score");
  const temporal = validateScore(temporalScore, "Temporal score");
  const hazard = validateScore(hazardScore, "Hazard score");

  return (
    0.40 * semantic
    + 0.30 * location
    + 0.20 * temporal
    + 0.10 * hazard
  );
};

const isPossibleDuplicate = ({
  semanticScore,
  distanceKm,
  differenceHours,
  duplicateScore,
}) => {
  const semantic = validateScore(semanticScore, "Semantic score");
  const distance = validateNonNegativeFiniteNumber(distanceKm, "Distance");
  const difference = validateNonNegativeFiniteNumber(differenceHours, "Time difference");
  const score = validateScore(duplicateScore, "Duplicate score");

  return (
    semantic >= 0.70
    && distance <= 10
    && difference <= 72
    && score >= 0.75
  );
};

export {
  calculateLocationScore,
  calculateTemporalScore,
  calculateHazardScore,
  calculateDuplicateScore,
  isPossibleDuplicate,
};