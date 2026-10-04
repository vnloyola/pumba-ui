import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const readFiles = (dir) =>
  readdirSync(dir).map((file) => JSON.parse(readFileSync(`${dir}/${file}`, "utf8")));

const readTokens = (dir) => Object.assign({}, ...readFiles(dir));

// Every primitive file has the same `primitive` root, so merge the groups inside it.
const primitive = Object.assign({}, ...readFiles("src/primitives").map((file) => file.primitive));
const { color: semanticColors } = readTokens("src/semantic");

const lookup = (reference) =>
  reference
    .slice(1, -1)
    .split(".")
    .reduce((node, key) => node[key], { primitive }).$value;

// OKLCH -> linear sRGB (https://bottosson.github.io/posts/oklab/), clipped to the gamut.
const toLinearRgb = (oklch) => {
  const [lightness, chroma, hue] = oklch
    .match(/oklch\(([^)]+)\)/)[1]
    .split(" ")
    .map(Number);
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.min(1, Math.max(0, channel)));
};

const luminance = (oklch) => {
  const [r, g, b] = toLinearRgb(oklch);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (first, second) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

const colorOf = (token, mode) => lookup(semanticColors[token].$extensions.mode[mode]);

// [foreground, background, minimum ratio]. WCAG AA: 4.5 for text, 3 for UI components.
const TEXT = 4.5;
const UI = 3;
const pairs = [
  ["text", "background", TEXT],
  ["text", "surface", TEXT],
  ["text", "surface-raised", TEXT],
  ["text-secondary", "background", TEXT],
  ["text-secondary", "surface", TEXT],
  ["accent-text", "accent", TEXT],
  ["accent-text", "accent-hover", TEXT],
  ["accent-text", "accent-pressed", TEXT],
  ["accent", "background", UI],
  ["accent", "surface", UI],
  ["focus", "background", UI],
  ["focus", "surface", UI],
  ["border-strong", "background", UI],
  ["border-strong", "surface", UI],
  ...["success", "error", "warning"].flatMap((state) => [
    [`${state}-text`, "background", TEXT],
    [`${state}-text`, "surface", TEXT],
    [`${state}-text`, `${state}-subtle`, TEXT],
    [state, "background", UI],
    [state, "surface", UI],
  ]),
];

for (const mode of ["light", "dark"]) {
  for (const [foreground, background, minimum] of pairs) {
    test(`${mode}: ${foreground} on ${background} is at least ${minimum}:1`, () => {
      const ratio = contrast(colorOf(foreground, mode), colorOf(background, mode));
      assert.ok(ratio >= minimum, `${foreground} on ${background} is ${ratio.toFixed(2)}:1`);
    });
  }
}

test("every semantic color defines a light and a dark value", () => {
  for (const [name, token] of Object.entries(semanticColors)) {
    if (name.startsWith("$")) continue;
    assert.ok(token.$extensions?.mode?.light, `${name} has no light value`);
    assert.ok(token.$extensions?.mode?.dark, `${name} has no dark value`);
  }
});
