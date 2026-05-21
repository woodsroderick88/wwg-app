export function isFocusMatch(row, selectedFocus) {
  if (selectedFocus === "Moving line") return row.moving;
  if (selectedFocus === "Self-line") return row.lineNumber === 1;
  if (selectedFocus === "Object-line") return row.lineNumber === 4;

  return row.sixKin === selectedFocus;
}

export function getFocusSummary(selectedFocus, focusRows) {
  if (focusRows.length === 0) {
    return "No matching line is currently visible. This may mean the focus is hidden, absent, or needs the Object/Self logic layer later.";
  }

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

  if (strongRows.length && !weakRows.length) {
    return `${selectedFocus} is present and currently supported. This gives the matter-element usable strength.`;
  }

  if (weakRows.length && !strongRows.length) {
    return `${selectedFocus} is present but weakened, clashed, or void. This suggests the matter-element needs caution.`;
  }

  if (strongRows.length && weakRows.length) {
    return `${selectedFocus} appears in mixed condition. Some evidence supports the matter, while another part weakens it.`;
  }

  return `${selectedFocus} is present in a mostly neutral condition. The app needs more rule layers before making a firm judgment.`;
}