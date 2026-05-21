import { branchClashes, getVoidPair } from "../data/branches";
import { lineTypes } from "../data/lines";

export function getLineCondition(
  branchKey,
  lineKey,
  monthBranchKey,
  dayBranchKey,
  voidPairKey
) {
  const notes = [];
  const voidPair = getVoidPair(voidPairKey);

  if (lineTypes[lineKey].moving) {
    notes.push("Active moving line");
  }

  if (branchKey === monthBranchKey) {
    notes.push("Supported by month");
  }

  if (branchKey === dayBranchKey) {
    notes.push("Supported by day");
  }

  if (branchClashes[branchKey] === monthBranchKey) {
    notes.push("Clashed by month");
  }

  if (branchClashes[branchKey] === dayBranchKey) {
    notes.push("Clashed by day");
  }

  if (voidPair?.branches.includes(branchKey)) {
    notes.push("Day void");
  }

  if (notes.length === 0) {
    notes.push("Neutral");
  }

  let score = 0;

  notes.forEach((note) => {
    if (note.includes("Supported")) score += 1;
    if (note.includes("Active")) score += 1;
    if (note.includes("Clashed")) score -= 1;
    if (note.includes("void")) score -= 2;
  });

  let summary = "Neutral";

  if (score >= 2) summary = "Strong";
  if (score === 1) summary = "Supported";
  if (score === -1) summary = "Weakened";
  if (score <= -2) summary = "Weak / void";

  return {
    notes,
    score,
    summary,
  };
}