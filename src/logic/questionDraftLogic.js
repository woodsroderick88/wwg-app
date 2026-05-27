function clean(value) {
  return String(value || "").trim();
}

export function buildDraftFinalQuestion({
  finalCastingQuestion = "",
  rawQuestion = "",
  suggestedFinalQuestion = "",
}) {
  const finalQuestion = clean(finalCastingQuestion);
  const raw = clean(rawQuestion);
  const suggested = clean(suggestedFinalQuestion);

  if (finalQuestion) {
    return {
      question: finalQuestion,
      source: "final",
      label: "Final Casting Question",
      isDraft: false,
      note: "Using the manually entered final casting question.",
    };
  }

  if (raw) {
    return {
      question: raw,
      source: "raw",
      label: "Raw Question Draft",
      isDraft: true,
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
      note:
        "Using the suggested final question as a draft until the user applies it.",
    };
  }

  return {
    question: "",
    source: "empty",
    label: "No Question",
    isDraft: true,
    note:
      "No raw question or final casting question has been entered yet.",
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