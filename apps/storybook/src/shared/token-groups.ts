import { primitives, tokens } from "@pumba-ui/tokens";

export type TokenEntry = {
  name: string;
  variable: string;
  label: string;
};

const PRIMITIVE_PREFIX = "pumba-primitive-";
const SEMANTIC_PREFIX = "pumba-";

const toEntries = (names: string[], prefix: string): TokenEntry[] =>
  names.map((name) => ({ name, variable: `--${name}`, label: name.slice(prefix.length) }));

const primitiveEntries = toEntries(Object.keys(primitives), PRIMITIVE_PREFIX);
const semanticEntries = toEntries(Object.keys(tokens), SEMANTIC_PREFIX);

export const semantic = (group: string): TokenEntry[] =>
  semanticEntries.filter((entry) => entry.label.startsWith(`${group}-`));

export const primitive = (group: string): TokenEntry[] =>
  primitiveEntries.filter((entry) => entry.label.startsWith(`${group}-`));

export const colorScales = (): Record<string, TokenEntry[]> => {
  const scales: Record<string, TokenEntry[]> = {};
  for (const entry of primitive("color")) {
    const [, scale = "base"] = entry.label.split("-");
    const isStep = /-\d+$/.test(entry.label);
    const key = isStep ? scale : "base";
    scales[key] = [...(scales[key] ?? []), entry];
  }
  return scales;
};

export const textStyles = (): string[] => {
  const names = semantic("text").map((entry) => entry.label.split("-")[1] ?? "");
  return [...new Set(names)];
};
