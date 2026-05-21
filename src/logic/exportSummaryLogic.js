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
  const ruleText = ruleGraph.rules
    .map((rule, index) => `${index + 1}. ${rule.title}: ${rule.text}`)
    .join("\n");

  const conflictText = conflictReport.conflicts
    .map(
      (conflict) =>
        `- ${conflict.level}: ${conflict.title} — ${conflict.text}`
    )
    .join("\n");

  const sixKinText = sixKinRows
    .map(
      (row) =>
        `Line ${row.lineNumber}: ${row.branch.label} / ${row.element} / ${row.sixKin} / ${row.condition.summary} (${row.condition.notes.join(", ")})`
    )
    .join("\n");

  const palaceRulesText = palaceRules?.notes
    ?.map((note, index) => `${index + 1}. ${note.title}: ${note.text}`)
    .join("\n");

  const hiddenSpiritText = hiddenSpirit?.notes
    ?.map((note, index) => `${index + 1}. ${note.title}: ${note.text}`)
    .join("\n");

  return `WEN WANG GUA MVP READING SUMMARY

QUESTION
${question.trim() || "No question entered."}

QUESTION CODING
Method: ${selectedMethod} — ${method.name}
Self: ${selfRole.trim() || "Not set"}
Object: ${objectRole.trim() || "Not set"}
Timeframe: ${timeframe.trim() || "Not set"}
Clarity Score: ${clarityScore}/100

CALENDAR
Gregorian Casting: ${
    castingDate && castingTime ? `${castingDate} at ${castingTime}` : "Not set"
  }
Location / Timezone: ${location.trim() || "Not set"}
Day Change Rule: ${dayChangeRule}
Calendar Source: ${
    calendarSource === "manual" ? "Manual override" : "Automatic engine pending"
  }
Chinese Calendar Status: ${
    manualCalendarMode
      ? `Manual override — Month: ${manualMonthBranchData.label}, Day: ${manualDayBranchData.label}, Stem: ${manualDayStemData.label}, Void: ${manualDayVoidData.label}`
      : "Pending calculation engine"
  }
Active Month / Day / Void: ${monthBranch.label} / ${dayBranch.label} / ${voidPair.label}

HEXAGRAMS
Original Hexagram: #${originalHexagram.kingWen.number} — ${originalHexagram.kingWen.name} / ${originalHexagram.kingWen.english}
Original Structure: ${originalHexagram.label}
Original Nature: ${originalHexagram.natureLabel}
Original Palace: ${originalHexagram.palace.palace}
Original Element: ${originalHexagram.palace.element}

Transformed Hexagram: #${transformedHexagram.kingWen.number} — ${transformedHexagram.kingWen.name} / ${transformedHexagram.kingWen.english}
Transformed Structure: ${transformedHexagram.label}
Transformed Nature: ${transformedHexagram.natureLabel}
Transformed Palace: ${transformedHexagram.palace.palace}
Transformed Element: ${transformedHexagram.palace.element}

MOVING LINES
${movingLines.length ? movingLines.join(", ") : "None"}

SIX-KINS / LINE CONDITIONS
${sixKinText}

USEFUL-SPIRIT / MATTER-ELEMENT
Selected Focus: ${selectedFocus}
Meaning: ${selectedFocusInfo?.meaning || "No meaning available"}
Focus Lines: ${
    focusRows.length
      ? focusRows.map((row) => `Line ${row.lineNumber}`).join(", ")
      : "None found"
  }
Focus Reading: ${focusSummary}

RULE GRAPH
${ruleText}

RULE CONCLUSION
${ruleGraph.conclusion}

CONFLICT REPORT
Confidence: ${conflictReport.confidence}
${conflictText}

RECOMMENDATION
Result: ${recommendation.result}
Reason: ${recommendation.reason}
Risk: ${recommendation.risk}
Next Check: ${recommendation.nextCheck}
Recommended Action: ${recommendation.action}

PALACE RULES PREVIEW
${palaceRulesText || "Palace rules preview not available yet."}

PALACE RULES SUMMARY
${palaceRules?.summary || "Not available yet."}

HIDDEN / FLYING SPIRIT PREVIEW
${hiddenSpiritText || "Hidden / Flying Spirit preview not available yet."}

HIDDEN / FLYING SPIRIT SUMMARY
${hiddenSpirit?.summary || "Not available yet."}

NEXT ENGINE NEEDED
True Calendar Engine → True WWG Palace Rules → Hidden/Flying Spirit Logic`;
}