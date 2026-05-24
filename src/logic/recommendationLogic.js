function clean(value) {
  return String(value || "").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function getFocusConditionText(focusRows) {
  if (!Array.isArray(focusRows) || focusRows.length === 0) {
    return "";
  }

  return focusRows
    .map((row) =>
      [
        row.condition?.summary,
        ...(Array.isArray(row.condition?.notes) ? row.condition.notes : []),
      ]
        .filter(Boolean)
        .join(" ")
    )
    .join(" ");
}

function hasText(text, keyword) {
  return lower(text).includes(lower(keyword));
}

function getMovingLineText(movingLines) {
  if (!Array.isArray(movingLines) || movingLines.length === 0) {
    return "No moving lines.";
  }

  return `Moving line${movingLines.length === 1 ? "" : "s"}: ${movingLines.join(
    ", "
  )}.`;
}

function hasMovingLines(movingLines) {
  return Array.isArray(movingLines) && movingLines.length > 0;
}

function getMethodPlainName(selectedMethod) {
  const methodMap = {
    GLDM: "gain, loss, money, resources, and profit",
    TDM: "timing and arrival",
    RIDM: "relationship, development, health, or progression",
    CDM: "competition, opposition, and rivals",
    ADM: "overall auspiciousness",
  };

  return methodMap[selectedMethod] || "the selected matter";
}

function getFocusPlainMeaning(selectedFocus) {
  const focusMap = {
    "Asset-line": "money, profit, resources, goods, or controllable value",
    "Officer-line":
      "authority, pressure, discipline, career, illness, or obligation",
    "Parent-line": "documents, protection, support, property, or information",
    "Offspring-line": "output, products, creativity, relief, children, or results",
    "Sibling-line": "competition, peers, expenses, rivals, or resource drain",
    Self: "the person asking, personal capacity, or self-position",
  };

  return focusMap[selectedFocus] || "the selected useful spirit";
}

function getFocusLineLabels(focusRows) {
  if (!Array.isArray(focusRows) || focusRows.length === 0) {
    return "";
  }

  return focusRows.map((row) => `Line ${row.lineNumber}`).join(", ");
}

function buildSignals({ selectedFocus, focusRows, movingLines, clarityScore }) {
  const conditionText = getFocusConditionText(focusRows);

  const supportingSigns = [];
  const warningSigns = [];

  if (!Array.isArray(focusRows) || focusRows.length === 0) {
    warningSigns.push(
      `${selectedFocus} is not visible in the current chart layer, so the matter is harder to judge at this MVP stage.`
    );
  } else {
    supportingSigns.push(
      `${selectedFocus} is visible on ${getFocusLineLabels(
        focusRows
      )}, so the matter is present in the chart.`
    );
  }

  if (hasText(conditionText, "supported")) {
    supportingSigns.push(
      `${selectedFocus} is supported, which gives the matter usable strength.`
    );
  }

  if (hasText(conditionText, "active moving line")) {
    supportingSigns.push(
      `${selectedFocus} is connected to a moving line, showing activity, change, or development.`
    );
  }

  if (hasText(conditionText, "clashed")) {
    warningSigns.push(
      `${selectedFocus} is clashed, which shows disruption, pressure, instability, delay, or extra effort.`
    );
  }

  if (hasText(conditionText, "void")) {
    warningSigns.push(
      `${selectedFocus} is affected by void, so the matter may be weak, delayed, absent, or not fully available yet.`
    );
  }

  if (hasText(conditionText, "weak")) {
    warningSigns.push(
      `${selectedFocus} appears weak, so the matter may not have enough strength yet.`
    );
  }

  if (hasText(conditionText, "damaged")) {
    warningSigns.push(
      `${selectedFocus} is damaged, so the matter may face loss, blockage, or instability.`
    );
  }

  if (!hasMovingLines(movingLines)) {
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
    supportingSigns,
    warningSigns,
  };
}

function classifyJudgment({
  focusRows,
  conditionText,
  movingLines,
  supportingSigns,
  warningSigns,
  clarityScore,
}) {
  const focusVisible = Array.isArray(focusRows) && focusRows.length > 0;
  const supported = hasText(conditionText, "supported");
  const active = hasText(conditionText, "active moving line");
  const clashed = hasText(conditionText, "clashed");
  const voided = hasText(conditionText, "void");
  const weak = hasText(conditionText, "weak");
  const damaged = hasText(conditionText, "damaged");
  const staticChart = !hasMovingLines(movingLines);

  if (clarityScore < 50) {
    return {
      label: "Too unclear to judge",
      confidence: "Low",
      polarity: "unclear",
    };
  }

  if (!focusVisible) {
    return {
      label: "Too unclear to judge",
      confidence: "Low",
      polarity: "unclear",
    };
  }

  if (staticChart) {
    if (supported && !clashed && !voided && !weak && !damaged) {
      return {
        label: "Static / Slow Favorable",
        confidence: "Medium",
        polarity: "static-positive",
      };
    }

    if (supported && (clashed || voided || weak || damaged)) {
      return {
        label: "Static / Mixed Signal",
        confidence: "Medium-Low",
        polarity: "static-mixed",
      };
    }

    if (!supported && !voided && !weak && !damaged) {
      return {
        label: "Static / Needs Activation",
        confidence: "Medium-Low",
        polarity: "static-neutral",
      };
    }

    return {
      label: "Static / Weak Signal",
      confidence: "Medium-Low",
      polarity: "static-negative",
    };
  }

  if (supported && active && !clashed && !voided && !weak && !damaged) {
    return {
      label: "Strong Yes",
      confidence: "High",
      polarity: "positive",
    };
  }

  if (supported && !clashed && !voided && !damaged) {
    return {
      label: "Cautious Yes",
      confidence: "Medium-High",
      polarity: "positive",
    };
  }

  if (supported && (clashed || voided || damaged || weak)) {
    return {
      label: "Cautious Yes",
      confidence: "Medium",
      polarity: "mixed-positive",
    };
  }

  if (!supported && active && !voided && !damaged) {
    return {
      label: "Mixed / Unstable",
      confidence: "Medium",
      polarity: "mixed",
    };
  }

  if (voided || damaged || weak) {
    return {
      label: "Weak No",
      confidence: "Medium",
      polarity: "negative",
    };
  }

  if (supportingSigns.length > warningSigns.length) {
    return {
      label: "Cautious Yes",
      confidence: "Medium",
      polarity: "mixed-positive",
    };
  }

  if (warningSigns.length > supportingSigns.length) {
    return {
      label: "Mixed / Unstable",
      confidence: "Medium",
      polarity: "mixed",
    };
  }

  return {
    label: "Mixed / Unstable",
    confidence: "Medium",
    polarity: "mixed",
  };
}

function buildPlainMeaning({
  judgment,
  selectedMethod,
  selectedFocus,
  focusRows,
  conditionText,
}) {
  const matter = getFocusPlainMeaning(selectedFocus);
  const methodMeaning = getMethodPlainName(selectedMethod);
  const supported = hasText(conditionText, "supported");
  const clashed = hasText(conditionText, "clashed");
  const voided = hasText(conditionText, "void");
  const weak = hasText(conditionText, "weak");
  const damaged = hasText(conditionText, "damaged");
  const active = hasText(conditionText, "active moving line");

  if (!Array.isArray(focusRows) || focusRows.length === 0) {
    return `The chart does not show the main ${matter} clearly enough in this MVP layer. Treat the result as incomplete until deeper palace, hidden-spirit, and calendar rules are added.`;
  }

  if (judgment.label === "Static / Slow Favorable") {
    return `The chart gives a quiet but favorable signal for ${methodMeaning}. The ${selectedFocus} is visible and supported, but there are no moving lines, so the matter may develop slowly or require steady practical effort before results become visible.`;
  }

  if (judgment.label === "Static / Needs Activation") {
    return `The ${matter} factor is present, but the chart is static. This means the matter exists, but it is not showing strong active movement yet. It may require deliberate action before the desired result appears.`;
  }

  if (judgment.label === "Static / Mixed Signal") {
    return `The chart shows the matter is present, but the signal is static and mixed. The ${selectedFocus} has some support, but it also has pressure or weakness, so the outcome may require correction, effort, or better conditions.`;
  }

  if (judgment.label === "Static / Weak Signal") {
    return `The chart is static and the ${selectedFocus} is not strong enough yet. The desired result may not develop unless the conditions are improved or activated by practical action.`;
  }

  if (judgment.label === "Strong Yes") {
    return `The chart gives a strong favorable signal for ${methodMeaning}. The matter is visible, supported, and active, so the outcome has real strength.`;
  }

  if (judgment.label === "Cautious Yes") {
    if (supported && clashed) {
      return `The chart shows real potential for ${methodMeaning}, but the signal is not fully stable. The ${selectedFocus} is visible and supported, yet it is also clashed, so the result may require extra effort, correction, or stronger follow-through.`;
    }

    if (supported && voided) {
      return `The chart shows potential for ${methodMeaning}, but the result may be delayed or not fully available yet because the ${selectedFocus} is affected by void.`;
    }

    if (supported && active) {
      return `The chart gives a favorable signal for ${methodMeaning}. The ${selectedFocus} is visible, supported, and active, but the app should still wait for deeper confirmation before treating this as guaranteed.`;
    }

    return `The chart gives a favorable but cautious signal for ${methodMeaning}. The matter is present and usable, but not strong enough yet to call it guaranteed.`;
  }

  if (judgment.label === "Mixed / Unstable") {
    return `The chart shows movement or presence, but the signal is unstable. The matter may develop, but there are enough conflicts or missing supports that the outcome should not be treated as settled.`;
  }

  if (judgment.label === "Weak No") {
    return `The chart shows the matter is weak, damaged, void, or not sufficiently supported. The outcome is unlikely to be strong unless conditions change.`;
  }

  if (judgment.label === "Blocked") {
    return `The chart shows blockage or strong damage around the matter. This points against the desired outcome unless a later reading shows improvement.`;
  }

  if (weak || damaged || voided) {
    return `The chart is not strong enough for a reliable favorable judgment. The ${selectedFocus} needs better support before the desired outcome can be trusted.`;
  }

  return `The chart is not clear enough for a reliable final judgment yet. Improve the question, calendar settings, and line data before relying on the result.`;
}

function buildAction({
  judgment,
  selectedMethod,
  selectedFocus,
  conditionText,
}) {
  const clashed = hasText(conditionText, "clashed");
  const voided = hasText(conditionText, "void");

  if (selectedMethod === "GLDM") {
    if (judgment.label === "Strong Yes") {
      return "Move forward actively. Strengthen the offer, promote it, and track money signals closely because the chart supports real profit potential.";
    }

    if (judgment.label === "Cautious Yes") {
      if (clashed) {
        return "Keep building and promoting, but do not assume passive profit. Treat the timeframe as a validation window: improve positioning, get users, test pricing, and remove friction.";
      }

      if (voided) {
        return "Keep preparing the offer, but watch for delay. Focus on making the product clearer and easier to buy before expecting steady profit.";
      }

      return "Continue the project and look for practical traction. Push for users, feedback, and revenue tests before making a final business decision.";
    }

    if (judgment.label === "Static / Slow Favorable") {
      return "Keep going, but expect gradual progress rather than sudden profit. Use the timeframe to build traction, improve the offer, test pricing, and make the path to payment clearer.";
    }

    if (judgment.label === "Static / Needs Activation") {
      return "Do not wait passively. Activate the money path through marketing, clearer positioning, user feedback, pricing tests, and direct outreach.";
    }

    if (judgment.label === "Static / Mixed Signal") {
      return "Proceed carefully. The profit factor exists, but the path is not clean yet. Reduce friction, improve the offer, and look for stronger traction before expecting reliable income.";
    }

    if (judgment.label === "Static / Weak Signal") {
      return "Do not rely on near-term profit yet. Improve the app, audience, offer, and sales path first, then cast again when the conditions are stronger.";
    }

    if (judgment.label === "Mixed / Unstable") {
      return "Do not overcommit yet. Test demand, reduce costs, improve the offer, and look for stronger confirmation before relying on profit.";
    }

    if (judgment.label === "Weak No") {
      return "Avoid expecting near-term profit without changing the conditions. Improve the product, audience, offer, and sales path first.";
    }
  }

  if (judgment.label === "Static / Slow Favorable") {
    return "Move forward steadily. The matter is favorable but slow, so focus on consistent practical action.";
  }

  if (judgment.label === "Static / Needs Activation") {
    return "Take deliberate action to activate the matter. Do not wait for the situation to move by itself.";
  }

  if (judgment.label === "Static / Mixed Signal") {
    return "Proceed carefully and improve the weak points before relying on the outcome.";
  }

  if (judgment.label === "Static / Weak Signal") {
    return "Do not rely on the desired outcome yet. Conditions need to be strengthened first.";
  }

  if (judgment.label === "Strong Yes") {
    return "Move forward with confidence, while still checking the practical details.";
  }

  if (judgment.label === "Cautious Yes") {
    return "Move forward carefully. The signal is favorable, but it still needs practical confirmation.";
  }

  if (judgment.label === "Mixed / Unstable") {
    return "Pause before making a major decision. Improve the conditions and look for clearer confirmation.";
  }

  if (judgment.label === "Weak No") {
    return "Do not rely on the desired outcome yet. Conditions need to improve first.";
  }

  return "Clarify the question and complete the missing chart rules before making a final decision.";
}

function buildNextCheck({
  selectedMethod,
  selectedFocus,
  movingLines,
}) {
  const movingText = getMovingLineText(movingLines);

  if (selectedMethod === "GLDM") {
    if (!hasMovingLines(movingLines)) {
      return `Next check: because the chart is static, review whether the ${selectedFocus} is supported, void, clashed, or weak. Then check true prosperity rules, Shi/Ying placement, and hidden/flying spirit logic. ${movingText}`;
    }

    return `Next check: analyze the ${selectedFocus} against moving lines, transformed hexagram, true prosperity rules, and hidden/flying spirit logic. ${movingText}`;
  }

  if (selectedMethod === "TDM") {
    return `Next check: compare moving lines, day/month strength, and transformed lines to estimate timing. ${movingText}`;
  }

  return `Next check: compare the focus line against Shi/Ying, moving lines, transformed hexagram, and hidden/flying spirit logic. ${movingText}`;
}

export function buildRecommendation({
  selectedMethod,
  selectedFocus,
  focusRows,
  focusSummary,
  ruleConclusion,
  conflictReport,
  movingLines,
  clarityScore,
}) {
  const conditionText = getFocusConditionText(focusRows);

  const { supportingSigns, warningSigns } = buildSignals({
    selectedFocus,
    focusRows,
    movingLines,
    clarityScore,
  });

  const judgment = classifyJudgment({
    focusRows,
    conditionText,
    movingLines,
    supportingSigns,
    warningSigns,
    clarityScore,
  });

  const plainMeaning = buildPlainMeaning({
    judgment,
    selectedMethod,
    selectedFocus,
    focusRows,
    conditionText,
  });

  const action = buildAction({
    judgment,
    selectedMethod,
    selectedFocus,
    conditionText,
  });

  const nextCheck = buildNextCheck({
    selectedMethod,
    selectedFocus,
    movingLines,
    conditionText,
  });

  const risk =
    warningSigns.length > 0
      ? warningSigns.join(" ")
      : "No major warning signs are visible in the current MVP layer, but deeper WWG rules still need confirmation.";

  const reason =
    supportingSigns.length > 0
      ? supportingSigns.join(" ")
      : ruleConclusion || focusSummary || "No strong supporting sign found yet.";

  return {
    finalJudgment: judgment.label,
    confidence: judgment.confidence,
    polarity: judgment.polarity,
    plainMeaning,
    supportingSigns,
    warningSigns,

    result: `Final Judgment: ${judgment.label}`,
    reason: `Plain-English meaning: ${plainMeaning} Supporting signs: ${reason}`,
    risk: `Warning signs: ${risk}`,
    nextCheck,
    action,

    recommendedAction: action,
    originalFocusSummary: focusSummary,
    originalRuleConclusion: ruleConclusion,
    originalConflictConfidence:
      conflictReport?.confidence || judgment.confidence,
  };
}