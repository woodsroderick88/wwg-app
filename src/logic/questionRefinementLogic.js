const INTENT_OPTIONS = [
  { id: "", label: "Auto-detect intent" },
  {
    id: "housing",
    label: "Home / Housing / Shelter",
    methodHint: "ADM",
    focusHint: "Parent-line",
    keywords: [
      "housing",
      "apartment",
      "government apartment",
      "government housing",
      "public housing",
      "section 8",
      "voucher",
      "shelter",
      "home",
      "house",
      "lease",
      "rental",
      "rent",
      "landlord",
      "tenant",
      "application",
      "apply for housing",
      "housing application",
      "approved for housing",
      "secure housing",
      "secure a government apartment",
      "full apartment",
      "northside",
    ],
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
      "business",
      "wealth",
      "financial",
      "paid",
      "earn",
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
    id: "discharge",
    label: "Institution / Discharge / Release",
    methodHint: "TDM",
    focusHint: "Moving line",
    keywords: [
      "nursing home",
      "hospital",
      "facility",
      "institution",
      "rehab",
      "care home",
      "assisted living",
      "placement",
      "custody",
      "detention",
      "court",
      "courts",
      "judge",
      "legal",
      "released",
      "release",
      "discharged",
      "discharge",
      "get out",
      "leave",
      "come home",
      "return home",
      "move out",
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
      "therese",
      "dating",
      "stability",
      "stable",
      "develop",
      "positively",
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
    methodHint: "ADM",
    focusHint: "Parent-line",
    keywords: [
      "property",
      "contract",
      "document",
      "paper",
      "vehicle",
      "car",
      "land",
      "housing",
      "apartment",
      "government housing",
      "government apartment",
      "public housing",
      "lease",
      "rental",
      "home",
      "house",
      "shelter",
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
    focusHint: "Moving line",
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
  /\bnext\s+(day|week|month|year|few days|few weeks|few months|twelve months|12 months|three years|3 years)\b/i,
  /\bover\s+(the\s+)?next\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
  /\bover\s+(the\s+)?next\s+(day|week|month|year|few days|few weeks|few months|twelve months|12 months|three years|3 years)\b/i,
  /\bwithin\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
  /\bwithin\s+(the\s+)?next\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
  /\bwithin\s+(the\s+)?next\s+(day|week|month|year|few days|few weeks|few months|twelve months|12 months|three years|3 years)\b/i,
  /\bby\s+(tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|the end|end of)\b/i,
  /\bthis\s+(week|month|year|quarter)\b/i,
  /\bin\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
  /\bin\s+(the\s+)?next\s+(day|week|month|year|few days|few weeks|few months|twelve months|12 months|three years|3 years)\b/i,
];

function clean(value) {
  return String(value || "").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function normalizeSpaces(text) {
  return clean(text).replace(/\s+/g, " ");
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

function addQuestionMark(text) {
  const value = stripTrailingQuestionMarks(text);
  return value ? `${value}?` : "";
}

function normalizeTimeframe(timeframe) {
  const value = lower(timeframe)
    .replace(/\s+/g, " ")
    .replace(/^within\s+/i, "")
    .replace(/^over\s+/i, "")
    .replace(/^in\s+/i, "")
    .trim();

  if (!value) return "";

  const cleanupMap = {
    "three months": "the next three months",
    "3 months": "the next three months",
    "next three months": "the next three months",
    "the next three months": "the next three months",
    "next 3 months": "the next three months",
    "the next 3 months": "the next three months",
    "in the next three months": "the next three months",

    "twelve months": "the next twelve months",
    "12 months": "the next twelve months",
    "next twelve months": "the next twelve months",
    "the next twelve months": "the next twelve months",
    "next 12 months": "the next twelve months",
    "the next 12 months": "the next twelve months",

    "one month": "the next month",
    "1 month": "the next month",
    "next month": "the next month",
    "the next month": "the next month",

    "next week": "the next week",
    "the next week": "the next week",
    "one week": "the next week",
    "1 week": "the next week",

    "next year": "the next year",
    "the next year": "the next year",
    "one year": "the next year",
    "1 year": "the next year",

    "three years": "the next three years",
    "3 years": "the next three years",
    "next three years": "the next three years",
    "the next three years": "the next three years",
    "next 3 years": "the next three years",
    "the next 3 years": "the next three years",
  };

  return cleanupMap[value] || value;
}

function extractTimeframeFromQuestion(rawQuestion) {
  const raw = clean(rawQuestion);

  const patterns = [
    /\bwithin\s+(the\s+)?next\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
    /\bwithin\s+(the\s+)?next\s+(day|week|month|year|few days|few weeks|few months|three months|twelve months|three years)\b/i,
    /\bin\s+(the\s+)?next\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
    /\bin\s+(the\s+)?next\s+(day|week|month|year|few days|few weeks|few months|three months|twelve months|three years)\b/i,
    /\bover\s+(the\s+)?next\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
    /\bover\s+(the\s+)?next\s+(day|week|month|year|few days|few weeks|few months|three months|twelve months|three years)\b/i,
    /\bnext\s+\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
    /\bnext\s+(day|week|month|year|few days|few weeks|few months|three months|twelve months|three years)\b/i,
    /\b\d+\s*(day|days|week|weeks|month|months|year|years)\b/i,
  ];

  const match = patterns.map((pattern) => raw.match(pattern)).find(Boolean);

  if (!match?.[0]) return "";

  return normalizeTimeframe(match[0]);
}

function timeframeToRegexText(timeframe) {
  return normalizeTimeframe(timeframe)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
}

function removeDuplicateTimeframeFromQuestion(question, timeframe = "") {
  let result = stripTrailingQuestionMarks(question);
  const normalizedTimeframe = normalizeTimeframe(timeframe);
  const timeframePatternText = timeframeToRegexText(normalizedTimeframe);

  if (timeframePatternText) {
    [
      new RegExp(`\\s+within\\s+${timeframePatternText}$`, "i"),
      new RegExp(`\\s+over\\s+${timeframePatternText}$`, "i"),
      new RegExp(`\\s+in\\s+${timeframePatternText}$`, "i"),
      new RegExp(`\\s+${timeframePatternText}$`, "i"),
    ].forEach((pattern) => {
      result = result.replace(pattern, "").trim();
    });
  }

  [
    /\s+within\s+over\s+the\s+next\s+[a-z0-9\s]+$/i,
    /\s+within\s+the\s+next\s+three\s+months$/i,
    /\s+within\s+next\s+three\s+months$/i,
    /\s+within\s+the\s+next\s+twelve\s+months$/i,
    /\s+within\s+next\s+twelve\s+months$/i,
    /\s+within\s+the\s+next\s+three\s+years$/i,
    /\s+within\s+next\s+three\s+years$/i,
    /\s+over\s+the\s+next\s+twelve\s+months$/i,
    /\s+over\s+next\s+twelve\s+months$/i,
    /\s+over\s+the\s+next\s+three\s+years$/i,
    /\s+over\s+next\s+three\s+years$/i,
    /\s+in\s+the\s+next\s+twelve\s+months$/i,
    /\s+in\s+next\s+twelve\s+months$/i,
    /\s+in\s+the\s+next\s+three\s+years$/i,
    /\s+in\s+next\s+three\s+years$/i,
    /\s+in\s+three\s+months$/i,
    /\s+in\s+twelve\s+months$/i,
    /\s+in\s+three\s+years$/i,
    /\s+next\s+three\s+months$/i,
    /\s+next\s+twelve\s+months$/i,
    /\s+next\s+three\s+years$/i,
  ].forEach((pattern) => {
    result = result.replace(pattern, "").trim();
  });

  return normalizeSpaces(result);
}

function questionAlreadyEndsWithTimeframe(question, timeframe) {
  const value = lower(stripTrailingQuestionMarks(question));
  const normalizedTimeframe = lower(normalizeTimeframe(timeframe));

  if (!value || !normalizedTimeframe) return false;

  return (
    value.endsWith(`within ${normalizedTimeframe}`) ||
    value.endsWith(`over ${normalizedTimeframe}`) ||
    value.endsWith(`in ${normalizedTimeframe}`) ||
    value.endsWith(normalizedTimeframe)
  );
}

function relationshipOutcomeAlreadyPresent(question) {
  const value = lower(question);

  return (
    value.includes("remain stable and develop positively") ||
    value.includes("remain stable") ||
    value.includes("develop positively") ||
    value.includes("stable and develop")
  );
}

function removeRelationshipOutcomeFromBase(question) {
  return normalizeSpaces(
    stripTrailingQuestionMarks(question)
      .replace(/\s+remain\s+stable\s+and\s+develop\s+positively\b/gi, "")
      .replace(/\s+remain\s+stable\b/gi, "")
      .replace(/\s+develop\s+positively\b/gi, "")
  );
}

function cleanRelationshipQuestion(question, timeframe) {
  let result = normalizeSpaces(stripTrailingQuestionMarks(question));

  result = result.replace(
    /\bremain\s+stable\s+and\s+develop\s+positively\s+remain\s+stable\s+and\s+develop\s+positively\b/gi,
    "remain stable and develop positively"
  );

  result = result.replace(
    /\bremain\s+stable\s+remain\s+stable\b/gi,
    "remain stable"
  );

  result = result.replace(
    /\bdevelop\s+positively\s+develop\s+positively\b/gi,
    "develop positively"
  );

  const normalizedTimeframe = normalizeTimeframe(timeframe);

  if (normalizedTimeframe) {
    const escapedTimeframe = timeframeToRegexText(normalizedTimeframe);

    result = result.replace(
      new RegExp(
        `(within|over|in)\\s+${escapedTimeframe}\\s+(within|over|in)\\s+${escapedTimeframe}$`,
        "i"
      ),
      `over ${normalizedTimeframe}`
    );

    result = result.replace(
      new RegExp(
        `(within|over|in)\\s+${escapedTimeframe}\\s+${escapedTimeframe}$`,
        "i"
      ),
      `over ${normalizedTimeframe}`
    );
  }

  return addQuestionMark(result);
}

function inferRelationshipSubject(rawQuestion, objectRole) {
  const raw = clean(rawQuestion);
  const object = clean(objectRole);

  const relationshipMatch = raw.match(
    /relationship\s+with\s+([^?]+?)(?:\s+in\s+|\s+over\s+|\s+within\s+|$)/i
  );

  if (relationshipMatch?.[1]) {
    return `my relationship with ${relationshipMatch[1].trim()}`;
  }

  if (object.toLowerCase().includes("therese")) {
    return "my relationship with Therese";
  }

  if (object.toLowerCase().includes("relationship")) {
    return "my relationship";
  }

  return object || "the relationship";
}

function inferCleanSubject(rawQuestion, objectRole) {
  const raw = lower(rawQuestion);
  const object = clean(objectRole);

  if (object) return object;
  if (raw.includes("this app")) return "this app";
  if (raw.includes("wwg app")) return "the WWG app";
  if (raw.includes("app")) return "the app";

  return "the matter";
}

function isLegalDischargeQuestion(rawQuestion) {
  const value = lower(rawQuestion);
  return (
    value.includes("court") ||
    value.includes("courts") ||
    value.includes("judge") ||
    value.includes("legal")
  );
}

function inferDischargePerson(rawQuestion, selfRole) {
  const raw = clean(rawQuestion);
  const self = clean(selfRole);

  if (self) return self;

  const legalReleaseMatch = raw.match(
    /\b(?:court|courts|judge|legal authority|legal system)\s+(?:will\s+)?release\s+([A-Z][a-zA-Z'-]*(?:\s+[A-Z][a-zA-Z'-]*)*)\s+from\b/i
  );

  if (legalReleaseMatch?.[1]) {
    return legalReleaseMatch[1].trim();
  }

  const releaseMatch = raw.match(
    /\brelease\s+([A-Z][a-zA-Z'-]*(?:\s+[A-Z][a-zA-Z'-]*)*)\s+from\b/i
  );

  if (releaseMatch?.[1]) {
    return releaseMatch[1].trim();
  }

  const dischargedMatch = raw.match(
    /\bwill\s+([A-Z][a-zA-Z'-]*(?:\s+[A-Z][a-zA-Z'-]*)*)\s+be\s+(?:discharged|released)\b/i
  );

  if (dischargedMatch?.[1]) {
    return dischargedMatch[1].trim();
  }

  const getOutMatch = raw.match(
    /\bwill\s+([A-Z][a-zA-Z'-]*(?:\s+[A-Z][a-zA-Z'-]*)*)\s+(?:get out|leave|come home|return home|move out)\b/i
  );

  if (getOutMatch?.[1]) {
    return getOutMatch[1].trim();
  }

  const namedPersonMatch = raw.match(/\b(Therese)\b/i);
  if (namedPersonMatch?.[1]) {
    return namedPersonMatch[1];
  }

  return "the person";
}

function inferInstitution(rawQuestion, objectRole) {
  const rawOriginal = clean(rawQuestion);
  const raw = lower(rawQuestion);
  const object = clean(objectRole);

  const fromMatch = rawOriginal.match(
    /from\s+(the\s+)?([^?]+?)(?:\s+in\s+|\s+within\s+|\s+over\s+|\s+by\s+|$)/i
  );

  if (fromMatch?.[2]) {
    const place = fromMatch[2].trim();
    if (place && !/court|judge|legal|release/i.test(place)) {
      return `${fromMatch[1] || ""}${place}`.trim();
    }
  }

  const institutionPatterns = [
    "nursing home",
    "hospital",
    "facility",
    "institution",
    "rehab",
    "care home",
    "assisted living",
    "placement",
    "custody",
    "detention",
  ];

  const found = institutionPatterns.find((item) => raw.includes(item));

  if (found) {
    if (
      found === "nursing home" ||
      found === "hospital" ||
      found === "facility" ||
      found === "institution" ||
      found === "rehab"
    ) {
      return `the ${found}`;
    }

    return found;
  }

  if (object) {
    const cleanedObject = object.split("/")[0].trim();
    if (cleanedObject && !/court|judge|legal|release/i.test(cleanedObject)) {
      return cleanedObject;
    }
  }

  return "the institution";
}

function cleanDischargeQuestion(question, timeframe) {
  let result = normalizeSpaces(stripTrailingQuestionMarks(question));
  const normalizedTimeframe = normalizeTimeframe(timeframe);

  result = result
    .replace(/\s+\/\s+court\s+release/gi, "")
    .replace(/\s+\/\s+legal\s+release/gi, "")
    .replace(/\s+\/\s+release/gi, "")
    .replace(/\s+from\s+Courts\b/g, " by the courts")
    .replace(/\s+from\s+Court\b/g, " by the court")
    .replace(/\bfrom\s+nursing home\b/gi, "from the nursing home")
    .replace(/\bfrom\s+hospital\b/gi, "from the hospital")
    .replace(/\bfrom\s+facility\b/gi, "from the facility");

  if (normalizedTimeframe) {
    const escapedTimeframe = timeframeToRegexText(normalizedTimeframe);

    result = result.replace(
      new RegExp(
        `(within|over|in)\\s+${escapedTimeframe}\\s+(within|over|in)\\s+${escapedTimeframe}$`,
        "i"
      ),
      `within ${normalizedTimeframe}`
    );

    result = result.replace(
      new RegExp(
        `(within|over|in)\\s+${escapedTimeframe}\\s+${escapedTimeframe}$`,
        "i"
      ),
      `within ${normalizedTimeframe}`
    );
  }

  return addQuestionMark(result);
}

function buildLegalDischargeQuestion(rawQuestion, selfRole, objectRole, timeframe) {
  const person = inferDischargePerson(rawQuestion, selfRole);
  const institution = inferInstitution(rawQuestion, objectRole);
  const time = normalizeTimeframe(timeframe) || extractTimeframeFromQuestion(rawQuestion);

  const baseQuestion = `Will the courts release ${person} from ${institution}`;

  return cleanDischargeQuestion(
    time ? `${baseQuestion} within ${time}` : baseQuestion,
    time
  );
}

function inferHousingSubject(rawQuestion, objectRole) {
  const raw = lower(rawQuestion);
  const object = lower(objectRole);

  if (
    raw.includes("government apartment") ||
    object.includes("government apartment") ||
    raw.includes("full apartment") ||
    object.includes("full apartment")
  ) {
    return "government housing";
  }

  if (raw.includes("government housing") || object.includes("government housing")) {
    return "government housing";
  }

  if (raw.includes("public housing") || object.includes("public housing")) {
    return "public housing";
  }

  if (raw.includes("section 8") || object.includes("section 8")) {
    return "Section 8 housing";
  }

  if (raw.includes("apartment") || object.includes("apartment")) {
    return "housing";
  }

  if (raw.includes("shelter") || object.includes("shelter")) {
    return "shelter";
  }

  return clean(objectRole) || "housing";
}

function buildHousingQuestion(rawQuestion, objectRole, timeframe) {
  const time = normalizeTimeframe(timeframe) || extractTimeframeFromQuestion(rawQuestion);
  const housingSubject = inferHousingSubject(rawQuestion, objectRole);

  const raw = lower(rawQuestion);
  const approvalLanguage =
    raw.includes("approved") ||
    raw.includes("application") ||
    raw.includes("apply") ||
    raw.includes("government") ||
    raw.includes("public housing") ||
    raw.includes("section 8");

  const baseQuestion = approvalLanguage
    ? `Will I be approved for ${housingSubject}`
    : `Will I secure ${housingSubject}`;

  return addQuestionMark(time ? `${baseQuestion} within ${time}` : baseQuestion);
}

function inferOutcomePhrase(rawQuestion, clarifiedIntent, detectedIntentId) {
  const combined = lower(`${rawQuestion} ${clarifiedIntent}`);

  if (detectedIntentId === "housing" || detectedIntentId === "home") {
    return "be secured";
  }

  if (
    detectedIntentId === "money" ||
    combined.includes("money") ||
    combined.includes("profit") ||
    combined.includes("revenue") ||
    combined.includes("income") ||
    combined.includes("make money")
  ) {
    return "generate profit";
  }

  if (detectedIntentId === "discharge") return "be discharged";
  if (detectedIntentId === "relationship") {
    return "remain stable and develop positively";
  }
  if (detectedIntentId === "health") return "improve";
  if (detectedIntentId === "career") {
    return "produce a favorable career outcome";
  }
  if (detectedIntentId === "lostObject") return "be found";
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
    const selected = INTENT_OPTIONS.find(
      (option) => option.id === selectedIntent
    );

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
      const matches = option.keywords.filter((keyword) =>
        text.includes(keyword)
      );

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
  const inferredTime = extractTimeframeFromQuestion(raw);
  const time = normalizeTimeframe(timeframe) || inferredTime;

  if (!raw && !intent && !object) return "";

  const detectedIntent = detectQuestionIntent([raw, intent, object].join(" "));
  const cleanBase = removeDuplicateTimeframeFromQuestion(raw, time);

  if (detectedIntent.id === "housing" || detectedIntent.id === "home") {
    return buildHousingQuestion(raw, object, time);
  }

  if (detectedIntent.id === "money") {
    const subject = inferCleanSubject(raw, object);
    const cleanSubject =
      subject.toLowerCase() === "wwg app" ? "the WWG app" : subject;

    if (time && !questionAlreadyEndsWithTimeframe(raw, time)) {
      return `Will ${cleanSubject} generate profit within ${time}?`;
    }

    if (time && questionAlreadyEndsWithTimeframe(raw, time)) {
      return addQuestionMark(cleanBase || raw);
    }

    return `Will ${cleanSubject} generate profit?`;
  }

  if (detectedIntent.id === "discharge") {
    if (isLegalDischargeQuestion(raw)) {
      return buildLegalDischargeQuestion(raw, self, object, time);
    }

    const person = inferDischargePerson(raw, self);
    const institution = inferInstitution(raw, object);

    if (time) {
      return cleanDischargeQuestion(
        `Will ${person} be discharged from ${institution} within ${time}`,
        time
      );
    }

    return cleanDischargeQuestion(
      `Will ${person} be discharged from ${institution}`,
      time
    );
  }

  if (detectedIntent.id === "relationship") {
    const normalizedRaw = cleanRelationshipQuestion(raw, time);

    if (
      raw &&
      relationshipOutcomeAlreadyPresent(raw) &&
      questionAlreadyEndsWithTimeframe(raw, time)
    ) {
      return normalizedRaw;
    }

    const relationshipSubject = inferRelationshipSubject(
      removeRelationshipOutcomeFromBase(raw),
      object
    );

    const baseRelationshipQuestion = `Will ${relationshipSubject} remain stable and develop positively`;

    if (time) {
      return cleanRelationshipQuestion(
        `${baseRelationshipQuestion} over ${time}`,
        time
      );
    }

    return cleanRelationshipQuestion(baseRelationshipQuestion, time);
  }

  const outcomePhrase = inferOutcomePhrase(raw, intent, detectedIntent.id);

  if (cleanBase && time && !hasTimeframe(raw)) {
    return `${cleanBase} within ${time}?`;
  }

  if (cleanBase && time && hasTimeframe(raw)) {
    if (questionAlreadyEndsWithTimeframe(raw, time)) {
      return addQuestionMark(raw);
    }

    if (cleanBase.toLowerCase().startsWith("will ")) {
      return `${cleanBase} within ${time}?`;
    }

    return `Will ${object || "the matter"} ${outcomePhrase} within ${time}?`;
  }

  if (raw) {
    return raw.endsWith("?") ? raw : `${raw}?`;
  }

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

  const inferredTimeframe = extractTimeframeFromQuestion(raw);
  const preliminaryIntent = detectQuestionIntent(
    [raw, intentText, objectRole].join(" "),
    selectedIntent
  );

  const inferredSelf =
    preliminaryIntent.id === "discharge" ? inferDischargePerson(raw, selfRole) : "";

  const inferredObject =
    preliminaryIntent.id === "discharge"
      ? inferInstitution(raw, objectRole)
      : preliminaryIntent.id === "housing" || preliminaryIntent.id === "home"
      ? inferHousingSubject(raw, objectRole)
      : "";

  const self = clean(selfRole) || (inferredSelf !== "the person" ? inferredSelf : "");

  const object =
    clean(objectRole) ||
    (inferredObject !== "the institution" ? inferredObject : "");

  const time = normalizeTimeframe(timeframe) || inferredTimeframe;

  const explicitFinalQuestion = clean(finalCastingQuestion);

  const suggestedFinalQuestion = buildFinalCastingQuestionSuggestion({
    rawQuestion: raw,
    clarifiedIntent: intentText,
    selfRole: self,
    objectRole: object,
    timeframe: time,
  });

  const analysisQuestion = explicitFinalQuestion || suggestedFinalQuestion;
  const finalQuestion = explicitFinalQuestion;

  const detectedIntent = detectQuestionIntent(
    [analysisQuestion, raw, intentText].join(" "),
    selectedIntent
  );

  const questionForm = detectQuestionForm(analysisQuestion || raw);

  const warnings = [];
  const strengths = [];
  const qualityFlags = [];

  if (!raw) {
    warnings.push("Enter a raw question before refining the reading.");
  } else {
    strengths.push("Raw question entered.");
  }

  if (!explicitFinalQuestion) {
    warnings.push(
      "Click “Use Suggested Final Question” or manually enter a Final Casting Question before casting."
    );
    qualityFlags.push("missing-final-casting-question");
  } else {
    strengths.push("Final casting question is applied.");
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
  } else if (!clean(selfRole) && inferredSelf) {
    strengths.push(`Self inferred from raw question: ${self}.`);
  } else {
    strengths.push("Self is defined.");
  }

  if (!object) {
    warnings.push("Define the Object so the chart knows what is being judged.");
    qualityFlags.push("missing-object");
  } else if (!clean(objectRole) && inferredObject) {
    strengths.push(`Object inferred from raw question: ${object}.`);
  } else {
    strengths.push("Object is defined.");
  }

  if (!time && !hasTimeframe(analysisQuestion)) {
    warnings.push("Add a timeframe so the reading has a clear boundary.");
    qualityFlags.push("missing-timeframe");
  } else if (!clean(timeframe) && inferredTimeframe) {
    strengths.push(`Timeframe inferred from raw question: ${time}.`);
  } else {
    strengths.push("Timeframe is defined.");
  }

  if (!facts) {
    warnings.push("Add at least one known fact to separate reality from assumption.");
    qualityFlags.push("missing-known-facts");
  } else {
    strengths.push("Known facts are recorded.");
  }

  const assumptionScanText = [raw, assumptionText, analysisQuestion].join(" ");

  if (hasAny(assumptionScanText, ASSUMPTION_PHRASES)) {
    warnings.push(
      "The question may contain an assumption. Consider asking about the actual outcome instead."
    );
    qualityFlags.push("assumption-heavy");
  }

  if (assumptionText) {
    strengths.push("Assumptions have been named.");
  }

  const emotionScanText = [raw, emotion, analysisQuestion].join(" ");

  if (hasAny(emotionScanText, EMOTION_WORDS)) {
    warnings.push(
      "Strong emotion may be influencing the wording. Keep the final question outcome-based."
    );
    qualityFlags.push("emotion-heavy");
  }

  if (emotion) {
    strengths.push("Emotional tone has been acknowledged.");
  }

  if (analysisQuestion.length > 180) {
    warnings.push("The final casting question is long. Shorten it if possible.");
    qualityFlags.push("long-final-question");
  }

  if (analysisQuestion && analysisQuestion.length < 15) {
    warnings.push("The final casting question may be too short or vague.");
    qualityFlags.push("short-final-question");
  }

  const scoringItems = [
    { key: "raw-question", points: 10, passed: Boolean(raw) },
    {
      key: "final-question-applied",
      points: 15,
      passed: Boolean(explicitFinalQuestion),
    },
    { key: "question-form", points: 10, passed: questionForm.isQuestionLike },
    {
      key: "clear-intent",
      points: 15,
      passed: Boolean(intentText || detectedIntent.id !== "general"),
    },
    { key: "self-defined-or-inferred", points: 15, passed: Boolean(self) },
    { key: "object-defined-or-inferred", points: 15, passed: Boolean(object) },
    {
      key: "timeframe-defined-or-inferred",
      points: 15,
      passed: Boolean(time || hasTimeframe(analysisQuestion)),
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

  const clarityScore = Math.min(
    100,
    scoringItems.reduce(
      (total, item) => total + (item.passed ? item.points : 0),
      0
    )
  );

  let readinessLabel = "Too vague for reliable coding";

  if (clarityScore >= 85) {
    readinessLabel = explicitFinalQuestion
      ? "Ready to cast"
      : "Ready after final question is applied";
  } else if (clarityScore >= 70) {
    readinessLabel = "Usable but could be sharper";
  } else if (clarityScore >= 50) {
    readinessLabel = "Needs refinement";
  }

  const methodHints = unique([detectedIntent.methodHint]);
  const focusHints = unique([detectedIntent.focusHint]);

  const readyToCast =
    clarityScore >= 70 &&
    Boolean(explicitFinalQuestion) &&
    Boolean(self) &&
    Boolean(object) &&
    Boolean(time || hasTimeframe(analysisQuestion));

  return {
    rawQuestion: raw,
    clarifiedIntent: intentText,
    knownFacts: facts,
    assumptions: assumptionText,
    emotionalTone: emotion,
    selfRole: self,
    objectRole: object,
    timeframe: time,
    inferredSelfRole: inferredSelf,
    inferredObjectRole: inferredObject,
    inferredTimeframe,
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