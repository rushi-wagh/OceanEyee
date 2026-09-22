import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";
import { cosineSimilarity } from "../utils/cosineSimiliarity.js";
import { calculateDistanceKm } from "./geo.service.js";
import {
  calculateDuplicateScore,
  calculateHazardScore,
  calculateLocationScore,
  calculateTemporalScore,
  isPossibleDuplicate,
} from "../utils/duplicateScoring.js";

const SEMANTIC_CANDIDATE_THRESHOLD = 0.70;
const EMBEDDING_DIMENSIONS = 1024;
const HISTORICAL_RADIUS_KM = 5;
const HISTORICAL_STATUSES = ["VERIFIED", "RESOLVED", "CLOSED"];

const isValidEmbedding = (embedding) => {
  return (
    Array.isArray(embedding) &&
    embedding.length === EMBEDDING_DIMENSIONS &&
    embedding.every(
      (value) => typeof value === "number" && Number.isFinite(value),
    )
  );
};

const retrieveDuplicateCandidates = async (currentReportId, currentEmbedding) => {
  if (!currentReportId) {
    throw new ApiError(400, "Report ID is required");
  }

  if (!isValidEmbedding(currentEmbedding)) {
    throw new ApiError(
      400,
      "Current report embedding must contain exactly 1024 finite numbers",
    );
  }

  try {
    const intelligenceRecords = await prisma.incidentIntelligence.findMany({
      where: {
        reportId: {
          not: currentReportId,
        },
        embedding: {
          not: null,
        },
      },
      select: {
        reportId: true,
        embedding: true,
        hazardType: true,
        report: {
          select: {
            createdAt: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    const candidates = [];

    for (const record of intelligenceRecords) {
      if (record.embedding === null) {
        continue;
      }

      if (!isValidEmbedding(record.embedding)) {
        throw new ApiError(502, "A stored incident embedding is invalid.");
      }

      let similarity;

      try {
        similarity = cosineSimilarity(currentEmbedding, record.embedding);
      } catch (error) {
        throw new ApiError(
          502,
          "A stored incident embedding could not be compared.",
        );
      }

      if (!Number.isFinite(similarity)) {
        throw new ApiError(
          502,
          "A stored incident embedding produced an invalid similarity.",
        );
      }

      if (similarity >= SEMANTIC_CANDIDATE_THRESHOLD) {
        candidates.push({
          reportId: record.reportId,
          similarity,
          hazardType: record.hazardType,
          createdAt: record.report.createdAt,
          latitude: record.report.latitude,
          longitude: record.report.longitude,
        });
      }
    }

    return candidates.sort(
      (candidateA, candidateB) => candidateB.similarity - candidateA.similarity,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to retrieve duplicate candidates.");
  }
};

const findPossibleDuplicates = async ({
  currentReportId,
  currentEmbedding,
  currentLatitude,
  currentLongitude,
  currentCreatedAt,
  currentHazardType,
}) => {
  if (!currentReportId) {
    throw new ApiError(400, "Report ID is required");
  }

  if (
    !Number.isFinite(currentLatitude) ||
    !Number.isFinite(currentLongitude)
  ) {
    throw new ApiError(400, "Current report coordinates must be valid numbers");
  }

  const currentDate = new Date(currentCreatedAt);

  if (Number.isNaN(currentDate.getTime())) {
    throw new ApiError(400, "Current report createdAt must be a valid date");
  }

  const candidates = await retrieveDuplicateCandidates(
    currentReportId,
    currentEmbedding,
  );

  const matchedReports = candidates
    .map((candidate) => {
      const distanceKm = calculateDistanceKm(
        currentLatitude,
        currentLongitude,
        candidate.latitude,
        candidate.longitude,
      );
      const candidateDate = new Date(candidate.createdAt);
      const differenceHours = Math.abs(
        currentDate.getTime() - candidateDate.getTime(),
      ) / (1000 * 60 * 60);
      const locationScore = calculateLocationScore(distanceKm);
      const temporalScore = calculateTemporalScore(differenceHours);
      const hazardScore = calculateHazardScore(
        currentHazardType,
        candidate.hazardType,
      );
      const duplicateScore = calculateDuplicateScore({
        semanticScore: candidate.similarity,
        locationScore,
        temporalScore,
        hazardScore,
      });

      if (!isPossibleDuplicate({
        semanticScore: candidate.similarity,
        distanceKm,
        differenceHours,
        duplicateScore,
      })) {
        return null;
      }

      const hazardDescription = hazardScore === 1
        ? "identify the same hazard type"
        : "have different or unknown hazard types";

      return {
        reportId: candidate.reportId,
        similarity: candidate.similarity,
        reason: `High semantic similarity, reports are ${distanceKm.toFixed(1)} km apart, were submitted ${differenceHours.toFixed(1)} hours apart, and ${hazardDescription}.`,
      };
    })
    .filter(Boolean);

  return {
    possibleDuplicate: matchedReports.length > 0,
    similarity: matchedReports[0]?.similarity ?? 0,
    matchedReports,
  };
};

const calculateHistoricalRecurrence = async ({
  currentReportId,
  currentLatitude,
  currentLongitude,
  currentCreatedAt,
  currentHazardType,
}) => {
  if (!currentReportId) {
    throw new ApiError(400, "Report ID is required");
  }

  if (
    !Number.isFinite(currentLatitude) ||
    !Number.isFinite(currentLongitude)
  ) {
    throw new ApiError(400, "Current report coordinates must be valid numbers");
  }

  const currentDate = new Date(currentCreatedAt);

  if (Number.isNaN(currentDate.getTime())) {
    throw new ApiError(400, "Current report createdAt must be a valid date");
  }

  try {
    const historicalReports = await prisma.report.findMany({
      where: {
        id: {
          not: currentReportId,
        },
        status: {
          in: HISTORICAL_STATUSES,
        },
        createdAt: {
          lt: currentDate,
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        intelligence: {
          select: {
            hazardType: true,
          },
        },
      },
    });

    const relevantIncidentCount = historicalReports.filter((report) => {
      if (
        !Number.isFinite(report.latitude) ||
        !Number.isFinite(report.longitude)
      ) {
        throw new ApiError(502, "A historical report has invalid coordinates.");
      }

      const distanceKm = calculateDistanceKm(
        currentLatitude,
        currentLongitude,
        report.latitude,
        report.longitude,
      );
      const hazardScore = calculateHazardScore(
        currentHazardType,
        report.intelligence?.hazardType,
      );

      return distanceKm <= HISTORICAL_RADIUS_KM && hazardScore === 1;
    }).length;

    return {
      previousIncidents: relevantIncidentCount,
      recurring: relevantIncidentCount >= 3,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to calculate historical recurrence.");
  }
};

export {
  calculateHistoricalRecurrence,
  findPossibleDuplicates,
  retrieveDuplicateCandidates,
};