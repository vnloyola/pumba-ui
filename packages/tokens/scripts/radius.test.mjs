import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const readFiles = (dir) =>
  readdirSync(dir).map((file) => JSON.parse(readFileSync(`${dir}/${file}`, "utf8")));

const primitive = Object.assign({}, ...readFiles("src/primitives").map((file) => file.primitive));
const semantic = Object.assign({}, ...readFiles("src/semantic"));

const lookup = (reference) =>
  reference
    .slice(1, -1)
    .split(".")
    .reduce((node, key) => node[key], { primitive }).$value;

const rem = (value) => Number.parseFloat(value);

test("a surface radius is the control radius plus the inset", () => {
  const control = rem(lookup(semantic.radius.control.$value));
  const surface = rem(lookup(semantic.radius.surface.$value));
  const inset = rem(lookup(semantic.space.inset.$value));
  assert.equal(surface, control + inset);
});
