const SNAPSHOT_STORAGE_KEY = "wwg-reading-snapshots";
const MAX_SNAPSHOTS = 20;

export function loadSavedSnapshots() {
  const storedSnapshots = localStorage.getItem(SNAPSHOT_STORAGE_KEY);

  if (!storedSnapshots) {
    return [];
  }

  try {
    const parsedSnapshots = JSON.parse(storedSnapshots);

    if (!Array.isArray(parsedSnapshots)) {
      return [];
    }

    const cleanedSnapshots = cleanupDuplicateSnapshots(parsedSnapshots);

    localStorage.setItem(
      SNAPSHOT_STORAGE_KEY,
      JSON.stringify(cleanedSnapshots)
    );

    return cleanedSnapshots;
  } catch {
    return [];
  }
}

export function saveSnapshots(nextSnapshots) {
  const safeSnapshots = cleanupDuplicateSnapshots(
    Array.isArray(nextSnapshots) ? nextSnapshots : []
  ).slice(0, MAX_SNAPSHOTS);

  localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(safeSnapshots));

  return safeSnapshots;
}

export function clearSavedSnapshots() {
  localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
  return [];
}

export function renameSnapshotTitle(existingSnapshots, snapshotId, nextTitle) {
  const safeSnapshots = Array.isArray(existingSnapshots)
    ? existingSnapshots
    : [];

  const cleanTitle = String(nextTitle || "").trim();

  if (!snapshotId || !cleanTitle) {
    return safeSnapshots;
  }

  return safeSnapshots.map((snapshot) =>
    snapshot.id === snapshotId
      ? {
          ...snapshot,
          title: cleanTitle,
          updatedAt: new Date().toISOString(),
        }
      : snapshot
  );
}

export function updateSnapshotNote(existingSnapshots, snapshotId, nextNote) {
  const safeSnapshots = Array.isArray(existingSnapshots)
    ? existingSnapshots
    : [];

  if (!snapshotId) {
    return safeSnapshots;
  }

  return safeSnapshots.map((snapshot) =>
    snapshot.id === snapshotId
      ? {
          ...snapshot,
          note: String(nextNote || "").trim(),
          updatedAt: new Date().toISOString(),
        }
      : snapshot
  );
}

export function createSnapshot({
  question,
  selectedMethod,
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
}) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    duplicateKey: buildSnapshotDuplicateKey({
      question,
      selectedMethod,
      castingDate,
      castingTime,
    }),
    title: question.trim(),
    note: "",
    createdAt: now,
    updatedAt: now,

    question,
    selectedMethod,
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
  };
}

export function upsertSnapshot(existingSnapshots, nextSnapshot) {
  const safeExistingSnapshots = Array.isArray(existingSnapshots)
    ? cleanupDuplicateSnapshots(existingSnapshots)
    : [];

  const duplicateKey =
    nextSnapshot.duplicateKey ||
    buildSnapshotDuplicateKey({
      question: nextSnapshot.question,
      selectedMethod: nextSnapshot.selectedMethod,
      castingDate: nextSnapshot.castingDate,
      castingTime: nextSnapshot.castingTime,
    });

  const matchingSnapshot = safeExistingSnapshots.find(
    (snapshot) => getSnapshotDuplicateKey(snapshot) === duplicateKey
  );

  if (!matchingSnapshot) {
    return {
      snapshots: cleanupDuplicateSnapshots([
        nextSnapshot,
        ...safeExistingSnapshots,
      ]).slice(0, MAX_SNAPSHOTS),
      action: "created",
    };
  }

  const updatedSnapshot = {
    ...matchingSnapshot,
    ...nextSnapshot,
    id: matchingSnapshot.id,
    duplicateKey,
    title: matchingSnapshot.title || nextSnapshot.title,
    note: matchingSnapshot.note || "",
    createdAt: matchingSnapshot.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const remainingSnapshots = safeExistingSnapshots.filter(
    (snapshot) => snapshot.id !== matchingSnapshot.id
  );

  return {
    snapshots: cleanupDuplicateSnapshots([
      updatedSnapshot,
      ...remainingSnapshots,
    ]).slice(0, MAX_SNAPSHOTS),
    action: "updated",
  };
}

export function buildSnapshotsExportJson(existingSnapshots) {
  const safeSnapshots = cleanupDuplicateSnapshots(
    Array.isArray(existingSnapshots) ? existingSnapshots : []
  );

  return JSON.stringify(
    {
      app: "Wen Wang Gua MVP",
      type: "wwg-reading-snapshots",
      version: 1,
      exportedAt: new Date().toISOString(),
      count: safeSnapshots.length,
      snapshots: safeSnapshots,
    },
    null,
    2
  );
}

export function parseSnapshotsImportJson(importText) {
  const parsedImport = JSON.parse(importText);

  const importedSnapshots = Array.isArray(parsedImport)
    ? parsedImport
    : parsedImport?.snapshots;

  if (!Array.isArray(importedSnapshots)) {
    throw new Error("Import file does not contain a snapshots array.");
  }

  return cleanupDuplicateSnapshots(importedSnapshots);
}

export function mergeImportedSnapshots(existingSnapshots, importedSnapshots) {
  const safeExistingSnapshots = Array.isArray(existingSnapshots)
    ? existingSnapshots
    : [];

  const safeImportedSnapshots = Array.isArray(importedSnapshots)
    ? importedSnapshots
    : [];

  return cleanupDuplicateSnapshots([
    ...safeImportedSnapshots,
    ...safeExistingSnapshots,
  ]).slice(0, MAX_SNAPSHOTS);
}

export function replaceWithImportedSnapshots(importedSnapshots) {
  const safeImportedSnapshots = Array.isArray(importedSnapshots)
    ? importedSnapshots
    : [];

  return cleanupDuplicateSnapshots(safeImportedSnapshots).slice(
    0,
    MAX_SNAPSHOTS
  );
}

function cleanupDuplicateSnapshots(snapshots) {
  const snapshotsByKey = new Map();

  snapshots.forEach((snapshot) => {
    if (!snapshot || typeof snapshot !== "object") {
      return;
    }

    const duplicateKey = getSnapshotDuplicateKey(snapshot);
    const existingSnapshot = snapshotsByKey.get(duplicateKey);

    if (!existingSnapshot) {
      snapshotsByKey.set(duplicateKey, {
        ...snapshot,
        id: snapshot.id || crypto.randomUUID(),
        duplicateKey,
        title: snapshot.title || snapshot.question || "Untitled reading",
        note: snapshot.note || "",
        createdAt: snapshot.createdAt || new Date().toISOString(),
        updatedAt:
          snapshot.updatedAt || snapshot.createdAt || new Date().toISOString(),
      });
      return;
    }

    const existingTime = getSnapshotSortTime(existingSnapshot);
    const nextTime = getSnapshotSortTime(snapshot);

    if (nextTime >= existingTime) {
      snapshotsByKey.set(duplicateKey, {
        ...snapshot,
        id: existingSnapshot.id || snapshot.id || crypto.randomUUID(),
        duplicateKey,
        title:
          existingSnapshot.title ||
          snapshot.title ||
          snapshot.question ||
          "Untitled reading",
        note: existingSnapshot.note || snapshot.note || "",
        createdAt: existingSnapshot.createdAt || snapshot.createdAt,
        updatedAt: snapshot.updatedAt || snapshot.createdAt,
      });
    }
  });

  return Array.from(snapshotsByKey.values())
    .sort((a, b) => getSnapshotSortTime(b) - getSnapshotSortTime(a))
    .slice(0, MAX_SNAPSHOTS);
}

function getSnapshotDuplicateKey(snapshot) {
  return (
    snapshot.duplicateKey ||
    buildSnapshotDuplicateKey({
      question: snapshot.question,
      selectedMethod: snapshot.selectedMethod,
      castingDate: snapshot.castingDate,
      castingTime: snapshot.castingTime,
    })
  );
}

function buildSnapshotDuplicateKey({
  question,
  selectedMethod,
  castingDate,
  castingTime,
}) {
  return [
    normalizeKeyPart(question),
    normalizeKeyPart(selectedMethod),
    normalizeKeyPart(castingDate),
    normalizeKeyPart(castingTime),
  ].join("|");
}

function normalizeKeyPart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getSnapshotSortTime(snapshot) {
  return new Date(snapshot.updatedAt || snapshot.createdAt || 0).getTime();
}