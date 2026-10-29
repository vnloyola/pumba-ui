import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(scriptsDir, "templates");
const defaultSrcDir = join(scriptsDir, "..", "src");

const FILES = [
  ["component.tsx.tpl", "__name__.tsx"],
  ["component.css.tpl", "__name__.css"],
  ["component.stories.tsx.tpl", "__name__.stories.tsx"],
  ["component.test.tsx.tpl", "__name__.test.tsx"],
  ["index.ts.tpl", "index.ts"],
];

export const toKebabCase = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

const appendLine = (file, line) => {
  const content = readFileSync(file, "utf8");
  if (content.split("\n").includes(line)) return;
  writeFileSync(file, `${content.endsWith("\n") ? content : `${content}\n`}${line}\n`);
};

const insertSortedExport = (file, line) => {
  const lines = readFileSync(file, "utf8").split("\n").filter(Boolean);
  if (lines.includes(line)) return;
  const segments = (text) => text.slice(text.indexOf("from")).split("/");
  const compare = (a, b) => {
    const [first, second] = [segments(a), segments(b)];
    for (let index = 0; index < Math.min(first.length, second.length); index++) {
      if (first[index] !== second[index]) return first[index] < second[index] ? -1 : 1;
    }
    return first.length - second.length;
  };
  lines.push(line);
  lines.sort(compare);
  writeFileSync(file, `${lines.join("\n")}\n`);
};

export function addComponent(name, srcDir = defaultSrcDir) {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(
      `"${name}" is not a valid component name. Use PascalCase, for example Button or ButtonGroup.`,
    );
  }
  const kebab = toKebabCase(name);
  const directory = join(srcDir, kebab);
  if (existsSync(directory)) {
    throw new Error(`src/${kebab} already exists. Nothing was changed.`);
  }

  const fill = (text) => text.replaceAll("__Name__", name).replaceAll("__name__", kebab);
  mkdirSync(directory, { recursive: true });
  const created = FILES.map(([template, target]) => {
    const file = join(directory, fill(target));
    writeFileSync(file, fill(readFileSync(join(templatesDir, template), "utf8")));
    return file;
  });

  insertSortedExport(
    join(srcDir, "index.ts"),
    `export { ${name}, type ${name}Props } from "./${kebab}/index.js";`,
  );
  appendLine(
    join(srcDir, "styles", "styles.css"),
    `@import url("../${kebab}/${kebab}.css") layer(pumba.components);`,
  );
  return { directory, created };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [name] = process.argv.slice(2);
  try {
    if (!name) {
      throw new Error("Usage: pnpm add:component <Name>, for example pnpm add:component Button");
    }
    const { created } = addComponent(name);
    console.log(`Created ${name}:\n${created.map((file) => `  ${file}`).join("\n")}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
