import { client } from "../utils/openrouter.js";
import { ApiError } from "../utils/ApiError.js";

const MODEL_NAME = "liquid/lfm-2.5-embedding-350m:free";
const EMBEDDING_DIMENSIONS = 1024;

const validateEmbedding = (embedding) => {
  if (
    !Array.isArray(embedding) ||
    embedding.length !== EMBEDDING_DIMENSIONS ||
    !embedding.every((value) => typeof value === "number" && Number.isFinite(value))
  ) {
    throw new ApiError(
      502,
      "The embedding model returned an invalid embedding.",
    );
  }

  return embedding;
};

const generateEmbedding = async (text) => {
  if (typeof text !== "string" || !text.trim()) {
    throw new ApiError(400, "Text must be a non-empty string.");
  }

  try {
    const response = await client.embeddings.create({
      model: MODEL_NAME,
      input: [text.trim()],
      encoding_format: "float",
    });

    const embedding = response?.data?.[0]?.embedding;

    if (embedding === undefined) {
      throw new ApiError(
        502,
        "The embedding model response is malformed.",
      );
    }

    return validateEmbedding(embedding);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message = error?.message || "Embedding generation failed.";
    throw new ApiError(502, `Embedding generation failed: ${message}`);
  }
};

export { generateEmbedding };