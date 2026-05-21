import { methods } from "../data/methods";

export function recommendMethod(question) {
  const text = question.toLowerCase();

  if (!text.trim()) return "GLDM";

  const scores = methods.map((method) => ({
    id: method.id,
    score: method.keywords.reduce((total, keyword) => {
      return text.includes(keyword) ? total + 1 : total;
    }, 0),
  }));

  const best = scores.sort((a, b) => b.score - a.score)[0];

  return best.score > 0 ? best.id : "GLDM";
}

function hasMultipleQuestionSignals(question) {
  const lower = question.toLowerCase();
  const questionMarks = (question.match(/\?/g) || []).length;

  if (questionMarks > 1) return true;

  const splitSignals = [
    " or ",
    " also ",
    " as well as ",
    " at the same time ",
    " separately ",
    " another question",
  ];

  return splitSignals.some((signal) => lower.includes(signal));
}

function hasClearOutcome(question) {
  const lower = question.toLowerCase();

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
  ];

  return outcomeSignals.some((signal) => lower.includes(signal));
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
  const cleanQuestion = question.trim();

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

  if (!selfRole.trim()) {
    warnings.push("Define what Self represents.");
  }

  if (!objectRole.trim()) {
    warnings.push(
      "Define what Object represents, even if the method later does not use it."
    );
  }

  if (!timeframe.trim()) {
    warnings.push("Add a timeframe so the reading has a clear validity period.");
  }

  if (!castingDate) {
    warnings.push("Add the casting date for the calendar engine.");
  }

  if (!castingTime) {
    warnings.push("Add the casting time for the calendar engine.");
  }

  return warnings;
}