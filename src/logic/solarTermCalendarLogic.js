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

const VOID_PAIR_BY_CYCLE_GROUP = [
  "xu-hai",
  "shen-you",
  "wu-wei",
  "chen-si",
  "yin-mao",
  "zi-chou",
];

const SOLAR_MONTH_BOUNDARIES = [
  {
    key: "xiao-han",
    name: "Xiao Han / Minor Cold",
    approximateDate: "01-06",
    monthBranchKey: "chou",
    note: "Approximate Chou month boundary.",
  },
  {
    key: "li-chun",
    name: "Li Chun / Beginning of Spring",
    approximateDate: "02-04",
    monthBranchKey: "yin",
    note: "Approximate Yin month boundary.",
  },
  {
    key: "jing-zhe",
    name: "Jing Zhe / Awakening of Insects",
    approximateDate: "03-06",
    monthBranchKey: "mao",
    note: "Approximate Mao month boundary.",
  },
  {
    key: "qing-ming",
    name: "Qing Ming / Clear and Bright",
    approximateDate: "04-05",
    monthBranchKey: "chen",
    note: "Approximate Chen month boundary.",
  },
  {
    key: "li-xia",
    name: "Li Xia / Beginning of Summer",
    approximateDate: "05-06",
    monthBranchKey: "si",
    note: "Approximate Si month boundary.",
  },
  {
    key: "mang-zhong",
    name: "Mang Zhong / Grain in Ear",
    approximateDate: "06-06",
    monthBranchKey: "wu",
    note: "Approximate Wu month boundary.",
  },
  {
    key: "xiao-shu",
    name: "Xiao Shu / Minor Heat",
    approximateDate: "07-07",
    monthBranchKey: "wei",
    note: "Approximate Wei month boundary.",
  },
  {
    key: "li-qiu",
    name: "Li Qiu / Beginning of Autumn",
    approximateDate: "08-08",
    monthBranchKey: "shen",
    note: "Approximate Shen month boundary.",
  },
  {
    key: "bai-lu",
    name: "Bai Lu / White Dew",
    approximateDate: "09-08",
    monthBranchKey: "you",
    note: "Approximate You month boundary.",
  },
  {
    key: "han-lu",
    name: "Han Lu / Cold Dew",
    approximateDate: "10-08",
    monthBranchKey: "xu",
    note: "Approximate Xu month boundary.",
  },
  {
    key: "li-dong",
    name: "Li Dong / Beginning of Winter",
    approximateDate: "11-07",
    monthBranchKey: "hai",
    note: "Approximate Hai month boundary.",
  },
  {
    key: "da-xue",
    name: "Da Xue / Major Snow",
    approximateDate: "12-07",
    monthBranchKey: "zi",
    note: "Approximate Zi month boundary.",
  },
];

function clean(value) {
  return String(value || "").trim();
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

function getDateOrdinal(month, day) {
  return month * 100 + day;
}

function getSolarBoundaryOrdinal(boundary) {
  const [monthText, dayText] = boundary.approximateDate.split("-");
  return getDateOrdinal(Number(monthText), Number(dayText));
}

function getSolarMonthBoundary(dateParts) {
  if (!dateParts) {
    return null;
  }

  const currentOrdinal = getDateOrdinal(
    dateParts.adjustedMonth,
    dateParts.adjustedDay
  );

  let activeBoundary = SOLAR_MONTH_BOUNDARIES[SOLAR_MONTH_BOUNDARIES.length - 1];

  for (const boundary of SOLAR_MONTH_BOUNDARIES) {
    if (currentOrdinal >= getSolarBoundaryOrdinal(boundary)) {
      activeBoundary = boundary;
    }
  }

  return activeBoundary;
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

export function buildSolarTermCalendarFoundation({
  castingDate = "",
  castingTime = "",
  dayChangeRule = "23:00",
}) {
  const dateParts = parseDateParts(castingDate, castingTime, dayChangeRule);

  if (!dateParts) {
    return {
      ok: false,
      source: "fallback",
      sourceLabel: "Fallback placeholder",
      statusLabel: "Waiting for valid casting date",
      statusNote:
        "No valid Gregorian casting date is available, so the app cannot build the solar-term calendar foundation yet.",
      dateParts: null,
      cycleIndex: 0,
      monthBranchKey: "zi",
      dayStemKey: "jia",
      dayBranchKey: "wu",
      voidPairKey: "xu-hai",
      solarMonthBoundary: null,
      solarTermNote:
        "Solar-term foundation not calculated because the casting date is missing or invalid.",
    };
  }

  const solarMonthBoundary = getSolarMonthBoundary(dateParts);
  const cycleIndex = getDayCycleIndex(dateParts);
  const [dayStemKey, dayBranchKey] = STEM_BRANCH_CYCLE[cycleIndex];

  const voidPairKey =
    VOID_PAIR_BY_CYCLE_GROUP[Math.floor(cycleIndex / 10)] || "xu-hai";

  return {
    ok: true,
    source: "solar-term-foundation",
    sourceLabel: "Solar-term calendar foundation",
    statusLabel: "Approximate solar-term foundation calculated",
    statusNote:
      "The app selected the month branch from approximate solar-term boundaries. This is a foundation layer, not a final traditional almanac-grade solar-term engine.",
    dateParts,
    cycleIndex,
    monthBranchKey: solarMonthBoundary?.monthBranchKey || "zi",
    dayStemKey,
    dayBranchKey,
    voidPairKey,
    solarMonthBoundary,
    solarTermNote: solarMonthBoundary
      ? `${solarMonthBoundary.name} boundary selected ${solarMonthBoundary.monthBranchKey.toUpperCase()} month from approximate date ${solarMonthBoundary.approximateDate}.`
      : "Solar month boundary could not be identified.",
  };
}

export function getSolarTermFoundationTestCases() {
  return [
    {
      name: "Before Li Chun uses Chou month",
      input: {
        castingDate: "2026-02-03",
        castingTime: "12:00",
        dayChangeRule: "23:00",
      },
      expectedMonthBranchKey: "chou",
    },
    {
      name: "On or after Li Chun uses Yin month",
      input: {
        castingDate: "2026-02-04",
        castingTime: "12:00",
        dayChangeRule: "23:00",
      },
      expectedMonthBranchKey: "yin",
    },
    {
      name: "May 26 uses Si month",
      input: {
        castingDate: "2026-05-26",
        castingTime: "11:28",
        dayChangeRule: "23:00",
      },
      expectedMonthBranchKey: "si",
    },
    {
      name: "After 23:00 day-change adjusts date",
      input: {
        castingDate: "2026-05-26",
        castingTime: "23:30",
        dayChangeRule: "23:00",
      },
      expectedAdjustedDateKey: "2026-05-27",
    },
  ];
}