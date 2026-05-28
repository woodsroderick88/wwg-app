function clean(value) {
  return String(value || "").trim();
}

function hasValue(value) {
  return Boolean(clean(value));
}

const NUMBER_WORDS =
  "(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";

const TIME_UNITS = "(days|day|weeks|week|months|month|years|year)";

const UI_ACTION_PREFIXES = [
  /^use\s+detected\s+timeframe\s*:\s*/i,
  /^detected\s+timeframe\s*:\s*/i,
];

function normalizeTimeframe(value) {
  return clean(value).replace(/\s+/g, " ");
}

function stripUiActionPrefix(value) {
  let text = normalizeTimeframe(value);

  for (const pattern of UI_ACTION_PREFIXES) {
    text = text.replace(pattern, "").trim();
  }

  return text;
}

function extractTimeframeFromText(text) {
  const source = stripUiActionPrefix(text).toLowerCase();

  if (!source) {
    return "";
  }

  const numberPattern = `(?:\\d+|${NUMBER_WORDS})`;

  const patterns = [
    new RegExp(
      `within\\s+the\\s+next\\s+${numberPattern}\\s+${TIME_UNITS}`,
      "i"
    ),
    new RegExp(`within\\s+next\\s+${numberPattern}\\s+${TIME_UNITS}`, "i"),
    new RegExp(`in\\s+the\\s+next\\s+${numberPattern}\\s+${TIME_UNITS}`, "i"),
    new RegExp(`next\\s+${numberPattern}\\s+${TIME_UNITS}`, "i"),
    /this\s+(week|month|year)/i,
    /next\s+(week|month|year)/i,
    /by\s+the\s+end\s+of\s+the\s+(week|month|year)/i,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);

    if (match?.[0]) {
      return match[0].trim();
    }
  }

  return "";
}

function buildChecklistItem({
  id,
  label,
  complete,
  completeText,
  missingText,
  value = "",
  importance = "required",
}) {
  const isComplete = Boolean(complete);

  return {
    id,
    label,
    complete: isComplete,
    status: isComplete ? "Complete" : "Missing",
    text: isComplete ? completeText : missingText,
    completeText,
    missingText,
    value,
    importance,
  };
}

export function buildSetupCompletion({
  rawQuestion = "",
  effectiveQuestion = "",
  finalCastingQuestion = "",
  selfRole = "",
  objectRole = "",
  timeframe = "",
  knownFacts = "",
  castingDate = "",
  castingTime = "",
  location = "",
  selectedMethod = "",
  methodPending = false,
  draftQuestionState = null,
  calendarConfidence = null,
}) {
  const cleanedFinalCastingQuestion = stripUiActionPrefix(finalCastingQuestion);

  const inferredTimeframe = extractTimeframeFromText(
    `${effectiveQuestion} ${rawQuestion} ${cleanedFinalCastingQuestion}`
  );

  const hasEffectiveQuestion = hasValue(effectiveQuestion);
  const hasFinalQuestion =
    hasValue(finalCastingQuestion) &&
    !UI_ACTION_PREFIXES.some((pattern) => pattern.test(finalCastingQuestion));

  const hasSelf = hasValue(selfRole);
  const hasObject = hasValue(objectRole);
  const hasTimeframe = hasValue(timeframe);
  const hasKnownFacts = hasValue(knownFacts);
  const hasCastingDate = hasValue(castingDate);
  const hasCastingTime = hasValue(castingTime);
  const hasLocation = hasValue(location);
  const hasMethod = hasValue(selectedMethod) && !methodPending;

  const checklist = [
    buildChecklistItem({
      id: "question",
      label: "Working question",
      complete: hasEffectiveQuestion,
      completeText: "A working question is available.",
      missingText: "Enter a raw question or final casting question.",
      value: effectiveQuestion,
    }),
    buildChecklistItem({
      id: "final-question",
      label: "Final casting question",
      complete: hasFinalQuestion,
      completeText: "Final casting question is explicitly set.",
      missingText:
        "The app is using a draft question. Apply the suggested question or enter a final casting question before relying on the reading.",
      value: finalCastingQuestion,
      importance: draftQuestionState?.isDraft ? "recommended" : "required",
    }),
    buildChecklistItem({
      id: "method",
      label: "WWG method",
      complete: hasMethod,
      completeText: "A WWG method has been selected.",
      missingText:
        "Method is pending. Enter or refine the question so the app can select GLDM, TDM, RIDM, CDM, or ADM.",
      value: selectedMethod,
    }),
    buildChecklistItem({
      id: "self",
      label: "Self role",
      complete: hasSelf,
      completeText: "Self side is defined.",
      missingText: "Define what Self represents in this reading.",
      value: selfRole,
    }),
    buildChecklistItem({
      id: "object",
      label: "Object role",
      complete: hasObject,
      completeText: "Object side is defined.",
      missingText: "Define what Object represents in this reading.",
      value: objectRole,
    }),
    buildChecklistItem({
      id: "timeframe",
      label: "Timeframe",
      complete: hasTimeframe,
      completeText: "Timeframe is set.",
      missingText: inferredTimeframe
        ? `Timeframe appears to be “${inferredTimeframe}.” Add it to the Timeframe field.`
        : "Add a timeframe so the reading has a clear validity period.",
      value: timeframe || inferredTimeframe,
    }),
    buildChecklistItem({
      id: "known-facts",
      label: "Known facts",
      complete: hasKnownFacts,
      completeText: "Known facts are recorded.",
      missingText:
        "Add at least one known fact to separate reality from assumption.",
      value: knownFacts,
      importance: "recommended",
    }),
    buildChecklistItem({
      id: "casting-date",
      label: "Casting date",
      complete: hasCastingDate,
      completeText: "Casting date is set.",
      missingText: "Enter the casting date for calendar strength and timing.",
      value: castingDate,
    }),
    buildChecklistItem({
      id: "casting-time",
      label: "Casting time",
      complete: hasCastingTime,
      completeText: "Casting time is set.",
      missingText: "Enter the casting time for calendar strength and timing.",
      value: castingTime,
    }),
    buildChecklistItem({
      id: "location",
      label: "Location / timezone",
      complete: hasLocation,
      completeText: "Location / timezone is set.",
      missingText:
        "Enter location or timezone so calendar interpretation is less ambiguous.",
      value: location,
      importance: "recommended",
    }),
  ];

  const requiredItems = checklist.filter(
    (item) => item.importance === "required"
  );

  const recommendedItems = checklist.filter(
    (item) => item.importance === "recommended"
  );

  const requiredComplete = requiredItems.filter((item) => item.complete).length;

  const recommendedComplete = recommendedItems.filter(
    (item) => item.complete
  ).length;

  const totalComplete = checklist.filter((item) => item.complete).length;
  const score = Math.round((totalComplete / checklist.length) * 100);

  const requiredReady = requiredComplete === requiredItems.length;
  const recommendedReady = recommendedComplete === recommendedItems.length;
  const calendarReliable = Boolean(calendarConfidence?.isReliableForTiming);

  let mode = "Draft Mode";
  let readinessLabel = "Not ready to cast";
  let summary =
    "The app can organize the chart, but the reading setup is still incomplete.";

  if (requiredReady && recommendedReady && calendarReliable) {
    mode = "Ready Mode";
    readinessLabel = "Ready for MVP reading";
    summary =
      "Question, roles, timeframe, known facts, and calendar inputs are strong enough for the MVP reading layer.";
  } else if (requiredReady && calendarReliable) {
    mode = "Working Mode";
    readinessLabel = "Usable with notes";
    summary =
      "Required setup is complete and calendar confidence is acceptable. Recommended context can still improve the reading.";
  } else if (requiredReady) {
    mode = "Structure Ready";
    readinessLabel = "Chart structure ready, timing weak";
    summary =
      "Core question setup is complete, but calendar confidence is not strong enough for timing or day/month strength judgment.";
  }

  const missingRequired = requiredItems.filter((item) => !item.complete);
  const missingRecommended = recommendedItems.filter((item) => !item.complete);

  const nextActions = [...missingRequired, ...missingRecommended]
    .slice(0, 5)
    .map((item) => item.missingText || item.text)
    .filter(Boolean);

  return {
    mode,
    readinessLabel,
    score,
    summary,
    checklist,
    requiredReady,
    recommendedReady,
    calendarReliable,
    inferredTimeframe,
    missingRequired,
    missingRecommended,
    nextActions,
  };
}

export function buildSetupCompletionExport(setupCompletion) {
  if (!setupCompletion) {
    return `SETUP COMPLETION
Not calculated.`;
  }

  const checklistText = setupCompletion.checklist
    .map((item) => {
      const mark = item.complete ? "✓" : "•";
      return `${mark} ${item.label}: ${item.text}`;
    })
    .join("\n");

  const nextActionsText = setupCompletion.nextActions.length
    ? setupCompletion.nextActions
        .map((action, index) => `${index + 1}. ${action}`)
        .join("\n")
    : "No immediate setup actions.";

  return `SETUP COMPLETION

Mode:
${setupCompletion.mode}

Readiness:
${setupCompletion.readinessLabel}

Setup Score:
${setupCompletion.score}/100

Summary:
${setupCompletion.summary}

Checklist:
${checklistText}

Next Actions:
${nextActionsText}`;
}