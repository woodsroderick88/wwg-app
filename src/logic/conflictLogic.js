export function buildConflictReport({
  selectedMethod,
  selectedFocus,
  focusRows,
  movingLines,
  clarityScore,
}) {
  const conflicts = [];

  if (clarityScore < 70) {
    conflicts.push({
      level: "Medium",
      title: "Question setup needs clarity",
      text: "The question setup is missing one or more important fields. A clearer setup improves the reliability of the reading.",
    });
  }

  if (focusRows.length === 0) {
    conflicts.push({
      level: "High",
      title: "Matter-element not visible",
      text: `${selectedFocus} does not appear in the visible six lines. Hidden-spirit logic may be needed later.`,
    });
  }

  focusRows.forEach((row) => {
    if (row.condition.notes.includes("Day void")) {
      conflicts.push({
        level: "High",
        title: `Line ${row.lineNumber} is void`,
        text: `The selected focus appears on Line ${row.lineNumber}, but it is in day void. This can show delay, emptiness, weakness, or something not yet available.`,
      });
    }

    if (
      row.condition.notes.includes("Clashed by day") ||
      row.condition.notes.includes("Clashed by month")
    ) {
      conflicts.push({
        level: "Medium",
        title: `Line ${row.lineNumber} is clashed`,
        text: `The selected focus appears on Line ${row.lineNumber}, but it is clashed by the day or month branch. This can show disturbance, damage, urgency, or instability.`,
      });
    }

    if (
      row.condition.notes.some((note) => note.includes("Supported")) &&
      row.condition.notes.some((note) => note.includes("Clashed"))
    ) {
      conflicts.push({
        level: "Medium",
        title: `Line ${row.lineNumber} has mixed signals`,
        text: "The selected focus is both supported and damaged. This suggests the matter exists, but the outcome is not clean yet.",
      });
    }
  });

  if (selectedMethod === "TDM" && movingLines.length === 0) {
    conflicts.push({
      level: "Medium",
      title: "Timing question has no moving line",
      text: "TDM usually benefits from active movement. With no moving line, timing may require void-filling, branch activation, or another timing rule later.",
    });
  }

  if (conflicts.length === 0) {
    conflicts.push({
      level: "Low",
      title: "No major conflict detected",
      text: "The current visible chart does not show an obvious contradiction at this MVP layer.",
    });
  }

  const highCount = conflicts.filter((item) => item.level === "High").length;
  const mediumCount = conflicts.filter((item) => item.level === "Medium").length;

  let confidence = "High";

  if (highCount > 0) {
    confidence = "Low";
  } else if (mediumCount > 0) {
    confidence = "Medium";
  }

  return {
    conflicts,
    confidence,
  };
}