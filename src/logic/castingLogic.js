const COIN_LINE_MAP = {
  6: {
    lineKey: "oldYin",
    label: "Old Yin",
    value: "yin",
    moving: true,
    transformedValue: "yang",
    meaning: "Changing yin line. This line is active and transforms into yang.",
  },
  7: {
    lineKey: "youngYang",
    label: "Young Yang",
    value: "yang",
    moving: false,
    transformedValue: "yang",
    meaning: "Stable yang line. This line does not transform.",
  },
  8: {
    lineKey: "youngYin",
    label: "Young Yin",
    value: "yin",
    moving: false,
    transformedValue: "yin",
    meaning: "Stable yin line. This line does not transform.",
  },
  9: {
    lineKey: "oldYang",
    label: "Old Yang",
    value: "yang",
    moving: true,
    transformedValue: "yin",
    meaning: "Changing yang line. This line is active and transforms into yin.",
  },
};

function tossSingleCoin() {
  return Math.random() < 0.5 ? "heads" : "tails";
}

function getCoinValue(side) {
  return side === "heads" ? 3 : 2;
}

function castSingleLine(lineNumber) {
  const coins = [tossSingleCoin(), tossSingleCoin(), tossSingleCoin()];
  const total = coins.reduce((sum, side) => sum + getCoinValue(side), 0);
  const line = COIN_LINE_MAP[total];

  return {
    lineNumber,
    coins,
    total,
    lineKey: line.lineKey,
    label: line.label,
    value: line.value,
    moving: line.moving,
    transformedValue: line.transformedValue,
    meaning: line.meaning,
  };
}

export function castSixLinesWithCoins() {
  const results = Array.from({ length: 6 }, (_, index) =>
    castSingleLine(index + 1)
  );

  return {
    method: "Three-Coin Casting",
    castAt: new Date().toISOString(),
    results,
    lines: results.map((result) => result.lineKey),
    movingLines: results
      .filter((result) => result.moving)
      .map((result) => result.lineNumber),
  };
}

export function formatCoinCastingLine(result) {
  if (!result) {
    return "No line result.";
  }

  const coinText = result.coins
    .map((coin) => (coin === "heads" ? "H" : "T"))
    .join("-");

  return `Line ${result.lineNumber}: ${coinText} = ${result.total} → ${result.label}${
    result.moving ? " / moving" : ""
  }`;
}

export function buildCoinCastingSummary(castingHistory) {
  if (!Array.isArray(castingHistory) || castingHistory.length === 0) {
    return `CASTING MODE

Current mode:
Manual line entry

Casting note:
No automatic coin cast has been performed for this reading yet. Lines may have been entered manually.`;
  }

  const movingLines = castingHistory
    .filter((line) => line.moving)
    .map((line) => `Line ${line.lineNumber}`);

  return `CASTING MODE

Current mode:
Three-Coin Casting

Line results:
${castingHistory.map(formatCoinCastingLine).join("\n")}

Moving lines:
${movingLines.length ? movingLines.join(", ") : "None"}

Casting note:
Lines are generated from bottom to top. Old Yin and Old Yang are moving lines and create the transformed hexagram.`;
}

export function getCoinCastingLegend() {
  return [
    {
      total: 6,
      label: "Old Yin",
      coins: "T-T-T",
      lineKey: "oldYin",
      moving: true,
      transformsTo: "Yang",
      meaning: "Changing yin. Active line.",
    },
    {
      total: 7,
      label: "Young Yang",
      coins: "H-T-T",
      lineKey: "youngYang",
      moving: false,
      transformsTo: "Yang",
      meaning: "Stable yang. Static line.",
    },
    {
      total: 8,
      label: "Young Yin",
      coins: "H-H-T",
      lineKey: "youngYin",
      moving: false,
      transformsTo: "Yin",
      meaning: "Stable yin. Static line.",
    },
    {
      total: 9,
      label: "Old Yang",
      coins: "H-H-H",
      lineKey: "oldYang",
      moving: true,
      transformsTo: "Yin",
      meaning: "Changing yang. Active line.",
    },
  ];
}