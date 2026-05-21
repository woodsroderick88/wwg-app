export const methods = [
  {
    id: "GLDM",
    name: "Gain & Loss Method",
    description:
      "For profit, money, job, contract, recovery, benefit, or loss questions.",
    keywords: [
      "profit",
      "money",
      "income",
      "job",
      "paid",
      "contract",
      "gain",
      "loss",
      "benefit",
      "recover",
    ],
  },
  {
    id: "TDM",
    name: "Time Method",
    description: "For questions about when something will happen.",
    keywords: [
      "when",
      "time",
      "date",
      "month",
      "year",
      "soon",
      "delay",
      "happen",
    ],
  },
  {
    id: "RIDM",
    name: "Relationship & Development Method",
    description:
      "For romance, partnership, cooperation, support, or relationship development.",
    keywords: [
      "relationship",
      "partner",
      "love",
      "marriage",
      "cooperate",
      "support",
      "develop",
      "client",
    ],
  },
  {
    id: "CDM",
    name: "Competition Method",
    description:
      "For contests, rivalry, lawsuits, selections, or side-versus-side questions.",
    keywords: [
      "win",
      "beat",
      "lawsuit",
      "compete",
      "competition",
      "selected",
      "chosen",
      "versus",
      "vs",
    ],
  },
  {
    id: "ADM",
    name: "Auspiciousness Method",
    description:
      "For whether something is favorable, safe, suitable, or worth doing.",
    keywords: [
      "good",
      "bad",
      "favorable",
      "safe",
      "suitable",
      "worth",
      "auspicious",
      "should",
    ],
  },
];

export const methodFocusMap = {
  GLDM: "Asset-line",
  TDM: "Moving line",
  RIDM: "Object-line",
  CDM: "Sibling-line",
  ADM: "Parent-line",
};