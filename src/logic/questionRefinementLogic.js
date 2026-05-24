const INTENT_OPTIONS = [
  {
    id: "",
    label: "Auto-detect intent",
  },
  {
    id: "money",
    label: "Money / Profit / Business",
    methodHint: "GLDM",
    focusHint: "Asset",
    keywords: [
      "money",
      "profit",
      "income",
      "revenue",
      "sales",
      "sale",
      "business",
      "wealth",
      "financial",
      "paid",
      "paying",
      "earn",
      "earning",
      "app",
      "product",
      "launch",
      "customer",
      "client",
      "roi",
      "return",
    ],
  },
  {
    id: "career",
    label: "Career / Authority / Official Matter",
    methodHint: "RIDM",
    focusHint: "Officer",
    keywords: [
      "career",
      "job",
      "boss",
      "promotion",
      "license",
      "exam",
      "court",
      "legal",
      "official",
      "authority",
      "approval",
    ],
  },
  {
    id: "relationship",
    label: "Relationship / Person",
    methodHint: "RIDM",
    focusHint: "Officer",
    keywords: [
      "relationship",
      "partner",
      "marriage",
      "wife",
      "husband",
      "girlfriend",
      "boyfriend",
      "friend",
      "love",
      "family",
    ],
  },
  {
    id: "health",
    label: "Health / Body / Recovery",
    methodHint: "RIDM",
    focusHint: "Officer",
    keywords: [
      "health",
      "illness",
      "sick",
      "recovery",
      "pain",
      "body",
      "doctor",
      "medicine",
      "heal",
      "injury",
      "sleep",
      "energy",
    ],
  },
  {
    id: "home",
    label: "Home / Property / Document",
    methodHint: "RIDM",
    focusHint: "Parent",
    keywords: [
      "home",
      "house",
      "property",
      "apartment",
      "lease",
      "contract",
      "document",
      "paper",
      "vehicle",
      "car",
      "land",
    ],
  },
  {
    id: "creative",
    label: "Creative Output / Product / Children",
    methodHint: "GLDM",
    focusHint: "Offspring",
    keywords: [
      "create",
      "creative",
      "content",
      "video",
      "animation",
      "story",
      "product",
      "output",
      "children",
      "child",
      "result",
    ],
  },
  {
    id: "timing",
    label: "Timing / When",
    methodHint: "TDM",
    focusHint: "Using recommended focus",
    keywords: [
      "when",
      "timing",
      "date",
      "soon",
      "delay",
      "arrive",
      "happen",
      "finish",
      "complete",
      "receive",
      "within",
      "by",
    ],
  },
  {
    id: "lostObject",
    label: "Lost Object / Search",
    methodHint: "RIDM",
    focusHint: "Asset",
    keywords: [
      "lost",
      "missing",
      "find",
      "where",
      "object",
      "item",
      "phone",
      "wallet",
      "keys",
      "located",
    ],
  },
  {
    id: "personalReadiness",
    label: "Personal Readiness / Self-Cultivation",
    methodHint: "RIDM",
    focusHint: "Self",
    keywords: [
      "able",
      "maintain",
      "discipline",
      "consistent",
      "ready",
      "habit",
      "workout",
      "exercise",
      "meditation",
      "focus",
      "capacity",
      "lifestyle",
    ],
  },
  {
    id: "general",
    label: "General Outcome",
    methodHint: "GLDM",
    focusHint: "Using recommended focus",
    keywords: [],
  },
];

const EMOTION_WORDS = [
  "afraid",
  "fear",
  "worried",
  "worry",
  "anxious",
  "anxiety",
  "angry",
  "mad",
  "upset",
  "desperate",
  "panic",
  "hopeless",
  "ashamed",
  "shame",
  "doubt",
  "tired",
  "fatigue",
  "pressured",
  "urgent",
];

const ASSUMPTION_PHRASES = [
  "why is",
  "why am i",
  "why are they",
  "always",
  "never",
  "going to fail",
  "will fail",
  "wasting my time",
  "doesn't care",
  "do not care",
  "against me",
  "must be",
  "obviously",
  "clearly",
];

const TIMEFRAME_PATTERNS = [
  /\b\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
  /\bnext\s+(day|week|month|year|few days|few weeks|few months)\b/i,
  /\bwithin\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
  /\bwithin\s+(the\s+)?next\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
  /\bwithin\s+(the\s+)?next\s+(day|week|month|year|few days|few weeks|few months)\b/i,
  /\bby\s+(tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|the end|end of)\b/i,
  /\bthis\s+(week|month|year|quarter)\b/i,
  /\bin\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
];

function clean(value) {
  return String(value || "").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function hasAny(text, words) {
  const value = lower(text);
  return words.some((word) => value.includes(word));
}

function hasTimeframe(text) {
  const value = clean(text);
  return TIMEFRAME_PATTERNS.some((pattern) => pattern.test(value));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function stripTrailingQuestionMarks(text) {
  return clean(text).replace(/\?+$/g, "").trim();
}

function normalizeTimeframe(timeframe) {
  const value = lower(timeframe);

  if (!value) {
    return "";
  }

  const cleanupMap = {
    "three months": "the next three months",
    "3 months": "the next three months",
    "next three months": "the next three months",
    "next 3 months": "the next three months",
    "within next three months": "the next three months",
    "within the next three months": "the next three months",
    "within next 3 months": "the next three months",
    "within the next 3 months": "the next three months",
    "one month": "the next month",
    "1 month": "the next month",
    "next month": "the next month",
    "next week": "the next week",
    "one week": "the next week",
    "1 week": "the next week",
    "next year": "the next year",
    "one year": "the next year",
    "1 year": "the next year",
  };

  return cleanupMap[value] || clean(timeframe);
}

function removeDuplicateTimeframeFromQuestion(question, timeframe) {
  let result = stripTrailingQuestionMarks(question);
  const normalized = normalizeTimeframe(timeframe);

  if (!result || !normalized) {
    return result;
  }

  const duplicatePatterns = [
    /\s+within\s+next\s+three\s+months$/i,
    /\s+within\s+the\s+next\s+three\s+months$/i,
    /\s+in\s+three\s+months$/i,
    /\s+within\s+3\s+months$/i,
    /\s+within\s+the\s+next\s+3\s+months$/i,
    /\s+within\s+next\s+3\s+months$/i,
    /\s+next\s+three\s+months$/i,
    /\s+next\s+3\s+months$/i,
  ];

  duplicatePatterns.forEach((pattern) => {
    result = result.replace(pattern, "").trim();
  });

  return result;
}

function inferCleanSubject(rawQuestion, objectRole) {
  const raw = lower(rawQuestion);
  const object = clean(objectRole);

  if (object) {
    return object;
  }

  if (raw.includes("this app")) {
    return "this app";
  }

  if (raw.includes("wwg app")) {
    return "the WWG app";
  }

  if (raw.includes("app")) {
    return "the app";
  }

  return "the matter";
}

function inferOutcomePhrase(rawQuestion, clarifiedIntent, detectedIntentId) {
  const combined = lower(`${rawQuestion} ${clarifiedIntent}`);

  if (
    detectedIntentId === "money" ||
    combined.includes("money") ||
    combined.includes("profit") ||
    combined.includes("revenue") ||
    combined.includes("income")
  ) {
    return "generate profit";
  }

  if (combined.includes("make money")) {
    return "generate profit";
  }

  if (detectedIntentId === "relationship") {
    return "develop favorably";
  }

  if (detectedIntentId === "health") {
    return "improve";
  }

  if (detectedIntentId === "career") {
    return "produce a favorable career outcome";
  }

  if (detectedIntentId === "lostObject") {
    return "be found";
  }

  if (detectedIntentId === "personalReadiness") {
    return "be maintained successfully";
  }

  return "produce the desired outcome";
}

function detectQuestionForm(question) {
  const value = lower(question);

  if (!value) {
    return {
      isQuestionLike: false,
      type: "empty",
      label: "No question entered",
    };
  }

  if (
    value.startsWith("will ") ||
    value.startsWith("can ") ||
    value.startsWith("should ") ||
    value.startsWith("is ") ||
    value.startsWith("are ") ||
    value.startsWith("does ") ||
    value.startsWith("do ") ||
    value.startsWith("did ")
  ) {
    return {
      isQuestionLike: true,
      type: "yesNo",
      label: "Yes / No or outcome question",
    };
  }

  if (
    value.startsWith("when ") ||
    value.includes(" when ") ||
    value.startsWith("how soon")
  ) {
    return {
      isQuestionLike: true,
      type: "timing",
      label: "Timing question",
    };
  }

  if (
    value.startsWith("how ") ||
    value.startsWith("what ") ||
    value.startsWith("why ") ||
    value.startsWith("where ") ||
    value.startsWith("which ")
  ) {
    return {
      isQuestionLike: true,
      type: "open",
      label: "Open-ended question",
    };
  }

  if (value.endsWith("?")) {
    return {
      isQuestionLike: true,
      type: "general",
      label: "General question",
    };
  }

  return {
    isQuestionLike: false,
    type: "statement",
    label: "Statement-like wording",
  };
}

export function getQuestionIntentOptions() {
  return INTENT_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
  }));
}

export function detectQuestionIntent(question, selectedIntent = "") {
  if (selectedIntent) {
    const selected = INTENT_OPTIONS.find((option) => option.id === selectedIntent);

    if (selected) {
      return {
        id: selected.id,
        label: selected.label,
        methodHint: selected.methodHint,
        focusHint: selected.focusHint,
        source: "manual",
        matches: [],
      };
    }
  }

  const text = lower(question);

  const scored = INTENT_OPTIONS.filter((option) => option.id && option.keywords)
    .map((option) => {
      const matches = option.keywords.filter((keyword) => text.includes(keyword));

      return {
        ...option,
        score: matches.length,
        matches,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best || best.score === 0) {
    const fallback = INTENT_OPTIONS.find((option) => option.id === "general");

    return {
      id: "general",
      label: fallback.label,
      methodHint: fallback.methodHint,
      focusHint: fallback.focusHint,
      source: "default",
      matches: [],
    };
  }

  return {
    id: best.id,
    label: best.label,
    methodHint: best.methodHint,
    focusHint: best.focusHint,
    source: "detected",
    matches: best.matches,
  };
}

export function buildFinalCastingQuestionSuggestion({
  rawQuestion,
  clarifiedIntent,
  selfRole,
  objectRole,
  timeframe,
}) {
  const raw = clean(rawQuestion);
  const intent = clean(clarifiedIntent);
  const self = clean(selfRole);
  const object = clean(objectRole);
  const time = normalizeTimeframe(timeframe);

  if (!raw && !intent && !object) {
    return "";
  }

  const detectedIntent = detectQuestionIntent([raw, intent, object].join(" "));
  const cleanBase = removeDuplicateTimeframeFromQuestion(raw, time);

  if (detectedIntent.id === "money") {
    const subject = inferCleanSubject(raw, object);
    const cleanSubject =
      subject.toLowerCase() === "wwg app" ? "the WWG app" : subject;

    if (time) {
      return `Will ${cleanSubject} generate profit within ${time}?`;
    }

    return `Will ${cleanSubject} generate profit?`;
  }

  if (cleanBase && time && !hasTimeframe(raw)) {
    return `${cleanBase} within ${time}?`;
  }

  if (cleanBase && time && hasTimeframe(raw)) {
    return `${cleanBase} within ${time}?`;
  }

  if (raw) {
    return raw.endsWith("?") ? raw : `${raw}?`;
  }

  const outcomePhrase = inferOutcomePhrase(raw, intent, detectedIntent.id);

  if (intent && object && time) {
    return `Will ${object} ${outcomePhrase} for ${self || "me"} within ${time}?`;
  }

  if (object && time) {
    return `Will ${object} ${outcomePhrase} within ${time}?`;
  }

  return intent || object || "";
}

export function analyzeQuestionRefinement({
  rawQuestion,
  clarifiedIntent,
  knownFacts,
  assumptions,
  emotionalTone,
  selfRole,
  objectRole,
  timeframe,
  finalCastingQuestion,
  selectedIntent,
}) {
  const raw = clean(rawQuestion);
  const intentText = clean(clarifiedIntent);
  const facts = clean(knownFacts);
  const assumptionText = clean(assumptions);
  const emotion = clean(emotionalTone);
  const self = clean(selfRole);
  const object = clean(objectRole);
  const time = normalizeTimeframe(timeframe);

  const suggestedFinalQuestion = buildFinalCastingQuestionSuggestion({
    rawQuestion: raw,
    clarifiedIntent: intentText,
    selfRole: self,
    objectRole: object,
    timeframe: time,
  });

  const finalQuestion = clean(finalCastingQuestion || suggestedFinalQuestion);

  const detectedIntent = detectQuestionIntent(
    [finalQuestion, raw, intentText].join(" "),
    selectedIntent
  );

  const questionForm = detectQuestionForm(finalQuestion || raw);

  const warnings = [];
  const strengths = [];
  const qualityFlags = [];

  if (!raw) {
    warnings.push("Enter a raw question before refining the reading.");
  } else {
    strengths.push("Raw question entered.");
  }

  if (!questionForm.isQuestionLike) {
    warnings.push("Phrase the final casting question as a clear question.");
    qualityFlags.push("statement-like-question");
  } else {
    strengths.push(`Question form detected: ${questionForm.label}.`);
  }

  if (!intentText && detectedIntent.id === "general") {
    warnings.push("Clarify what outcome you are really asking about.");
    qualityFlags.push("missing-clarified-intent");
  } else {
    strengths.push("Intent is clarified or detected.");
  }

  if (!self) {
    warnings.push("Define Self so the chart knows the querent's position.");
    qualityFlags.push("missing-self");
  } else {
    strengths.push("Self is defined.");
  }

  if (!object) {
    warnings.push("Define the Object so the chart knows what is being judged.");
    qualityFlags.push("missing-object");
  } else {
    strengths.push("Object is defined.");
  }

  if (!time && !hasTimeframe(finalQuestion)) {
    warnings.push("Add a timeframe so the reading has a clear boundary.");
    qualityFlags.push("missing-timeframe");
  } else {
    strengths.push("Timeframe is defined.");
  }

  if (!facts) {
    warnings.push("Add at least one known fact to separate reality from assumption.");
    qualityFlags.push("missing-known-facts");
  } else {
    strengths.push("Known facts are recorded.");
  }

  const assumptionScanText = [raw, assumptionText, finalQuestion].join(" ");

  if (hasAny(assumptionScanText, ASSUMPTION_PHRASES)) {
    warnings.push(
      "The question may contain an assumption. Consider asking about the actual outcome instead."
    );
    qualityFlags.push("assumption-heavy");
  }

  if (assumptionText) {
    strengths.push("Assumptions have been named.");
  }

  const emotionScanText = [raw, emotion, finalQuestion].join(" ");

  if (hasAny(emotionScanText, EMOTION_WORDS)) {
    warnings.push(
      "Strong emotion may be influencing the wording. Keep the final question outcome-based."
    );
    qualityFlags.push("emotion-heavy");
  }

  if (emotion) {
    strengths.push("Emotional tone has been acknowledged.");
  }

  if (finalQuestion.length > 180) {
    warnings.push("The final casting question is long. Shorten it if possible.");
    qualityFlags.push("long-final-question");
  }

  if (finalQuestion && finalQuestion.length < 15) {
    warnings.push("The final casting question may be too short or vague.");
    qualityFlags.push("short-final-question");
  }

  const scoringItems = [
    { key: "raw-question", points: 15, passed: Boolean(raw) },
    { key: "question-form", points: 10, passed: questionForm.isQuestionLike },
    {
      key: "clear-intent",
      points: 15,
      passed: Boolean(intentText || detectedIntent.id !== "general"),
    },
    { key: "self-defined", points: 15, passed: Boolean(self) },
    { key: "object-defined", points: 15, passed: Boolean(object) },
    {
      key: "timeframe-defined",
      points: 15,
      passed: Boolean(time || hasTimeframe(finalQuestion)),
    },
    { key: "grounded-facts", points: 10, passed: Boolean(facts) },
    {
      key: "low-distortion",
      points: 5,
      passed:
        !qualityFlags.includes("assumption-heavy") &&
        !qualityFlags.includes("emotion-heavy"),
    },
  ];

  const clarityScore = scoringItems.reduce(
    (total, item) => total + (item.passed ? item.points : 0),
    0
  );

  let readinessLabel = "Too vague for reliable coding";

  if (clarityScore >= 85) {
    readinessLabel = "Ready to cast";
  } else if (clarityScore >= 70) {
    readinessLabel = "Usable but could be sharper";
  } else if (clarityScore >= 50) {
    readinessLabel = "Needs refinement";
  }

  const methodHints = unique([detectedIntent.methodHint]);
  const focusHints = unique([detectedIntent.focusHint]);

  const readyToCast =
    clarityScore >= 70 &&
    Boolean(finalQuestion) &&
    Boolean(self) &&
    Boolean(object) &&
    Boolean(time || hasTimeframe(finalQuestion));

  return {
    rawQuestion: raw,
    clarifiedIntent: intentText,
    knownFacts: facts,
    assumptions: assumptionText,
    emotionalTone: emotion,
    selfRole: self,
    objectRole: object,
    timeframe: time,
    finalCastingQuestion: finalQuestion,
    suggestedFinalQuestion,
    selectedIntent: selectedIntent || "",
    detectedIntent,
    questionForm,
    warnings,
    strengths,
    qualityFlags,
    scoringItems,
    clarityScore,
    readinessLabel,
    readyToCast,
    methodHints,
    focusHints,
  };
}

export function buildQuestionRefinementSummary(refinement) {
  if (!refinement) {
    return "QUESTION REFINEMENT\nNo refinement data available.";
  }

  return `QUESTION REFINEMENT

Raw Question:
${refinement.rawQuestion || "Not set"}

Clarified Intent:
${refinement.clarifiedIntent || "Not set"}

Detected Intent:
${refinement.detectedIntent?.label || "General Outcome"}

Known Facts:
${refinement.knownFacts || "Not set"}

Assumptions:
${refinement.assumptions || "None recorded"}

Emotional Tone:
${refinement.emotionalTone || "Not recorded"}

Self:
${refinement.selfRole || "Not set"}

Object:
${refinement.objectRole || "Not set"}

Timeframe:
${refinement.timeframe || "Not set"}

Final Casting Question:
${refinement.finalCastingQuestion || "Not set"}

Question Quality:
${refinement.clarityScore}/100 — ${refinement.readinessLabel}

Ready to Cast:
${refinement.readyToCast ? "Yes" : "No"}

Method Hints:
${
  refinement.methodHints?.length
    ? refinement.methodHints.join(", ")
    : "No method hint"
}

Focus Hints:
${
  refinement.focusHints?.length
    ? refinement.focusHints.join(", ")
    : "No focus hint"
}

Warnings:
${
  refinement.warnings?.length
    ? refinement.warnings.map((warning) => `- ${warning}`).join("\n")
    : "No warnings"
}`;
}