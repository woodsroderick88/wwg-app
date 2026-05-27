const METHOD_PENDING_ID = "PENDING";

const METHOD_KEYWORDS = {
  GLDM: [
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
    "benefit",
    "gain",
    "loss",
    "cost",
    "value",
    "resources",
  ],
  TDM: [
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
    "next",
    "month",
    "week",
    "year",
    "days",
    "weeks",
    "months",
    "years",
  ],
  RIDM: [
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
    "person",
    "develop",
    "response",
    "contact",
    "connection",
    "health",
    "recovery",
    "job",
    "career",
  ],
  CDM: [
    "compete",
    "competition",
    "opponent",
    "rival",
    "win",
    "lose",
    "against",
    "versus",
    "vs",
    "contest",
    "conflict",
    "fight",
    "battle",
    "compare",
    "side",
  ],
  ADM: [
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
    "approval",
    "approved",
    "document",
    "paperwork",
    "contract",
    "legal",
    "safe",
    "safety",
    "support",
    "protection",
    "property",
  ],
};

function clean(value) {
  return String(value || "").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function scoreMethod(text, methodId) {
  const keywords = METHOD_KEYWORDS[methodId] || [];

  return keywords.reduce((total, keyword) => {
    return text.includes(keyword.toLowerCase()) ? total + 1 : total;
  }, 0);
}

export function recommendMethod(question) {
  const text = lower(question);

  if (!text) {
    return METHOD_PENDING_ID;
  }

  const scores = Object.keys(METHOD_KEYWORDS).map((methodId) => ({
    id: methodId,
    score: scoreMethod(text, methodId),
  }));

  const best = scores.sort((a, b) => b.score - a.score)[0];

  return best && best.score > 0 ? best.id : "GLDM";
}

function hasMultipleQuestionSignals(question) {
  const text = lower(question);
  const questionMarks = (clean(question).match(/\?/g) || []).length;

  if (questionMarks > 1) return true;

  const splitSignals = [
    " or ",
    " also ",
    " as well as ",
    " at the same time ",
    " separately ",
    " another question",
  ];

  return splitSignals.some((signal) => text.includes(signal));
}

function hasClearOutcome(question) {
  const text = lower(question);

  const outcomeSignals = [
    "will i",
    "will this",
    "will the",
    "can i",
    "can this",
    "should i",
    "should this",
    "when",
    "whether",
    "benefit",
    "profit",
    "improve",
    "succeed",
    "recover",
    "develop",
    "happen",
    "win",
    "safe",
    "suitable",
    "approved",
    "receive",
    "complete",
    "make money",
    "generate",
  ];

  return outcomeSignals.some((signal) => text.includes(signal));
}

export function getQuestionWarnings(
  question,
  selfRole,
  objectRole,
  timeframe,
  castingDate,
  castingTime
) {
  const warnings = [];
  const cleanQuestion = clean(question);

  if (!cleanQuestion) {
    warnings.push("Enter a clear question before casting.");
  }

  if (cleanQuestion && cleanQuestion.length < 12) {
    warnings.push("The question may be too short. Add a clear target or outcome.");
  }

  if (cleanQuestion && !hasClearOutcome(cleanQuestion)) {
    warnings.push("The question may need a clearer outcome, target, or decision point.");
  }

  if (hasMultipleQuestionSignals(cleanQuestion)) {
    warnings.push(
      "This may contain multiple questions. Consider splitting it before casting."
    );
  }

  if (!clean(selfRole)) {
    warnings.push("Define what Self represents.");
  }

  if (!clean(objectRole)) {
    warnings.push(
      "Define what Object represents, even if the method later does not use it."
    );
  }

  if (!clean(timeframe)) {
    warnings.push("Add a timeframe so the reading has a clear validity period.");
  }

  if (!clean(castingDate)) {
    warnings.push("Add the casting date for the calendar engine.");
  }

  if (!clean(castingTime)) {
    warnings.push("Add the casting time for the calendar engine.");
  }

  return warnings;
}