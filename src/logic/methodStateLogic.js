const METHOD_PENDING_ID = "PENDING";

function clean(value) {
  return String(value || "").trim();
}

export function hasQuestionInput({
  rawQuestion = "",
  finalCastingQuestion = "",
  clarifiedIntent = "",
}) {
  return Boolean(
    clean(rawQuestion) || clean(finalCastingQuestion) || clean(clarifiedIntent)
  );
}

export function isMethodPending({
  rawQuestion = "",
  finalCastingQuestion = "",
  clarifiedIntent = "",
  selectedMethod = METHOD_PENDING_ID,
}) {
  if (selectedMethod === METHOD_PENDING_ID) {
    return true;
  }

  return !hasQuestionInput({
    rawQuestion,
    finalCastingQuestion,
    clarifiedIntent,
  });
}

export function getMethodPendingId() {
  return METHOD_PENDING_ID;
}

export function buildPendingMethodState({
  rawQuestion = "",
  finalCastingQuestion = "",
  clarifiedIntent = "",
  selectedMethod = METHOD_PENDING_ID,
  recommendedMethodId = METHOD_PENDING_ID,
}) {
  const hasInput = hasQuestionInput({
    rawQuestion,
    finalCastingQuestion,
    clarifiedIntent,
  });

  const pending =
    selectedMethod === METHOD_PENDING_ID ||
    recommendedMethodId === METHOD_PENDING_ID ||
    !hasInput;

  return {
    pending,
    hasInput,
    methodId: pending ? METHOD_PENDING_ID : selectedMethod,
    recommendedMethodId: pending ? METHOD_PENDING_ID : recommendedMethodId,
    label: pending ? "Method pending" : "Method selected",
    summary: pending
      ? "Enter or refine a question before choosing a WWG method. GLDM should not appear as a real recommendation until the app has enough question context."
      : "A method has been selected from the current question context.",
    warning: pending
      ? "No method has been selected yet because the question is not ready for reliable coding."
      : "",
  };
}