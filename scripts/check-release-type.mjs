import { execFileSync } from "node:child_process";

const [base = "origin/dev"] = process.argv.slice(2);
const { PR_TITLE: title = "", SKIP: skip } = process.env;

const published = /^packages\/(tokens|ui)\/(src\/|USAGE\.md$)/;
const notPublished = /\.(test|stories)\.[a-z]+$/;
const releasing = /^((feat|fix|perf|revert)(\([^)]*\))?!?|[a-z]+(\([^)]*\))?!):/;

const changed = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" })
  .split("\n")
  .filter((file) => published.test(file) && !notPublished.test(file));

if (changed.length === 0 || releasing.test(title)) process.exit(0);

if (skip === "true") {
  console.log("The no-release label skips this check.");
  process.exit(0);
}

console.error(`"${title}" does not publish a release, but the PR changes published files:`);
for (const file of changed) console.error(`  ${file}`);
console.error(
  "Use feat, fix, perf or revert (or mark a breaking change with !), or add the no-release label.",
);
process.exit(1);
