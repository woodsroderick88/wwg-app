function clean(value) {
  return String(value || "").trim();
}

function mergeText(existingValue, newValue) {
  const existing = clean(existingValue);
  const incoming = clean(newValue);

  if (!existing) {
    return incoming;
  }

  if (!incoming) {
    return existing;
  }

  if (existing.toLowerCase().includes(incoming.toLowerCase())) {
    return existing;
  }

  return `${existing}\n${incoming}`;
}

export const setupAutofillPresets = [
  {
    id: "app-money",
    label: "App money setup",
    description: "Best for questions about whether this app will make money.",
    selfRole: "Me, my app, and my business effort",
    objectRole: "App revenue, paying users, and monetization",
    knownFacts:
      "The app is built and deployed. The product is still being improved. Monetization and user demand still need to be tested.",
    assumptions:
      "People may be willing to pay if the app solves a real problem clearly enough.",
    location: "Chicago, Central Time",
  },
  {
    id: "career-income",
    label: "Career / income setup",
    description: "Best for job, client, promotion, or income questions.",
    selfRole: "Me and my career path",
    objectRole: "The job, client, income opportunity, or professional outcome",
    knownFacts:
      "The question concerns work, income, opportunity, or career direction. The final result depends on timing, effort, and outside response.",
    assumptions:
      "The opportunity may improve if follow-up, positioning, and practical action are strong.",
    location: "Chicago, Central Time",
  },
  {
    id: "relationship",
    label: "Relationship setup",
    description: "Best for relationship direction or interaction questions.",
    selfRole: "Me and my side of the relationship",
    objectRole: "The other person and the relationship dynamic",
    knownFacts:
      "The question concerns the relationship pattern, communication, and current interaction.",
    assumptions:
      "The situation may change depending on communication, timing, and each person’s willingness.",
    location: "Chicago, Central Time",
  },
  {
    id: "timing",
    label: "Timing setup",
    description: "Best for when something may happen.",
    selfRole: "Me and my position in the timing question",
    objectRole: "The event, outcome, message, approval, or trigger being timed",
    knownFacts:
      "The question concerns timing. Real-world triggers, deadlines, messages, approvals, or movement should be tracked.",
    assumptions:
      "The event may depend on an external trigger, moving condition, or calendar activation.",
    location: "Chicago, Central Time",
  },
];

export function getSetupAutofillPreset(presetId) {
  return setupAutofillPresets.find((preset) => preset.id === presetId) || null;
}

export function buildSetupAutofillPatch({
  presetId,
  currentState = {},
  detectedTimeframe = "",
}) {
  const preset = getSetupAutofillPreset(presetId);

  if (!preset) {
    return {
      ok: false,
      message: "Autofill preset not found.",
      patch: {},
    };
  }

  const patch = {
    selfRole: clean(currentState.selfRole) || preset.selfRole,
    objectRole: clean(currentState.objectRole) || preset.objectRole,
    knownFacts: mergeText(currentState.knownFacts, preset.knownFacts),
    assumptions: mergeText(currentState.assumptions, preset.assumptions),
    location: clean(currentState.location) || preset.location,
    timeframe: clean(currentState.timeframe) || clean(detectedTimeframe),
  };

  return {
    ok: true,
    message: `${preset.label} applied.`,
    patch,
  };
}

export function buildQuickKnownFact(value) {
  return mergeText(
    value,
    "The app is built and deployed. Current work is focused on improving the product, reducing friction, and testing monetization."
  );
}

export function buildQuickAppMoneyObject(value) {
  return clean(value) || "App revenue, paying users, and monetization";
}

export function buildQuickSelfBusiness(value) {
  return clean(value) || "Me, my app, and my business effort";
}

export function buildQuickChicagoLocation(value) {
  return clean(value) || "Chicago, Central Time";
}