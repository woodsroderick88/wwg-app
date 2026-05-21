export function scrollToQuestionSection() {
  setTimeout(() => {
    document
      .getElementById("question-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

export function applyPresetToAppState(preset, setters) {
  const {
    setQuestion,
    setSelectedMethod,
    setSelfRole,
    setObjectRole,
    setTimeframe,

    setCastingDate,
    setCastingTime,
    setLocation,
    setDayChangeRule,

    setLines,
    setLineBranches,

    setManualCalendarMode,
    setManualMonthBranch,
    setManualDayBranch,
    setManualDayStem,
    setManualDayVoid,

    setMonthBranchContext,
    setDayBranchContext,
    setVoidPairContext,

    setManualFocus,
    setCopied,
    setSnapshotStatus,
  } = setters;

  setQuestion(preset.question || "");
  setSelectedMethod(preset.selectedMethod || "GLDM");
  setSelfRole(preset.selfRole || "");
  setObjectRole(preset.objectRole || "");
  setTimeframe(preset.timeframe || "");

  setCastingDate(preset.castingDate || "");
  setCastingTime(preset.castingTime || "");
  setLocation(preset.location || "");
  setDayChangeRule(preset.dayChangeRule || "23:00");

  setLines(preset.lines);
  setLineBranches(preset.lineBranches);

  setManualCalendarMode(Boolean(preset.manualCalendarMode));
  setManualMonthBranch(preset.manualMonthBranch || "zi");
  setManualDayBranch(preset.manualDayBranch || "wu");
  setManualDayStem(preset.manualDayStem || "jia");
  setManualDayVoid(preset.manualDayVoid || "xu-hai");

  setMonthBranchContext(preset.monthBranchContext || "zi");
  setDayBranchContext(preset.dayBranchContext || "wu");
  setVoidPairContext(preset.voidPairContext || "xu-hai");

  setManualFocus("");
  setCopied(false);
  setSnapshotStatus("Loaded sample case.");
}