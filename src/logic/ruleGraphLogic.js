export function buildRuleGraph({
  selectedMethod,
  method,
  selectedFocus,
  selectedFocusInfo,
  focusRows,
  originalHexagram,
  transformedHexagram,
  monthBranch,
  dayBranch,
  voidPair,
  movingLines,
}) {
  const rules = [];

  rules.push({
    title: "Method selected",
    text: `The selected reading method is ${selectedMethod} — ${method.name}.`,
  });

  rules.push({
    title: "Matter-element chosen",
    text: `${selectedMethod} uses ${selectedFocus} as the current matter-element focus.`,
  });

  rules.push({
    title: "Focus meaning",
    text: selectedFocusInfo?.meaning || "No focus meaning available yet.",
  });

  rules.push({
    title: "Original hexagram identified",
    text: `The original hexagram is #${originalHexagram.kingWen.number} — ${originalHexagram.kingWen.name} / ${originalHexagram.kingWen.english}.`,
  });

  rules.push({
    title: "Original palace element",
    text: `The original hexagram belongs to ${originalHexagram.palace.palace}, so the working hexagram element is ${originalHexagram.palace.element}.`,
  });

  rules.push({
    title: "Transformed hexagram identified",
    text: `The transformed hexagram is #${transformedHexagram.kingWen.number} — ${transformedHexagram.kingWen.name} / ${transformedHexagram.kingWen.english}.`,
  });

  rules.push({
    title: "Time context",
    text: `The month branch is ${monthBranch.label}, the day branch is ${dayBranch.label}, and the day void pair is ${voidPair.label}.`,
  });

  if (movingLines.length) {
    rules.push({
      title: "Moving-line activity",
      text: `The active moving line(s) are: ${movingLines.join(
        ", "
      )}. Moving lines are important because they show active change.`,
    });
  } else {
    rules.push({
      title: "Moving-line activity",
      text: "There are no moving lines. The chart is currently read as a static condition.",
    });
  }

  if (focusRows.length) {
    focusRows.forEach((row) => {
      rules.push({
        title: `Focus found on Line ${row.lineNumber}`,
        text: `Line ${row.lineNumber} is ${row.branch.label} / ${row.element}, assigned as ${row.sixKin}, with condition: ${row.condition.summary}. Notes: ${row.condition.notes.join(
          " • "
        )}.`,
      });
    });
  } else {
    rules.push({
      title: "Focus not visible",
      text: `${selectedFocus} does not currently appear directly in the visible six lines. Later hidden-spirit and flying-spirit logic may be needed.`,
    });
  }

  let conclusion =
    "The app needs more rule layers before making a firm judgment.";

  if (focusRows.length) {
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
      conclusion = `${selectedFocus} is visible and supported. This gives the matter-element usable strength.`;
    } else if (weakRows.length && !strongRows.length) {
      conclusion = `${selectedFocus} is visible but weakened, clashed, or void. This suggests caution.`;
    } else if (strongRows.length && weakRows.length) {
      conclusion = `${selectedFocus} has mixed evidence. Some signs support the matter, while other signs weaken it.`;
    } else {
      conclusion = `${selectedFocus} is visible but mostly neutral. The matter exists, but the chart does not yet show strong support.`;
    }
  }

  return {
    rules,
    conclusion,
  };
}