export const earthlyBranches = [
  { key: "zi", label: "Zi 子", element: "Water" },
  { key: "chou", label: "Chou 丑", element: "Earth" },
  { key: "yin", label: "Yin 寅", element: "Wood" },
  { key: "mao", label: "Mao 卯", element: "Wood" },
  { key: "chen", label: "Chen 辰", element: "Earth" },
  { key: "si", label: "Si 巳", element: "Fire" },
  { key: "wu", label: "Wu 午", element: "Fire" },
  { key: "wei", label: "Wei 未", element: "Earth" },
  { key: "shen", label: "Shen 申", element: "Metal" },
  { key: "you", label: "You 酉", element: "Metal" },
  { key: "xu", label: "Xu 戌", element: "Earth" },
  { key: "hai", label: "Hai 亥", element: "Water" },
];

export const defaultLineBranches = ["zi", "chou", "yin", "mao", "shen", "wei"];

export const branchClashes = {
  zi: "wu",
  wu: "zi",
  chou: "wei",
  wei: "chou",
  yin: "shen",
  shen: "yin",
  mao: "you",
  you: "mao",
  chen: "xu",
  xu: "chen",
  si: "hai",
  hai: "si",
};

export const voidPairs = [
  { key: "xu-hai", label: "Xu-Hai 戌亥", branches: ["xu", "hai"] },
  { key: "shen-you", label: "Shen-You 申酉", branches: ["shen", "you"] },
  { key: "wu-wei", label: "Wu-Wei 午未", branches: ["wu", "wei"] },
  { key: "chen-si", label: "Chen-Si 辰巳", branches: ["chen", "si"] },
  { key: "yin-mao", label: "Yin-Mao 寅卯", branches: ["yin", "mao"] },
  { key: "zi-chou", label: "Zi-Chou 子丑", branches: ["zi", "chou"] },
];

export function getBranch(branchKey) {
  return earthlyBranches.find((branch) => branch.key === branchKey);
}

export function getVoidPair(voidKey) {
  return voidPairs.find((pair) => pair.key === voidKey);
}