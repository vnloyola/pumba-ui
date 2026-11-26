import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import { buildFigmaTokens } from "./figma.mjs";

const sd = new StyleDictionary({ source: ["src/**/*.json"] });
await sd.hasInitialized;
const figma = buildFigmaTokens(sd.tokens);

const find = (tree, path) => path.split(".").reduce((node, key) => node?.[key], tree);

const collectTokens = (node, found = []) => {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if ("$value" in child) found.push(child);
    else collectTokens(child, found);
  }
  return found;
};

const allTokens = Object.values(figma).flatMap((collection) => collectTokens(collection));

test("exports a primitives and a semantic collection", () => {
  assert.deepEqual(Object.keys(figma), ["Primitives", "Semantic"]);
});

test("keeps nested primitive and semantic tokens split across files", (t) => {
  const cwd = mkdtempSync(join(tmpdir(), "pumba-figma-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(join(cwd, "src", "primitives"), { recursive: true });
  mkdirSync(join(cwd, "src", "semantic"), { recursive: true });

  for (const [name, value] of [
    ["small", 1],
    ["large", 2],
  ]) {
    writeFileSync(
      join(cwd, "src", "primitives", `${name}.json`),
      JSON.stringify({
        primitive: { space: { inset: { [name]: { $type: "number", $value: value } } } },
      }),
    );
    writeFileSync(
      join(cwd, "src", "semantic", `${name}.json`),
      JSON.stringify({
        space: {
          inset: { [name]: { $type: "number", $value: `{primitive.space.inset.${name}}` } },
        },
      }),
    );
  }

  execFileSync(process.execPath, [fileURLToPath(new URL("../build.mjs", import.meta.url))], {
    cwd,
  });
  const output = JSON.parse(readFileSync(join(cwd, "dist", "figma.json"), "utf8"));

  assert.deepEqual(output.Primitives.space.inset, {
    small: { $type: "number", $value: 1 },
    large: { $type: "number", $value: 2 },
  });
  assert.deepEqual(output.Semantic.space.inset, {
    small: { $type: "number", $value: "{Primitives.space.inset.small}" },
    large: { $type: "number", $value: "{Primitives.space.inset.large}" },
  });
});

test("converts OKLCH primitives to hex", () => {
  const { white, black, neutral } = figma.Primitives.color;
  assert.equal(white.$value, "#ffffff");
  assert.equal(black.$value, "#000000");
  assert.match(neutral["50"].$value, /^#[0-9a-f]{6}$/);
  assert.ok(!JSON.stringify(figma).includes("oklch"));
});

test("converts dimensions to unitless pixels", () => {
  assert.equal(find(figma, "Primitives.space.4").$value, 16);
  assert.equal(find(figma, "Primitives.space.px").$value, 1);
  assert.equal(find(figma, "Primitives.radius.md").$value, 8);
  assert.equal(find(figma, "Primitives.font-size.md").$value, 16);
});

test("keeps light and dark values on semantic colors", () => {
  const { background } = figma.Semantic.color;
  assert.equal(background.$value, "{Primitives.color.neutral.50}");
  assert.deepEqual(background.$extensions.mode, {
    light: "{Primitives.color.neutral.50}",
    dark: "{Primitives.color.neutral.950}",
  });
});

test("leaves out token types Figma variables cannot hold", () => {
  assert.equal(find(figma, "Primitives.shadow"), undefined);
  assert.equal(find(figma, "Primitives.font-family"), undefined);
  assert.equal(find(figma, "Primitives.motion"), undefined);
  assert.equal(find(figma, "Semantic.text"), undefined);
});

test("every reference points to a token that exists", () => {
  const references = allTokens.flatMap((token) =>
    [token.$value, ...Object.values(token.$extensions?.mode ?? {})].filter(
      (value) => typeof value === "string" && value.startsWith("{"),
    ),
  );
  assert.ok(references.length > 0);
  for (const reference of references) {
    assert.ok(find(figma, reference.slice(1, -1)), `${reference} does not resolve`);
  }
});
