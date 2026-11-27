import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const readFiles = (dir) =>
  readdirSync(dir).map((file) => JSON.parse(readFileSync(`${dir}/${file}`, "utf8")));

const primitive = Object.assign({}, ...readFiles("src/primitives").map((file) => file.primitive));
const semantic = Object.assign({}, ...readFiles("src/semantic"));

const steps = Object.keys(primitive.radius);
const step = (reference) => steps.indexOf(reference.match(/\{primitive\.radius\.(\w+)\}/)[1]);

test("a surface radius is the step above the control radius", () => {
  assert.equal(step(semantic.radius.surface.$value), step(semantic.radius.control.$value) + 1);
});
