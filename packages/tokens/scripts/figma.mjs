import { readdirSync, readFileSync } from "node:fs";
import { toHex } from "./oklch.mjs";

const PRIMITIVES = "Primitives";
const SEMANTIC = "Semantic";
const REM_IN_PX = 16;
const SUPPORTED_TYPES = new Set(["color", "dimension", "number", "fontWeight"]);

const readFiles = (dir) =>
  readdirSync(dir).map((file) => JSON.parse(readFileSync(`${dir}/${file}`, "utf8")));

const round = (value) => Math.round(value * 1000) / 1000;

const convertDimension = (value) => {
  const [, amount, unit] = value.match(/^(-?[\d.]+)(rem|px|em)?$/);
  if (unit === "rem") return round(Number(amount) * REM_IN_PX);
  if (unit === "em") return round(Number(amount) * 100);
  return Number(amount);
};

const toReference = (value) => value.replace(/\{primitive\./g, `{${PRIMITIVES}.`);

const convertValue = (type, value) => {
  if (typeof value === "string" && value.startsWith("{")) return toReference(value);
  if (type === "color") return toHex(value);
  if (type === "dimension") return convertDimension(value);
  return value;
};

const convertToken = (token) => {
  const { $type, $value, $description, $extensions } = token;
  const converted = {
    $type: $type === "color" ? "color" : "number",
    $value: convertValue($type, $extensions?.mode?.light ?? $value),
  };
  if ($description) converted.$description = $description;
  if ($extensions?.mode) {
    converted.$extensions = {
      mode: Object.fromEntries(
        Object.entries($extensions.mode).map(([mode, value]) => [mode, convertValue($type, value)]),
      ),
    };
  }
  return converted;
};

const convertTree = (node) =>
  Object.fromEntries(
    Object.entries(node).flatMap(([key, child]) => {
      if (key.startsWith("$")) return [];
      if ("$value" in child) {
        return SUPPORTED_TYPES.has(child.$type) ? [[key, convertToken(child)]] : [];
      }
      const subtree = convertTree(child);
      return Object.keys(subtree).length > 0 ? [[key, subtree]] : [];
    }),
  );

export const buildFigmaTokens = (sourceDir = "src") => {
  const primitives = Object.assign(
    {},
    ...readFiles(`${sourceDir}/primitives`).map((file) => file.primitive),
  );
  const semantic = Object.assign({}, ...readFiles(`${sourceDir}/semantic`));
  return {
    [PRIMITIVES]: convertTree(primitives),
    [SEMANTIC]: convertTree(semantic),
  };
};
