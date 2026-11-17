export default {
  branches: ["main"],
  tagFormat: "v${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "feature", release: "minor" },
          { breaking: true, release: "minor" },
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "revert", release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "Features" },
            { type: "feature", section: "Features" },
            { type: "fix", section: "Bug fixes" },
            { type: "perf", section: "Performance" },
            { type: "revert", section: "Reverts" },
          ],
        },
      },
    ],
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          'pnpm --filter "./packages/*" exec npm pkg set version=${nextRelease.version} && pnpm build',
        publishCmd: 'pnpm --filter "./packages/*" publish --provenance --no-git-checks',
      },
    ],
    [
      "@semantic-release/github",
      { successComment: false, failComment: false, failTitle: false, releasedLabels: false },
    ],
  ],
};
