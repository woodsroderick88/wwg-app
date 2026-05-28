const FIELD_LABEL_PATTERNS = [
  /^raw\s+question\s*:\s*/i,
  /^question\s*:\s*/i,
  /^final\s+casting\s+question\s*:\s*/i,
  /^casting\s+question\s*:\s*/i,
  /^suggested\s+final\s+question\s*:\s*/i,
  /^draft\s+final\s+question\s*:\s*/i,
];

const INLINE_FIELD_LABEL_PATTERNS = [
  /\braw\s+question\s*:\s*/gi,
  /\bfinal\s+casting\s+question\s*:\s*/gi,
  /\bcasting\s+question\s*:\s*/gi,
  /\bsuggested\s+final\s+question\s*:\s*/gi,
  /\bdraft\s+final\s+question\s*:\s*/gi,
];

const UI_ACTION_PATTERNS = [
  /^use\s+detected\s+timeframe\s*:\s*/i,
  /^detected\s+timeframe\s*:\s*/i,
  /^use\s+suggested\s+final\s+question\s*$/i,
  /^copy\s+reading\s+summary\s*$/i,
  /^save\s+current\s+reading\s*$/i,
];

function clean(value) {
  return String(value || "").trim();
}

function startsWithUiAction(value) {
  const text = clean(value);

  if (!text) {
    return false;
  }

  return UI_ACTION_PATTERNS.some((pattern) => pattern.test(text));
}

function stripInlineLabels(value) {
  let text = clean(value);

  for (const pattern of INLINE_FIELD_LABEL_PATTERNS) {
    text = text.replace(pattern, "").trim();
  }

  return text;
}

export function stripPastedQuestionLabels(value) {
  let text = clean(value);

  if (!text) {
    return "";
  }

  if (startsWithUiAction(text)) {
    return "";
  }

  let changed = true;

  while (changed) {
    changed = false;

    const before = text;

    for (const pattern of FIELD_LABEL_PATTERNS) {
      text = text.replace(pattern, "").trim();
    }

    text = stripInlineLabels(text);

    if (startsWithUiAction(text)) {
      return "";
    }

    if (text !== before) {
      changed = true;
    }
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => stripInlineLabels(clean(line)))
    .filter(Boolean);

  if (lines.length <= 1) {
    return stripInlineLabels(text);
  }

  const cleanedLines = lines.filter((line) => {
    const isFieldLabel = FIELD_LABEL_PATTERNS.some((pattern) =>
      pattern.test(line)
    );
    const isUiAction = UI_ACTION_PATTERNS.some((pattern) => pattern.test(line));

    return !isFieldLabel && !isUiAction;
  });

  return cleanedLines.join("\n").trim();
}

export function cleanQuestionText(value) {
  return stripPastedQuestionLabels(value);
}

export function buildDraftFinalQuestion({
  finalCastingQuestion = "",
  rawQuestion = "",
  suggestedFinalQuestion = "",
}) {
  const finalQuestion = stripPastedQuestionLabels(finalCastingQuestion);
  const raw = stripPastedQuestionLabels(rawQuestion);
  const suggested = stripPastedQuestionLabels(suggestedFinalQuestion);

  if (finalQuestion) {
    return {
      question: finalQuestion,
      source: "final",
      label: "Final Casting Question",
      isDraft: false,
      originalQuestion: finalCastingQuestion,
      note: "Using the manually entered final casting question.",
    };
  }

  if (raw) {
    return {
      question: raw,
      source: "raw",
      label: "Raw Question Draft",
      isDraft: true,
      originalQuestion: rawQuestion,
      note:
        "Using the raw question as a draft final question until the user applies or enters a final casting question.",
    };
  }

  if (suggested) {
    return {
      question: suggested,
      source: "suggested",
      label: "Suggested Question Draft",
      isDraft: true,
      originalQuestion: suggestedFinalQuestion,
      note:
        "Using the suggested final question as a draft until the user applies it.",
    };
  }

  return {
    question: "",
    source: "empty",
    label: "No Question",
    isDraft: true,
    originalQuestion: "",
    note: "No raw question or final casting question has been entered yet.",
  };
}

export function formatDraftQuestionLabel(draftQuestionState) {
  if (!draftQuestionState?.question) {
    return "No final question entered yet.";
  }

  if (draftQuestionState.isDraft) {
    return `${draftQuestionState.question} — draft from ${draftQuestionState.label}`;
  }

  return draftQuestionState.question;
}

export function getDraftQuestionSourceNote(draftQuestionState) {
  if (!draftQuestionState) {
    return "Question source not calculated.";
  }

  return draftQuestionState.note;
}