import { earthlyBranches, voidPairs } from "../data/branches";
import { heavenlyStems } from "../data/stems";
import { lineTypes } from "../data/lines";

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

function formatDateTime(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function formatLines(lines = []) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return "Not set";
  }

  return lines
    .map((lineKey, index) => `L${index + 1}: ${getLineLabel(lineKey)}`)
    .join(" | ");
}

function formatBranches(branches = []) {
  if (!Array.isArray(branches) || branches.length === 0) {
    return "Not set";
  }

  return branches
    .map((branchKey, index) => `L${index + 1}: ${getBranchLabel(branchKey)}`)
    .join(" | ");
}

function getSnapshotValue(snapshot, fieldKey) {
  if (!snapshot) {
    return "Not selected";
  }

  if (fieldKey === "title") {
    return snapshot.title || snapshot.question || "Untitled reading";
  }

  if (fieldKey === "question") {
    return snapshot.question || "Not set";
  }

  if (fieldKey === "method") {
    return snapshot.selectedMethod || "Not set";
  }

  if (fieldKey === "self") {
    return snapshot.selfRole || "Not set";
  }

  if (fieldKey === "object") {
    return snapshot.objectRole || "Not set";
  }

  if (fieldKey === "timeframe") {
    return snapshot.timeframe || "Not set";
  }

  if (fieldKey === "casting") {
    return `${snapshot.castingDate || "No date"} ${
      snapshot.castingTime || "No time"
    }`;
  }

  if (fieldKey === "location") {
    return snapshot.location || "Not set";
  }

  if (fieldKey === "dayRule") {
    return snapshot.dayChangeRule || "23:00";
  }

  if (fieldKey === "manualCalendar") {
    return snapshot.manualCalendarMode ? "On" : "Off";
  }

  if (fieldKey === "monthBranch") {
    return getBranchLabel(snapshot.manualMonthBranch);
  }

  if (fieldKey === "dayBranch") {
    return getBranchLabel(snapshot.manualDayBranch);
  }

  if (fieldKey === "dayStem") {
    return getStemLabel(snapshot.manualDayStem);
  }

  if (fieldKey === "dayVoid") {
    return getVoidLabel(snapshot.manualDayVoid);
  }

  if (fieldKey === "focus") {
    return snapshot.manualFocus || "Using recommended focus";
  }

  if (fieldKey === "lines") {
    return formatLines(snapshot.lines);
  }

  if (fieldKey === "branches") {
    return formatBranches(snapshot.lineBranches);
  }

  if (fieldKey === "note") {
    return snapshot.note || "No note added.";
  }

  if (fieldKey === "created") {
    return formatDateTime(snapshot.createdAt);
  }

  if (fieldKey === "updated") {
    return formatDateTime(snapshot.updatedAt);
  }

  return "Not set";
}

export function buildSnapshotCompareRows(snapshotA, snapshotB) {
  const sections = [
    {
      section: "Core Question",
      priority: 1,
      fields: [
        ["title", "Saved title"],
        ["question", "Question"],
        ["method", "Method"],
        ["self", "Self"],
        ["object", "Object"],
        ["timeframe", "Timeframe"],
        ["focus", "Focus"],
      ],
    },
    {
      section: "Calendar",
      priority: 2,
      fields: [
        ["casting", "Casting"],
        ["location", "Location"],
        ["dayRule", "Day rule"],
        ["manualCalendar", "Manual calendar"],
        ["monthBranch", "Month branch"],
        ["dayBranch", "Day branch"],
        ["dayStem", "Day stem"],
        ["dayVoid", "Day void"],
      ],
    },
    {
      section: "Lines + Branches",
      priority: 3,
      fields: [
        ["lines", "Lines"],
        ["branches", "Branches"],
      ],
    },
    {
      section: "Notes",
      priority: 4,
      fields: [["note", "Note"]],
    },
    {
      section: "Timestamps",
      priority: 5,
      fields: [
        ["created", "Created"],
        ["updated", "Last updated"],
      ],
    },
  ];

  return sections.map((section) => ({
    section: section.section,
    priority: section.priority,
    rows: section.fields.map(([fieldKey, label]) => {
      const valueA = getSnapshotValue(snapshotA, fieldKey);
      const valueB = getSnapshotValue(snapshotB, fieldKey);

      return {
        key: fieldKey,
        label,
        valueA,
        valueB,
        isDifferent: valueA !== valueB,
      };
    }),
  }));
}

export function buildSnapshotCompareSummary(snapshotA, snapshotB) {
  if (!snapshotA || !snapshotB) {
    return {
      differenceCount: 0,
      sameCount: 0,
      totalCount: 0,
      importantDifferences: [],
      summaryText: "Select two saved readings to view a comparison summary.",
    };
  }

  const compareRows = buildSnapshotCompareRows(snapshotA, snapshotB);
  const flatRows = compareRows.flatMap((section) =>
    section.rows.map((row) => ({
      ...row,
      section: section.section,
      priority: section.priority,
    }))
  );

  const differentRows = flatRows.filter((row) => row.isDifferent);
  const sameRows = flatRows.filter((row) => !row.isDifferent);

  const importantFieldOrder = [
    "question",
    "method",
    "self",
    "object",
    "timeframe",
    "focus",
    "casting",
    "monthBranch",
    "dayBranch",
    "dayStem",
    "dayVoid",
    "lines",
    "branches",
    "note",
  ];

  const importantDifferences = differentRows
    .slice()
    .sort((a, b) => {
      const indexA = importantFieldOrder.indexOf(a.key);
      const indexB = importantFieldOrder.indexOf(b.key);

      const safeIndexA = indexA === -1 ? 999 : indexA;
      const safeIndexB = indexB === -1 ? 999 : indexB;

      if (safeIndexA !== safeIndexB) {
        return safeIndexA - safeIndexB;
      }

      return a.priority - b.priority;
    })
    .slice(0, 5)
    .map((row) => row.label);

  const summaryText =
    differentRows.length === 0
      ? "These two saved readings currently match across all compared fields."
      : `Differences found: ${differentRows.length}. Same fields: ${
          sameRows.length
        }. Most important differences: ${
          importantDifferences.length
            ? importantDifferences.join(", ")
            : "None"
        }.`;

  return {
    differenceCount: differentRows.length,
    sameCount: sameRows.length,
    totalCount: flatRows.length,
    importantDifferences,
    summaryText,
  };
}

export function buildSnapshotCompareText(snapshotA, snapshotB) {
  const compareRows = buildSnapshotCompareRows(snapshotA, snapshotB);
  const compareSummary = buildSnapshotCompareSummary(snapshotA, snapshotB);

  const titleA = snapshotA?.title || snapshotA?.question || "Reading A";
  const titleB = snapshotB?.title || snapshotB?.question || "Reading B";

  const lines = [
    "SNAPSHOT COMPARE",
    "",
    `Reading A: ${titleA}`,
    `Reading B: ${titleB}`,
    "",
    "COMPARE SUMMARY",
    `Differences found: ${compareSummary.differenceCount}`,
    `Same fields: ${compareSummary.sameCount}`,
    `Total fields compared: ${compareSummary.totalCount}`,
    `Most important differences: ${
      compareSummary.importantDifferences.length
        ? compareSummary.importantDifferences.join(", ")
        : "None"
    }`,
    "",
  ];

  compareRows.forEach((section) => {
    lines.push(section.section.toUpperCase());

    section.rows.forEach((row) => {
      lines.push(`${row.label}:`);
      lines.push(`A: ${row.valueA}`);
      lines.push(`B: ${row.valueB}`);
      lines.push(row.isDifferent ? "Different: Yes" : "Different: No");
      lines.push("");
    });
  });

  return lines.join("\n").trim();
}