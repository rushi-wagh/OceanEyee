import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";
import { generateEmbedding } from "./embedding.service.js";

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

export { generateAndPersistIncidentEmbedding };