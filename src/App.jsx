import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import {
  allMethods,
  methods,
  methodFocusMap,
  pendingMethod,
} from "./data/methods";
import { focusOptions } from "./data/focusOptions";
import { lineTypes, defaultLines } from "./data/lines";
import {
  earthlyBranches,
  defaultLineBranches,
  voidPairs,
} from "./data/branches";
import { heavenlyStems } from "./data/stems";
import { casePresets } from "./data/casePresets";

import { recommendMethod, getQuestionWarnings } from "./logic/questionLogic";
import {
  analyzeQuestionRefinement,
  buildQuestionRefinementSummary,
  getQuestionIntentOptions,
} from "./logic/questionRefinementLogic";
import {
  buildCoinCastingSummary,
  castSixLinesWithCoins,
  formatCoinCastingLine,
  getCoinCastingLegend,
} from "./logic/castingLogic";
import { buildCalendarContext } from "./logic/calendarEngine";
import { buildCalendarConfidence } from "./logic/calendarConfidenceLogic";
import { buildReadingSummary } from "./logic/exportSummaryLogic";
import {
  applyPresetToAppState,
  scrollToQuestionSection,
} from "./logic/presetLogic";
import { applyDefaultReadingState } from "./logic/resetReadingLogic";
import { buildPalaceRulesPreview } from "./logic/palaceRulesLogic";
import { buildHiddenSpiritPreview } from "./logic/hiddenSpiritLogic";
import { getHexagramInfo, getTransformedValue } from "./logic/hexagramLogic";
import { getSixKin } from "./logic/sixKinLogic";
import { getLineCondition } from "./logic/conditionLogic";
import { isFocusMatch, getFocusSummary } from "./logic/focusLogic";
import { buildRuleGraph } from "./logic/ruleGraphLogic";
import { buildConflictReport } from "./logic/conflictLogic";
import { buildRecommendation } from "./logic/recommendationLogic";
import { buildManualHexagramEntry } from "./logic/manualHexagramEntryLogic";
import {
  buildPendingMethodState,
  getMethodPendingId,
  hasQuestionInput,
} from "./logic/methodStateLogic";
import {
  buildDraftFinalQuestion,
  formatDraftQuestionLabel,
  getDraftQuestionSourceNote,
} from "./logic/questionDraftLogic";
import {
  buildSnapshotsExportJson,
  clearSavedSnapshots,
  createSnapshot,
  loadSavedSnapshots,
  mergeImportedSnapshots,
  parseSnapshotsImportJson,
  renameSnapshotTitle,
  replaceWithImportedSnapshots,
  saveSnapshots,
  updateSnapshotNote,
  upsertSnapshot,
} from "./logic/snapshotStorage";
import {
  buildSnapshotCompareRows,
  buildSnapshotCompareSummary,
  buildSnapshotCompareText,
} from "./logic/snapshotCompareLogic";

const METHOD_PENDING_ID = getMethodPendingId();
const VALID_METHOD_IDS = ["GLDM", "TDM", "RIDM", "CDM", "ADM"];
const SELECTABLE_METHOD_IDS = VALID_METHOD_IDS;

function renderLineByValue(value) {
  if (value === "yang") {
    return <div className="hex-line yang-line" />;
  }

  return (
    <div className="yin-line-wrap">
      <div className="hex-line yin-half" />
      <div className="hex-line yin-half" />
    </div>
  );
}

function renderOriginalLine(lineKey) {
  return renderLineByValue(lineTypes[lineKey].value);
}

function buildSnapshotSearchText(snapshot) {
  return [
    snapshot.title,
    snapshot.question,
    snapshot.note,
    snapshot.selectedMethod,
    snapshot.selfRole,
    snapshot.objectRole,
    snapshot.timeframe,
    snapshot.castingDate,
    snapshot.castingTime,
    snapshot.location,
    snapshot.createdAt,
    snapshot.updatedAt,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getSnapshotTitle(snapshot) {
  return String(snapshot.title || snapshot.question || "Untitled reading");
}

function getSnapshotTime(snapshot) {
  return new Date(snapshot.updatedAt || snapshot.createdAt || 0).getTime();
}

function sortSnapshots(snapshots, sortMode) {
  const sortedSnapshots = [...snapshots];

  if (sortMode === "oldest") {
    return sortedSnapshots.sort(
      (a, b) => getSnapshotTime(a) - getSnapshotTime(b)
    );
  }

  if (sortMode === "title-az") {
    return sortedSnapshots.sort((a, b) =>
      getSnapshotTitle(a).localeCompare(getSnapshotTitle(b))
    );
  }

  if (sortMode === "title-za") {
    return sortedSnapshots.sort((a, b) =>
      getSnapshotTitle(b).localeCompare(getSnapshotTitle(a))
    );
  }

  if (sortMode === "method-az") {
    return sortedSnapshots.sort((a, b) =>
      String(a.selectedMethod || "").localeCompare(
        String(b.selectedMethod || "")
      )
    );
  }

  return sortedSnapshots.sort((a, b) => getSnapshotTime(b) - getSnapshotTime(a));
}

function getBranchLabel(branchKey) {
  const branch = earthlyBranches.find((item) => item.key === branchKey);
  return branch ? `${branch.label} / ${branch.element}` : "Not set";
}

function getStemLabel(stemKey) {
  const stem = heavenlyStems.find((item) => item.key === stemKey);
  return stem ? `${stem.label} / ${stem.element}, ${stem.polarity}` : "Not set";
}

function getVoidLabel(voidKey) {
  const voidPair = voidPairs.find((item) => item.key === voidKey);
  return voidPair ? voidPair.label : "Not set";
}

function getLineLabel(lineKey) {
  return lineTypes[lineKey]?.label || "Unknown line";
}

function getMethodDisplayName(methodId) {
  const method = allMethods.find((item) => item.id === methodId);
  return method ? `${method.id} — ${method.name}` : "Method pending";
}

function normalizeMethodForSave(methodId) {
  return SELECTABLE_METHOD_IDS.includes(methodId) ? methodId : METHOD_PENDING_ID;
}

function buildManualHexagramExportSummary({
  manualHexagramNumber,
  manualHexagramMovingLines,
  lines,
  originalHexagram,
  transformedHexagram,
  movingLines,
}) {
  const lineResults =
    lines
      .map((lineKey, index) => {
        const lineType = lineTypes[lineKey];
        return `Line ${index + 1}: ${lineType?.label || lineKey}`;
      })
      .join("\n") || "No lines available.";

  const movingLinesText =
    movingLines.length > 0
      ? movingLines.map((lineNumber) => `Line ${lineNumber}`).join(", ")
      : "None";

  return `CASTING MODE

Current mode:
Manual Hexagram Entry

Original hexagram input:
${manualHexagramNumber || "Not recorded"}

Moving lines input:
${manualHexagramMovingLines || "None"}

Applied chart:
Original Hexagram: #${originalHexagram.kingWen.number} — ${
    originalHexagram.kingWen.name
  } / ${originalHexagram.kingWen.english}
Transformed Hexagram: #${transformedHexagram.kingWen.number} — ${
    transformedHexagram.kingWen.name
  } / ${transformedHexagram.kingWen.english}

Line results:
${lineResults}

Moving lines:
${movingLinesText}

Casting note:
This chart was entered through Manual Hexagram Entry. The original King Wen hexagram number and moving lines were used to populate the six-line structure and calculate the transformed hexagram.`;
}

function buildSnapshotDetailsText(snapshot) {
  const linesText =
    (snapshot.lines || [])
      .map((lineKey, index) => `L${index + 1}: ${getLineLabel(lineKey)}`)
      .join(" | ") || "Not set";

  const branchesText =
    (snapshot.lineBranches || [])
      .map(
        (branchKey, index) => `L${index + 1}: ${getBranchLabel(branchKey)}`
      )
      .join(" | ") || "Not set";

  return `SNAPSHOT DETAILS

CORE QUESTION
Saved title: ${snapshot.title || "Untitled reading"}
Question: ${snapshot.question || "Not set"}
Method: ${getMethodDisplayName(snapshot.selectedMethod)}
Self: ${snapshot.selfRole || "Not set"}
Object: ${snapshot.objectRole || "Not set"}
Timeframe: ${snapshot.timeframe || "Not set"}
Focus: ${snapshot.manualFocus || "Using recommended focus"}

CALENDAR
Casting: ${snapshot.castingDate || "No date"} ${
    snapshot.castingTime || "No time"
  }
Location: ${snapshot.location || "Not set"}
Day rule: ${snapshot.dayChangeRule || "23:00"}
Manual calendar: ${snapshot.manualCalendarMode ? "On" : "Off"}
Month branch: ${getBranchLabel(snapshot.manualMonthBranch)}
Day branch: ${getBranchLabel(snapshot.manualDayBranch)}
Day stem: ${getStemLabel(snapshot.manualDayStem)}
Day void: ${getVoidLabel(snapshot.manualDayVoid)}

LINES + BRANCHES
Lines: ${linesText}
Branches: ${branchesText}

NOTES
Note: ${snapshot.note || "No note added."}

TIMESTAMPS
Created: ${
    snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleString() : "Unknown"
  }
Last updated: ${
    snapshot.updatedAt ? new Date(snapshot.updatedAt).toLocaleString() : "Unknown"
  }`;
}

function DetailSection({ title, children }) {
  return (
    <div
      style={{
        marginTop: "18px",
        paddingTop: "16px",
        borderTop: "1px solid rgba(207, 224, 255, 0.18)",
      }}
    >
      <h4
        style={{
          margin: "0 0 14px",
          color: "#f0b45f",
          fontSize: "1.15rem",
          textAlign: "left",
        }}
      >
        {title}
      </h4>

      {children}
    </div>
  );
}
function DetailRow({ label, value }) {
  return (
    <div
      style={{
        marginBottom: "14px",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#cfe0ff",
          fontWeight: 800,
          fontSize: "1rem",
          lineHeight: 1.35,
          marginBottom: "3px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#f4e5d0",
          fontSize: "0.98rem",
          lineHeight: 1.45,
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "normal",
        }}
      >
        {value || "Not set"}
      </div>
    </div>
  );
}

function CompareCell({ value, isDifferent }) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "14px",
        border: isDifferent
          ? "1px solid rgba(240, 180, 95, 0.7)"
          : "1px solid rgba(120, 150, 210, 0.25)",
        background: isDifferent
          ? "rgba(78, 55, 30, 0.48)"
          : "rgba(15, 15, 18, 0.32)",
        color: "#f4e5d0",
        lineHeight: 1.45,
        overflowWrap: "anywhere",
        whiteSpace: "normal",
      }}
    >
      {value}
    </div>
  );
}

function RecommendationList({ items, fallback }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p>{fallback || "No details available yet."}</p>;
  }

  return (
    <ul className="warning-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function CalendarConfidenceCard({ calendarConfidence }) {
  if (!calendarConfidence) {
    return null;
  }

  return (
    <div className="recommendation-card">
      <strong>Calendar Confidence</strong>
      <p>
        {calendarConfidence.level} — {calendarConfidence.score}/100
      </p>
      <p>{calendarConfidence.summary}</p>
      {calendarConfidence.warning ? (
        <p>
          <strong>Warning:</strong> {calendarConfidence.warning}
        </p>
      ) : null}
    </div>
  );
}

function MethodPendingCard({ methodState }) {
  if (!methodState?.pending) {
    return null;
  }

  return (
    <div className="recommendation-card">
      <strong>Method Status</strong>
      <p>{methodState.label}</p>
      <p>{methodState.summary}</p>
      {methodState.warning ? (
        <p>
          <strong>Warning:</strong> {methodState.warning}
        </p>
      ) : null}
    </div>
  );
}

function DraftQuestionCard({ draftQuestionState }) {
  if (!draftQuestionState?.question || !draftQuestionState.isDraft) {
    return null;
  }

  return (
    <div className="recommendation-card">
      <strong>Draft Question Active</strong>
      <p>{formatDraftQuestionLabel(draftQuestionState)}</p>
      <p>{getDraftQuestionSourceNote(draftQuestionState)}</p>
    </div>
  );
}

function App() {
  const [rawQuestion, setRawQuestion] = useState("");
  const [clarifiedIntent, setClarifiedIntent] = useState("");
  const [knownFacts, setKnownFacts] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [emotionalTone, setEmotionalTone] = useState("");
  const [selectedQuestionIntent, setSelectedQuestionIntent] = useState("");

  const [question, setQuestion] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(METHOD_PENDING_ID);
  const [selfRole, setSelfRole] = useState("");
  const [objectRole, setObjectRole] = useState("");
  const [timeframe, setTimeframe] = useState("");

  const [lines, setLines] = useState(defaultLines);
  const [lineBranches, setLineBranches] = useState(defaultLineBranches);
  const [coinCastingHistory, setCoinCastingHistory] = useState([]);
  const [manualHexagramNumber, setManualHexagramNumber] = useState("");
  const [manualHexagramMovingLines, setManualHexagramMovingLines] =
    useState("");
  const [manualHexagramStatus, setManualHexagramStatus] = useState("");

  const [castingDate, setCastingDate] = useState("");
  const [castingTime, setCastingTime] = useState("");
  const [location, setLocation] = useState("");
  const [dayChangeRule, setDayChangeRule] = useState("23:00");

  const [monthBranchContext, setMonthBranchContext] = useState("zi");
  const [dayBranchContext, setDayBranchContext] = useState("wu");
  const [voidPairContext, setVoidPairContext] = useState("xu-hai");

  const [manualCalendarMode, setManualCalendarMode] = useState(false);
  const [manualMonthBranch, setManualMonthBranch] = useState("zi");
  const [manualDayBranch, setManualDayBranch] = useState("wu");
  const [manualDayStem, setManualDayStem] = useState("jia");
  const [manualDayVoid, setManualDayVoid] = useState("xu-hai");

  const [manualFocus, setManualFocus] = useState("");
  const [copied, setCopied] = useState(false);

  const [savedSnapshots, setSavedSnapshots] = useState([]);
  const [snapshotStatus, setSnapshotStatus] = useState("");
  const [deleteConfirmArmed, setDeleteConfirmArmed] = useState(false);

  const [renamingSnapshotId, setRenamingSnapshotId] = useState("");
  const [renameTitleDraft, setRenameTitleDraft] = useState("");

  const [editingNoteSnapshotId, setEditingNoteSnapshotId] = useState("");
  const [noteDraft, setNoteDraft] = useState("");

  const [viewingSnapshotId, setViewingSnapshotId] = useState("");

  const [snapshotSearch, setSnapshotSearch] = useState("");
  const [snapshotSort, setSnapshotSort] = useState("newest");
  const [snapshotImportMode, setSnapshotImportMode] = useState("merge");

  const [compareSnapshotAId, setCompareSnapshotAId] = useState("");
  const [compareSnapshotBId, setCompareSnapshotBId] = useState("");

  const importFileInputRef = useRef(null);

  useEffect(() => {
    setSavedSnapshots(loadSavedSnapshots());
  }, []);

  const questionIntentOptions = getQuestionIntentOptions();
  const coinCastingLegend = getCoinCastingLegend();

  const questionRefinement = useMemo(
    () =>
      analyzeQuestionRefinement({
        rawQuestion,
        clarifiedIntent,
        knownFacts,
        assumptions,
        emotionalTone,
        selfRole,
        objectRole,
        timeframe,
        finalCastingQuestion: question,
        selectedIntent: selectedQuestionIntent,
      }),
    [
      rawQuestion,
      clarifiedIntent,
      knownFacts,
      assumptions,
      emotionalTone,
      selfRole,
      objectRole,
      timeframe,
      question,
      selectedQuestionIntent,
    ]
  );

  const draftQuestionState = buildDraftFinalQuestion({
    finalCastingQuestion: question,
    rawQuestion,
    suggestedFinalQuestion: questionRefinement.suggestedFinalQuestion,
  });

  const effectiveQuestion = draftQuestionState.question;

  const hasAnyQuestionInput = hasQuestionInput({
    rawQuestion,
    finalCastingQuestion: effectiveQuestion,
    clarifiedIntent,
  });

  const questionForLogic = effectiveQuestion || clarifiedIntent;

  const fallbackRecommendedMethodId = useMemo(() => {
    if (!hasAnyQuestionInput) {
      return METHOD_PENDING_ID;
    }

    return recommendMethod(questionForLogic);
  }, [hasAnyQuestionInput, questionForLogic]);

  const recommendedMethodId = hasAnyQuestionInput
    ? VALID_METHOD_IDS.includes(questionRefinement.methodHints?.[0])
      ? questionRefinement.methodHints[0]
      : fallbackRecommendedMethodId
    : METHOD_PENDING_ID;

  useEffect(() => {
    const methodHint = questionRefinement.methodHints?.[0];

    if (
      hasAnyQuestionInput &&
      VALID_METHOD_IDS.includes(methodHint) &&
      selectedMethod !== methodHint
    ) {
      setSelectedMethod(methodHint);
      setManualFocus("");
      setCopied(false);
      setSnapshotStatus(`Method auto-synced to ${methodHint}.`);
      setDeleteConfirmArmed(false);
      return;
    }

    if (!hasAnyQuestionInput && selectedMethod !== METHOD_PENDING_ID) {
      setSelectedMethod(METHOD_PENDING_ID);
      setManualFocus("");
      setCopied(false);
      setSnapshotStatus("");
      setDeleteConfirmArmed(false);
    }
  }, [hasAnyQuestionInput, questionRefinement.methodHints, selectedMethod]);

  const methodState = buildPendingMethodState({
    rawQuestion,
    finalCastingQuestion: effectiveQuestion,
    clarifiedIntent,
    selectedMethod,
    recommendedMethodId,
  });

  const recommendedMethod = methodState.pending
    ? pendingMethod
    : allMethods.find((item) => item.id === recommendedMethodId) ||
      pendingMethod;

  const effectiveMethodId = methodState.pending
    ? METHOD_PENDING_ID
    : selectedMethod;

  const method = methodState.pending
    ? pendingMethod
    : methods.find((item) => item.id === selectedMethod) || pendingMethod;

  const recommendedFocus = methodFocusMap[effectiveMethodId] || "Method pending";

  const refinementFocusHint = questionRefinement.focusHints?.[0];

  const intentFocus =
    !methodState.pending &&
    refinementFocusHint &&
    refinementFocusHint !== "Using recommended focus" &&
    focusOptions.some((focus) => focus.key === refinementFocusHint)
      ? refinementFocusHint
      : "";

  const selectedFocus = methodState.pending
    ? "Method pending"
    : manualFocus || intentFocus || recommendedFocus;

  const selectedFocusInfo = methodState.pending
    ? {
        key: "Method pending",
        label: "Method pending",
        meaning:
          "No useful-spirit focus has been selected yet because the question method is pending.",
      }
    : focusOptions.find((focus) => focus.key === selectedFocus);
      const calendarContext = buildCalendarContext({
    castingDate,
    castingTime,
    dayChangeRule,

    manualCalendarMode,
    manualMonthBranch,
    manualDayBranch,
    manualDayStem,
    manualDayVoid,

    monthBranchContext,
    dayBranchContext,
    voidPairContext,
  });

  const {
    source: calendarSource,
    sourceLabel: calendarSourceLabel,
    statusLabel: calendarStatusLabel,
    statusNote: calendarStatusNote,
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
  } = calendarContext;

  const calendarConfidence = buildCalendarConfidence({
    castingDate,
    castingTime,
    location,
    manualCalendarMode,
    calendarSource,
    calendarSourceLabel,
    calendarStatusLabel,
    calendarStatusNote,
  });

  const warnings = getQuestionWarnings(
    effectiveQuestion,
    selfRole,
    objectRole,
    timeframe,
    castingDate,
    castingTime
  );

  if (draftQuestionState.isDraft && effectiveQuestion) {
    warnings.push(
      "Final casting question is using a draft source. Apply the suggested question or enter a final casting question before relying on the reading."
    );
  }

  if (!questionRefinement.readyToCast) {
    warnings.push(`Question Refinement: ${questionRefinement.readinessLabel}.`);
  }

  if (methodState.pending) {
    warnings.push("Select or refine a method before relying on the reading.");
  }

  if (manualCalendarMode) {
    if (!manualMonthBranch.trim()) {
      warnings.push(
        "Manual calendar override is on, but month branch is missing."
      );
    }

    if (!manualDayStem.trim()) {
      warnings.push("Manual calendar override is on, but day stem is missing.");
    }

    if (!manualDayBranch.trim()) {
      warnings.push(
        "Manual calendar override is on, but day branch is missing."
      );
    }

    if (!manualDayVoid.trim()) {
      warnings.push(
        "Manual calendar override is on, but dekad void is missing."
      );
    }
  }

  const clarityScore = Math.max(0, 100 - warnings.length * 14);

  const movingLines = lines
    .map((lineKey, index) => (lineTypes[lineKey].moving ? index + 1 : null))
    .filter(Boolean);

  const originalValues = lines.map((lineKey) => lineTypes[lineKey].value);
  const transformedValues = lines.map((lineKey) =>
    getTransformedValue(lineKey)
  );

  const originalHexagram = getHexagramInfo(originalValues);
  const transformedHexagram = getHexagramInfo(transformedValues);

  const sixKinRows = lineBranches.map((branchKey, index) => {
    const branch = earthlyBranches.find((item) => item.key === branchKey);
    const condition = getLineCondition(
      branch.key,
      lines[index],
      activeMonthBranchKey,
      activeDayBranchKey,
      activeVoidPairKey
    );

    return {
      lineNumber: index + 1,
      lineKey: lines[index],
      moving: lineTypes[lines[index]].moving,
      branch,
      element: branch.element,
      sixKin: getSixKin(originalHexagram.palace.element, branch.element),
      condition,
    };
  });

  const focusRows = methodState.pending
    ? []
    : sixKinRows.filter((row) => isFocusMatch(row, selectedFocus));

  const focusSummary = methodState.pending
    ? "No focus reading yet. Enter or refine a question before selecting a WWG method and useful spirit."
    : getFocusSummary(selectedFocus, focusRows);

  const ruleGraph = methodState.pending
    ? {
        rules: [
          {
            title: "Method pending",
            text: "No WWG method has been selected yet because the question is not ready for reliable coding.",
          },
          {
            title: "Next required step",
            text: "Enter a raw question, clarify the intent, define Self/Object, and set a timeframe before treating the chart as a coded reading.",
          },
        ],
        conclusion:
          "Method is pending. The chart can be visually prepared, but no final WWG rule conclusion should be trusted yet.",
      }
    : buildRuleGraph({
        selectedMethod: effectiveMethodId,
        method,
        selectedFocus,
        selectedFocusInfo,
        focusRows,
        originalHexagram,
        transformedHexagram,
        monthBranch,
        dayBranch,
        voidPair,
        movingLines,
      });

  const conflictReport = buildConflictReport({
    warnings,
    focusRows,
    movingLines,
    clarityScore,
  });

  const recommendation = methodState.pending
    ? {
        result: "Method pending",
        finalJudgment: "Method pending",
        confidence: "Low",
        calendarConfidence,
        plainMeaning:
          "No final reading should be made yet because the method is pending. Enter or refine the question first so the app can select the correct WWG method and useful spirit.",
        reason:
          "No final reading should be made yet because the method is pending. Enter or refine the question first so the app can select the correct WWG method and useful spirit.",
        risk:
          "Warning signs: A blank or unclear question can make GLDM appear as a false default. The app is now holding the method in a pending state until there is enough question context.",
        supportingSigns: [
          "The app is preventing a false GLDM default when the question is empty or not ready.",
        ],
        warningSigns: [
          "The question setup is not clear enough for method selection.",
          "Do not treat the current chart as a final coded WWG reading yet.",
        ],
        action:
          "Enter a clear final casting question, define Self/Object, and add a timeframe. Then use the suggested method or choose the method manually.",
        nextCheck:
          "Next check: once the question is clear, confirm method, useful spirit, calendar confidence, moving lines, Shi/Ying, and hidden/flying spirit logic.",
      }
    : buildRecommendation({
        selectedMethod: effectiveMethodId,
        selectedFocus,
        focusRows,
        focusSummary,
        ruleConclusion: ruleGraph.conclusion,
        movingLines,
        clarityScore,
        calendarConfidence,
      });

  const palaceRules = methodState.pending
    ? {
        summary:
          "Palace rules are waiting for a selected method and useful-spirit focus.",
        notes: [
          {
            title: "Method pending",
            text: "Palace rules can display chart structure later, but interpretation should wait until a method is selected.",
          },
        ],
      }
    : buildPalaceRulesPreview({
        originalHexagram,
        transformedHexagram,
        selectedFocus,
        focusRows,
        sixKinRows,
        movingLines,
      });

  const hiddenSpirit = methodState.pending
    ? {
        status: "Method pending",
        flyingStatus: "Method pending",
        selectedFocus,
        visibleFocusFound: false,
        notes: [
          {
            title: "Method pending",
            text: "Hidden/Flying Spirit interpretation is paused until the app knows which useful spirit is being judged.",
          },
        ],
        summary:
          "Hidden/Flying Spirit preview is waiting for method and useful-spirit selection.",
      }
    : buildHiddenSpiritPreview({
        originalHexagram,
        transformedHexagram,
        selectedFocus,
        focusRows,
        sixKinRows,
        movingLines,
        palaceRules,
      });
        const questionRefinementSummary = buildQuestionRefinementSummary(
    questionRefinement
  );

  const coinCastingSummary = buildCoinCastingSummary(coinCastingHistory);

  const manualHexagramSummary = buildManualHexagramExportSummary({
    manualHexagramNumber,
    manualHexagramMovingLines,
    lines,
    originalHexagram,
    transformedHexagram,
    movingLines,
  });

  const readingSummaryCore = buildReadingSummary({
    question: effectiveQuestion,
    selectedMethod: effectiveMethodId,
    method,
    selfRole,
    objectRole,
    timeframe,
    clarityScore,

    castingDate,
    castingTime,
    location,
    dayChangeRule,
    calendarSource,
    calendarConfidence,
    manualCalendarMode,
    manualMonthBranchData,
    manualDayBranchData,
    manualDayStemData,
    manualDayVoidData,
    monthBranch,
    dayBranch,
    voidPair,

    originalHexagram,
    transformedHexagram,
    movingLines,
    sixKinRows,

    selectedFocus,
    selectedFocusInfo,
    focusRows,
    focusSummary,

    ruleGraph,
    conflictReport,
    recommendation,
    palaceRules,
    hiddenSpirit,
  });

  const draftQuestionExportNote =
    draftQuestionState.isDraft && draftQuestionState.question
      ? `

DRAFT QUESTION SOURCE
${draftQuestionState.label}: ${draftQuestionState.question}
Note: ${draftQuestionState.note}`
      : "";

  const readingSummary = `${questionRefinementSummary}${draftQuestionExportNote}

${coinCastingHistory.length ? coinCastingSummary : manualHexagramSummary}

${readingSummaryCore}`;

  const visibleSnapshots = useMemo(() => {
    const searchText = snapshotSearch.trim().toLowerCase();

    const filteredSnapshots = searchText
      ? savedSnapshots.filter((snapshot) =>
          buildSnapshotSearchText(snapshot).includes(searchText)
        )
      : savedSnapshots;

    return sortSnapshots(filteredSnapshots, snapshotSort);
  }, [savedSnapshots, snapshotSearch, snapshotSort]);

  const compareSnapshotA = savedSnapshots.find(
    (snapshot) => snapshot.id === compareSnapshotAId
  );

  const compareSnapshotB = savedSnapshots.find(
    (snapshot) => snapshot.id === compareSnapshotBId
  );

  const canCompareSnapshots = Boolean(compareSnapshotA && compareSnapshotB);

  const compareSameReading =
    compareSnapshotAId &&
    compareSnapshotBId &&
    compareSnapshotAId === compareSnapshotBId;

  const compareRows =
    canCompareSnapshots && !compareSameReading
      ? buildSnapshotCompareRows(compareSnapshotA, compareSnapshotB)
      : [];

  const compareSummary =
    canCompareSnapshots && !compareSameReading
      ? buildSnapshotCompareSummary(compareSnapshotA, compareSnapshotB)
      : null;

  function updateLine(index, value) {
    setLines((currentLines) =>
      currentLines.map((line, lineIndex) =>
        lineIndex === index ? value : line
      )
    );

    setCoinCastingHistory([]);
    setManualHexagramStatus("");
  }

  function updateLineBranch(index, value) {
    setLineBranches((currentBranches) =>
      currentBranches.map((branch, branchIndex) =>
        branchIndex === index ? value : branch
      )
    );
  }

  function resetCopyAndStatus() {
    setCopied(false);
    setSnapshotStatus("");
    setDeleteConfirmArmed(false);
  }

  function clearSnapshotEditModes() {
    setRenamingSnapshotId("");
    setRenameTitleDraft("");
    setEditingNoteSnapshotId("");
    setNoteDraft("");
    setViewingSnapshotId("");
  }

  function persistSnapshots(nextSnapshots) {
    const storedSnapshots = saveSnapshots(nextSnapshots);
    setSavedSnapshots(storedSnapshots);
  }

  function resetQuestionRefinement() {
    setRawQuestion("");
    setClarifiedIntent("");
    setKnownFacts("");
    setAssumptions("");
    setEmotionalTone("");
    setSelectedQuestionIntent("");
  }

  function resetCurrentReading() {
    resetQuestionRefinement();
    setCoinCastingHistory([]);
    setManualHexagramNumber("");
    setManualHexagramMovingLines("");
    setManualHexagramStatus("");

    applyDefaultReadingState({
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
    });

    setSelectedMethod(METHOD_PENDING_ID);
    setDeleteConfirmArmed(false);
    clearSnapshotEditModes();
    scrollToQuestionSection();
  }

  function loadPreset(preset) {
    resetQuestionRefinement();
    setCoinCastingHistory([]);
    setManualHexagramNumber("");
    setManualHexagramMovingLines("");
    setManualHexagramStatus("");

    applyPresetToAppState(preset, {
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
    });

    setRawQuestion(preset.question || "");
    setClarifiedIntent(preset.description || "");
    setSelectedQuestionIntent("");

    if (!VALID_METHOD_IDS.includes(preset.selectedMethod)) {
      setSelectedMethod("GLDM");
    }

    setDeleteConfirmArmed(false);
    clearSnapshotEditModes();
    scrollToQuestionSection();
  }

  function useSuggestedFinalQuestion() {
    if (!questionRefinement.suggestedFinalQuestion) {
      setSnapshotStatus("Add a raw question before generating a final question.");
      return;
    }

    setQuestion(questionRefinement.suggestedFinalQuestion);

    const methodHint = questionRefinement.methodHints?.[0];

    if (VALID_METHOD_IDS.includes(methodHint)) {
      setSelectedMethod(methodHint);
      setManualFocus("");
      setSnapshotStatus(
        `Suggested final casting question applied. Method synced to ${methodHint}.`
      );
    } else {
      setSnapshotStatus("Suggested final casting question applied.");
    }

    setDeleteConfirmArmed(false);
  }

  function castReadingWithCoins() {
    const methodHint = questionRefinement.methodHints?.[0];

    if (!hasAnyQuestionInput) {
      setSnapshotStatus(
        "Enter or refine a question before casting so the method is not pending."
      );
      setDeleteConfirmArmed(false);
      return;
    }

    if (VALID_METHOD_IDS.includes(methodHint) && selectedMethod !== methodHint) {
      setSelectedMethod(methodHint);
      setManualFocus("");
    }

    const casting = castSixLinesWithCoins();

    setLines(casting.lines);
    setCoinCastingHistory(casting.results);
    setManualHexagramStatus("");
    setCopied(false);
    setSnapshotStatus(
      `Coin casting completed. Moving lines: ${
        casting.movingLines.length ? casting.movingLines.join(", ") : "none"
      }.`
    );
    setDeleteConfirmArmed(false);
    clearSnapshotEditModes();
  }
    function applyManualHexagramEntry() {
    const result = buildManualHexagramEntry({
      originalHexagramNumber: manualHexagramNumber,
      movingLinesText: manualHexagramMovingLines,
    });

    if (!result.ok) {
      setManualHexagramStatus(result.message);
      setSnapshotStatus(result.message);
      return;
    }

    setLines(result.lines);
    setCoinCastingHistory([]);
    setManualHexagramStatus(`${result.message}\n${result.lineSummary}`);
    setSnapshotStatus("Manual hexagram entry applied.");
    setCopied(false);
    setDeleteConfirmArmed(false);
    clearSnapshotEditModes();
  }

  async function copyReadingSummary() {
    try {
      await navigator.clipboard.writeText(readingSummary);
      setCopied(true);
      setDeleteConfirmArmed(false);
    } catch {
      setCopied(false);
      alert(
        "Could not copy automatically. Select the export text and copy it manually."
      );
    }
  }

  async function copySnapshotDetails(snapshot) {
    try {
      await navigator.clipboard.writeText(buildSnapshotDetailsText(snapshot));
      setSnapshotStatus("Copied snapshot details.");
      setDeleteConfirmArmed(false);
    } catch {
      setSnapshotStatus(
        "Could not copy snapshot details automatically. Open View Details and copy manually."
      );
    }
  }

  async function copySnapshotCompare() {
    if (compareSameReading) {
      setSnapshotStatus("Choose two different saved readings before copying.");
      return;
    }

    if (!canCompareSnapshots) {
      setSnapshotStatus("Select two saved readings before copying a comparison.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        buildSnapshotCompareText(compareSnapshotA, compareSnapshotB)
      );
      setSnapshotStatus("Copied snapshot comparison.");
      setDeleteConfirmArmed(false);
    } catch {
      setSnapshotStatus(
        "Could not copy snapshot comparison automatically. Copy it manually from the compare section."
      );
    }
  }

  function saveCurrentSnapshot() {
    if (!effectiveQuestion.trim()) {
      setSnapshotStatus("Add a question before saving a reading.");
      setDeleteConfirmArmed(false);
      return;
    }

    if (methodState.pending) {
      setSnapshotStatus(
        "Method is pending. Refine the question or choose a method before saving."
      );
      setDeleteConfirmArmed(false);
      return;
    }

    const snapshot = createSnapshot({
      question: effectiveQuestion,
      selectedMethod: normalizeMethodForSave(effectiveMethodId),
      selfRole,
      objectRole,
      timeframe,

      lines,
      lineBranches,

      castingDate,
      castingTime,
      location,
      dayChangeRule,

      monthBranchContext,
      dayBranchContext,
      voidPairContext,

      manualCalendarMode,
      manualMonthBranch,
      manualDayBranch,
      manualDayStem,
      manualDayVoid,

      manualFocus,

      readingSummary,
    });

    const { snapshots: nextSnapshots, action } = upsertSnapshot(
      savedSnapshots,
      snapshot
    );

    persistSnapshots(nextSnapshots);

    setSnapshotStatus(
      action === "updated"
        ? "Updated existing saved reading."
        : draftQuestionState.isDraft
        ? "Saved current reading using draft question."
        : "Saved current reading."
    );

    setDeleteConfirmArmed(false);
  }

  function loadSnapshot(snapshot) {
    const loadedQuestion = snapshot.question || "";
    const loadedMethod = VALID_METHOD_IDS.includes(snapshot.selectedMethod)
      ? snapshot.selectedMethod
      : METHOD_PENDING_ID;

    setRawQuestion(loadedQuestion);
    setClarifiedIntent("");
    setKnownFacts("");
    setAssumptions("");
    setEmotionalTone("");
    setSelectedQuestionIntent("");
    setCoinCastingHistory([]);
    setManualHexagramNumber("");
    setManualHexagramMovingLines("");
    setManualHexagramStatus("");

    setQuestion(loadedQuestion);
    setSelectedMethod(loadedQuestion.trim() ? loadedMethod : METHOD_PENDING_ID);
    setSelfRole(snapshot.selfRole || "");
    setObjectRole(snapshot.objectRole || "");
    setTimeframe(snapshot.timeframe || "");

    setLines(snapshot.lines || defaultLines);
    setLineBranches(snapshot.lineBranches || defaultLineBranches);

    setCastingDate(snapshot.castingDate || "");
    setCastingTime(snapshot.castingTime || "");
    setLocation(snapshot.location || "");
    setDayChangeRule(snapshot.dayChangeRule || "23:00");

    setMonthBranchContext(snapshot.monthBranchContext || "zi");
    setDayBranchContext(snapshot.dayBranchContext || "wu");
    setVoidPairContext(snapshot.voidPairContext || "xu-hai");

    setManualCalendarMode(Boolean(snapshot.manualCalendarMode));
    setManualMonthBranch(snapshot.manualMonthBranch || "zi");
    setManualDayBranch(snapshot.manualDayBranch || "wu");
    setManualDayStem(snapshot.manualDayStem || "jia");
    setManualDayVoid(snapshot.manualDayVoid || "xu-hai");

    setManualFocus(snapshot.manualFocus || "");
    setCopied(false);
    setSnapshotStatus("Loaded saved reading.");
    setDeleteConfirmArmed(false);
    clearSnapshotEditModes();

    scrollToQuestionSection();
  }

  function deleteSnapshot(snapshotId) {
    const nextSnapshots = savedSnapshots.filter(
      (snapshot) => snapshot.id !== snapshotId
    );

    persistSnapshots(nextSnapshots);
    setSnapshotStatus("Deleted saved reading.");
    setDeleteConfirmArmed(false);
    clearSnapshotEditModes();

    if (compareSnapshotAId === snapshotId) {
      setCompareSnapshotAId("");
    }

    if (compareSnapshotBId === snapshotId) {
      setCompareSnapshotBId("");
    }
  }

  function deleteAllSavedSnapshots() {
    if (savedSnapshots.length === 0) {
      setSnapshotStatus("No saved readings to delete.");
      setDeleteConfirmArmed(false);
      return;
    }

    if (!deleteConfirmArmed) {
      setDeleteConfirmArmed(true);
      setSnapshotStatus("Click Delete All Saved Readings again to confirm.");
      return;
    }

    const clearedSnapshots = clearSavedSnapshots();

    setSavedSnapshots(clearedSnapshots);
    setSnapshotStatus("Deleted all saved readings.");
    setDeleteConfirmArmed(false);
    setSnapshotSearch("");
    setCompareSnapshotAId("");
    setCompareSnapshotBId("");
    clearSnapshotEditModes();
  }

  function startRenameSnapshot(snapshot) {
    setRenamingSnapshotId(snapshot.id);
    setRenameTitleDraft(snapshot.title || snapshot.question || "");
    setEditingNoteSnapshotId("");
    setNoteDraft("");
    setViewingSnapshotId("");
    setSnapshotStatus("");
    setDeleteConfirmArmed(false);
  }

  function cancelRenameSnapshot() {
    setRenamingSnapshotId("");
    setRenameTitleDraft("");
    setSnapshotStatus("Rename cancelled.");
  }

  function saveSnapshotRename(snapshotId) {
    if (!renameTitleDraft.trim()) {
      setSnapshotStatus("Enter a title before saving the rename.");
      return;
    }

    const renamedSnapshots = renameSnapshotTitle(
      savedSnapshots,
      snapshotId,
      renameTitleDraft
    );

    persistSnapshots(renamedSnapshots);

    setRenamingSnapshotId("");
    setRenameTitleDraft("");
    setSnapshotStatus("Renamed saved reading.");
    setDeleteConfirmArmed(false);
  }
    function startEditSnapshotNote(snapshot) {
    setEditingNoteSnapshotId(snapshot.id);
    setNoteDraft(snapshot.note || "");
    setRenamingSnapshotId("");
    setRenameTitleDraft("");
    setViewingSnapshotId("");
    setSnapshotStatus("");
    setDeleteConfirmArmed(false);
  }

  function cancelEditSnapshotNote() {
    setEditingNoteSnapshotId("");
    setNoteDraft("");
    setSnapshotStatus("Note edit cancelled.");
  }

  function saveSnapshotNote(snapshotId) {
    const updatedSnapshots = updateSnapshotNote(
      savedSnapshots,
      snapshotId,
      noteDraft
    );

    persistSnapshots(updatedSnapshots);

    setEditingNoteSnapshotId("");
    setNoteDraft("");
    setSnapshotStatus("Saved note.");
    setDeleteConfirmArmed(false);
  }

  function toggleSnapshotDetails(snapshotId) {
    setViewingSnapshotId((currentSnapshotId) =>
      currentSnapshotId === snapshotId ? "" : snapshotId
    );
    setRenamingSnapshotId("");
    setRenameTitleDraft("");
    setEditingNoteSnapshotId("");
    setNoteDraft("");
    setSnapshotStatus("");
    setDeleteConfirmArmed(false);
  }

  function exportSavedSnapshots() {
    if (savedSnapshots.length === 0) {
      setSnapshotStatus("No saved readings to export.");
      setDeleteConfirmArmed(false);
      return;
    }

    const exportJson = buildSnapshotsExportJson(savedSnapshots);
    const exportBlob = new Blob([exportJson], {
      type: "application/json;charset=utf-8",
    });

    const exportUrl = URL.createObjectURL(exportBlob);
    const exportLink = document.createElement("a");

    exportLink.href = exportUrl;
    exportLink.download = `wwg-saved-readings-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);

    URL.revokeObjectURL(exportUrl);

    setSnapshotStatus("Exported saved readings.");
    setDeleteConfirmArmed(false);
    clearSnapshotEditModes();
  }

  function openImportSavedSnapshotsPicker() {
    setDeleteConfirmArmed(false);
    clearSnapshotEditModes();

    if (importFileInputRef.current) {
      importFileInputRef.current.click();
    }
  }

  async function importSavedSnapshotsFromFile(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const importText = await selectedFile.text();
      const importedSnapshots = parseSnapshotsImportJson(importText);

      const nextSnapshots =
        snapshotImportMode === "replace"
          ? replaceWithImportedSnapshots(importedSnapshots)
          : mergeImportedSnapshots(savedSnapshots, importedSnapshots);

      persistSnapshots(nextSnapshots);

      setSnapshotStatus(
        snapshotImportMode === "replace"
          ? `Imported ${importedSnapshots.length} saved reading${
              importedSnapshots.length === 1 ? "" : "s"
            } and replaced current saved readings.`
          : `Imported ${importedSnapshots.length} saved reading${
              importedSnapshots.length === 1 ? "" : "s"
            } and merged with current saved readings.`
      );
    } catch {
      setSnapshotStatus(
        "Import failed. Choose a valid WWG saved readings JSON file."
      );
    } finally {
      event.target.value = "";
      setDeleteConfirmArmed(false);
      clearSnapshotEditModes();
    }
  }

  const deleteAllButtonInactiveStyle =
    savedSnapshots.length === 0
      ? {
          opacity: 0.45,
          cursor: "not-allowed",
          filter: "grayscale(40%)",
        }
      : undefined;

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Wen Wang Gua MVP</p>
        <h1>Question Coding + Chart Logic</h1>
        <p className="subtitle">
          A guided system for turning a clear question into a structured WWG
          reading.
        </p>

        <button className="export-button" onClick={resetCurrentReading}>
          New Reading / Reset Form
        </button>
      </section>

      <section className="panel preset-panel">
        <h2>0. Load Sample Case</h2>
        <p className="section-note">
          Use presets to quickly test different WWG reading methods without
          entering everything manually.
        </p>

        <div className="preset-grid">
          {casePresets.map((preset) => (
            <button
              key={preset.id}
              className="preset-card"
              onClick={() => loadPreset(preset)}
            >
              <strong>{preset.label}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel" id="question-section">
        <h2>1. Question Refinement Engine</h2>
        <p className="section-note">
          Clarify the question before casting so the method, Self/Object coding,
          useful spirit, and final judgment have a clean target.
        </p>

        <label>
          Raw Question
          <textarea
            value={rawQuestion}
            onChange={(event) => {
              setRawQuestion(event.target.value);
              resetCopyAndStatus();
            }}
            placeholder="Example: Will this app make money?"
          />
        </label>

        <div className="field-grid">
          <label>
            Intent category
            <select
              value={selectedQuestionIntent}
              onChange={(event) => {
                setSelectedQuestionIntent(event.target.value);
                resetCopyAndStatus();
              }}
            >
              {questionIntentOptions.map((option) => (
                <option key={option.id || "auto"} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Clarified intent
            <input
              value={clarifiedIntent}
              onChange={(event) => {
                setClarifiedIntent(event.target.value);
                resetCopyAndStatus();
              }}
              placeholder="Example: profit from the WWG"
            />
          </label>

          <label>
            Emotional tone
            <select
              value={emotionalTone}
              onChange={(event) => {
                setEmotionalTone(event.target.value);
                resetCopyAndStatus();
              }}
            >
              <option value="">Not selected</option>
              <option value="Neutral">Neutral</option>
              <option value="Hope">Hope</option>
              <option value="Excitement">Excitement</option>
              <option value="Doubt">Doubt</option>
              <option value="Fear">Fear</option>
              <option value="Pressure">Pressure</option>
              <option value="Urgency">Urgency</option>
              <option value="Fatigue">Fatigue</option>
              <option value="Attachment">Attachment</option>
              <option value="Shame">Shame</option>
              <option value="Anger">Anger</option>
            </select>
          </label>
        </div>
                <div className="field-grid">
          <label>
            Known facts
            <textarea
              value={knownFacts}
              onChange={(event) => {
                setKnownFacts(event.target.value);
                resetCopyAndStatus();
              }}
              placeholder="Example: The app is built, deployed, and still being improved."
            />
          </label>

          <label>
            Assumptions to watch
            <textarea
              value={assumptions}
              onChange={(event) => {
                setAssumptions(event.target.value);
                resetCopyAndStatus();
              }}
              placeholder="Example: I assume people will pay for it quickly."
            />
          </label>
        </div>

        <div className="field-grid">
          <label>
            Self represents
            <input
              value={selfRole}
              onChange={(event) => {
                setSelfRole(event.target.value);
                resetCopyAndStatus();
              }}
              placeholder="Example: me, my business, my health"
            />
          </label>

          <label>
            Object represents
            <input
              value={objectRole}
              onChange={(event) => {
                setObjectRole(event.target.value);
                resetCopyAndStatus();
              }}
              placeholder="Example: job, client, partner, product"
            />
          </label>

          <label>
            Timeframe
            <input
              value={timeframe}
              onChange={(event) => {
                setTimeframe(event.target.value);
                resetCopyAndStatus();
              }}
              placeholder="Example: next 3 months"
            />
          </label>
        </div>

        <label>
          Final Casting Question
          <textarea
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              resetCopyAndStatus();
            }}
            placeholder="Example: Will this WWG app generate profit within the next three months?"
          />
        </label>

        <div className="recommendation-box">
          <strong>Suggested final question:</strong>{" "}
          {questionRefinement.suggestedFinalQuestion || "Add a raw question."}
        </div>

        <button className="export-button" onClick={useSuggestedFinalQuestion}>
          Use Suggested Final Question
        </button>

        {draftQuestionState.isDraft && draftQuestionState.question && (
          <div className="recommendation-box">
            <strong>Draft final question in use:</strong>{" "}
            {formatDraftQuestionLabel(draftQuestionState)}
          </div>
        )}

        <div className="score-row">
          <span>Question Quality</span>
          <strong>
            {questionRefinement.clarityScore}/100 —{" "}
            {questionRefinement.readinessLabel}
          </strong>
        </div>

        <div className="recommendation-grid">
          <div className="recommendation-card">
            <strong>Detected Intent</strong>
            <p>{questionRefinement.detectedIntent.label}</p>
          </div>

          <div className="recommendation-card">
            <strong>Method Hint</strong>
            <p>
              {methodState.pending
                ? "Method pending"
                : questionRefinement.methodHints.length
                ? questionRefinement.methodHints.join(", ")
                : "No method hint"}
            </p>
          </div>

          <div className="recommendation-card">
            <strong>Focus Hint</strong>
            <p>
              {methodState.pending
                ? "Method pending"
                : questionRefinement.focusHints.length
                ? questionRefinement.focusHints.join(", ")
                : "No focus hint"}
            </p>
          </div>

          <div className="recommendation-card">
            <strong>Ready to Cast</strong>
            <p>{questionRefinement.readyToCast && !methodState.pending ? "Yes" : "No"}</p>
          </div>

          <MethodPendingCard methodState={methodState} />
          <DraftQuestionCard draftQuestionState={draftQuestionState} />
        </div>

        {questionRefinement.warnings.length > 0 || methodState.pending ? (
          <ul className="warning-list">
            {methodState.pending && (
              <li>
                Method is pending until a question gives the app enough context.
              </li>
            )}
            {draftQuestionState.isDraft && draftQuestionState.question && (
              <li>
                Raw question is being used as a draft final question until you
                apply or enter a final casting question.
              </li>
            )}
            {questionRefinement.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : (
          <p className="success-message">
            The question is clear enough to move toward casting.
          </p>
        )}
      </section>

      <section className="panel">
        <h2>2. Choose the reading method</h2>

        <div className="recommendation-box">
          <strong>Recommended method:</strong>{" "}
          {methodState.pending
            ? "Method pending — enter or refine a question first"
            : `${recommendedMethod.id} — ${recommendedMethod.name}`}
        </div>

        <div className="method-grid">
          {methods.map((item) => (
            <button
              key={item.id}
              className={
                selectedMethod === item.id ? "method-card active" : "method-card"
              }
              onClick={() => {
                setSelectedMethod(item.id);
                setManualFocus("");
                resetCopyAndStatus();
              }}
            >
              <strong>{item.id}</strong>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {methodState.pending && (
          <p className="section-note">
            Manual method buttons remain available, but the app will not treat
            GLDM as a true default recommendation while the question is blank or
            unclear.
          </p>
        )}
      </section>

      <section className="panel">
        <h2>3. Question Coding Review</h2>

        <div className="summary-card">
          <p>
            <strong>Final casting question:</strong>{" "}
            {effectiveQuestion
              ? formatDraftQuestionLabel(draftQuestionState)
              : "No final question entered yet."}
          </p>
          <p>
            <strong>Question source:</strong>{" "}
            {getDraftQuestionSourceNote(draftQuestionState)}
          </p>
          <p>
            <strong>Selected method:</strong>{" "}
            {methodState.pending ? "Method pending" : method.name}
          </p>
          <p>
            <strong>Self:</strong> {selfRole.trim() ? selfRole : "Not set yet."}
          </p>
          <p>
            <strong>Object:</strong>{" "}
            {objectRole.trim() ? objectRole : "Not set yet."}
          </p>
          <p>
            <strong>Timeframe:</strong>{" "}
            {timeframe.trim() ? timeframe : "Not set yet."}
          </p>
          <p>
            <strong>Detected intent:</strong>{" "}
            {questionRefinement.detectedIntent.label}
          </p>
        </div>
      </section>
            <section className="panel">
        <h2>4. Calendar Engine Setup</h2>
        <p className="section-note">
          WWG depends on Gregorian date and time converted into Chinese
          calendrical values.
        </p>

        <div className="field-grid">
          <label>
            Casting date
            <input
              type="date"
              value={castingDate}
              onChange={(event) => {
                setCastingDate(event.target.value);
                resetCopyAndStatus();
              }}
            />
          </label>

          <label>
            Casting time
            <input
              type="time"
              value={castingTime}
              onChange={(event) => {
                setCastingTime(event.target.value);
                resetCopyAndStatus();
              }}
            />
          </label>

          <label>
            Location / timezone
            <input
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                resetCopyAndStatus();
              }}
              placeholder="Example: Chicago, Central Time"
            />
          </label>

          <label>
            Day change rule
            <select
              value={dayChangeRule}
              onChange={(event) => {
                setDayChangeRule(event.target.value);
                resetCopyAndStatus();
              }}
            >
              <option value="23:00">23:00 traditional rule</option>
              <option value="00:00">00:00 civil calendar rule</option>
            </select>
          </label>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={manualCalendarMode}
            onChange={(event) => {
              setManualCalendarMode(event.target.checked);
              resetCopyAndStatus();
            }}
          />
          Use manual Chinese calendar override
        </label>

        {manualCalendarMode && (
          <div className="field-grid manual-grid">
            <label>
              Month branch
              <select
                value={manualMonthBranch}
                onChange={(event) => {
                  setManualMonthBranch(event.target.value);
                  resetCopyAndStatus();
                }}
              >
                {earthlyBranches.map((branch) => (
                  <option key={branch.key} value={branch.key}>
                    {branch.label} — {branch.element}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Day branch
              <select
                value={manualDayBranch}
                onChange={(event) => {
                  setManualDayBranch(event.target.value);
                  resetCopyAndStatus();
                }}
              >
                {earthlyBranches.map((branch) => (
                  <option key={branch.key} value={branch.key}>
                    {branch.label} — {branch.element}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Day stem
              <select
                value={manualDayStem}
                onChange={(event) => {
                  setManualDayStem(event.target.value);
                  resetCopyAndStatus();
                }}
              >
                {heavenlyStems.map((stem) => (
                  <option key={stem.key} value={stem.key}>
                    {stem.label} — {stem.element}, {stem.polarity}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Day void
              <select
                value={manualDayVoid}
                onChange={(event) => {
                  setManualDayVoid(event.target.value);
                  resetCopyAndStatus();
                }}
              >
                {voidPairs.map((pair) => (
                  <option key={pair.key} value={pair.key}>
                    {pair.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="calendar-preview">
          <h3>Calendar Preview</h3>

          <p>
            <strong>Gregorian input:</strong>{" "}
            {castingDate
              ? `${castingDate}${castingTime ? ` at ${castingTime}` : ""}`
              : "Waiting for date."}
          </p>

          <p>
            <strong>Calendar-adjusted day:</strong>{" "}
            {automaticCalendar?.dateParts?.dateKey || "Not calculated yet"}
            {automaticCalendar?.dateParts?.dayAdjustedByRule
              ? " — adjusted by 23:00 day-change rule"
              : ""}
          </p>

          <p>
            <strong>Location / timezone:</strong>{" "}
            {location.trim() ? location : "Not set yet."}
          </p>

          <p>
            <strong>Chinese month branch:</strong> {monthBranch.label} /{" "}
            {monthBranch.element}
          </p>

          <p>
            <strong>Chinese day stem:</strong> {dayStem.label} /{" "}
            {dayStem.element}, {dayStem.polarity}
          </p>

          <p>
            <strong>Chinese day branch:</strong> {dayBranch.label} /{" "}
            {dayBranch.element}
          </p>

          <p>
            <strong>Dekad void:</strong> {voidPair.label}
          </p>

          <p>
            <strong>Calendar rule:</strong> Day changes at {dayChangeRule}
          </p>

          <p>
            <strong>Calendar source:</strong> {calendarSourceLabel}
          </p>

          <p>
            <strong>Calendar status:</strong> {calendarStatusLabel}
          </p>

          <p>
            <strong>Note:</strong> {calendarStatusNote}
          </p>
        </div>

        <div className="recommendation-grid">
          <CalendarConfidenceCard calendarConfidence={calendarConfidence} />
        </div>
      </section>

      <section className="panel">
        <h2>5. Question Quality Check</h2>

        <div className="score-row">
          <span>Overall Clarity Score</span>
          <strong>{clarityScore}/100</strong>
        </div>

        {warnings.length > 0 ? (
          <ul className="warning-list">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : (
          <p className="success-message">
            The question setup is clean enough to move toward casting.
          </p>
        )}
      </section>

      <section className="panel">
        <h2>6. Line Entry / Chart Builder</h2>
        <p className="section-note">
          Cast six lines automatically with the three-coin method, manually
          enter six lines from bottom to top, or enter a King Wen hexagram number
          with moving lines.
        </p>

        <div className="recommendation-box">
          <strong>Casting mode:</strong>{" "}
          {coinCastingHistory.length
            ? "Three-Coin Casting"
            : manualHexagramStatus
            ? "Manual Hexagram Entry"
            : "Manual Line Entry"}
        </div>

        {methodState.pending && (
          <div className="recommendation-box">
            <strong>Method pending:</strong> enter or refine a question before
            casting if you want this chart to become a coded WWG reading.
          </div>
        )}

        <button className="export-button" onClick={castReadingWithCoins}>
          Cast Reading with Three Coins
        </button>

        <div className="focus-panel">
          <h3>Manual Hexagram Entry</h3>
          <p className="section-note">
            Use this when you already cast a hexagram outside the app. Enter the
            original King Wen number and any moving lines.
          </p>

          <div className="field-grid">
            <label>
              Original hexagram number
              <input
                value={manualHexagramNumber}
                onChange={(event) => {
                  setManualHexagramNumber(event.target.value);
                  setManualHexagramStatus("");
                  resetCopyAndStatus();
                }}
                placeholder="Example: 62"
              />
            </label>

            <label>
              Moving lines
              <input
                value={manualHexagramMovingLines}
                onChange={(event) => {
                  setManualHexagramMovingLines(event.target.value);
                  setManualHexagramStatus("");
                  resetCopyAndStatus();
                }}
                placeholder="Example: 2, 5"
              />
            </label>

            <label>
              Apply manual chart
              <button onClick={applyManualHexagramEntry}>
                Apply Manual Hexagram
              </button>
            </label>
          </div>

          {manualHexagramStatus && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                textAlign: "left",
                color: "#f4e5d0",
                background: "rgba(15, 15, 18, 0.35)",
                border: "1px solid rgba(207, 224, 255, 0.18)",
                borderRadius: "18px",
                padding: "16px",
                lineHeight: 1.45,
              }}
            >
              {manualHexagramStatus}
            </pre>
          )}
        </div>
                {coinCastingHistory.length > 0 && (
          <div className="rule-list">
            {coinCastingHistory.map((result) => (
              <div key={result.lineNumber} className="rule-card">
                <strong>{formatCoinCastingLine(result)}</strong>
                <p>{result.meaning}</p>
              </div>
            ))}
          </div>
        )}

        <div className="recommendation-grid">
          {coinCastingLegend.map((item) => (
            <div key={item.total} className="recommendation-card">
              <strong>
                {item.total} — {item.label}
              </strong>
              <p>
                Coins: {item.coins}
                <br />
                Moving: {item.moving ? "Yes" : "No"}
                <br />
                Transforms to: {item.transformsTo}
              </p>
            </div>
          ))}
        </div>

        <div className="casting-layout">
          <div className="line-controls">
            {lines.map((lineKey, index) => (
              <label key={index}>
                Line {index + 1}{" "}
                {index === 0 ? "(bottom)" : index === 5 ? "(top)" : ""}
                <select
                  value={lineKey}
                  onChange={(event) => {
                    updateLine(index, event.target.value);
                    resetCopyAndStatus();
                  }}
                >
                  {Object.entries(lineTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="hexagram-comparison">
            <div className="hexagram-card">
              <p>Original Hexagram</p>
              <div className="hexagram-lines">
                {[...lines].reverse().map((lineKey, index) => (
                  <div key={`${lineKey}-${index}`} className="preview-line">
                    {renderOriginalLine(lineKey)}
                    {lineTypes[lineKey].moving && (
                      <span className="moving-marker">moving</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="hexagram-card transformed-card">
              <p>Transformed Hexagram</p>
              <div className="hexagram-lines">
                {[...transformedValues].reverse().map((lineValue, index) => (
                  <div key={`${lineValue}-${index}`} className="preview-line">
                    {renderLineByValue(lineValue)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hexagram-id-grid">
          <div className="hexagram-id-card">
            <h3>Original Identification</h3>
            <p>
              <strong>Hexagram:</strong> #{originalHexagram.kingWen.number} —{" "}
              {originalHexagram.kingWen.name} /{" "}
              {originalHexagram.kingWen.english}
              <br />
              <span className="subtle-line">{originalHexagram.label}</span>
            </p>
            <p>
              <strong>Nature:</strong> {originalHexagram.natureLabel}
            </p>
            <p>
              <strong>Palace:</strong> {originalHexagram.palace.palace}
            </p>
            <p>
              <strong>Hexagram element:</strong>{" "}
              {originalHexagram.palace.element}
            </p>
          </div>

          <div className="hexagram-id-card">
            <h3>Transformed Identification</h3>
            <p>
              <strong>Hexagram:</strong> #{transformedHexagram.kingWen.number} —{" "}
              {transformedHexagram.kingWen.name} /{" "}
              {transformedHexagram.kingWen.english}
              <br />
              <span className="subtle-line">{transformedHexagram.label}</span>
            </p>
            <p>
              <strong>Nature:</strong> {transformedHexagram.natureLabel}
            </p>
            <p>
              <strong>Palace:</strong> {transformedHexagram.palace.palace}
            </p>
            <p>
              <strong>Hexagram element:</strong>{" "}
              {transformedHexagram.palace.element}
            </p>
          </div>
        </div>

        <div className="focus-panel">
          <h3>Useful-Spirit / Matter-Element Focus</h3>

          <div className="field-grid">
            <label>
              Recommended focus
              <input
                value={
                  methodState.pending
                    ? "Method pending"
                    : `${selectedFocus} from ${effectiveMethodId}`
                }
                readOnly
              />
            </label>

            <label>
              Override focus
              <select
                value={manualFocus}
                onChange={(event) => {
                  setManualFocus(event.target.value);
                  resetCopyAndStatus();
                }}
                disabled={methodState.pending}
              >
                <option value="">Use recommended focus</option>
                {focusOptions.map((focus) => (
                  <option key={focus.key} value={focus.key}>
                    {focus.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="focus-summary">
            <p>
              <strong>Selected focus:</strong> {selectedFocus}
            </p>
            <p>
              <strong>Meaning:</strong> {selectedFocusInfo?.meaning}
            </p>
            <p>
              <strong>Focus lines:</strong>{" "}
              {focusRows.length
                ? focusRows.map((row) => `Line ${row.lineNumber}`).join(", ")
                : methodState.pending
                ? "Pending method selection"
                : "None found"}
            </p>
            <p>
              <strong>Preliminary focus reading:</strong> {focusSummary}
            </p>
          </div>
        </div>

        <div className="six-kins-panel">
          <h3>Earthly Branch + Six-Kins Assignment</h3>

          <div className="field-grid">
            <label>
              Month branch context
              <select
                value={monthBranchContext}
                onChange={(event) => {
                  setMonthBranchContext(event.target.value);
                  resetCopyAndStatus();
                }}
                disabled={manualCalendarMode}
              >
                {earthlyBranches.map((branch) => (
                  <option key={branch.key} value={branch.key}>
                    {branch.label} — {branch.element}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Day branch context
              <select
                value={dayBranchContext}
                onChange={(event) => {
                  setDayBranchContext(event.target.value);
                  resetCopyAndStatus();
                }}
                disabled={manualCalendarMode}
              >
                {earthlyBranches.map((branch) => (
                  <option key={branch.key} value={branch.key}>
                    {branch.label} — {branch.element}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Dekad void pair
              <select
                value={voidPairContext}
                onChange={(event) => {
                  setVoidPairContext(event.target.value);
                  resetCopyAndStatus();
                }}
                disabled={manualCalendarMode}
              >
                {voidPairs.map((pair) => (
                  <option key={pair.key} value={pair.key}>
                    {pair.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
                    <div className="six-kins-summary">
            <p>
              <strong>Using original hexagram element:</strong>{" "}
              {originalHexagram.palace.element}
            </p>
            <p>
              <strong>Active Month:</strong> {monthBranch.label} /{" "}
              {monthBranch.element} | <strong>Active Day:</strong>{" "}
              {dayBranch.label} / {dayBranch.element} |{" "}
              <strong>Active Void:</strong> {voidPair.label}
            </p>
          </div>

          <div className="six-kins-grid">
            {sixKinRows.map((row, index) => {
              const focused =
                !methodState.pending && isFocusMatch(row, selectedFocus);

              return (
                <div
                  key={row.lineNumber}
                  className={
                    focused
                      ? "six-kin-row line-condition-row focus-row"
                      : "six-kin-row line-condition-row"
                  }
                >
                  <strong>
                    Line {row.lineNumber}
                    {focused ? " ★" : ""}
                  </strong>

                  <select
                    value={row.branch.key}
                    onChange={(event) => {
                      updateLineBranch(index, event.target.value);
                      resetCopyAndStatus();
                    }}
                  >
                    {earthlyBranches.map((branch) => (
                      <option key={branch.key} value={branch.key}>
                        {branch.label} — {branch.element}
                      </option>
                    ))}
                  </select>

                  <span>
                    {row.branch.label} / {row.element} → {row.sixKin}
                  </span>

                  <span className="condition-pill">
                    {row.condition.summary}
                  </span>

                  <small>{row.condition.notes.join(" • ")}</small>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel rule-graph-panel">
        <h2>7. Rule Graph Engine</h2>
        <div className="rule-list">
          {ruleGraph.rules.map((rule, index) => (
            <div key={`${rule.title}-${index}`} className="rule-card">
              <strong>
                Rule {index + 1}: {rule.title}
              </strong>
              <p>{rule.text}</p>
            </div>
          ))}
        </div>
        <div className="rule-conclusion">
          <strong>Conclusion:</strong> {ruleGraph.conclusion}
        </div>
      </section>

      <section className="panel conflict-panel">
        <h2>8. Conflict Detection Engine</h2>
        <div className="confidence-box">
          <strong>Current confidence:</strong> {conflictReport.confidence}
        </div>
        <div className="conflict-list">
          {conflictReport.conflicts.map((conflict, index) => (
            <div key={`${conflict.title}-${index}`} className="conflict-card">
              <strong>
                {conflict.level} — {conflict.title}
              </strong>
              <p>{conflict.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel recommendation-panel">
        <h2>9. Recommendation Layer</h2>

        <div className="recommendation-grid">
          <div className="recommendation-card recommendation-action">
            <strong>Result Meaning</strong>
            <p>
              {recommendation.plainMeaning ||
                recommendation.reason ||
                "No result meaning available yet."}
            </p>
          </div>

          <div className="recommendation-card">
            <strong>Final Judgment</strong>
            <p>{recommendation.finalJudgment || recommendation.result}</p>
          </div>

          <CalendarConfidenceCard calendarConfidence={calendarConfidence} />

          <div className="recommendation-card">
            <strong>Supporting Signs</strong>
            <RecommendationList
              items={recommendation.supportingSigns}
              fallback={recommendation.reason}
            />
          </div>

          <div className="recommendation-card">
            <strong>Warning Signs</strong>
            <RecommendationList
              items={recommendation.warningSigns}
              fallback={recommendation.risk}
            />
          </div>

          <div className="recommendation-card recommendation-action">
            <strong>Recommended Action</strong>
            <p>{recommendation.action}</p>
          </div>

          <div className="recommendation-card">
            <strong>Next Check</strong>
            <p>{recommendation.nextCheck}</p>
          </div>
        </div>
      </section>

      <section className="panel palace-rules-panel">
        <h2>10. Palace Rules Preview</h2>

        {methodState.pending ? (
          <div className="rule-conclusion">
            <strong>Palace summary:</strong> {palaceRules.summary}
          </div>
        ) : (
          <>
            <div className="recommendation-grid">
              <div className="recommendation-card">
                <strong>Original Palace</strong>
                <p>
                  {palaceRules.originalPalace} / {palaceRules.originalElement}
                </p>
              </div>
              <div className="recommendation-card">
                <strong>Transformed Palace</strong>
                <p>
                  {palaceRules.transformedPalace} /{" "}
                  {palaceRules.transformedElement}
                </p>
              </div>
              <div className="recommendation-card">
                <strong>Shi / Self Line</strong>
                <p>Line {palaceRules.shiLine}</p>
              </div>
              <div className="recommendation-card">
                <strong>Ying / Other Line</strong>
                <p>Line {palaceRules.yingLine}</p>
              </div>
            </div>

            <div className="rule-list">
              {palaceRules.notes.map((note, index) => (
                <div key={`${note.title}-${index}`} className="rule-card">
                  <strong>
                    Palace Rule {index + 1}: {note.title}
                  </strong>
                  <p>{note.text}</p>
                </div>
              ))}
            </div>

            <div className="rule-conclusion">
              <strong>Palace summary:</strong> {palaceRules.summary}
            </div>
          </>
        )}
      </section>

      <section className="panel hidden-spirit-panel">
        <h2>11. Hidden / Flying Spirit Preview</h2>

        <div className="recommendation-grid">
          <div className="recommendation-card">
            <strong>Hidden Spirit Status</strong>
            <p>
              {hiddenSpirit.hiddenSpiritStatus ||
                hiddenSpirit.status ||
                "Method pending"}
            </p>
          </div>

          <div className="recommendation-card">
            <strong>Flying Spirit Status</strong>
            <p>
              {hiddenSpirit.flyingSpiritStatus ||
                hiddenSpirit.flyingStatus ||
                "Method pending"}
            </p>
          </div>

          <div className="recommendation-card">
            <strong>Selected Focus</strong>
            <p>{hiddenSpirit.selectedFocus || selectedFocus}</p>
          </div>

          <div className="recommendation-card">
            <strong>Visible Focus Found</strong>
            <p>{hiddenSpirit.visibleFocusFound ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="rule-list">
          {hiddenSpirit.notes.map((note, index) => (
            <div key={`${note.title}-${index}`} className="rule-card">
              <strong>
                Hidden Rule {index + 1}: {note.title}
              </strong>
              <p>{note.text}</p>
            </div>
          ))}
        </div>

        <div className="rule-conclusion">
          <strong>Hidden / Flying summary:</strong> {hiddenSpirit.summary}
        </div>
      </section>

      <section className="panel export-panel">
        <h2>12. Export Reading Summary</h2>
        <p className="section-note">
          Copy a clean report of the current reading for saving, journaling, or
          comparing cases later.
        </p>

        <button className="export-button" onClick={copyReadingSummary}>
          {copied ? "Copied Summary" : "Copy Reading Summary"}
        </button>

        <textarea className="export-textarea" value={readingSummary} readOnly />
      </section>
            <section className="panel result-panel">
        <h2>13. Protocol Preview</h2>

        <div className="summary-card">
          <p>
            <strong>Question:</strong>{" "}
            {effectiveQuestion
              ? formatDraftQuestionLabel(draftQuestionState)
              : "No final question entered yet."}
          </p>

          <p>
            <strong>Question source:</strong>{" "}
            {getDraftQuestionSourceNote(draftQuestionState)}
          </p>

          <p>
            <strong>Selected method:</strong>{" "}
            {methodState.pending ? "Method pending" : method.name}
          </p>

          <p>
            <strong>Self:</strong> {selfRole.trim() ? selfRole : "Not set yet."}
          </p>

          <p>
            <strong>Object:</strong>{" "}
            {objectRole.trim() ? objectRole : "Not set yet."}
          </p>

          <p>
            <strong>Timeframe:</strong>{" "}
            {timeframe.trim() ? timeframe : "Not set yet."}
          </p>

          <p>
            <strong>Matter focus:</strong> {selectedFocus}
          </p>

          <p>
            <strong>Focus reading:</strong> {focusSummary}
          </p>

          <p>
            <strong>Rule conclusion:</strong> {ruleGraph.conclusion}
          </p>

          <p>
            <strong>Confidence:</strong>{" "}
            {recommendation.confidence || conflictReport.confidence}
          </p>

          <p>
            <strong>Calendar confidence:</strong> {calendarConfidence.level} —{" "}
            {calendarConfidence.score}/100
          </p>

          <p>
            <strong>Calendar note:</strong> {calendarConfidence.summary}
          </p>

          <p>
            <strong>Result meaning:</strong>{" "}
            {recommendation.plainMeaning ||
              recommendation.reason ||
              "No result meaning available yet."}
          </p>

          <p>
            <strong>Final judgment:</strong>{" "}
            {recommendation.finalJudgment || recommendation.result}
          </p>

          <p>
            <strong>Recommended action:</strong> {recommendation.action}
          </p>
        </div>
      </section>

      <section className="panel snapshots-panel">
        <h2>14. Saved Reading Snapshots</h2>

        <p className="section-note">
          Save the current reading in this browser so you can reload, rename,
          annotate, search, sort, export, import, preview, copy, compare, and
          study cases later.
        </p>

        <div className="field-grid">
          <label>
            Search saved readings
            <input
              value={snapshotSearch}
              onChange={(event) => {
                setSnapshotSearch(event.target.value);
                setDeleteConfirmArmed(false);
                clearSnapshotEditModes();
              }}
              placeholder="Search title, question, note, method, date..."
            />
          </label>

          <label>
            Sort saved readings
            <select
              value={snapshotSort}
              onChange={(event) => {
                setSnapshotSort(event.target.value);
                setDeleteConfirmArmed(false);
                clearSnapshotEditModes();
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-az">Title A-Z</option>
              <option value="title-za">Title Z-A</option>
              <option value="method-az">Method A-Z</option>
            </select>
          </label>

          <label>
            Import behavior
            <select
              value={snapshotImportMode}
              onChange={(event) => {
                setSnapshotImportMode(event.target.value);
                setDeleteConfirmArmed(false);
                clearSnapshotEditModes();
              }}
            >
              <option value="merge">Import and Merge</option>
              <option value="replace">Import and Replace</option>
            </select>
          </label>
        </div>

        <input
          ref={importFileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={importSavedSnapshotsFromFile}
          style={{ display: "none" }}
        />

        <div className="snapshot-actions">
          <button className="snapshot-save-button" onClick={saveCurrentSnapshot}>
            Save Current Reading
          </button>

          <button
            onClick={exportSavedSnapshots}
            disabled={savedSnapshots.length === 0}
            style={deleteAllButtonInactiveStyle}
          >
            Export Saved Readings
          </button>

          <button onClick={openImportSavedSnapshotsPicker}>
            Import Saved Readings
          </button>

          <button
            className="danger-button"
            onClick={deleteAllSavedSnapshots}
            disabled={savedSnapshots.length === 0}
            style={deleteAllButtonInactiveStyle}
          >
            {deleteConfirmArmed
              ? "Confirm Delete All Saved Readings"
              : "Delete All Saved Readings"}
          </button>
        </div>

        {snapshotStatus && <p className="snapshot-status">{snapshotStatus}</p>}

        {savedSnapshots.length > 0 && snapshotSearch.trim() && (
          <p className="section-note">
            Showing {visibleSnapshots.length} of {savedSnapshots.length} saved
            readings.
          </p>
        )}

        <div
          style={{
            marginTop: "26px",
            marginBottom: "26px",
            padding: "24px",
            borderRadius: "26px",
            border: "1px solid rgba(240, 180, 95, 0.5)",
            background: "rgba(35, 27, 22, 0.58)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "12px",
              color: "#fbf7f1",
              textAlign: "center",
            }}
          >
            Snapshot Compare
          </h3>

          <p className="section-note" style={{ textAlign: "center" }}>
            Select two different saved readings to compare their question,
            method, calendar, lines, branches, notes, and timestamps.
          </p>

          <div className="field-grid">
            <label>
              Compare Reading A
              <select
                value={compareSnapshotAId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setCompareSnapshotAId(nextId);

                  if (nextId && nextId === compareSnapshotBId) {
                    setCompareSnapshotBId("");
                    setSnapshotStatus(
                      "Reading B was cleared because it matched Reading A."
                    );
                  } else {
                    setSnapshotStatus("");
                  }
                }}
              >
                <option value="">Select Reading A</option>
                {savedSnapshots
                  .filter((snapshot) => snapshot.id !== compareSnapshotBId)
                  .map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {getSnapshotTitle(snapshot)}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Compare Reading B
              <select
                value={compareSnapshotBId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setCompareSnapshotBId(nextId);

                  if (nextId && nextId === compareSnapshotAId) {
                    setCompareSnapshotAId("");
                    setSnapshotStatus(
                      "Reading A was cleared because it matched Reading B."
                    );
                  } else {
                    setSnapshotStatus("");
                  }
                }}
              >
                <option value="">Select Reading B</option>
                {savedSnapshots
                  .filter((snapshot) => snapshot.id !== compareSnapshotAId)
                  .map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {getSnapshotTitle(snapshot)}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Copy comparison
              <button
                onClick={copySnapshotCompare}
                disabled={!canCompareSnapshots}
                style={
                  !canCompareSnapshots
                    ? {
                        opacity: 0.45,
                        cursor: "not-allowed",
                        filter: "grayscale(40%)",
                      }
                    : undefined
                }
              >
                Copy Compare
              </button>
            </label>
          </div>
                    {compareSameReading ? (
            <p className="section-note" style={{ textAlign: "center" }}>
              Choose two different saved readings to compare.
            </p>
          ) : canCompareSnapshots ? (
            <div style={{ marginTop: "22px" }}>
              {compareSummary && (
                <div
                  style={{
                    marginBottom: "22px",
                    padding: "18px",
                    borderRadius: "20px",
                    border: "1px solid rgba(240, 180, 95, 0.55)",
                    background: "rgba(78, 55, 30, 0.35)",
                    textAlign: "left",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 8px",
                      color: "#f0b45f",
                      fontSize: "1.1rem",
                    }}
                  >
                    Compare Summary
                  </h4>
                  <p style={{ margin: 0, color: "#f4e5d0" }}>
                    {compareSummary.summaryText}
                  </p>
                </div>
              )}

              {compareRows.map((section) => (
                <div
                  key={section.section}
                  style={{
                    marginTop: "22px",
                    paddingTop: "18px",
                    borderTop: "1px solid rgba(207, 224, 255, 0.18)",
                  }}
                >
                  <h4
                    style={{
                      color: "#f0b45f",
                      fontSize: "1.2rem",
                      marginBottom: "14px",
                      textAlign: "left",
                    }}
                  >
                    {section.section}
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "180px 1fr 1fr",
                      gap: "12px",
                      alignItems: "start",
                    }}
                  >
                    <strong style={{ color: "#cfe0ff" }}>Field</strong>
                    <strong style={{ color: "#cfe0ff" }}>Reading A</strong>
                    <strong style={{ color: "#cfe0ff" }}>Reading B</strong>

                    {section.rows.map((row) => (
                      <React.Fragment key={`${section.section}-${row.key}`}>
                        <div
                          style={{
                            color: row.isDifferent ? "#f0b45f" : "#cfe0ff",
                            fontWeight: 900,
                            lineHeight: 1.45,
                            paddingTop: "10px",
                          }}
                        >
                          {row.label}
                          {row.isDifferent ? " ★" : ""}
                        </div>

                        <CompareCell
                          value={row.valueA}
                          isDifferent={row.isDifferent}
                        />

                        <CompareCell
                          value={row.valueB}
                          isDifferent={row.isDifferent}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="section-note" style={{ textAlign: "center" }}>
              Select two readings to view a comparison.
            </p>
          )}
        </div>

        {savedSnapshots.length === 0 ? (
          <p className="section-note">No saved readings yet.</p>
        ) : visibleSnapshots.length === 0 ? (
          <p className="section-note">No saved readings match your search.</p>
        ) : (
          <div className="snapshot-list">
            {visibleSnapshots.map((snapshot) => {
              const isRenaming = renamingSnapshotId === snapshot.id;
              const isEditingNote = editingNoteSnapshotId === snapshot.id;
              const isViewingDetails = viewingSnapshotId === snapshot.id;

              return (
                <div key={snapshot.id} className="snapshot-card">
                  <div>
                    {isRenaming ? (
                      <input
                        value={renameTitleDraft}
                        onChange={(event) =>
                          setRenameTitleDraft(event.target.value)
                        }
                        placeholder="Saved reading title"
                      />
                    ) : (
                      <strong>
                        {snapshot.title ||
                          snapshot.question ||
                          "Untitled reading"}
                      </strong>
                    )}

                    <span>
                      Saved{" "}
                      {new Date(
                        snapshot.updatedAt || snapshot.createdAt
                      ).toLocaleString()}
                    </span>

                    {isEditingNote ? (
                      <textarea
                        value={noteDraft}
                        onChange={(event) => setNoteDraft(event.target.value)}
                        placeholder="Add a note about this saved reading..."
                      />
                    ) : snapshot.note ? (
                      <p className="section-note">Note: {snapshot.note}</p>
                    ) : (
                      <p className="section-note">No note added.</p>
                    )}
                  </div>

                  <div className="snapshot-actions">
                    {isRenaming ? (
                      <>
                        <button onClick={() => saveSnapshotRename(snapshot.id)}>
                          Save Title
                        </button>
                        <button onClick={cancelRenameSnapshot}>Cancel</button>
                      </>
                    ) : isEditingNote ? (
                      <>
                        <button onClick={() => saveSnapshotNote(snapshot.id)}>
                          Save Note
                        </button>
                        <button onClick={cancelEditSnapshotNote}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => loadSnapshot(snapshot)}>
                          Load
                        </button>
                        <button onClick={() => toggleSnapshotDetails(snapshot.id)}>
                          {isViewingDetails ? "Hide Details" : "View Details"}
                        </button>
                        <button onClick={() => copySnapshotDetails(snapshot)}>
                          Copy Details
                        </button>
                        <button onClick={() => startRenameSnapshot(snapshot)}>
                          Rename
                        </button>
                        <button onClick={() => startEditSnapshotNote(snapshot)}>
                          {snapshot.note ? "Edit Note" : "Add Note"}
                        </button>
                        <button
                          className="danger-button"
                          onClick={() => deleteSnapshot(snapshot.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {isViewingDetails && (
                    <div>
                      <h3>Snapshot Details</h3>

                      <DetailSection title="Core Question">
                        <DetailRow
                          label="Saved title"
                          value={snapshot.title || "Untitled reading"}
                        />
                        <DetailRow
                          label="Question"
                          value={snapshot.question || "Not set"}
                        />
                        <DetailRow
                          label="Method"
                          value={getMethodDisplayName(snapshot.selectedMethod)}
                        />
                        <DetailRow
                          label="Self"
                          value={snapshot.selfRole || "Not set"}
                        />
                        <DetailRow
                          label="Object"
                          value={snapshot.objectRole || "Not set"}
                        />
                        <DetailRow
                          label="Timeframe"
                          value={snapshot.timeframe || "Not set"}
                        />
                        <DetailRow
                          label="Focus"
                          value={
                            snapshot.manualFocus || "Using recommended focus"
                          }
                        />
                      </DetailSection>

                      <DetailSection title="Calendar">
                        <DetailRow
                          label="Casting"
                          value={`${snapshot.castingDate || "No date"} ${
                            snapshot.castingTime || "No time"
                          }`}
                        />
                        <DetailRow
                          label="Location"
                          value={snapshot.location || "Not set"}
                        />
                        <DetailRow
                          label="Day rule"
                          value={snapshot.dayChangeRule || "23:00"}
                        />
                        <DetailRow
                          label="Manual calendar"
                          value={snapshot.manualCalendarMode ? "On" : "Off"}
                        />
                        <DetailRow
                          label="Month branch"
                          value={getBranchLabel(snapshot.manualMonthBranch)}
                        />
                        <DetailRow
                          label="Day branch"
                          value={getBranchLabel(snapshot.manualDayBranch)}
                        />
                        <DetailRow
                          label="Day stem"
                          value={getStemLabel(snapshot.manualDayStem)}
                        />
                        <DetailRow
                          label="Day void"
                          value={getVoidLabel(snapshot.manualDayVoid)}
                        />
                      </DetailSection>

                      <DetailSection title="Lines + Branches">
                        <DetailRow
                          label="Lines"
                          value={
                            (snapshot.lines || [])
                              .map(
                                (lineKey, index) =>
                                  `L${index + 1}: ${getLineLabel(lineKey)}`
                              )
                              .join(" | ") || "Not set"
                          }
                        />
                        <DetailRow
                          label="Branches"
                          value={
                            (snapshot.lineBranches || [])
                              .map(
                                (branchKey, index) =>
                                  `L${index + 1}: ${getBranchLabel(branchKey)}`
                              )
                              .join(" | ") || "Not set"
                          }
                        />
                      </DetailSection>

                      <DetailSection title="Notes">
                        <DetailRow
                          label="Note"
                          value={snapshot.note || "No note added."}
                        />
                      </DetailSection>

                      <DetailSection title="Timestamps">
                        <DetailRow
                          label="Created"
                          value={
                            snapshot.createdAt
                              ? new Date(snapshot.createdAt).toLocaleString()
                              : "Unknown"
                          }
                        />
                        <DetailRow
                          label="Last updated"
                          value={
                            snapshot.updatedAt
                              ? new Date(snapshot.updatedAt).toLocaleString()
                              : "Unknown"
                          }
                        />
                      </DetailSection>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
