import { lineTypes } from "../data/lines";
import { getHexagramInfo } from "./hexagramLogic";

const STABLE_YANG_KEY = "youngYang";
const STABLE_YIN_KEY = "youngYin";
const MOVING_YANG_KEY = "oldYang";
const MOVING_YIN_KEY = "oldYin";

function normalizeHexagramNumber(value) {
  const number = Number(String(value || "").trim());

  if (!Number.isInteger(number) || number < 1 || number > 64) {
    return null;
  }

  return number;
}

function parseMovingLines(value) {
  if (!value) {
    return [];
  }

  const lineNumbers = String(value)
    .split(/[,\s]+/)
    .map((item) => Number(item.trim()))
    .filter((number) => Number.isInteger(number) && number >= 1 && number <= 6);

  return [...new Set(lineNumbers)].sort((a, b) => a - b);
}

function buildAllPossibleLineValues() {
  const allLineValues = [];

  for (let mask = 0; mask < 64; mask += 1) {
    const values = [];

    for (let lineIndex = 0; lineIndex < 6; lineIndex += 1) {
      const isYang = Boolean(mask & (1 << lineIndex));
      values.push(isYang ? "yang" : "yin");
    }

    allLineValues.push(values);
  }

  return allLineValues;
}

function findLineValuesByHexagramNumber(hexagramNumber) {
  const allLineValues = buildAllPossibleLineValues();

  return (
    allLineValues.find((values) => {
      const hexagram = getHexagramInfo(values);
      return Number(hexagram?.kingWen?.number) === hexagramNumber;
    }) || null
  );
}

function lineValueToLineKey(value, isMoving) {
  if (value === "yang") {
    return isMoving ? MOVING_YANG_KEY : STABLE_YANG_KEY;
  }

  return isMoving ? MOVING_YIN_KEY : STABLE_YIN_KEY;
}

function buildLinesFromHexagramValues(values, movingLines) {
  return values.map((value, index) => {
    const lineNumber = index + 1;
    return lineValueToLineKey(value, movingLines.includes(lineNumber));
  });
}

function describeLine(lineKey, lineNumber) {
  const lineType = lineTypes[lineKey];

  return `Line ${lineNumber}: ${lineType?.label || lineKey}`;
}

export function buildManualHexagramEntry({
  originalHexagramNumber,
  movingLinesText,
}) {
  const hexagramNumber = normalizeHexagramNumber(originalHexagramNumber);

  if (!hexagramNumber) {
    return {
      ok: false,
      message: "Enter a valid King Wen hexagram number from 1 to 64.",
      lines: [],
      movingLines: [],
      originalHexagram: null,
      transformedHexagram: null,
      lineSummary: "",
    };
  }

  const originalValues = findLineValuesByHexagramNumber(hexagramNumber);

  if (!originalValues) {
    return {
      ok: false,
      message: `Could not find King Wen hexagram #${hexagramNumber}.`,
      lines: [],
      movingLines: [],
      originalHexagram: null,
      transformedHexagram: null,
      lineSummary: "",
    };
  }

  const movingLines = parseMovingLines(movingLinesText);
  const lines = buildLinesFromHexagramValues(originalValues, movingLines);

  const originalHexagram = getHexagramInfo(
    lines.map((lineKey) => lineTypes[lineKey].value)
  );

  const transformedHexagram = getHexagramInfo(
    lines.map((lineKey) => {
      if (lineKey === MOVING_YANG_KEY) return "yin";
      if (lineKey === MOVING_YIN_KEY) return "yang";
      return lineTypes[lineKey].value;
    })
  );

  const lineSummary = lines
    .map((lineKey, index) => describeLine(lineKey, index + 1))
    .join("\n");

  return {
    ok: true,
    message: `Manual hexagram entry applied: #${originalHexagram.kingWen.number} — ${originalHexagram.kingWen.name} transforms to #${transformedHexagram.kingWen.number} — ${transformedHexagram.kingWen.name}.`,
    lines,
    movingLines,
    originalHexagram,
    transformedHexagram,
    lineSummary,
  };
}