import { lineTypes } from "../data/lines";
import { kingWenHexagrams, palaceMap, trigrams } from "../data/hexagrams";

export function getTransformedValue(lineKey) {
  const line = lineTypes[lineKey];

  if (!line.moving) return line.value;

  return line.value === "yang" ? "yin" : "yang";
}

export function getTrigramFromValues(values) {
  const key = values.join("_");
  return trigrams[key];
}

export function getHexagramInfo(values) {
  const lowerValues = values.slice(0, 3);
  const upperValues = values.slice(3, 6);

  const lower = getTrigramFromValues(lowerValues);
  const upper = getTrigramFromValues(upperValues);

  const lookupKey = `${upper.key}_${lower.key}`;
  const kingWen = kingWenHexagrams[lookupKey];
  const palace = palaceMap[lower.key];

  return {
    lower,
    upper,
    kingWen,
    palace,
    label: `${upper.name} over ${lower.name}`,
    natureLabel: `${upper.nature} over ${lower.nature}`,
    elementLabel: `Upper ${upper.element}, Lower ${lower.element}`,
  };
}