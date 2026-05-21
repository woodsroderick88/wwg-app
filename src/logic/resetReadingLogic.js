import { defaultLines } from "../data/lines";
import { defaultLineBranches } from "../data/branches";

export function applyDefaultReadingState(setters) {
  const {
    setQuestion,
    setSelectedMethod,
    setSelfRole,
    setObjectRole,
    setTimeframe,

    setLines,
    setLineBranches,

    setCastingDate,
    setCastingTime,
    setLocation,
    setDayChangeRule,

    setMonthBranchContext,
    setDayBranchContext,
    setVoidPairContext,

    setManualCalendarMode,
    setManualMonthBranch,
    setManualDayBranch,
    setManualDayStem,
    setManualDayVoid,

    setManualFocus,
    setCopied,
    setSnapshotStatus,
  } = setters;

  setQuestion("");
  setSelectedMethod("GLDM");
  setSelfRole("");
  setObjectRole("");
  setTimeframe("");

  setLines(defaultLines);
  setLineBranches(defaultLineBranches);

  setCastingDate("");
  setCastingTime("");
  setLocation("");
  setDayChangeRule("23:00");

  setMonthBranchContext("zi");
  setDayBranchContext("wu");
  setVoidPairContext("xu-hai");

  setManualCalendarMode(false);
  setManualMonthBranch("zi");
  setManualDayBranch("wu");
  setManualDayStem("jia");
  setManualDayVoid("xu-hai");

  setManualFocus("");
  setCopied(false);
  setSnapshotStatus("Started a new reading.");
}