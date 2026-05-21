import { getBranch, getVoidPair } from "../data/branches";
import { getStem } from "../data/stems";

export function buildCalendarContext({
  manualCalendarMode,
  manualMonthBranch,
  manualDayBranch,
  manualDayStem,
  manualDayVoid,
  monthBranchContext,
  dayBranchContext,
  voidPairContext,
}) {
  const activeMonthBranchKey = manualCalendarMode
    ? manualMonthBranch
    : monthBranchContext;

  const activeDayBranchKey = manualCalendarMode
    ? manualDayBranch
    : dayBranchContext;

  const activeVoidPairKey = manualCalendarMode
    ? manualDayVoid
    : voidPairContext;

  const monthBranch = getBranch(activeMonthBranchKey);
  const dayBranch = getBranch(activeDayBranchKey);
  const voidPair = getVoidPair(activeVoidPairKey);

  const manualMonthBranchData = getBranch(manualMonthBranch);
  const manualDayBranchData = getBranch(manualDayBranch);
  const manualDayStemData = getStem(manualDayStem);
  const manualDayVoidData = getVoidPair(manualDayVoid);

  return {
    source: manualCalendarMode ? "manual" : "automatic-pending",

    activeMonthBranchKey,
    activeDayBranchKey,
    activeVoidPairKey,

    monthBranch,
    dayBranch,
    voidPair,

    manualMonthBranchData,
    manualDayBranchData,
    manualDayStemData,
    manualDayVoidData,
  };
}