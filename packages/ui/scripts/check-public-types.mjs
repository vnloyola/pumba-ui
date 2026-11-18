import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const leaks = readdirSync("dist", { recursive: true })
  .filter((file) => file.endsWith(".d.ts"))
  .filter((file) => readFileSync(join("dist", file), "utf8").includes("@base-ui/"));

if (leaks.length > 0) {
  console.error("Base UI types appear in the public type declarations:");
  for (const file of leaks) console.error(`  dist/${file}`);
  console.error("Type the public signature with React types instead (docs/api-conventions.md, 7).");
  process.exit(1);
}
