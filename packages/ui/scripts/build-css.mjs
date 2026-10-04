import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import postcss from "postcss";
import postcssImport from "postcss-import";

const resolveImport = (id, basedir) =>
  id.startsWith(".") ? resolve(basedir, id) : createRequire(resolve(basedir, "_")).resolve(id);

mkdirSync("dist", { recursive: true });

for (const name of ["styles", "reset"]) {
  const from = `src/styles/${name}.css`;
  const { css } = await postcss([postcssImport({ resolve: resolveImport })]).process(
    readFileSync(from, "utf8"),
    { from },
  );
  writeFileSync(`dist/${name}.css`, css);
}
