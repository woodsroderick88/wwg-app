import { earthlyBranches, voidPairs } from "../data/branches";
import { heavenlyStems } from "../data/stems";

const DEFAULT_MONTH_BRANCH = "zi";
const DEFAULT_DAY_BRANCH = "wu";
const DEFAULT_DAY_STEM = "jia";
const DEFAULT_VOID_PAIR = "xu-hai";

const STEM_BRANCH_CYCLE = [
  ["jia", "zi"],
  ["yi", "chou"],
  ["bing", "yin"],
  ["ding", "mao"],
  ["wu", "chen"],
  ["ji", "si"],
  ["geng", "wu"],
  ["xin", "wei"],
  ["ren", "shen"],
  ["gui", "you"],
  ["jia", "xu"],
  ["yi", "hai"],
  ["bing", "zi"],
  ["ding", "chou"],
  ["wu", "yin"],
  ["ji", "mao"],
  ["geng", "chen"],
  ["xin", "si"],
  ["ren", "wu"],
  ["gui", "wei"],
  ["jia", "shen"],
  ["yi", "you"],
  ["bing", "xu"],
  ["ding", "hai"],
  ["wu", "zi"],
  ["ji", "chou"],
  ["geng", "yin"],
  ["xin", "mao"],
  ["ren", "chen"],
  ["gui", "si"],
  ["jia", "wu"],
  ["yi", "wei"],
  ["bing", "shen"],
  ["ding", "you"],
  ["wu", "xu"],
  ["ji", "hai"],
  ["geng", "zi"],
  ["xin", "chou"],
  ["ren", "yin"],
  ["gui", "mao"],
  ["jia", "chen"],
  ["yi", "si"],
  ["bing", "wu"],
  ["ding", "wei"],
  ["wu", "shen"],
  ["ji", "you"],
  ["geng", "xu"],
  ["xin", "hai"],
  ["ren", "zi"],
  ["gui", "chou"],
  ["jia", "yin"],
  ["yi", "mao"],
  ["bing", "chen"],
  ["ding", "si"],
  ["wu", "wu"],
  ["ji", "wei"],
  ["geng", "shen"],
  ["xin", "you"],
  ["ren", "xu"],
  ["gui", "hai"],
];

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

const MONTH_BRANCH_BY_GREGORIAN_MONTH = {
  1: "chou",
  2: "yin",
  3: "mao",
  4: "chen",
  5: "si",
  6: "wu",
  7: "wei",
  8: "shen",
  9: "you",
  10: "xu",
  11: "hai",
  12: "zi",
};

const VOID_PAIR_BY_CYCLE_GROUP = [
  "xu-hai",
  "shen-you",
  "wu-wei",
  "chen-si",
  "yin-mao",
  "zi-chou",
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

function parseDateParts(castingDate, castingTime, dayChangeRule) {
  if (!clean(castingDate)) {
    return null;
  }

  const dateParts = clean(castingDate)
    .split("-")
    .map((part) => Number(part));

  if (dateParts.length !== 3 || dateParts.some((part) => Number.isNaN(part))) {
    return null;
  }

  const [year, month, day] = dateParts;

  let adjustedDate = new Date(Date.UTC(year, month - 1, day));
  let dayAdjustedByRule = false;

  if (dayChangeRule === "23:00" && clean(castingTime)) {
    const [hourText] = clean(castingTime).split(":");
    const hour = Number(hourText);

    if (!Number.isNaN(hour) && hour >= 23) {
      adjustedDate = new Date(adjustedDate.getTime() + 24 * 60 * 60 * 1000);
      dayAdjustedByRule = true;
    }
  }

  const adjustedYear = adjustedDate.getUTCFullYear();
  const adjustedMonth = adjustedDate.getUTCMonth() + 1;
  const adjustedDay = adjustedDate.getUTCDate();

  return {
    year,
    month,
    day,
    adjustedYear,
    adjustedMonth,
    adjustedDay,
    dateKey: `${adjustedYear}-${String(adjustedMonth).padStart(
      2,
      "0"
    )}-${String(adjustedDay).padStart(2, "0")}`,
    dayAdjustedByRule,
  };
}

function getDayCycleIndex(dateParts) {
  if (!dateParts) {
    return 0;
  }

  const baseDate = Date.UTC(1984, 1, 2);
  const targetDate = Date.UTC(
    dateParts.adjustedYear,
    dateParts.adjustedMonth - 1,
    dateParts.adjustedDay
  );

  const dayDifference = Math.floor(
    (targetDate - baseDate) / (24 * 60 * 60 * 1000)
  );

  return ((dayDifference % 60) + 60) % 60;
}

function getAutomaticCalendar({ castingDate, castingTime, dayChangeRule }) {
  const dateParts = parseDateParts(castingDate, castingTime, dayChangeRule);

  if (!dateParts) {
    return null;
  }

  const cycleIndex = getDayCycleIndex(dateParts);
  const [dayStemKey, dayBranchKey] = STEM_BRANCH_CYCLE[cycleIndex];

  const monthBranchKey =
    MONTH_BRANCH_BY_GREGORIAN_MONTH[dateParts.adjustedMonth] ||
    DEFAULT_MONTH_BRANCH;

  const voidPairKey =
    VOID_PAIR_BY_CYCLE_GROUP[Math.floor(cycleIndex / 10)] ||
    DEFAULT_VOID_PAIR;

  return {
    dateParts,
    cycleIndex,
    monthBranchKey,
    dayStemKey,
    dayBranchKey,
    voidPairKey,
  };
}

function getContextStatus({
  castingDate,
  castingTime,
  manualCalendarMode,
  automaticCalendar,
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
      source: automaticCalendar ? "calculated" : "fallback",
      sourceLabel: automaticCalendar
        ? "Approximate calculated calendar"
        : "Fallback placeholder",
      statusLabel: automaticCalendar
        ? "Approximate date-based calendar values"
        : "Missing casting time",
      statusNote:
        "Casting date is present, but casting time is missing. Timing confidence is limited until the casting time is entered.",
    };
  }

  if (automaticCalendar) {
    return {
      source: "calculated",
      sourceLabel: "Approximate calculated calendar",
      statusLabel: "Approximate calendar values calculated",
      statusNote:
        "The app calculated approximate day/month values from the Gregorian input. This is an MVP calendar layer and should later be replaced by a true solar-term calendar engine.",
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
  const automaticCalendar = getAutomaticCalendar({
    castingDate,
    castingTime,
    dayChangeRule,
  });

  const status = getContextStatus({
    castingDate,
    castingTime,
    manualCalendarMode,
    automaticCalendar,
  });

  const activeMonthBranchKey = manualCalendarMode
    ? manualMonthBranch
    : automaticCalendar?.monthBranchKey ||
      monthBranchContext ||
      DEFAULT_MONTH_BRANCH;

  const activeDayBranchKey = manualCalendarMode
    ? manualDayBranch
    : automaticCalendar?.dayBranchKey ||
      dayBranchContext ||
      DEFAULT_DAY_BRANCH;

  const activeDayStemKey = manualCalendarMode
    ? manualDayStem
    : automaticCalendar?.dayStemKey || DEFAULT_DAY_STEM;

  const activeVoidPairKey = manualCalendarMode
    ? manualDayVoid
    : automaticCalendar?.voidPairKey || voidPairContext || DEFAULT_VOID_PAIR;

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

    automaticCalendar,

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

    branchOrder: BRANCH_ORDER,
  };
}