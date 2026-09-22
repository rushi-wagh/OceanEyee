import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";
import { analyzeDescription } from "./nlp.service.js";
import { analyzeGeo } from "./geo.service.js";
import {
  calculateHistoricalRecurrence,
  findPossibleDuplicates,
} from "./duplicate.service.js";
import { generateEmbedding } from "./embedding.service.js";
import { assessEvidenceConsistency } from "../services/evidenceConsistency.service.js";
import { calculatePriority } from "./priority.service.js";
import { generateRecommendation } from "./recommendation.service.js";
import { analyzeReportImages } from "./vision.service.js";

const generateAndPersistIncidentEmbedding = async (
  reportId,
  description,
  visionAnalysis,
) => {
  if (!reportId) {
    throw new ApiError(400, "Report ID is required");
  }

  if (typeof description !== "string" || !description.trim()) {
    throw new ApiError(400, "Report description must be a non-empty string");
  }

  if (
    !visionAnalysis ||
    typeof visionAnalysis !== "object" ||
    Array.isArray(visionAnalysis) ||
    typeof visionAnalysis.category !== "string" ||
    !visionAnalysis.category.trim()
  ) {
    throw new ApiError(400, "Vision analysis must include a hazard category");
  }

  const hazardType = visionAnalysis.category.trim();
  const embeddingText = `Hazard: ${hazardType}\nDescription: ${description.trim()}`;
  const embedding = await generateEmbedding(embeddingText);

  try {
    return await prisma.incidentIntelligence.upsert({
      where: {
        reportId,
      },
      update: {
        hazardType,
        embedding,
      },
      create: {
        reportId,
        hazardType,
        embedding,
      },
    });
  } catch (error) {
    throw new ApiError(500, "Failed to persist incident embedding.");
  }
};

const processIncidentIntelligence = async (report) => {
  
  if (!report || typeof report !== "object") {
    throw new ApiError(400, "Report is required");
  }

  if (!report.id) {
    throw new ApiError(400, "Report ID is required");
  }

  try {
    await prisma.incidentIntelligence.upsert({
      where: {
        reportId: report.id,
      },
      update: {
        processingStatus: "PROCESSING",
      },
      create: {
        reportId: report.id,
        processingStatus: "PROCESSING",
      },
    });
    

    const [visionAnalysis, nlpAnalysis, geoAnalysis] = await Promise.all([
      analyzeReportImages(report.images),
      analyzeDescription(report.description),
      analyzeGeo(report.latitude, report.longitude),
    ]);
   

    const [evidenceConsistency, intelligenceWithEmbedding] = await Promise.all([
      Promise.resolve().then(() => {
        return assessEvidenceConsistency({
          visionAnalysis,
          nlpAnalysis,
        });
      }),
      generateAndPersistIncidentEmbedding(
        report.id,
        report.description,
        visionAnalysis,
      ),
    ]);
   
    

    const [duplicateAnalysis, historicalRecurrence] = await Promise.all([
      findPossibleDuplicates({
        currentReportId: report.id,
        currentEmbedding: intelligenceWithEmbedding.embedding,
        currentLatitude: report.latitude,
        currentLongitude: report.longitude,
        currentCreatedAt: report.createdAt,
        currentHazardType: visionAnalysis.category,
      }),
      calculateHistoricalRecurrence({
        currentReportId: report.id,
        currentLatitude: report.latitude,
        currentLongitude: report.longitude,
        currentCreatedAt: report.createdAt,
        currentHazardType: visionAnalysis.category,
      }),
    ]);
    

    const priority = calculatePriority({
      visionAnalysis,
      nlpAnalysis,
      geoAnalysis,
      duplicateAnalysis,
      historicalRecurrence,
      evidenceConsistency,
    });
    

    const recommendation = await generateRecommendation({
      visionAnalysis,
      nlpAnalysis,
      geoAnalysis,
      duplicateAnalysis,
      historicalRecurrence,
      evidenceConsistency,
      priority,
    });
    

    const updatedIntelligence = await prisma.incidentIntelligence.update({
      where: {
        reportId: report.id,
      },
      data: {
        hazardType: visionAnalysis.category,
        summary: recommendation.summary,
        visionAnalysis,
        nlpAnalysis,
        geoAnalysis,
        duplicateAnalysis: {
          ...duplicateAnalysis,
          historicalRecurrence,
        },
        evidenceConsistency,
        embedding: intelligenceWithEmbedding.embedding,
        priorityScore: priority.score,
        recommendation: recommendation.recommendation,
        reasoning: recommendation.reasoning,
        processingStatus: "COMPLETED",
      },
    });
    
    return updatedIntelligence;
  } catch (error) {
    console.error("Incident intelligence processing failed:", error);

    try {
      await prisma.incidentIntelligence.update({
        where: {
          reportId: report.id,
        },
        data: {
          processingStatus: "FAILED",
        },
      });
    } catch (failedUpdateError) {
      console.error(
        "Failed to mark incident intelligence as FAILED:",
        failedUpdateError,
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Incident intelligence processing failed.");
  }
};

export { generateAndPersistIncidentEmbedding, processIncidentIntelligence };
