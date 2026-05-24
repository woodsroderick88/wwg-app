import { defaultLines, normalizeLineKey } from "../data/lines";
import { defaultLineBranches } from "../data/branches";

const PRIMARY_STORAGE_KEY = "wwg_saved_reading_snapshots_v2";

const LEGACY_STORAGE_KEYS = [
  "wwg_saved_reading_snapshots",
  "wwgSavedReadingSnapshots",
  "wwgSavedSnapshots",
  "wwg-saved-reading-snapshots",
  "wwg-saved-readings",
  "wwg_saved_readings",
];

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeLines(lines) {
  const sourceLines = Array.isArray(lines) && lines.length === 6 ? lines : defaultLines;

  return sourceLines.map((lineKey) => normalizeLineKey(lineKey));
}

function normalizeBranches(branches) {
  const sourceBranches =
    Array.isArray(branches) && branches.length === 6
      ? branches
      : defaultLineBranches;

  return sourceBranches.map((branchKey) => String(branchKey || "").trim() || "zi");
}

function getSnapshotSignature(snapshot) {
  return [
    cleanText(snapshot.question).toLowerCase(),
    cleanText(snapshot.selectedMethod),
    cleanText(snapshot.selfRole).toLowerCase(),
    cleanText(snapshot.objectRole).toLowerCase(),
    cleanText(snapshot.timeframe).toLowerCase(),
    normalizeLines(snapshot.lines).join("|"),
    normalizeBranches(snapshot.lineBranches).join("|"),
  ].join("::");
}

function normalizeSnapshot(snapshot) {
  const now = new Date().toISOString();

  const normalizedSnapshot = {
    id: cleanText(snapshot?.id) || makeId(),

    title:
      cleanText(snapshot?.title) ||
      cleanText(snapshot?.question) ||
      "Untitled reading",

    question: cleanText(snapshot?.question),

    selectedMethod: cleanText(snapshot?.selectedMethod) || "GLDM",
    selfRole: cleanText(snapshot?.selfRole),
    objectRole: cleanText(snapshot?.objectRole),
    timeframe: cleanText(snapshot?.timeframe),

    lines: normalizeLines(snapshot?.lines),
    lineBranches: normalizeBranches(snapshot?.lineBranches),

    castingDate: cleanText(snapshot?.castingDate),
    castingTime: cleanText(snapshot?.castingTime),
    location: cleanText(snapshot?.location),
    dayChangeRule: cleanText(snapshot?.dayChangeRule) || "23:00",

    monthBranchContext: cleanText(snapshot?.monthBranchContext) || "zi",
    dayBranchContext: cleanText(snapshot?.dayBranchContext) || "wu",
    voidPairContext: cleanText(snapshot?.voidPairContext) || "xu-hai",

    manualCalendarMode: Boolean(snapshot?.manualCalendarMode),
    manualMonthBranch: cleanText(snapshot?.manualMonthBranch) || "zi",
    manualDayBranch: cleanText(snapshot?.manualDayBranch) || "wu",
    manualDayStem: cleanText(snapshot?.manualDayStem) || "jia",
    manualDayVoid: cleanText(snapshot?.manualDayVoid) || "xu-hai",

    manualFocus: cleanText(snapshot?.manualFocus),

    note: cleanText(snapshot?.note),
    readingSummary: cleanText(snapshot?.readingSummary),

    createdAt: cleanText(snapshot?.createdAt) || now,
    updatedAt: cleanText(snapshot?.updatedAt) || cleanText(snapshot?.createdAt) || now,
  };

  normalizedSnapshot.signature = getSnapshotSignature(normalizedSnapshot);

  return normalizedSnapshot;
}

function dedupeSnapshots(snapshots) {
  const byId = new Map();
  const bySignature = new Map();

  snapshots.forEach((snapshot) => {
    const normalizedSnapshot = normalizeSnapshot(snapshot);

    if (byId.has(normalizedSnapshot.id)) {
      const current = byId.get(normalizedSnapshot.id);
      const currentTime = new Date(current.updatedAt || current.createdAt || 0).getTime();
      const nextTime = new Date(
        normalizedSnapshot.updatedAt || normalizedSnapshot.createdAt || 0
      ).getTime();

      if (nextTime >= currentTime) {
        byId.set(normalizedSnapshot.id, normalizedSnapshot);
      }

      return;
    }

    const existingSignatureId = bySignature.get(normalizedSnapshot.signature);

    if (existingSignatureId && byId.has(existingSignatureId)) {
      const current = byId.get(existingSignatureId);
      const currentTime = new Date(current.updatedAt || current.createdAt || 0).getTime();
      const nextTime = new Date(
        normalizedSnapshot.updatedAt || normalizedSnapshot.createdAt || 0
      ).getTime();

      if (nextTime >= currentTime) {
        byId.set(existingSignatureId, {
          ...normalizedSnapshot,
          id: existingSignatureId,
          createdAt: current.createdAt || normalizedSnapshot.createdAt,
        });
      }

      return;
    }

    byId.set(normalizedSnapshot.id, normalizedSnapshot);
    bySignature.set(normalizedSnapshot.signature, normalizedSnapshot.id);
  });

  return Array.from(byId.values()).sort((a, b) => {
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();

    return bTime - aTime;
  });
}

function readSnapshotsFromKey(storageKey) {
  if (typeof localStorage === "undefined") {
    return [];
  }

  const rawValue = localStorage.getItem(storageKey);

  if (!rawValue) {
    return [];
  }

  const parsedValue = safeJsonParse(rawValue, []);

  if (Array.isArray(parsedValue)) {
    return parsedValue;
  }

  if (Array.isArray(parsedValue.snapshots)) {
    return parsedValue.snapshots;
  }

  return [];
}

function writeSnapshotsToStorage(snapshots) {
  if (typeof localStorage === "undefined") {
    return;
  }

  const normalizedSnapshots = dedupeSnapshots(snapshots);

  localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(normalizedSnapshots));
}

export function loadSavedSnapshots() {
  const primarySnapshots = readSnapshotsFromKey(PRIMARY_STORAGE_KEY);

  const legacySnapshots = LEGACY_STORAGE_KEYS.flatMap((storageKey) =>
    readSnapshotsFromKey(storageKey)
  );

  const normalizedSnapshots = dedupeSnapshots([
    ...primarySnapshots,
    ...legacySnapshots,
  ]);

  writeSnapshotsToStorage(normalizedSnapshots);

  return normalizedSnapshots;
}

export function saveSnapshots(snapshots) {
  const normalizedSnapshots = dedupeSnapshots(snapshots);

  writeSnapshotsToStorage(normalizedSnapshots);

  return normalizedSnapshots;
}

export function clearSavedSnapshots() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(PRIMARY_STORAGE_KEY);

    LEGACY_STORAGE_KEYS.forEach((storageKey) => {
      localStorage.removeItem(storageKey);
    });
  }

  return [];
}

export function createSnapshot(readingState) {
  const now = new Date().toISOString();

  return normalizeSnapshot({
    id: makeId(),

    title:
      cleanText(readingState.question) ||
      cleanText(readingState.title) ||
      "Untitled reading",

    question: readingState.question,

    selectedMethod: readingState.selectedMethod,
    selfRole: readingState.selfRole,
    objectRole: readingState.objectRole,
    timeframe: readingState.timeframe,

    lines: normalizeLines(readingState.lines),
    lineBranches: normalizeBranches(readingState.lineBranches),

    castingDate: readingState.castingDate,
    castingTime: readingState.castingTime,
    location: readingState.location,
    dayChangeRule: readingState.dayChangeRule,

    monthBranchContext: readingState.monthBranchContext,
    dayBranchContext: readingState.dayBranchContext,
    voidPairContext: readingState.voidPairContext,

    manualCalendarMode: readingState.manualCalendarMode,
    manualMonthBranch: readingState.manualMonthBranch,
    manualDayBranch: readingState.manualDayBranch,
    manualDayStem: readingState.manualDayStem,
    manualDayVoid: readingState.manualDayVoid,

    manualFocus: readingState.manualFocus,

    note: readingState.note,
    readingSummary: readingState.readingSummary,

    createdAt: now,
    updatedAt: now,
  });
}

export function upsertSnapshot(snapshots, snapshot) {
  const normalizedSnapshot = normalizeSnapshot(snapshot);
  const normalizedSnapshots = dedupeSnapshots(snapshots);

  const existingIndex = normalizedSnapshots.findIndex(
    (currentSnapshot) =>
      currentSnapshot.id === normalizedSnapshot.id ||
      currentSnapshot.signature === normalizedSnapshot.signature
  );

  if (existingIndex >= 0) {
    const existingSnapshot = normalizedSnapshots[existingIndex];

    const updatedSnapshot = normalizeSnapshot({
      ...existingSnapshot,
      ...normalizedSnapshot,
      id: existingSnapshot.id,
      createdAt: existingSnapshot.createdAt || normalizedSnapshot.createdAt,
      updatedAt: new Date().toISOString(),
      note: existingSnapshot.note || normalizedSnapshot.note,
      title:
        existingSnapshot.title ||
        normalizedSnapshot.title ||
        normalizedSnapshot.question ||
        "Untitled reading",
    });

    const nextSnapshots = [...normalizedSnapshots];

    nextSnapshots[existingIndex] = updatedSnapshot;

    return {
      snapshots: saveSnapshots(nextSnapshots),
      action: "updated",
    };
  }

  return {
    snapshots: saveSnapshots([normalizedSnapshot, ...normalizedSnapshots]),
    action: "created",
  };
}

export function renameSnapshotTitle(snapshots, snapshotId, title) {
  const updatedAt = new Date().toISOString();

  return saveSnapshots(
    snapshots.map((snapshot) =>
      snapshot.id === snapshotId
        ? normalizeSnapshot({
            ...snapshot,
            title,
            updatedAt,
          })
        : normalizeSnapshot(snapshot)
    )
  );
}

export function updateSnapshotNote(snapshots, snapshotId, note) {
  const updatedAt = new Date().toISOString();

  return saveSnapshots(
    snapshots.map((snapshot) =>
      snapshot.id === snapshotId
        ? normalizeSnapshot({
            ...snapshot,
            note,
            updatedAt,
          })
        : normalizeSnapshot(snapshot)
    )
  );
}

export function buildSnapshotsExportJson(snapshots) {
  const exportPayload = {
    type: "wwg-saved-reading-snapshots",
    version: 2,
    exportedAt: new Date().toISOString(),
    snapshots: dedupeSnapshots(snapshots),
  };

  return JSON.stringify(exportPayload, null, 2);
}

export function parseSnapshotsImportJson(importText) {
  const parsedValue = safeJsonParse(importText, null);

  if (!parsedValue) {
    throw new Error("Invalid JSON.");
  }

  const snapshots = Array.isArray(parsedValue)
    ? parsedValue
    : Array.isArray(parsedValue.snapshots)
      ? parsedValue.snapshots
      : null;

  if (!snapshots) {
    throw new Error("No snapshots found.");
  }

  return dedupeSnapshots(snapshots);
}

export function mergeImportedSnapshots(currentSnapshots, importedSnapshots) {
  return saveSnapshots([...currentSnapshots, ...importedSnapshots]);
}

export function replaceWithImportedSnapshots(importedSnapshots) {
  return saveSnapshots(importedSnapshots);
}