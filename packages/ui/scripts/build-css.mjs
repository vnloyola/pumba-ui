import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import postcss from "postcss";
import postcssImport from "postcss-import";

// Resolves `@import "@pumba-ui/tokens/tokens.css"` through the package's `exports` map, the
// same way a bundler would. Relative imports resolve against the importing file.
const resolveImport = (id, basedir) =>
  id.startsWith(".") ? resolve(basedir, id) : createRequire(resolve(basedir, "_")).resolve(id);

mkdirSync("dist", { recursive: true });

// postcss-import inlines every @import and keeps the rest of the CSS exactly as written, so
// the published files stay readable and the layer order statement stays at the top. The
// consumer's bundler minifies them.
for (const name of ["styles", "reset"]) {
  const from = `src/styles/${name}.css`;
  const { css } = await postcss([postcssImport({ resolve: resolveImport })]).process(
    readFileSync(from, "utf8"),
    { from },
  );
  writeFileSync(`dist/${name}.css`, css);
}
