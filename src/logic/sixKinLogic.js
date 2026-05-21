import { generatingCycle, controllingCycle } from "../data/cycles";

export function getSixKin(hexagramElement, lineElement) {
  if (lineElement === hexagramElement) return "Sibling-line";

  if (generatingCycle[hexagramElement] === lineElement) {
    return "Offspring-line";
  }

  if (controllingCycle[hexagramElement] === lineElement) {
    return "Asset-line";
  }

  if (controllingCycle[lineElement] === hexagramElement) {
    return "Officer-line";
  }

  if (generatingCycle[lineElement] === hexagramElement) {
    return "Parent-line";
  }

  return "Unknown";
}