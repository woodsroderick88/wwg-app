export function buildPalaceRulesPreview({
  originalHexagram,
  transformedHexagram,
  sixKinRows,
  selectedFocus,
  focusRows,
  movingLines,
}) {
  const originalPalace = originalHexagram?.palace?.palace || "Unknown Palace";
  const transformedPalace =
    transformedHexagram?.palace?.palace || "Unknown Palace";

  const originalElement = originalHexagram?.palace?.element || "Unknown";
  const transformedElement = transformedHexagram?.palace?.element || "Unknown";

  const shiLine = inferShiLine(originalHexagram);
  const yingLine = inferYingLine(shiLine);

  const shiRow = sixKinRows.find((row) => row.lineNumber === shiLine);
  const yingRow = sixKinRows.find((row) => row.lineNumber === yingLine);

  const focusLineNumbers = focusRows.map((row) => row.lineNumber);

  const palaceNotes = [
    {
      title: "Original palace",
      text: `The original hexagram belongs to ${originalPalace}, with ${originalElement} as the working palace element.`,
    },
    {
      title: "Transformed palace",
      text: `The transformed hexagram belongs to ${transformedPalace}, with ${transformedElement} as the transformed palace element.`,
    },
    {
      title: "Shi / Self line placeholder",
      text: shiRow
        ? `Line ${shiLine} is currently treated as the Shi / Self placeholder. It is ${shiRow.branch.label} / ${shiRow.element}, assigned as ${shiRow.sixKin}, with condition: ${shiRow.condition.summary}.`
        : `Line ${shiLine} is currently treated as the Shi / Self placeholder.`,
    },
    {
      title: "Ying / Other line placeholder",
      text: yingRow
        ? `Line ${yingLine} is currently treated as the Ying / Other placeholder. It is ${yingRow.branch.label} / ${yingRow.element}, assigned as ${yingRow.sixKin}, with condition: ${yingRow.condition.summary}.`
        : `Line ${yingLine} is currently treated as the Ying / Other placeholder.`,
    },
    {
      title: "Focus relationship",
      text: focusLineNumbers.length
        ? `${selectedFocus} appears on line ${focusLineNumbers.join(
            ", "
          )}. This allows the future palace engine to compare the matter line against Shi, Ying, moving lines, and hidden/flying spirits.`
        : `${selectedFocus} does not appear directly in the visible six lines. Future hidden-spirit logic should check whether it is concealed.`,
    },
    {
      title: "Moving-line palace effect",
      text: movingLines.length
        ? `Moving lines are present on line ${movingLines.join(
            ", "
          )}. Future palace rules should check whether movement strengthens, weakens, reveals, hides, combines, clashes, or transforms the matter.`
        : "No moving lines are present. Future palace rules should treat this as a mostly static chart unless hidden/flying spirit logic changes the reading.",
    },
    {
      title: "Hidden / Flying spirit placeholder",
      text: "Hidden Spirit / 伏神 and Flying Spirit / 飞神 logic is not active yet. This section reserves the rule layer where concealed useful spirits and covering lines will be calculated.",
    },
  ];

  return {
    originalPalace,
    transformedPalace,
    originalElement,
    transformedElement,
    shiLine,
    yingLine,
    shiRow,
    yingRow,
    focusLineNumbers,
    notes: palaceNotes,
    summary: buildPalaceSummary({
      originalPalace,
      transformedPalace,
      shiLine,
      yingLine,
      selectedFocus,
      focusLineNumbers,
      movingLines,
    }),
  };
}

function inferShiLine(hexagram) {
  const number = hexagram?.kingWen?.number;

  const shiLineByHexagramNumber = {
    1: 6,
    2: 6,
    3: 2,
    4: 3,
    5: 5,
    6: 4,
    7: 3,
    8: 3,
    9: 4,
    10: 3,
    11: 3,
    12: 3,
    13: 2,
    14: 3,
    15: 3,
    16: 4,
    17: 1,
    18: 3,
    19: 2,
    20: 4,
    21: 4,
    22: 5,
    23: 5,
    24: 1,
    25: 4,
    26: 2,
    27: 4,
    28: 4,
    29: 6,
    30: 6,
    31: 3,
    32: 3,
    33: 2,
    34: 4,
    35: 4,
    36: 3,
    37: 3,
    38: 4,
    39: 3,
    40: 4,
    41: 3,
    42: 4,
    43: 5,
    44: 1,
    45: 2,
    46: 4,
    47: 4,
    48: 3,
    49: 4,
    50: 2,
    51: 6,
    52: 6,
    53: 3,
    54: 4,
    55: 5,
    56: 4,
    57: 6,
    58: 6,
    59: 4,
    60: 3,
    61: 4,
    62: 4,
    63: 3,
    64: 4,
  };

  return shiLineByHexagramNumber[number] || 3;
}

function inferYingLine(shiLine) {
  if (shiLine <= 3) {
    return shiLine + 3;
  }

  return shiLine - 3;
}

function buildPalaceSummary({
  originalPalace,
  transformedPalace,
  shiLine,
  yingLine,
  selectedFocus,
  focusLineNumbers,
  movingLines,
}) {
  const focusText = focusLineNumbers.length
    ? `${selectedFocus} is visible on line ${focusLineNumbers.join(", ")}`
    : `${selectedFocus} is not visible in the six main lines`;

  const movingText = movingLines.length
    ? `Moving lines are active on line ${movingLines.join(", ")}.`
    : "No moving lines are active.";

  return `Original palace: ${originalPalace}. Transformed palace: ${transformedPalace}. Shi placeholder: Line ${shiLine}. Ying placeholder: Line ${yingLine}. ${focusText}. ${movingText}`;
}