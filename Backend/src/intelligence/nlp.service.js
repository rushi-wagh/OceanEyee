import { client } from "../utils/openrouter.js";
import { ApiError } from "../utils/ApiError.js";

const MODEL_NAME = "inclusionai/ling-3.0-flash-vl:free";

const NLP_PROMPT = `
Analyze only the citizen's written description for marine-incident signals.

Return ONLY valid JSON in this exact structure:

{
  "hazardSignals": ["string"],
  "keywords": ["string"],
  "severityIndicators": ["string"],
  "entities": ["string"],
  "confidence": 0.0
}

Rules:
1. Analyze only the citizen description.
2. Extract what the citizen claims or describes.
3. Never verify whether the claim is true.
4. Never use image information.
5. Never infer information from location coordinates.
6. Never invent hazards, severity, entities, or events.
7. Preserve uncertainty when the description is ambiguous.
8. Use neutral language.
9. hazardSignals are possible marine hazards mentioned or strongly implied by the citizen's description. These are citizen claims/signals, not verified facts.
10. keywords should be useful terms for incident processing and search/classification.
11. severityIndicators must be only explicit textual indicators of scale, intensity, quantity, spread, urgency, casualties, damage, or impact. Examples: "large amount", "spreading across the surface", "many animals affected", "strong smell". Do not treat location/context as severity unless explicitly connected to scale, spread, damage, or impact.
12. entities should be relevant locations, objects, groups, or named entities explicitly mentioned. Do not invent them.
13. confidence is the model confidence in the NLP extraction/classification itself, not confidence that the citizen is telling the truth.
14. confidence must be a number between 0 and 1.
15. Empty arrays are valid.
16. Return ONLY valid JSON. No markdown fences or explanatory text outside the JSON.
`;

const validateStringArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw new ApiError(
      502,
      `The NLP analysis ${fieldName} field is invalid.`,
    );
  }

  if (!value.every((entry) => typeof entry === "string")) {
    throw new ApiError(
      502,
      `The NLP analysis ${fieldName} field must contain only strings.`,
    );
  }

  return value.map((entry) => entry.trim()).filter(Boolean);
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

const parseNlpJson = (responseContent) => {
  const rawText = extractTextFromResponse(responseContent);

  if (!rawText) {
    throw new ApiError(502, "The NLP model returned an empty response.");
  }

  const cleanedText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleanedText);
  } catch (error) {
    throw new ApiError(
      502,
      `The NLP model response could not be parsed as JSON: ${error.message}`,
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new ApiError(
      502,
      "The NLP model response must be a JSON object.",
    );
  }

  return parsed;
};

const validateNlpAnalysis = (payload) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new ApiError(502, "The NLP analysis payload is invalid.");
  }

  const hazardSignals = validateStringArray(
    payload.hazardSignals,
    "hazardSignals",
  );

  const keywords = validateStringArray(
    payload.keywords,
    "keywords",
  );

  const severityIndicators = validateStringArray(
    payload.severityIndicators,
    "severityIndicators",
  );

  const entities = validateStringArray(
    payload.entities,
    "entities",
  );

  const confidenceValue = payload.confidence;

  if (
    typeof confidenceValue !== "number" ||
    !Number.isFinite(confidenceValue) ||
    confidenceValue < 0 ||
    confidenceValue > 1
  ) {
    throw new ApiError(
      502,
      "The NLP analysis confidence must be a number between 0 and 1.",
    );
  }

  return {
    hazardSignals,
    keywords,
    severityIndicators,
    entities,
    confidence: confidenceValue,
  };
};

const analyzeDescription = async (description) => {
  if (typeof description !== "string") {
    throw new ApiError(400, "Description must be a non-empty string.");
  }

  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    throw new ApiError(400, "Description must be a non-empty string.");
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `${NLP_PROMPT}

Citizen description:
${trimmedDescription}`,
        },
      ],
    });

    const messageContent =
      response?.choices?.[0]?.message?.content;

    const parsedPayload = parseNlpJson(messageContent);

    return validateNlpAnalysis(parsedPayload);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error?.message || "NLP analysis failed.";

    throw new ApiError(
      502,
      `NLP analysis failed: ${message}`,
    );
  }
};

export {
  analyzeDescription,
  parseNlpJson,
  validateNlpAnalysis,
};