# Changesets

A changeset is a small Markdown file that says which packages a PR changes, how their version
moves, and one line for the changelog. `pnpm changeset` writes one; `pnpm version-packages`
turns the pending changesets into new versions and `CHANGELOG.md` entries.

`@pumba-ui/tokens` and `@pumba-ui/ui` share one version number (`fixed` in `config.json`), so
releasing either releases both. `@pumba-ui/storybook` is never versioned.

## When a PR needs a changeset

Add one when a consumer of `@pumba-ui/tokens` or `@pumba-ui/ui` could notice the change: a
component, prop, variant, `data-*` attribute, token, CSS rule, exported type, a bug fix in any
of them, or a change to the published files or dependencies.

Skip it when nothing published changes: stories, tests, Storybook, CI, repo docs, tooling, or a
refactor with identical output.

## Choosing the bump

What counts as breaking is defined in section 8 of
[`docs/api-conventions.md`](../docs/api-conventions.md). While the packages are below `1.0.0`:

| Change | Changeset |
| --- | --- |
| Breaks a consumer (section 8 "Major") | `minor` |
| Anything else: new features and fixes | `patch` |

A `major` changeset would publish `1.0.0`, so it is reserved for the release that declares the
API stable. From `1.0.0` on, the table in section 8 applies as written.

Write the summary for the consumer, in the imperative: "Add the `loading` prop to Button", not
"Updated button.tsx".
