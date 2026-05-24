const stableYang = {
  key: "youngYang",
  label: "Young Yang / Stable Yang / 7",
  value: "yang",
  moving: false,
  transformedValue: "yang",
  number: 7,
  description: "Stable yang line. Does not transform.",
};

const stableYin = {
  key: "youngYin",
  label: "Young Yin / Stable Yin / 8",
  value: "yin",
  moving: false,
  transformedValue: "yin",
  number: 8,
  description: "Stable yin line. Does not transform.",
};

const movingYin = {
  key: "oldYin",
  label: "Old Yin / Moving Yin / 6",
  value: "yin",
  moving: true,
  transformedValue: "yang",
  number: 6,
  description: "Changing yin line. Transforms into yang.",
};

const movingYang = {
  key: "oldYang",
  label: "Old Yang / Moving Yang / 9",
  value: "yang",
  moving: true,
  transformedValue: "yin",
  number: 9,
  description: "Changing yang line. Transforms into yin.",
};

export function normalizeLineKey(lineKey) {
  const key = String(lineKey || "").trim();

  const keyMap = {
    // Canonical keys
    oldYin: "oldYin",
    youngYang: "youngYang",
    youngYin: "youngYin",
    oldYang: "oldYang",

    // Original / older app keys
    yin: "youngYin",
    yang: "youngYang",
    yinStatic: "youngYin",
    yangStatic: "youngYang",
    yinMoving: "oldYin",
    yangMoving: "oldYang",
    movingYin: "oldYin",
    movingYang: "oldYang",

    // Alternate keys
    stableYin: "youngYin",
    stableYang: "youngYang",
    changingYin: "oldYin",
    changingYang: "oldYang",

    // Number keys
    6: "oldYin",
    7: "youngYang",
    8: "youngYin",
    9: "oldYang",

    // Dashed keys
    "old-yin": "oldYin",
    "young-yang": "youngYang",
    "young-yin": "youngYin",
    "old-yang": "oldYang",
    "moving-yin": "oldYin",
    "moving-yang": "oldYang",
    "stable-yin": "youngYin",
    "stable-yang": "youngYang",
    "changing-yin": "oldYin",
    "changing-yang": "oldYang",
    "yin-static": "youngYin",
    "yang-static": "youngYang",
    "yin-moving": "oldYin",
    "yang-moving": "oldYang",

    // Title-case keys
    OldYin: "oldYin",
    YoungYang: "youngYang",
    YoungYin: "youngYin",
    OldYang: "oldYang",
    MovingYin: "oldYin",
    MovingYang: "oldYang",
    StableYin: "youngYin",
    StableYang: "youngYang",
    YinStatic: "youngYin",
    YangStatic: "youngYang",
    YinMoving: "oldYin",
    YangMoving: "oldYang",
  };

  return keyMap[key] || "youngYang";
}

const canonicalLineTypes = {
  oldYin: movingYin,
  youngYang: stableYang,
  youngYin: stableYin,
  oldYang: movingYang,
};

const compatibilityLineTypes = {
  // Canonical
  oldYin: movingYin,
  youngYang: stableYang,
  youngYin: stableYin,
  oldYang: movingYang,

  // Older app keys
  yin: stableYin,
  yang: stableYang,
  yinStatic: stableYin,
  yangStatic: stableYang,
  yinMoving: movingYin,
  yangMoving: movingYang,
  movingYin,
  movingYang,

  // Alternate keys
  stableYin,
  stableYang,
  changingYin: movingYin,
  changingYang: movingYang,

  // Number keys
  6: movingYin,
  7: stableYang,
  8: stableYin,
  9: movingYang,

  // Dashed keys
  "old-yin": movingYin,
  "young-yang": stableYang,
  "young-yin": stableYin,
  "old-yang": movingYang,
  "moving-yin": movingYin,
  "moving-yang": movingYang,
  "stable-yin": stableYin,
  "stable-yang": stableYang,
  "changing-yin": movingYin,
  "changing-yang": movingYang,
  "yin-static": stableYin,
  "yang-static": stableYang,
  "yin-moving": movingYin,
  "yang-moving": movingYang,

  // Title-case keys
  OldYin: movingYin,
  YoungYang: stableYang,
  YoungYin: stableYin,
  OldYang: movingYang,
  MovingYin: movingYin,
  MovingYang: movingYang,
  StableYin: stableYin,
  StableYang: stableYang,
  YinStatic: stableYin,
  YangStatic: stableYang,
  YinMoving: movingYin,
  YangMoving: movingYang,
};

export const lineTypes = new Proxy(compatibilityLineTypes, {
  get(target, key) {
    if (key in target) {
      return target[key];
    }

    return stableYang;
  },
});

export const selectableLineTypes = canonicalLineTypes;

export const defaultLines = [
  "youngYang",
  "youngYin",
  "youngYang",
  "youngYin",
  "youngYang",
  "youngYin",
];