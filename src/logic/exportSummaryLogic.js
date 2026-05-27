function formatValue(value, fallback = "Not set") {
  return value === undefined || value === null || String(value).trim() === ""
    ? fallback
    : String(value);
}

function formatLinesList(values, fallback = "None") {
  return Array.isArray(values) && values.length ? values.join(", ") : fallback;
}

function formatCalendarSource(calendarSource, manualCalendarMode) {
  if (manualCalendarMode) {
    return "Manual calendar override";
  }

  if (calendarSource === "solar-term-foundation") {
    return "Solar-term calendar foundation";
  }

  if (calendarSource === "automatic" || calendarSource === "calculated") {
    return "Automatic calendar foundation";
  }

  if (calendarSource === "manual") {
    return "Manual calendar override";
  }

  return "Fallback placeholder";
}

function formatCalendarStatus(calendarSource, manualCalendarMode) {
  if (manualCalendarMode || calendarSource === "manual") {
    return "Manual calendar override active";
  }

  if (calendarSource === "solar-term-foundation") {
    return "Approximate solar-term foundation active";
  }

  if (calendarSource === "automatic" || calendarSource === "calculated") {
    return "Automatic calendar foundation active";
  }

  return "Using fallback placeholder values";
}

function formatCalendarConfidence(calendarConfidence) {
  if (!calendarConfidence) {
    return `Calendar Confidence: Not calculated
Calendar Confidence Score: Not calculated
Timing Reliability: Not calculated
Calendar Confidence Note: Not calculated
Calendar Confidence Warning: Not calculated`;
  }

  const timingReliability = calendarConfidence.isReliableForTiming
    ? "Reliable enough for this MVP timing layer"
    : "Not reliable for final timing judgment";

  return `Calendar Confidence: ${formatValue(calendarConfidence.level)}
Calendar Confidence Score: ${formatValue(
    calendarConfidence.score,
    "Not scored"
  )}/100
Timing Reliability: ${timingReliability}
Calendar Confidence Note: ${formatValue(calendarConfidence.summary)}
Calendar Confidence Warning: ${formatValue(
    calendarConfidence.warning,
    "No calendar warning."
  )}`;
}

function formatBranch(branch) {
  if (!branch) {
    return "Not set";
  }

  return `${branch.label || branch.key || "Unknown"} / ${
    branch.element || "Unknown element"
  }`;
}

function formatVoidPair(voidPair) {
  if (!voidPair) {
    return "Not set";
  }

  return voidPair.label || voidPair.key || "Not set";
}

function formatSixKinRows(sixKinRows) {
  if (!Array.isArray(sixKinRows) || sixKinRows.length === 0) {
    return "No six-kin rows available.";
  }

  return sixKinRows
    .map((row) => {
      const notes = row.condition?.notes?.length
        ? row.condition.notes.join(", ")
        : row.condition?.summary || "Neutral";

      return `Line ${row.lineNumber}: ${row.branch?.label || "Unknown"} / ${
        row.element || "Unknown"
      } / ${row.sixKin || "Unknown"} / ${
        row.condition?.summary || "Unknown"
      } (${notes})`;
    })
    .join("\n");
}

function formatRuleGraph(ruleGraph) {
  if (!ruleGraph?.rules?.length) {
    return "No rule graph available.";
  }

  return ruleGraph.rules
    .map((rule, index) => `${index + 1}. ${rule.title}: ${rule.text}`)
    .join("\n");
}

function formatConflicts(conflictReport) {
  if (!conflictReport?.conflicts?.length) {
    return "No conflict report available.";
  }

  return conflictReport.conflicts
    .map(
      (conflict) =>
        `- ${conflict.level}: ${conflict.title} — ${conflict.text}`
    )
    .join("\n");
}

function formatPalaceNotes(palaceRules) {
  if (!palaceRules?.notes?.length) {
    return "No palace rules preview available.";
  }

  return palaceRules.notes
    .map((note, index) => `${index + 1}. ${note.title}: ${note.text}`)
    .join("\n");
}

function formatHiddenNotes(hiddenSpirit) {
  if (!hiddenSpirit?.notes?.length) {
    return "No hidden/flying spirit preview available.";
  }

  return hiddenSpirit.notes
    .map((note, index) => `${index + 1}. ${note.title}: ${note.text}`)
    .join("\n");
}

function formatRecommendation(recommendation) {
  if (!recommendation) {
    return `Result: Not available
Reason: Not available
Risk: Not available
Next Check: Not available
Recommended Action: Not available`;
  }

  const supportingSigns = recommendation.supportingSigns?.length
    ? recommendation.supportingSigns.join(" ")
    : recommendation.reason || "No supporting signs available.";

  const warningSigns = recommendation.warningSigns?.length
    ? recommendation.warningSigns.join(" ")
    : recommendation.risk || "No warning signs available.";

  return `Result: Final Judgment: ${
    recommendation.finalJudgment || recommendation.result || "Not available"
  }
Reason: Plain-English meaning: ${
    recommendation.plainMeaning || recommendation.reason || "Not available"
  } Supporting signs: ${supportingSigns}
Risk: Warning signs: ${warningSigns}
Next Check: ${recommendation.nextCheck || "Not available"}
Recommended Action: ${recommendation.action || "Not available"}`;
}

export function buildReadingSummary({
  question,
  selectedMethod,
  method,
  selfRole,
  objectRole,
  timeframe,
  clarityScore,

  castingDate,
  castingTime,
  location,
  dayChangeRule,
  calendarSource,
  calendarConfidence,
  manualCalendarMode,
  manualMonthBranchData,
  manualDayBranchData,
  manualDayStemData,
  manualDayVoidData,
  monthBranch,
  dayBranch,
  voidPair,

  originalHexagram,
  transformedHexagram,
  movingLines,
  sixKinRows,

  selectedFocus,
  selectedFocusInfo,
  focusRows,
  focusSummary,

  ruleGraph,
  conflictReport,
  recommendation,
  palaceRules,
  hiddenSpirit,
}) {
  const calendarSourceLabel = formatCalendarSource(
    calendarSource,
    manualCalendarMode
  );

  const calendarStatusLabel = formatCalendarStatus(
    calendarSource,
    manualCalendarMode
  );

  const activeMonthBranch = manualCalendarMode
    ? manualMonthBranchData
    : monthBranch;

  const activeDayBranch = manualCalendarMode ? manualDayBranchData : dayBranch;
  const activeVoidPair = manualCalendarMode ? manualDayVoidData : voidPair;

  const manualDayStemLabel = manualDayStemData
    ? `${manualDayStemData.label} / ${manualDayStemData.element}, ${manualDayStemData.polarity}`
    : "Not set";

  const calendarFoundationNote =
    calendarSource === "solar-term-foundation"
      ? "Calendar Foundation Note: Month branch is selected from approximate solar-term boundaries. This foundation should later be replaced by an almanac-grade true solar-term engine."
      : "";

  return `WEN WANG GUA MVP READING SUMMARY

QUESTION
${formatValue(question, "No question entered.")}

QUESTION CODING
Method: ${formatValue(selectedMethod)} — ${formatValue(method?.name)}
Self: ${formatValue(selfRole)}
Object: ${formatValue(objectRole)}
Timeframe: ${formatValue(timeframe)}
Clarity Score: ${formatValue(clarityScore, "Not scored")}/100

CALENDAR
Gregorian Casting: ${
    castingDate
      ? `${castingDate}${castingTime ? ` at ${castingTime}` : ""}`
      : "Not set"
  }
Location / Timezone: ${formatValue(location)}
Day Change Rule: ${formatValue(dayChangeRule, "23:00")}
Calendar Source: ${calendarSourceLabel}
Chinese Calendar Status: ${calendarStatusLabel}
${calendarFoundationNote}
${formatCalendarConfidence(calendarConfidence)}
${
  manualCalendarMode
    ? `Manual Day Stem: ${manualDayStemLabel}
Manual Month Branch: ${formatBranch(manualMonthBranchData)}
Manual Day Branch: ${formatBranch(manualDayBranchData)}
Manual Dekad Void: ${formatVoidPair(manualDayVoidData)}`
    : ""
}
Active Month / Day / Void: ${formatBranch(activeMonthBranch)} / ${formatBranch(
    activeDayBranch
  )} / ${formatVoidPair(activeVoidPair)}

HEXAGRAMS
Original Hexagram: #${originalHexagram?.kingWen?.number || "?"} — ${
    originalHexagram?.kingWen?.name || "Unknown"
  } / ${originalHexagram?.kingWen?.english || "Unknown"}
Original Structure: ${formatValue(originalHexagram?.label)}
Original Nature: ${formatValue(originalHexagram?.natureLabel)}
Original Palace: ${formatValue(originalHexagram?.palace?.palace)}
Original Element: ${formatValue(originalHexagram?.palace?.element)}

Transformed Hexagram: #${transformedHexagram?.kingWen?.number || "?"} — ${
    transformedHexagram?.kingWen?.name || "Unknown"
  } / ${transformedHexagram?.kingWen?.english || "Unknown"}
Transformed Structure: ${formatValue(transformedHexagram?.label)}
Transformed Nature: ${formatValue(transformedHexagram?.natureLabel)}
Transformed Palace: ${formatValue(transformedHexagram?.palace?.palace)}
Transformed Element: ${formatValue(transformedHexagram?.palace?.element)}

MOVING LINES
${formatLinesList(movingLines)}

SIX-KINS / LINE CONDITIONS
${formatSixKinRows(sixKinRows)}

USEFUL-SPIRIT / MATTER-ELEMENT
Selected Focus: ${formatValue(selectedFocus)}
Meaning: ${formatValue(selectedFocusInfo?.meaning)}
Focus Lines: ${
    focusRows?.length
      ? focusRows.map((row) => `Line ${row.lineNumber}`).join(", ")
      : "None found"
  }
Focus Reading: ${formatValue(focusSummary)}

RULE GRAPH
${formatRuleGraph(ruleGraph)}

RULE CONCLUSION
${formatValue(ruleGraph?.conclusion)}

CONFLICT REPORT
Confidence: ${formatValue(conflictReport?.confidence)}
${formatConflicts(conflictReport)}

RECOMMENDATION
${formatRecommendation(recommendation)}

PALACE RULES PREVIEW
${formatPalaceNotes(palaceRules)}

PALACE RULES SUMMARY
${formatValue(palaceRules?.summary)}

HIDDEN / FLYING SPIRIT PREVIEW
${formatHiddenNotes(hiddenSpirit)}

HIDDEN / FLYING SPIRIT SUMMARY
${formatValue(hiddenSpirit?.summary)}

NEXT ENGINE NEEDED
True Solar-Term Calendar Engine → True WWG Palace Rules → Hidden/Flying Spirit Logic`;
}