const normalizeArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const TECHNICAL_TEXT_PATTERNS = [
  /\bembedding(s)?\b/gi,
  /\bcosine similarity\b/gi,
  /\bsimilarity\s*[:=]?\s*\d+(?:\.\d+)?/gi,
  /\bduplicate score\b/gi,
  /\bpriority score\b/gi,
  /\bconfidence\s*[:=]?\s*\d+(?:\.\d+)?/gi,
  /\b\d+(?:\.\d+)?\s*km\b/gi,
  /\b\d+(?:\.\d+)?\s*hours?\s*apart\b/gi,
  /\bsemantic similarity\b/gi,
  /\bNLP\b/g,
  /\bVision\b/g,
];

const sanitizeAuthorityText = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  let nextValue = value.trim();

  TECHNICAL_TEXT_PATTERNS.forEach((pattern) => {
    nextValue = nextValue.replace(pattern, "");
  });

  return nextValue.replace(/\s{2,}/g, " ").replace(/\s+([,.;])/g, "$1").trim();
};

const formatHazardLabel = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  return value
    .trim()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getEvidencePresentation = (evidence) => {
  if (!evidence || typeof evidence !== "object") {
    return {
      available: false,
      title: "Evidence assessment is not available for this report.",
      detail: "",
      tone: "default",
    };
  }

  const consistency = String(evidence.consistency || "").toLowerCase();

  if (consistency === "consistent") {
    return {
      available: true,
      title: "Evidence appears consistent",
      detail: "The submitted image and description support the same reported hazard.",
      tone: "positive",
    };
  }

  if (consistency === "contradictory") {
    return {
      available: true,
      title: "Evidence may be inconsistent",
      detail:
        "The submitted description and visible image do not appear to support the same reported hazard.",
      tone: "caution",
    };
  }

  if (consistency === "uncertain") {
    return {
      available: true,
      title: "Evidence is inconclusive",
      detail:
        "The available image and description do not provide enough consistent evidence to make a clear assessment.",
      tone: "caution",
    };
  }

  return {
    available: false,
    title: "Evidence assessment is not available for this report.",
    detail: "",
    tone: "default",
  };
};

const getPriorityLabel = (intelligence) => {
  const existingLevel = intelligence?.priorityLevel || intelligence?.priority?.level;
  if (existingLevel) {
    return String(existingLevel).toUpperCase();
  }

  const score = intelligence?.priorityScore;
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return "Not available";
  }

  if (score <= 24) return "LOW";
  if (score <= 49) return "MEDIUM";
  if (score <= 74) return "HIGH";
  return "CRITICAL";
};

const buildReportedIndicators = (nlp) => {
  const hazardSignals = normalizeArray(nlp?.hazardSignals).map((item) => String(item));
  const severityIndicators = normalizeArray(nlp?.severityIndicators).map((item) => String(item));
  const keywords = normalizeArray(nlp?.keywords).map((item) => String(item));

  const combined = [...hazardSignals, ...severityIndicators, ...keywords];
  const unique = [];

  combined.forEach((item) => {
    const normalized = item.trim();
    if (!normalized) {
      return;
    }

    if (!unique.some((existing) => existing.toLowerCase() === normalized.toLowerCase())) {
      unique.push(normalized);
    }
  });

  return unique.slice(0, 8);
};

const buildSuggestedNextStep = (intelligence) => {
  const recommendation = sanitizeAuthorityText(intelligence?.recommendation || "");
  if (recommendation) {
    return recommendation;
  }

  const evidence = getEvidencePresentation(intelligence?.evidenceConsistency);
  if (evidence.available && evidence.tone === "caution") {
    return "Review the submitted evidence carefully and verify the reported hazard before deciding the next action.";
  }

  return "No suggested next step is available.";
};

const buildAssessmentNotes = (intelligence) => {
  const summary = sanitizeAuthorityText(intelligence?.summary || "");
  if (summary) {
    return summary;
  }

  const reasoning = sanitizeAuthorityText(intelligence?.reasoning || "");
  if (reasoning) {
    return reasoning;
  }

  const notes = [];
  const vision = intelligence?.visionAnalysis || {};
  const hazardLabel = formatHazardLabel(vision.category || intelligence?.hazardType);

  if (vision.description) {
    notes.push(String(vision.description).trim());
  } else if (hazardLabel) {
    notes.push(`Available evidence indicates a reported ${hazardLabel.toLowerCase()} concern.`);
  }

  const duplicate = intelligence?.duplicateAnalysis || {};
  const historical = duplicate.historicalRecurrence || {};
  const relatedCount = normalizeArray(duplicate.matchedReports).length;

  if (relatedCount > 0) {
    notes.push(
      `${relatedCount} related report${relatedCount === 1 ? "" : "s"} ${relatedCount === 1 ? "was" : "were"} identified nearby.`,
    );
  }

  if (historical.previousIncidents > 0) {
    notes.push(
      `${historical.previousIncidents} previous related incident${historical.previousIncidents === 1 ? "" : "s"} ${historical.previousIncidents === 1 ? "was" : "were"} found in this area.`,
    );
  }

  const evidence = getEvidencePresentation(intelligence?.evidenceConsistency);
  if (evidence.available) {
    notes.push(evidence.detail);
  }

  if (notes.length === 0) {
    return "No assessment notes are available.";
  }

  notes.push("Field verification is recommended before making a final authority decision.");

  return notes.join(" ");
};

export {
  buildAssessmentNotes,
  buildReportedIndicators,
  buildSuggestedNextStep,
  formatHazardLabel,
  getEvidencePresentation,
  getPriorityLabel,
  normalizeArray,
  sanitizeAuthorityText,
};
