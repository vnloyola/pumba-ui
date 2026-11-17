import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { toLinearRgb } from "./oklch.mjs";

const readFiles = (dir) =>
  readdirSync(dir).map((file) => JSON.parse(readFileSync(`${dir}/${file}`, "utf8")));

const readTokens = (dir) => Object.assign({}, ...readFiles(dir));

const primitive = Object.assign({}, ...readFiles("src/primitives").map((file) => file.primitive));
const { color: semanticColors } = readTokens("src/semantic");

const lookup = (reference) =>
  reference
    .slice(1, -1)
    .split(".")
    .reduce((node, key) => node[key], { primitive }).$value;

const luminance = (oklch) => {
  const [r, g, b] = toLinearRgb(oklch);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (first, second) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

const colorOf = (token, mode) => lookup(semanticColors[token].$extensions.mode[mode]);

const TEXT = 4.5;
const UI = 3;
const pairs = [
  ["text", "background", TEXT],
  ["text", "surface", TEXT],
  ["text", "surface-raised", TEXT],
  ["text-secondary", "background", TEXT],
  ["text-secondary", "surface", TEXT],
  ["text", "accent-subtle", TEXT],
  ["text", "field", TEXT],
  ["text", "field-hover", TEXT],
  ["text-secondary", "field", TEXT],
  ["text-secondary", "field-hover", TEXT],
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
