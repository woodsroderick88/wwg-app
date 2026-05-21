export function buildRecommendation({
  selectedMethod,
  selectedFocus,
  focusRows,
  focusSummary,
  ruleConclusion,
  conflictReport,
  movingLines,
  clarityScore,
}) {
  let result = "Preliminary result: Neutral / still developing";
  let reason = ruleConclusion;
  let risk = "No major risk detected at this MVP layer.";
  let nextCheck =
    "Next check: transformed line logic, hidden-spirit logic, true calendar engine, and true WWG palace rules.";
  let action = "Use this as a structured preliminary reading, not a final judgment.";

  const hasFocus = focusRows.length > 0;
  const hasMoving = movingLines.length > 0;
  const confidence = conflictReport.confidence;

  const strongRows = focusRows.filter(
    (row) =>
      row.condition.summary === "Strong" ||
      row.condition.summary === "Supported"
  );

  const weakRows = focusRows.filter(
    (row) =>
      row.condition.summary === "Weakened" ||
      row.condition.summary === "Weak / void"
  );

  if (!hasFocus) {
    result = "Preliminary result: Unclear";
    reason = `${selectedFocus} is not visible in the current six-line structure.`;
    risk =
      "The matter-element may be hidden, absent, or not captured by the current MVP logic.";
    action =
      "Do not force a conclusion yet. Add hidden-spirit and flying-spirit logic before judging.";
  } else if (strongRows.length && !weakRows.length) {
    result = "Preliminary result: Favorable signal";
    reason = `${selectedFocus} is visible and supported in the current chart context.`;
    risk =
      "The signal still needs confirmation from transformed lines, true prosperity rules, and hidden-spirit checks.";
    action =
      "Treat the matter as present and usable, but wait for deeper confirmation before making a final decision.";
  } else if (weakRows.length && !strongRows.length) {
    result = "Preliminary result: Caution";
    reason = `${selectedFocus} is visible but weakened, clashed, or void.`;
    risk = "The matter may be delayed, unstable, blocked, or not yet fully available.";
    action =
      "Proceed carefully. Look for support from moving lines, transformed lines, or future activation periods.";
  } else if (strongRows.length && weakRows.length) {
    result = "Preliminary result: Mixed";
    reason = `${selectedFocus} has both supportive and damaging signals.`;
    risk = "The chart contains contradiction, so a clean yes/no judgment would be premature.";
    action =
      "Treat the matter as possible but unstable. The next layer should identify which signal has priority.";
  } else {
    result = "Preliminary result: Neutral";
    reason = focusSummary;
    risk = "The matter exists, but the chart does not yet show strong momentum.";
    action =
      "Do not overread the chart. Continue into deeper rule layers before making a final judgment.";
  }

  if (confidence === "Low") {
    action =
      "Pause before treating this as reliable. Clarify the setup or wait for hidden-spirit and conflict-priority logic.";
  }

  if (clarityScore < 70) {
    risk = "The question setup is incomplete, which lowers confidence in the reading.";
  }

  if (selectedMethod === "TDM" && !hasMoving) {
    nextCheck = "Next check: void-filling, branch activation, and transformed-line timing rules.";
    action = "Timing is not clean yet. Do not force a date from the MVP layer.";
  }

  if (hasMoving) {
    nextCheck = `Next check: analyze moving line ${movingLines.join(
      ", "
    )} against the transformed hexagram and transformed branch.`;
  }

  return {
    result,
    reason,
    risk,
    nextCheck,
    action,
  };
}