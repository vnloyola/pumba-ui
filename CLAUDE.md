# Pumba

Pumba is a design system: accessible React components, design tokens and light/dark themes,
published as `@pumba-ui/*` packages. The guiding principle is to add only what a consumer needs:
no component, prop, token or option without a real use for it.

## Layout

| Path | What it is |
| --- | --- |
| `packages/tokens` | DTCG JSON compiled by Style Dictionary to CSS variables and TS names |
| `packages/ui` | The component library: Vite (JS), `tsc` (types), `postcss-import` (CSS) |
| `apps/storybook` | Isolated development and the generated token pages |
| `docs/api-conventions.md` | The public API contract. Source of truth for every component |

`ui` and `storybook` consume `tokens` from its `dist/`, so `tokens` builds first.

## Commands

Run from the repo root. Node 22 (`.nvmrc`), pnpm (version in `packageManager`).

```bash
pnpm install
pnpm storybook                          # builds tokens and ui, then serves on :6006
pnpm build                              # every package, in dependency order
pnpm lint                               # Biome (JS/TS) and Stylelint (CSS)
pnpm typecheck                          # needs `pnpm build` first
pnpm test
pnpm check:package                      # publint and arethetypeswrong
pnpm build-storybook
pnpm --filter @pumba-ui/ui build        # one package
```

Done means `pnpm lint && pnpm typecheck && pnpm test` pass, plus `pnpm build` when you touched
`tokens`, `ui` or `storybook`. CI runs lint, typecheck, build, check:package, build-storybook and
test on every PR.

## Components

Follow `docs/api-conventions.md`; do not restate it here. When a decision is missing there, ask
before deciding, then record it in that file. Quick reminders:

- Props are flat and extend the native element's props. `className` is appended, never replaced.
- Variants are string unions reflected as `data-variant` and `data-size`; the default value is
  always written to the attribute.
- Every component that renders its own element accepts `render`.
- A component folder holds `<name>.tsx`, `<name>.css`, `<name>.stories.tsx`, `<name>.test.tsx`
  and `index.ts`, in kebab-case.
- Relative imports inside `packages/ui/src` carry the `.js` extension.

## CSS and tokens

- Layers are `pumba.reset, pumba.tokens, pumba.base, pumba.components`. Never declare a layer
  named `base`, `components` or `utilities`.
- Tokens use the `--pumba-` prefix. Primitives are `--pumba-primitive-*`; semantic tokens are
  `--pumba-*`.
- Components use semantic tokens only, never primitives.
- Component CSS depends on `.pumba-*` classes, `data-*` attributes and `--pumba-*` tokens, never
  on React.
- Add a component's CSS to `packages/ui/src/styles/styles.css` with `layer(pumba.components)`.
- Renaming or removing a token is a major change; adding one is minor (section 8 of the docs).
- Text and background token pairs must keep WCAG AA contrast; `pnpm test` checks it.

## Git

- Default branch is `main`. Work goes `feature branch -> dev` (squash and merge), then
  `dev -> main` (merge commit). Never rebase-merge.
- Branch names: `feature/`, `fix/`, `chore/`, `docs/`, `a11y/` followed by a short kebab-case
  description.
- PR title is `type: description`: type is `feature`, `chore`, `docs`, `a11y` or `fix`, the
  description is lowercase and imperative, with no card id.
- Open PRs with `/open-pr <card id or none>`. The body follows `.github/pull_request_template.md`
  and states only what was actually run.
- Commit messages follow the same `type: description` format.

## Working rules

- Do not commit unless asked. Leave changes in the working tree.
- Do not push unless asked. The default is that the user pushes, and Claude opens the PR.
- Language: the repo (code, docs, commits, PRs) is in English; chat and Linear are in Spanish.
- No comments in code except `NOTE:` and `TODO:`. Technical rationale goes in a README or in
  `docs/`, not in the source.
- Do not create docs or READMEs unless asked.
- Before finishing, scan the diff for comment lines and for work outside the card's scope.
- Say plainly what was and was not verified; do not describe untested things as done.

## Do not

- Expose Base UI types in a public signature.
- Import `lucide-react` anywhere except `packages/ui/src/icons.ts`.
- Add a component, token or prop that no consumer needs yet.
- Reference a primitive token from a component.
- Copy `docs/api-conventions.md` into other files; link to it.
- Hardcode a dependency version that belongs in the pnpm catalog (`pnpm-workspace.yaml`).
- Edit generated output in `dist/` or `storybook-static/`.
