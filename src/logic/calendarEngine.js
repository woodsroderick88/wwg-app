import { earthlyBranches, voidPairs } from "../data/branches";
import { heavenlyStems } from "../data/stems";

const STEM_SEQUENCE = [
  "jia",
  "yi",
  "bing",
  "ding",
  "wu",
  "ji",
  "geng",
  "xin",
  "ren",
  "gui",
];

const BRANCH_SEQUENCE = [
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

const VOID_PAIR_BY_STEM_BRANCH_GROUP = [
  {
    startStem: "jia",
    startBranch: "zi",
    branches: ["xu", "hai"],
    key: "xu-hai",
  },
  {
    startStem: "jia",
    startBranch: "xu",
    branches: ["shen", "you"],
    key: "shen-you",
  },
  {
    startStem: "jia",
    startBranch: "shen",
    branches: ["wu", "wei"],
    key: "wu-wei",
  },
  {
    startStem: "jia",
    startBranch: "wu",
    branches: ["chen", "si"],
    key: "chen-si",
  },
  {
    startStem: "jia",
    startBranch: "chen",
    branches: ["yin", "mao"],
    key: "yin-mao",
  },
  {
    startStem: "jia",
    startBranch: "yin",
    branches: ["zi", "chou"],
    key: "zi-chou",
  },
];

function findBranch(key, fallbackKey = "zi") {
  return (
    earthlyBranches.find((branch) => branch.key === key) ||
    earthlyBranches.find((branch) => branch.key === fallbackKey) ||
    earthlyBranches[0]
  );
}

function findStem(key, fallbackKey = "jia") {
  return (
    heavenlyStems.find((stem) => stem.key === key) ||
    heavenlyStems.find((stem) => stem.key === fallbackKey) ||
    heavenlyStems[0]
  );
}

function findVoidPair(key, fallbackKey = "xu-hai") {
  return (
    voidPairs.find((pair) => pair.key === key) ||
    voidPairs.find((pair) => pair.key === fallbackKey) ||
    voidPairs[0]
  );
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function parseDateTime({ castingDate, castingTime, dayChangeRule }) {
  if (!castingDate) {
    return null;
  }

  const [yearText, monthText, dayText] = String(castingDate).split("-");

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    return null;
  }

  const cleanTime = castingTime || "12:00";
  const [hourText = "12", minuteText = "00"] = String(cleanTime).split(":");

  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const adjustedDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  if (dayChangeRule === "23:00" && hour >= 23) {
    adjustedDate.setUTCDate(adjustedDate.getUTCDate() + 1);
  }

  return {
    year: adjustedDate.getUTCFullYear(),
    month: adjustedDate.getUTCMonth() + 1,
    day: adjustedDate.getUTCDate(),
    hour,
    minute,
    dateKey: `${adjustedDate.getUTCFullYear()}-${pad2(
      adjustedDate.getUTCMonth() + 1
    )}-${pad2(adjustedDate.getUTCDate())}`,
    usedTime: Boolean(castingTime),
    dayAdjustedByRule: dayChangeRule === "23:00" && hour >= 23,
  };
}

function getDayCycleIndex(dateParts) {
  if (!dateParts) {
    return 0;
  }

  const baseDate = Date.UTC(1984, 1, 2);
  const targetDate = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day);

  const dayDifference = Math.floor(
    (targetDate - baseDate) / (24 * 60 * 60 * 1000)
  );

  return ((dayDifference % 60) + 60) % 60;
}

function getDayStemKey(dateParts) {
  const dayCycleIndex = getDayCycleIndex(dateParts);
  return STEM_SEQUENCE[dayCycleIndex % 10];
}

function getDayBranchKey(dateParts) {
  const dayCycleIndex = getDayCycleIndex(dateParts);
  return BRANCH_SEQUENCE[dayCycleIndex % 12];
}

function getApproximateSolarMonthBranchKey(dateParts) {
  if (!dateParts) {
    return "zi";
  }

  const month = dateParts.month;
  const day = dateParts.day;

  if ((month === 2 && day >= 4) || (month === 3 && day <= 5)) return "yin";
  if ((month === 3 && day >= 6) || (month === 4 && day <= 4)) return "mao";
  if ((month === 4 && day >= 5) || (month === 5 && day <= 5)) return "chen";
  if ((month === 5 && day >= 6) || (month === 6 && day <= 5)) return "si";
  if ((month === 6 && day >= 6) || (month === 7 && day <= 6)) return "wu";
  if ((month === 7 && day >= 7) || (month === 8 && day <= 7)) return "wei";
  if ((month === 8 && day >= 8) || (month === 9 && day <= 7)) return "shen";
  if ((month === 9 && day >= 8) || (month === 10 && day <= 7)) return "you";
  if ((month === 10 && day >= 8) || (month === 11 && day <= 6)) return "xu";
  if ((month === 11 && day >= 7) || (month === 12 && day <= 6)) return "hai";
  if ((month === 12 && day >= 7) || (month === 1 && day <= 5)) return "zi";
  return "chou";
}

function getVoidPairKey(dayStemKey, dayBranchKey) {
  const stemIndex = STEM_SEQUENCE.indexOf(dayStemKey);
  const branchIndex = BRANCH_SEQUENCE.indexOf(dayBranchKey);

  if (stemIndex < 0 || branchIndex < 0) {
    return "xu-hai";
  }

  const cycleIndex = Array.from({ length: 60 }).findIndex((_, index) => {
    return (
      STEM_SEQUENCE[index % 10] === dayStemKey &&
      BRANCH_SEQUENCE[index % 12] === dayBranchKey
    );
  });

  if (cycleIndex < 0) {
    return "xu-hai";
  }

  const groupIndex = Math.floor(cycleIndex / 10);
  return VOID_PAIR_BY_STEM_BRANCH_GROUP[groupIndex]?.key || "xu-hai";
}

function buildAutomaticCalendar({
  castingDate,
  castingTime,
  dayChangeRule,
}) {
  const dateParts = parseDateTime({
    castingDate,
    castingTime,
    dayChangeRule,
  });

  if (!dateParts) {
    return {
      available: false,
      source: "automatic-pending",
      note: "Enter a casting date to calculate automatic calendar values.",
      dateParts: null,
      monthBranchKey: "zi",
      dayBranchKey: "wu",
      dayStemKey: "jia",
      voidPairKey: "xu-hai",
    };
  }

  const dayStemKey = getDayStemKey(dateParts);
  const dayBranchKey = getDayBranchKey(dateParts);
  const monthBranchKey = getApproximateSolarMonthBranchKey(dateParts);
  const voidPairKey = getVoidPairKey(dayStemKey, dayBranchKey);

  return {
    available: true,
    source: "automatic-foundation",
    note:
      "Automatic calendar foundation is active. Month branch uses approximate solar-month boundaries and should later be upgraded with exact solar terms.",
    dateParts,
    monthBranchKey,
    dayBranchKey,
    dayStemKey,
    voidPairKey,
  };
}

export function buildCalendarContext({
  castingDate = "",
  castingTime = "",
  dayChangeRule = "23:00",

  manualCalendarMode = false,
  manualMonthBranch = "zi",
  manualDayBranch = "wu",
  manualDayStem = "jia",
  manualDayVoid = "xu-hai",

  monthBranchContext = "zi",
  dayBranchContext = "wu",
  voidPairContext = "xu-hai",
} = {}) {
  const automaticCalendar = buildAutomaticCalendar({
    castingDate,
    castingTime,
    dayChangeRule,
  });

  const activeMonthBranchKey = manualCalendarMode
    ? manualMonthBranch
    : automaticCalendar.available
    ? automaticCalendar.monthBranchKey
    : monthBranchContext;

  const activeDayBranchKey = manualCalendarMode
    ? manualDayBranch
    : automaticCalendar.available
    ? automaticCalendar.dayBranchKey
    : dayBranchContext;

  const activeDayStemKey = manualCalendarMode
    ? manualDayStem
    : automaticCalendar.available
    ? automaticCalendar.dayStemKey
    : "jia";

  const activeVoidPairKey = manualCalendarMode
    ? manualDayVoid
    : automaticCalendar.available
    ? automaticCalendar.voidPairKey
    : voidPairContext;

  const monthBranch = findBranch(activeMonthBranchKey, "zi");
  const dayBranch = findBranch(activeDayBranchKey, "wu");
  const dayStem = findStem(activeDayStemKey, "jia");
  const voidPair = findVoidPair(activeVoidPairKey, "xu-hai");

  const manualMonthBranchData = findBranch(manualMonthBranch, "zi");
  const manualDayBranchData = findBranch(manualDayBranch, "wu");
  const manualDayStemData = findStem(manualDayStem, "jia");
  const manualDayVoidData = findVoidPair(manualDayVoid, "xu-hai");

  let source = "fallback-placeholder";
  let sourceLabel = "Fallback placeholder";
  let statusLabel = "Using fallback placeholder values";
  let statusNote =
    "Enter a casting date and time, or turn on manual calendar override.";

  if (automaticCalendar.available) {
    source = "automatic";
    sourceLabel = "Automatic calendar foundation";
    statusLabel = "Automatic calendar foundation active";
    statusNote = automaticCalendar.note;
  }

  if (manualCalendarMode) {
    source = "manual";
    sourceLabel = "Manual override";
    statusLabel = "Manual calendar override active";
    statusNote =
      "Manual override is active. The app is using the manually selected month, day, stem, and void pair.";
  }

  return {
    source,
    sourceLabel,
    statusLabel,
    statusNote,
    automaticCalendar,

    activeMonthBranchKey,
    activeDayBranchKey,
    activeDayStemKey,
    activeVoidPairKey,

    monthBranch,
    dayBranch,
    dayStem,
    voidPair,

    manualMonthBranchData,
    manualDayBranchData,
    manualDayStemData,
    manualDayVoidData,
  };
}