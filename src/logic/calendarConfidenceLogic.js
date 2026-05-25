function clean(value) {
  return String(value || "").trim();
}

function hasValue(value) {
  return clean(value).length > 0;
}

export function buildCalendarConfidence({
  castingDate,
  castingTime,
  location,
  manualCalendarMode,
  calendarSource,
  calendarSourceLabel,
  calendarStatusLabel,
  calendarStatusNote,
}) {
  const hasCastingDate = hasValue(castingDate);
  const hasCastingTime = hasValue(castingTime);
  const hasLocation = hasValue(location);

  const source = clean(calendarSource);
  const sourceLabel = clean(calendarSourceLabel) || "Unknown calendar source";
  const statusLabel = clean(calendarStatusLabel) || "Unknown calendar status";
  const statusNote = clean(calendarStatusNote);

  const missingItems = [];

  if (!hasCastingDate) {
    missingItems.push("casting date");
  }

  if (!hasCastingTime) {
    missingItems.push("casting time");
  }

  if (!hasLocation) {
    missingItems.push("location / timezone");
  }

  if (manualCalendarMode) {
    return {
      level: "Manual",
      score: hasCastingDate && hasCastingTime ? 85 : 70,
      isReliableForTiming: hasCastingDate && hasCastingTime,
      isFallback: false,
      isManual: true,
      hasCastingDate,
      hasCastingTime,
      hasLocation,
      missingItems,
      source,
      sourceLabel,
      statusLabel,
      statusNote,
      label:
        hasCastingDate && hasCastingTime
          ? "Manual calendar override active"
          : "Manual calendar override active, but casting date/time are incomplete",
      summary:
        hasCastingDate && hasCastingTime
          ? "Manual calendar override is active. The reading can use the manually selected Chinese calendar values, but exact timing still depends on the accuracy of the manual inputs."
          : "Manual calendar override is active, but the casting date/time are incomplete. Use the structure reading cautiously until the casting moment is fully recorded.",
      warning:
        hasCastingDate && hasCastingTime
          ? ""
          : "Calendar confidence is limited because the casting date or time is missing even though manual override is active.",
    };
  }

  if (!hasCastingDate || !hasCastingTime) {
    return {
      level: "Low",
      score: 25,
      isReliableForTiming: false,
      isFallback: true,
      isManual: false,
      hasCastingDate,
      hasCastingTime,
      hasLocation,
      missingItems,
      source,
      sourceLabel,
      statusLabel,
      statusNote,
      label: "Low calendar confidence",
      summary:
        "The chart structure can still be reviewed, but timing and day/month strength should be treated cautiously because fallback calendar values are being used.",
      warning: `Calendar confidence is low because ${missingItems.join(
        " and "
      )} ${
        missingItems.length === 1 ? "is" : "are"
      } missing. Enter the casting date and time before relying on timing strength, day/month strength, void, clash, or activation timing.`,
    };
  }

  if (!hasLocation) {
    return {
      level: "Medium",
      score: 65,
      isReliableForTiming: true,
      isFallback: false,
      isManual: false,
      hasCastingDate,
      hasCastingTime,
      hasLocation,
      missingItems,
      source,
      sourceLabel,
      statusLabel,
      statusNote,
      label: "Medium calendar confidence",
      summary:
        "Casting date and time are present, but location/timezone is missing. The app can proceed, but timezone-sensitive timing should still be verified.",
      warning:
        "Calendar confidence is medium because location/timezone is missing. Add the casting location or timezone before relying on precise day-change or timing rules.",
    };
  }

  return {
    level: "High",
    score: 95,
    isReliableForTiming: true,
    isFallback: false,
    isManual: false,
    hasCastingDate,
    hasCastingTime,
    hasLocation,
    missingItems,
    source,
    sourceLabel,
    statusLabel,
    statusNote,
    label: "High calendar confidence",
    summary:
      "Casting date, time, and location/timezone are present. Calendar confidence is high for this MVP layer.",
    warning: "",
  };
}

export function formatCalendarConfidenceSummary(calendarConfidence) {
  if (!calendarConfidence) {
    return "Calendar confidence: Not calculated.";
  }

  const warning = calendarConfidence.warning
    ? `\nWarning: ${calendarConfidence.warning}`
    : "";

  return `Calendar confidence: ${calendarConfidence.level} / ${calendarConfidence.score}/100
${calendarConfidence.summary}${warning}`;
}