import { earthlyBranches, voidPairs } from "../data/branches";
import { heavenlyStems } from "../data/stems";
import { buildSolarTermCalendarFoundation } from "./solarTermCalendarLogic";

const DEFAULT_MONTH_BRANCH = "zi";
const DEFAULT_DAY_BRANCH = "wu";
const DEFAULT_DAY_STEM = "jia";
const DEFAULT_VOID_PAIR = "xu-hai";

const BRANCH_ORDER = [
  "zi",
  "chou",
  "yin",
  "mao",
  "chen",
  "si",
  "wu",
  "wei",
  "shen",
  "you",
  "xu",
  "hai",
];

function clean(value) {
  return String(value || "").trim();
}

function findBranch(key, fallbackKey = DEFAULT_MONTH_BRANCH) {
  return (
    earthlyBranches.find((branch) => branch.key === key) ||
    earthlyBranches.find((branch) => branch.key === fallbackKey) ||
    earthlyBranches[0]
  );
}

function findStem(key, fallbackKey = DEFAULT_DAY_STEM) {
  return (
    heavenlyStems.find((stem) => stem.key === key) ||
    heavenlyStems.find((stem) => stem.key === fallbackKey) ||
    heavenlyStems[0]
  );
}

function findVoidPair(key, fallbackKey = DEFAULT_VOID_PAIR) {
  return (
    voidPairs.find((pair) => pair.key === key) ||
    voidPairs.find((pair) => pair.key === fallbackKey) ||
    voidPairs[0]
  );
}

function getContextStatus({
  castingDate,
  castingTime,
  manualCalendarMode,
  solarTermCalendar,
}) {
  if (manualCalendarMode) {
    return {
      source: "manual",
      sourceLabel: "Manual override",
      statusLabel: "Manual calendar override active",
      statusNote:
        "Manual override is active. The app is using the manually selected month, day, stem, and void pair.",
    };
  }

  if (!clean(castingDate) && !clean(castingTime)) {
    return {
      source: "fallback",
      sourceLabel: "Fallback placeholder",
      statusLabel: "Using fallback placeholder values",
      statusNote:
        "Enter a casting date and time, or turn on manual calendar override.",
    };
  }

  if (!clean(castingDate)) {
    return {
      source: "fallback",
      sourceLabel: "Fallback placeholder",
      statusLabel: "Missing casting date",
      statusNote:
        "Casting time was entered, but casting date is missing. The app is still using fallback calendar values.",
    };
  }

  if (!clean(castingTime)) {
    return {
      source: solarTermCalendar?.ok ? "solar-term-foundation" : "fallback",
      sourceLabel: solarTermCalendar?.ok
        ? "Solar-term calendar foundation"
        : "Fallback placeholder",
      statusLabel: solarTermCalendar?.ok
        ? "Approximate date-based solar-term values"
        : "Missing casting time",
      statusNote: solarTermCalendar?.ok
        ? "Casting date is present, but casting time is missing. The app can estimate the solar-term month branch, but timing confidence is limited until the casting time is entered."
        : "Casting date is present, but the app could not calculate a solar-term foundation.",
    };
  }

  if (solarTermCalendar?.ok) {
    return {
      source: solarTermCalendar.source,
      sourceLabel: solarTermCalendar.sourceLabel,
      statusLabel: solarTermCalendar.statusLabel,
      statusNote: solarTermCalendar.statusNote,
    };
  }

  return {
    source: "fallback",
    sourceLabel: "Fallback placeholder",
    statusLabel: "Using fallback placeholder values",
    statusNote:
      "The app could not calculate calendar values from the current input, so fallback values are being used.",
  };
}

export function buildCalendarContext({
  castingDate = "",
  castingTime = "",
  dayChangeRule = "23:00",

  manualCalendarMode = false,
  manualMonthBranch = DEFAULT_MONTH_BRANCH,
  manualDayBranch = DEFAULT_DAY_BRANCH,
  manualDayStem = DEFAULT_DAY_STEM,
  manualDayVoid = DEFAULT_VOID_PAIR,

  monthBranchContext = DEFAULT_MONTH_BRANCH,
  dayBranchContext = DEFAULT_DAY_BRANCH,
  voidPairContext = DEFAULT_VOID_PAIR,
}) {
  const solarTermCalendar = buildSolarTermCalendarFoundation({
    castingDate,
    castingTime,
    dayChangeRule,
  });

  const status = getContextStatus({
    castingDate,
    castingTime,
    manualCalendarMode,
    solarTermCalendar,
  });

  const activeMonthBranchKey = manualCalendarMode
    ? manualMonthBranch
    : solarTermCalendar?.ok
    ? solarTermCalendar.monthBranchKey
    : monthBranchContext || DEFAULT_MONTH_BRANCH;

  const activeDayBranchKey = manualCalendarMode
    ? manualDayBranch
    : solarTermCalendar?.ok
    ? solarTermCalendar.dayBranchKey
    : dayBranchContext || DEFAULT_DAY_BRANCH;

  const activeDayStemKey = manualCalendarMode
    ? manualDayStem
    : solarTermCalendar?.ok
    ? solarTermCalendar.dayStemKey
    : DEFAULT_DAY_STEM;

  const activeVoidPairKey = manualCalendarMode
    ? manualDayVoid
    : solarTermCalendar?.ok
    ? solarTermCalendar.voidPairKey
    : voidPairContext || DEFAULT_VOID_PAIR;

  const monthBranch = findBranch(activeMonthBranchKey, DEFAULT_MONTH_BRANCH);
  const dayBranch = findBranch(activeDayBranchKey, DEFAULT_DAY_BRANCH);
  const dayStem = findStem(activeDayStemKey, DEFAULT_DAY_STEM);
  const voidPair = findVoidPair(activeVoidPairKey, DEFAULT_VOID_PAIR);

  const manualMonthBranchData = findBranch(
    manualMonthBranch,
    DEFAULT_MONTH_BRANCH
  );
  const manualDayBranchData = findBranch(manualDayBranch, DEFAULT_DAY_BRANCH);
  const manualDayStemData = findStem(manualDayStem, DEFAULT_DAY_STEM);
  const manualDayVoidData = findVoidPair(manualDayVoid, DEFAULT_VOID_PAIR);

  return {
    source: status.source,
    sourceLabel: status.sourceLabel,
    statusLabel: status.statusLabel,
    statusNote: status.statusNote,

    automaticCalendar: solarTermCalendar?.ok ? solarTermCalendar : null,
    solarTermCalendar,

    activeMonthBranchKey,
    activeDayBranchKey,
    activeVoidPairKey,

    monthBranch,
    dayBranch,
    dayStem,
    voidPair,

    manualMonthBranchData,
    manualDayBranchData,
    manualDayStemData,
    manualDayVoidData,

    solarMonthBoundary: solarTermCalendar?.solarMonthBoundary || null,
    solarTermNote: solarTermCalendar?.solarTermNote || "",

    branchOrder: BRANCH_ORDER,
  };
}