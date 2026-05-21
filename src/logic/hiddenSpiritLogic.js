export function buildHiddenSpiritPreview({
  selectedFocus,
  focusRows,
  sixKinRows,
  palaceRules,
  movingLines,
}) {
  const visibleFocusFound = focusRows.length > 0;

  const shiLine = palaceRules?.shiLine;
  const yingLine = palaceRules?.yingLine;

  const shiRow = sixKinRows.find((row) => row.lineNumber === shiLine);
  const yingRow = sixKinRows.find((row) => row.lineNumber === yingLine);

  const possibleFlyingRows = visibleFocusFound
    ? []
    : sixKinRows.filter((row) => row.lineNumber === shiLine || row.lineNumber === yingLine || row.moving);

  const hiddenSpiritStatus = visibleFocusFound
    ? "Visible useful spirit found"
    : "Visible useful spirit missing";

  const flyingSpiritStatus = visibleFocusFound
    ? "No flying-spirit cover needed at this MVP layer"
    : possibleFlyingRows.length
      ? "Possible flying-spirit cover candidates found"
      : "No clear flying-spirit cover candidate yet";

  const notes = [
    {
      title: "Visible useful spirit check",
      text: visibleFocusFound
        ? `${selectedFocus} is visible on line ${focusRows
            .map((row) => row.lineNumber)
            .join(", ")}. Hidden-spirit search is not required at this MVP layer.`
        : `${selectedFocus} is not visible in the six main lines. Future hidden-spirit logic should search the hidden stems/branches attached to the palace structure.`,
    },
    {
      title: "Shi / Ying relationship",
      text:
        shiRow && yingRow
          ? `Shi placeholder is line ${shiLine}: ${shiRow.branch.label} / ${shiRow.sixKin}. Ying placeholder is line ${yingLine}: ${yingRow.branch.label} / ${yingRow.sixKin}. Future logic should compare whether the hidden useful spirit is under Shi, Ying, or another active line.`
          : "Shi / Ying placeholders are not fully available yet.",
    },
    {
      title: "Flying spirit placeholder",
      text: visibleFocusFound
        ? "Because the useful spirit is visible, the current MVP does not need to identify a covering flying spirit."
        : possibleFlyingRows.length
          ? `Possible future flying-spirit cover candidates: ${possibleFlyingRows
              .map((row) => `Line ${row.lineNumber} ${row.branch.label} / ${row.sixKin}`)
              .join("; ")}.`
          : "No visible moving, Shi, or Ying line is currently marked as a likely flying-spirit cover candidate.",
    },
    {
      title: "Moving-line reveal check",
      text: movingLines.length
        ? `Moving lines exist on line ${movingLines.join(
            ", "
          )}. Future hidden-spirit rules should check whether movement reveals or activates a concealed useful spirit.`
        : "No moving lines are present, so the hidden spirit is not being visibly activated by movement at this MVP layer.",
    },
    {
      title: "Next required data",
      text: "To make this exact, the app needs a complete palace table containing each hexagram's hidden spirits, flying spirits, Shi line, Ying line, and palace-relative branch assignments.",
    },
  ];

  return {
    selectedFocus,
    visibleFocusFound,
    hiddenSpiritStatus,
    flyingSpiritStatus,
    possibleFlyingRows,
    shiLine,
    yingLine,
    notes,
    summary: buildHiddenSpiritSummary({
      selectedFocus,
      visibleFocusFound,
      focusRows,
      possibleFlyingRows,
      movingLines,
    }),
  };
}

function buildHiddenSpiritSummary({
  selectedFocus,
  visibleFocusFound,
  focusRows,
  possibleFlyingRows,
  movingLines,
}) {
  if (visibleFocusFound) {
    return `${selectedFocus} is visible on line ${focusRows
      .map((row) => row.lineNumber)
      .join(", ")}. Hidden-spirit search is not required yet.`;
  }

  const coverText = possibleFlyingRows.length
    ? `Possible cover candidates: ${possibleFlyingRows
        .map((row) => `Line ${row.lineNumber}`)
        .join(", ")}.`
    : "No clear cover candidate is identified yet.";

  const movementText = movingLines.length
    ? `Movement exists on line ${movingLines.join(", ")}.`
    : "No moving lines are present.";

  return `${selectedFocus} is not visible. Hidden-spirit search is needed. ${coverText} ${movementText}`;
}