function getFocusLineNumbers(focusRows) {
  if (!Array.isArray(focusRows) || focusRows.length === 0) {
    return "";
  }

  return focusRows.map((row) => row.lineNumber).join(", ");
}

function hasSupportedFocus(focusRows) {
  return focusRows.some((row) => row.condition?.summary === "Supported");
}

function hasWeakenedFocus(focusRows) {
  return focusRows.some((row) => row.condition?.summary === "Weakened");
}

function hasClashedFocus(focusRows) {
  return focusRows.some((row) =>
    row.condition?.notes?.some((note) =>
      String(note).toLowerCase().includes("clashed")
    )
  );
}

function hasVoidFocus(focusRows) {
  return focusRows.some((row) =>
    row.condition?.notes?.some((note) =>
      String(note).toLowerCase().includes("void")
    )
  );
}

function hasMovingFocus(focusRows) {
  return focusRows.some((row) => row.moving);
}

function getMovingLineText(movingLines) {
  if (!Array.isArray(movingLines) || movingLines.length === 0) {
    return "No moving lines.";
  }

  return movingLines.length === 1
    ? `Moving line: ${movingLines[0]}.`
    : `Moving lines: ${movingLines.join(", ")}.`;
}

function hasMovingLines(movingLines) {
  return Array.isArray(movingLines) && movingLines.length > 0;
}

function hasMovingLine(movingLines, lineNumber) {
  return Array.isArray(movingLines) && movingLines.includes(lineNumber);
}

function isParentFocus(selectedFocus) {
  return String(selectedFocus || "").toLowerCase() === "parent-line";
}

function buildHiddenParentCandidateText(movingLines) {
  const candidates = [];

  if (hasMovingLine(movingLines, 2)) {
    candidates.push(
      "Line 2 may conceal or activate a hidden Parent-line support/document signal."
    );
  }

  if (hasMovingLine(movingLines, 5)) {
    candidates.push(
      "Line 5 may conceal or activate a hidden Parent-line support/document signal."
    );
  }

  if (candidates.length === 0 && hasMovingLines(movingLines)) {
    candidates.push(
      `The moving line(s) ${movingLines.join(
        ", "
      )} suggest active process movement, but the hidden Parent-line still needs full Flying/Hidden Spirit confirmation.`
    );
  }

  return candidates;
}

function buildBaseSignals({ selectedFocus, focusRows, movingLines, clarityScore }) {
  const focusLineNumbers = getFocusLineNumbers(focusRows);
  const supported = hasSupportedFocus(focusRows);
  const weakened = hasWeakenedFocus(focusRows);
  const clashed = hasClashedFocus(focusRows);
  const voided = hasVoidFocus(focusRows);
  const movingFocus = hasMovingFocus(focusRows);
  const chartHasMovingLines = hasMovingLines(movingLines);

  const supportingSigns = [];
  const warningSigns = [];

  if (focusRows.length > 0) {
    supportingSigns.push(
      `${selectedFocus} is visible on Line ${focusLineNumbers}, so the matter is present in the chart.`
    );
  } else {
    warningSigns.push(
      `${selectedFocus} is not visible in the current chart layer, so the matter is harder to judge directly. Hidden/Flying Spirit logic is needed.`
    );
  }

  if (supported) {
    supportingSigns.push(
      `${selectedFocus} is supported, which gives the matter usable strength.`
    );
  }

  if (movingFocus) {
    supportingSigns.push(
      `${selectedFocus} is connected to a moving line, showing activity, change, or development.`
    );
  }

  if (weakened) {
    warningSigns.push(
      `${selectedFocus} is weakened, which can show low strength, delay, or reduced effectiveness.`
    );
  }

  if (clashed) {
    warningSigns.push(
      `${selectedFocus} is clashed, which shows disruption, pressure, instability, delay, or extra effort.`
    );
  }

  if (voided) {
    warningSigns.push(
      `${selectedFocus} is void, which can show incompleteness, delay, emptiness, or a matter not yet fully available.`
    );
  }

  if (!chartHasMovingLines) {
    warningSigns.push(
      "There are no moving lines, so the chart is static. This does not make the reading invalid, but it means the matter may require deliberate action before visible change appears."
    );
  }

  if (clarityScore < 70) {
    warningSigns.push(
      "The question setup is not clear enough for a strong final judgment."
    );
  }

  return {
    focusLineNumbers,
    supported,
    weakened,
    clashed,
    voided,
    movingFocus,
    hasMovingLines: chartHasMovingLines,
    supportingSigns,
    warningSigns,
  };
}

function getConfidence({
  focusRows,
  supported,
  weakened,
  clashed,
  voided,
  movingFocus,
  hasMovingLines,
  clarityScore,
}) {
  if (clarityScore < 50) {
    return "Low";
  }

  if (focusRows.length === 0 && hasMovingLines && clarityScore >= 70) {
    return "Medium-Low";
  }

  if (focusRows.length === 0) {
    return "Low";
  }

  if (supported && movingFocus && !clashed && !voided && clarityScore >= 80) {
    return "High";
  }

  if ((supported || hasMovingLines) && !weakened && clarityScore >= 70) {
    return "Medium-High";
  }

  if (clashed || voided || weakened || !hasMovingLines) {
    return "Medium-Low";
  }

  return "Medium";
}

function getFinalJudgment({
  focusRows,
  supported,
  weakened,
  clashed,
  voided,
  movingFocus,
  hasMovingLines,
  clarityScore,
}) {
  if (clarityScore < 50) {
    return "Too unclear to judge";
  }

  if (focusRows.length === 0 && hasMovingLines) {
    return "Hidden Support / Needs Confirmation";
  }

  if (focusRows.length === 0) {
    return "Too unclear to judge";
  }

  if (supported && movingFocus && !weakened && !clashed && !voided) {
    return "Strong Yes";
  }

  if ((supported || movingFocus) && !weakened && !voided) {
    return clashed ? "Cautious Yes" : "Favorable";
  }

  if (!hasMovingLines) {
    return "Static / Needs Activation";
  }

  if (weakened || clashed || voided) {
    return "Uncertain / Needs Support";
  }

  return "Cautious Yes";
}

function buildHousingRecommendation({
  selectedFocus,
  focusRows,
  focusSummary,
  ruleConclusion,
  movingLines,
  clarityScore,
}) {
  const signals = buildBaseSignals({
    selectedFocus,
    focusRows,
    movingLines,
    clarityScore,
  });

  const finalJudgment = getFinalJudgment({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  const confidence = getConfidence({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  const hiddenParentCandidateText =
    focusRows.length === 0 && isParentFocus(selectedFocus)
      ? buildHiddenParentCandidateText(movingLines)
      : [];

  let plainMeaning =
    "The housing, shelter, approval, document, or support matter is present as the selected focus, but the signal needs practical confirmation. Continue the application process and verify requirements, documents, eligibility, waitlist status, and follow-up steps.";

  if (finalJudgment === "Strong Yes") {
    plainMeaning =
      "The chart gives a strong favorable signal for housing approval, shelter support, or document-based progress. The Parent-line is visible, supported, and active, so the matter has real strength.";
  } else if (finalJudgment === "Cautious Yes" || finalJudgment === "Favorable") {
    plainMeaning =
      "The chart gives a cautiously favorable signal for housing progress. The support/application matter is present, but it still needs follow-through, paperwork, eligibility confirmation, and timing support.";
  } else if (finalJudgment === "Static / Needs Activation") {
    plainMeaning =
      "The housing matter is present, but the chart is static. This suggests the opportunity exists, but progress may depend on active application steps, document submission, follow-up calls, appointments, or waiting-list movement.";
  } else if (finalJudgment === "Hidden Support / Needs Confirmation") {
    plainMeaning =
      "The housing/support/document matter is not visible openly, but the chart has movement that points toward hidden process activity. This suggests the housing matter may exist behind paperwork, agency processing, timing delay, eligibility review, or hidden support rather than being immediately visible.";
  } else if (finalJudgment === "Too unclear to judge") {
    plainMeaning =
      "The chart is not clear enough for a reliable housing judgment yet. Complete the question, calendar, and line setup before relying on the result.";
  }

  const supportingSigns =
    signals.supportingSigns.length > 0
      ? [...signals.supportingSigns]
      : [
          ruleConclusion ||
            focusSummary ||
            "The housing matter is selected as the focus, but more rule layers are needed.",
        ];

  if (hiddenParentCandidateText.length > 0) {
    supportingSigns.push(...hiddenParentCandidateText);
    supportingSigns.push(
      "Because Parent-line represents housing, shelter, documents, protection, and support, hidden Parent-line activity can point to a housing/application matter that is not openly visible yet."
    );
  }

  const warningSigns =
    signals.warningSigns.length > 0
      ? [...signals.warningSigns]
      : [
          "No major warning signs are visible in the current MVP layer, but deeper WWG rules still need confirmation.",
        ];

  if (focusRows.length === 0 && isParentFocus(selectedFocus)) {
    warningSigns.push(
      "Because the Parent-line is hidden rather than visible, the result should be treated as a process signal, not a final approval guarantee."
    );
  }

  return {
    result: finalJudgment,
    finalJudgment,
    confidence,
    plainMeaning,
    reason: plainMeaning,
    risk:
      warningSigns.length > 0
        ? `Warning signs: ${warningSigns.join(" ")}`
        : "Warning signs: No major warning signs are visible in the current MVP layer, but housing approval still depends on real-world eligibility, paperwork, availability, and agency timing.",
    supportingSigns,
    warningSigns,
    action:
      "Keep moving the housing process forward. Apply, gather documents, verify eligibility, ask about waitlist timing, save confirmation numbers, and follow up consistently instead of waiting passively.",
    nextCheck: `Next check: compare the hidden Parent-line candidates against Shi/Ying, moving lines, transformed hexagram, application documents, void/clash status, and full Hidden/Flying Spirit rules. ${getMovingLineText(
      movingLines
    )}`,
  };
}

function buildMoneyRecommendation({
  selectedFocus,
  focusRows,
  focusSummary,
  ruleConclusion,
  movingLines,
  clarityScore,
}) {
  const signals = buildBaseSignals({
    selectedFocus,
    focusRows,
    movingLines,
    clarityScore,
  });

  const finalJudgment = getFinalJudgment({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  const confidence = getConfidence({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  let plainMeaning =
    "Money, profit, resources, goods, or controllable value factor is present, but the chart needs more confirmation before treating it as a strong gain signal.";

  if (finalJudgment === "Static / Needs Activation") {
    plainMeaning =
      "Money, profit, resources, goods, or controllable value factor is present, but the chart is static. This means the matter exists, but it is not showing strong active movement yet. It may require deliberate action before the desired result appears.";
  } else if (finalJudgment === "Strong Yes") {
    plainMeaning =
      "The chart gives a strong favorable signal for gain, money, resources, or profit. The Asset-line is visible, supported, and active.";
  } else if (finalJudgment === "Cautious Yes" || finalJudgment === "Favorable") {
    plainMeaning =
      "The chart shows real potential for gain, money, resources, or profit, but the signal is not fully clean. Extra effort, timing, or correction may still be needed.";
  } else if (finalJudgment === "Hidden Support / Needs Confirmation") {
    plainMeaning =
      "The money/resource signal is not visible openly, but moving lines show process activity. This needs hidden-spirit confirmation before treating it as a gain signal.";
  }

  return {
    result: finalJudgment,
    finalJudgment,
    confidence,
    plainMeaning,
    reason: plainMeaning,
    risk:
      signals.warningSigns.length > 0
        ? `Warning signs: ${signals.warningSigns.join(" ")}`
        : "Warning signs: No major warning signs are visible in the current MVP layer, but deeper WWG rules still need confirmation.",
    supportingSigns: signals.supportingSigns,
    warningSigns:
      signals.warningSigns.length > 0
        ? signals.warningSigns
        : [
            "No major warning signs are visible in the current MVP layer, but deeper WWG rules still need confirmation.",
          ],
    action:
      "Do not wait passively. Activate the money path through clearer positioning, direct action, pricing tests, outreach, follow-up, and removing friction.",
    nextCheck: `Next check: analyze the Asset-line against moving lines, transformed hexagram, true prosperity rules, Shi/Ying placement, and hidden/flying spirit logic. ${getMovingLineText(
      movingLines
    )}`,
  };
}

function buildTimingRecommendation({
  selectedFocus,
  focusRows,
  focusSummary,
  ruleConclusion,
  movingLines,
  clarityScore,
}) {
  const signals = buildBaseSignals({
    selectedFocus,
    focusRows,
    movingLines,
    clarityScore,
  });

  const finalJudgment = getFinalJudgment({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  const confidence = getConfidence({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  let plainMeaning =
    "The timing signal is present but not complete. Moving lines, void-filling, day/month activation, and transformed lines need deeper comparison.";

  if (!signals.hasMovingLines) {
    plainMeaning =
      "The chart does not show a clear active timing trigger in this MVP layer. This does not mean the event cannot happen, but the current chart is static and timing is harder to judge.";
  } else if (finalJudgment === "Strong Yes") {
    plainMeaning =
      "The chart gives a strong favorable timing signal. The matter is visible, supported, and active.";
  } else if (finalJudgment === "Cautious Yes" || finalJudgment === "Favorable") {
    plainMeaning =
      "The chart gives a cautiously favorable timing signal. There is movement, but the timing still needs confirmation through day/month, void, clash, and transformed-line rules.";
  } else if (finalJudgment === "Hidden Support / Needs Confirmation") {
    plainMeaning =
      "The timing trigger is not visible as a clean focus line, but moving lines show process activity. Hidden/Flying Spirit and activation timing are needed before making a firm date judgment.";
  }

  return {
    result: finalJudgment,
    finalJudgment,
    confidence,
    plainMeaning,
    reason: plainMeaning,
    risk:
      signals.warningSigns.length > 0
        ? `Warning signs: ${signals.warningSigns.join(" ")}`
        : "Warning signs: No major warning signs are visible in the current MVP layer.",
    supportingSigns:
      signals.supportingSigns.length > 0
        ? signals.supportingSigns
        : [ruleConclusion || focusSummary || "The app needs more timing layers."],
    warningSigns:
      signals.warningSigns.length > 0
        ? signals.warningSigns
        : [
            "No major warning signs are visible in the current MVP layer, but deeper WWG timing rules still need confirmation.",
          ],
    action:
      "Track the real-world trigger points. Watch for appointments, approvals, messages, paperwork, deadlines, and movement around the moving-line or activation period.",
    nextCheck: `Next check: compare moving lines, day/month strength, void-filling, transformed lines, and Shi/Ying. ${getMovingLineText(
      movingLines
    )}`,
  };
}

function buildRelationshipRecommendation({
  selectedFocus,
  focusRows,
  focusSummary,
  ruleConclusion,
  movingLines,
  clarityScore,
}) {
  const signals = buildBaseSignals({
    selectedFocus,
    focusRows,
    movingLines,
    clarityScore,
  });

  const finalJudgment = getFinalJudgment({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  const confidence = getConfidence({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  let plainMeaning =
    "The relationship or external-object matter is present, but the signal needs more confirmation before making a strong judgment.";

  if (finalJudgment === "Static / Needs Activation") {
    plainMeaning =
      "The relationship or external-object matter is present, but the chart is static. This means the situation exists, but it may need communication, follow-through, or real-world confirmation before change appears.";
  } else if (finalJudgment === "Strong Yes") {
    plainMeaning =
      "The chart gives a strong favorable signal for relationship or external-object development. The matter is visible, supported, and active.";
  } else if (finalJudgment === "Cautious Yes" || finalJudgment === "Favorable") {
    plainMeaning =
      "The relationship or external-object matter is present and has a cautiously favorable signal, but stability is not guaranteed by itself.";
  } else if (finalJudgment === "Hidden Support / Needs Confirmation") {
    plainMeaning =
      "The relationship or external-object matter is not visible openly, but moving lines show process activity. Hidden/Flying Spirit rules are needed before making a firm judgment.";
  }

  return {
    result: finalJudgment,
    finalJudgment,
    confidence,
    plainMeaning,
    reason: plainMeaning,
    risk:
      signals.warningSigns.length > 0
        ? `Warning signs: ${signals.warningSigns.join(" ")}`
        : "Warning signs: No major warning signs are visible in the current MVP layer, but deeper WWG rules still need confirmation.",
    supportingSigns: signals.supportingSigns,
    warningSigns:
      signals.warningSigns.length > 0
        ? signals.warningSigns
        : [
            "No major warning signs are visible in the current MVP layer, but deeper WWG rules still need confirmation.",
          ],
    action:
      "Move forward carefully. Keep communication steady, act consistently, and watch for practical confirmation that the situation is developing well.",
    nextCheck: `Next check: compare the focus against Shi/Ying, moving lines, transformed hexagram, and hidden/flying spirit logic. ${getMovingLineText(
      movingLines
    )}`,
  };
}

function buildGenericRecommendation({
  selectedFocus,
  focusRows,
  focusSummary,
  ruleConclusion,
  movingLines,
  clarityScore,
}) {
  const signals = buildBaseSignals({
    selectedFocus,
    focusRows,
    movingLines,
    clarityScore,
  });

  const finalJudgment = getFinalJudgment({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  const confidence = getConfidence({
    focusRows,
    supported: signals.supported,
    weakened: signals.weakened,
    clashed: signals.clashed,
    voided: signals.voided,
    movingFocus: signals.movingFocus,
    hasMovingLines: signals.hasMovingLines,
    clarityScore,
  });

  let plainMeaning =
    focusRows.length === 0
      ? "The chart does not show the main selected useful-spirit factor clearly in the visible six lines. Hidden/Flying Spirit logic may be needed before making a fully reliable judgment."
      : "The selected matter is present in the chart, but deeper WWG layers are still needed before making a fully reliable judgment.";

  if (finalJudgment === "Hidden Support / Needs Confirmation") {
    plainMeaning =
      "The selected matter is not visible openly, but moving lines show active process movement. Hidden/Flying Spirit logic is needed to judge whether the matter is concealed, delayed, covered, or being activated behind the scenes.";
  }

  return {
    result: finalJudgment,
    finalJudgment,
    confidence,
    plainMeaning,
    reason: plainMeaning,
    risk:
      signals.warningSigns.length > 0
        ? `Warning signs: ${signals.warningSigns.join(" ")}`
        : "Warning signs: No major warning signs are visible in the current MVP layer.",
    supportingSigns:
      signals.supportingSigns.length > 0
        ? signals.supportingSigns
        : [ruleConclusion || focusSummary || "The app needs more rule layers."],
    warningSigns:
      signals.warningSigns.length > 0
        ? signals.warningSigns
        : [
            "No major warning signs are visible in the current MVP layer, but deeper WWG rules still need confirmation.",
          ],
    action:
      "Clarify the question, complete the calendar setup, and compare the matter line against Shi/Ying, moving lines, transformed hexagram, and hidden/flying spirit logic.",
    nextCheck: `Next check: compare the focus line against Shi/Ying, moving lines, transformed hexagram, and hidden/flying spirit logic. ${getMovingLineText(
      movingLines
    )}`,
  };
}

export function buildRecommendation({
  selectedMethod,
  selectedFocus,
  focusRows = [],
  focusSummary = "",
  ruleConclusion = "",
  conflictReport = {},
  movingLines = [],
  clarityScore = 0,
}) {
  const normalizedFocus = String(selectedFocus || "").toLowerCase();

  if (normalizedFocus === "parent-line") {
    return buildHousingRecommendation({
      selectedFocus,
      focusRows,
      focusSummary,
      ruleConclusion,
      conflictReport,
      movingLines,
      clarityScore,
    });
  }

  if (selectedMethod === "GLDM" || normalizedFocus === "asset-line") {
    return buildMoneyRecommendation({
      selectedFocus,
      focusRows,
      focusSummary,
      ruleConclusion,
      conflictReport,
      movingLines,
      clarityScore,
    });
  }

  if (selectedMethod === "TDM" || normalizedFocus === "moving line") {
    return buildTimingRecommendation({
      selectedFocus,
      focusRows,
      focusSummary,
      ruleConclusion,
      conflictReport,
      movingLines,
      clarityScore,
    });
  }

  if (selectedMethod === "RIDM" || normalizedFocus === "object-line") {
    return buildRelationshipRecommendation({
      selectedFocus,
      focusRows,
      focusSummary,
      ruleConclusion,
      conflictReport,
      movingLines,
      clarityScore,
    });
  }

  return buildGenericRecommendation({
    selectedFocus,
    focusRows,
    focusSummary,
    ruleConclusion,
    conflictReport,
    movingLines,
    clarityScore,
  });
}