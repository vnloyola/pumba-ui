import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addComponent, toKebabCase } from "./add-component.mjs";

let srcDir;

const read = (...path) => readFileSync(join(srcDir, ...path), "utf8");

beforeEach(() => {
  srcDir = mkdtempSync(join(tmpdir(), "pumba-add-component-"));
  mkdirSync(join(srcDir, "styles"));
  writeFileSync(
    join(srcDir, "index.ts"),
    'export { Placeholder, type PlaceholderProps } from "./placeholder/index.js";\n',
  );
  writeFileSync(
    join(srcDir, "styles", "styles.css"),
    '@import url("../placeholder/placeholder.css") layer(pumba.components);\n',
  );
});

afterEach(() => {
  rmSync(srcDir, { recursive: true, force: true });
});

describe("toKebabCase", () => {
  it("splits PascalCase words and acronyms", () => {
    expect(toKebabCase("Button")).toBe("button");
    expect(toKebabCase("ButtonGroup")).toBe("button-group");
    expect(toKebabCase("URLInput")).toBe("url-input");
  });
});

describe("addComponent", () => {
  it("creates the five files with the name filled in", () => {
    addComponent("Example", srcDir);
    expect(readdirSync(join(srcDir, "example")).sort()).toEqual([
      "example.css",
      "example.stories.tsx",
      "example.test.tsx",
      "example.tsx",
      "index.ts",
    ]);
    for (const file of readdirSync(join(srcDir, "example"))) {
      expect(read("example", file)).not.toContain("__");
    }
    expect(read("example", "example.tsx")).toContain("export function Example(");
    expect(read("example", "example.css")).toContain(".pumba-example {");
  });

  it("adds the export in order and the stylesheet import", () => {
    addComponent("Example", srcDir);
    expect(read("index.ts")).toBe(
      [
        'export { Example, type ExampleProps } from "./example/index.js";',
        'export { Placeholder, type PlaceholderProps } from "./placeholder/index.js";',
        "",
      ].join("\n"),
    );
    expect(read("styles", "styles.css")).toContain(
      '@import url("../example/example.css") layer(pumba.components);',
    );
  });

  it("orders a name before the longer names that start with it", () => {
    addComponent("ButtonGroup", srcDir);
    addComponent("Button", srcDir);
    expect(read("index.ts").split("\n").slice(0, 2)).toEqual([
      'export { Button, type ButtonProps } from "./button/index.js";',
      'export { ButtonGroup, type ButtonGroupProps } from "./button-group/index.js";',
    ]);
  });

  it("uses a kebab-case folder and class for multi-word names", () => {
    addComponent("ButtonGroup", srcDir);
    expect(readdirSync(join(srcDir, "button-group"))).toContain("button-group.tsx");
    expect(read("button-group", "button-group.css")).toContain(".pumba-button-group {");
  });

  it("fails when the component exists and changes nothing", () => {
    addComponent("Example", srcDir);
    writeFileSync(join(srcDir, "example", "example.tsx"), "custom work");
    const index = read("index.ts");
    const styles = read("styles", "styles.css");

    expect(() => addComponent("Example", srcDir)).toThrow("src/example already exists");
    expect(read("example", "example.tsx")).toBe("custom work");
    expect(read("index.ts")).toBe(index);
    expect(read("styles", "styles.css")).toBe(styles);
  });

  it("rejects names that are not PascalCase", () => {
    expect(() => addComponent("button", srcDir)).toThrow("not a valid component name");
    expect(() => addComponent("Button Group", srcDir)).toThrow("not a valid component name");
    expect(readdirSync(srcDir).sort()).toEqual(["index.ts", "styles"]);
  });
});
