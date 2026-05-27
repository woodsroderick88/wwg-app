export const methods = [
  {
    id: "GLDM",
    name: "Gain & Loss Method",
    description:
      "Used for questions about money, resources, profit, benefit, opportunity, cost, gain, loss, or whether something brings value.",
  },
  {
    id: "TDM",
    name: "Time Method",
    description:
      "Used for questions about when something may happen, timing windows, delays, activation, waiting periods, or event movement.",
  },
  {
    id: "RIDM",
    name: "Relationship & Development Method",
    description:
      "Used for relationship, connection, interaction, development, response, contact, or external-object questions.",
  },
  {
    id: "CDM",
    name: "Competition Method",
    description:
      "Used for competition, conflict, comparison, opponent, side-versus-side, or win/loss questions.",
  },
  {
    id: "ADM",
    name: "Auspiciousness Method",
    description:
      "Used for approval, safety, support, protection, documents, housing, health, stability, legal standing, or general auspiciousness questions.",
  },
];

export const methodFocusMap = {
  GLDM: "Asset-line",
  TDM: "Moving line",
  RIDM: "Object-line",
  CDM: "Opponent-line",
  ADM: "Parent-line",
};