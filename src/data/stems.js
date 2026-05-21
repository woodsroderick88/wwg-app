export const heavenlyStems = [
  { key: "jia", label: "Jia 甲", element: "Wood", polarity: "Yang" },
  { key: "yi", label: "Yi 乙", element: "Wood", polarity: "Yin" },
  { key: "bing", label: "Bing 丙", element: "Fire", polarity: "Yang" },
  { key: "ding", label: "Ding 丁", element: "Fire", polarity: "Yin" },
  { key: "wu", label: "Wu 戊", element: "Earth", polarity: "Yang" },
  { key: "ji", label: "Ji 己", element: "Earth", polarity: "Yin" },
  { key: "geng", label: "Geng 庚", element: "Metal", polarity: "Yang" },
  { key: "xin", label: "Xin 辛", element: "Metal", polarity: "Yin" },
  { key: "ren", label: "Ren 壬", element: "Water", polarity: "Yang" },
  { key: "gui", label: "Gui 癸", element: "Water", polarity: "Yin" },
];

export function getStem(stemKey) {
  return heavenlyStems.find((stem) => stem.key === stemKey);
}