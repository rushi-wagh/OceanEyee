import { client } from "../utils/openrouter.js";
import { ApiError } from "../utils/ApiError.js";

const MODEL_NAME = "inclusionai/ling-3.0-flash-vl:free";

const ALLOWED_VISION_CATEGORIES = [
  "oil_spill",
  "marine_debris",
  "dead_marine_life",
  "water_pollution",
  "coastal_flooding",
  "coastal_erosion",
  "vessel_incident",
  "infrastructure_damage",
  "other",
  "no_hazard_visible",
  "uncertain",
];

const VISION_PROMPT = `
Analyze the uploaded images only for visible marine-hazard evidence.

Return ONLY valid JSON in this exact structure:
{
  "category": "string",
  "description": "string",
  "observations": ["string"],
  "severityIndicators": ["string"],
  "visibleHazardEvidence": ["string"],
  "confidence": 0.0
}

Allowed category values:
- oil_spill
- marine_debris
- dead_marine_life
- water_pollution
- coastal_flooding
- coastal_erosion
- vessel_incident
- infrastructure_damage
- other
- no_hazard_visible
- uncertain

Rules:
1. Analyze only what is visually supported by the uploaded images.
2. Do not infer hazards merely because they are possible in that environment.
3. Do not invent causes, events, or conditions that cannot be seen.
4. category must describe a visible marine hazard, not an activity, location, object, or environment.
5. description must be a concise factual description of the visible evidence.
6. observations must contain concrete visual facts.
7. severityIndicators must contain only visibly supported severity signals.
8. visibleHazardEvidence must contain direct visual evidence of a hazard.
9. If no marine hazard is visibly supported, use "no_hazard_visible".
10. If evidence is insufficient to classify the hazard, use "uncertain".
11. Use neutral observable language. Avoid subjective terms such as "pristine", "beautiful", "healthy", "safe", or "clean".
12. confidence must be a number between 0 and 1.
13. Return ONLY valid JSON. No markdown or explanation outside the JSON.
`;

const normalizeImageList = (reportImages) => {
  if (!Array.isArray(reportImages) || reportImages.length === 0) {
    throw new ApiError(
      400,
      "At least one report image is required for vision analysis.",
    );
  }

  return reportImages.map((image) => {
    const url = typeof image === "string" ? image : image?.url;

    if (typeof url !== "string" || !url.trim()) {
      throw new ApiError(
        400,
        "Each report image must include a valid Cloudinary URL.",
      );
    }

    return {
      type: "image_url",
      image_url: {
        url: url.trim(),
      },
    };
  });
};

const extractTextFromResponse = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== "object") {
          return "";
        }

        if (typeof part.text === "string") {
          return part.text;
        }

        return "";
      })
      .join("\n");
  }

  if (content && typeof content === "object") {
    if (typeof content.text === "string") {
      return content.text;
    }

    if (typeof content.content === "string") {
      return content.content;
    }
  }

  return "";
};

const parseVisionJson = (responseContent) => {
  const rawText = extractTextFromResponse(responseContent);

  if (!rawText) {
    throw new ApiError(502, "The vision model returned an empty response.");
  }

  const cleanedText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleanedText);
  } catch (error) {
    throw new ApiError(
      502,
      `The vision model response could not be parsed as JSON: ${error.message}`,
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ApiError(502, "The vision model response must be a JSON object.");
  }

  return parsed;
};

const coerceStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim();
      }

      return String(entry ?? "").trim();
    })
    .filter(Boolean);
};

const validateVisionAnalysis = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(502, "The vision analysis payload is invalid.");
  }

  const category = String(payload.category ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const observations = coerceStringArray(payload.observations);
  const severityIndicators = coerceStringArray(payload.severityIndicators);
  const visibleHazardEvidence = coerceStringArray(
    payload.visibleHazardEvidence,
  );

  if (!ALLOWED_VISION_CATEGORIES.includes(category)) {
    throw new ApiError(
      502,
      `Invalid vision category: ${category || "missing"}.`,
    );
  }

  if (!description) {
    throw new ApiError(502, "The vision analysis description is missing.");
  }

  if (!Array.isArray(payload.observations) || !observations.length) {
    throw new ApiError(
      502,
      "The vision analysis observations array is missing or empty.",
    );
  }

  if (!Array.isArray(payload.severityIndicators)) {
    throw new ApiError(
      502,
      "The vision analysis severityIndicators array is missing .",
    );
  }

  if (!Array.isArray(payload.visibleHazardEvidence)) {
    throw new ApiError(
      502,
      "The vision analysis visibleHazardEvidence array is missing .",
    );
  }

  const confidenceValue = payload.confidence;

  if (
    typeof confidenceValue !== "number" ||
    !Number.isFinite(confidenceValue) ||
    confidenceValue < 0 ||
    confidenceValue > 1
  ) {
    throw new ApiError(
      502,
      "The vision analysis confidence must be a number between 0 and 1.",
    );
  }

  return {
    category,
    description,
    observations,
    severityIndicators,
    visibleHazardEvidence,
    confidence: confidenceValue,
  };
};

const analyzeReportImages = async (reportImages) => {
  const normalizedImages = normalizeImageList(reportImages);

  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: VISION_PROMPT,
            },
            ...normalizedImages,
          ],
        },
      ],
    });

    const messageContent = response?.choices?.[0]?.message?.content;
    const parsedPayload = parseVisionJson(messageContent);

    return validateVisionAnalysis(parsedPayload);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message = error?.message || "Vision analysis failed.";
    throw new ApiError(502, `Vision analysis failed: ${message}`);
  }
};

export {
  ALLOWED_VISION_CATEGORIES,
  analyzeReportImages,
  parseVisionJson,
  validateVisionAnalysis,
};
