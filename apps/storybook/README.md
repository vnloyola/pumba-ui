# @pumba-ui/storybook

Storybook for developing Pumba components in isolation, and the living documentation of the
tokens.

```bash
pnpm storybook         # dev server on http://localhost:6006
pnpm build-storybook   # static site in apps/storybook/storybook-static
```

Both root scripts build `@pumba-ui/tokens` and `@pumba-ui/ui` first, because Storybook consumes
them from their `dist/` like any other app would, so it exercises the real package exports.

## Setup

- **Framework:** `@storybook/react-vite`, with the a11y and docs addons. `tags: ["autodocs"]`
  in `.storybook/preview.tsx` gives every stories file a Docs page.
- **Styles:** `preview.tsx` imports `@pumba-ui/ui/styles.css`, and `preview.css` paints the body
  with the semantic tokens so the whole canvas follows the theme.
- **Theme toolbar:** the `theme` global (System, Light, Dark) sets or removes `data-theme` on the
  iframe's `<html>`. System removes the attribute, so the page follows the OS.
- **Stories:** `stories/` for Storybook's own pages and `packages/ui/src/**/*.stories.tsx` for
  component stories, which live next to each component.

## Import alias

Files in `src/` and `stories/` import each other with `@/`, which points to `src/`, instead of
`../` paths: `import { semantic } from "@/shared/token-groups.js"`. It is declared twice because
two tools resolve it: `paths` in `tsconfig.json` for the type checker, and `viteFinal` in
`.storybook/main.ts` for Vite. Imports inside the same folder stay relative (`./swatch.js`).

## Tokens pages

`Foundations / Tokens` has one story per group: Colors, Space, Radius, Shadow, Typography and
Motion. Nothing is hardcoded: the names come from the `primitives` and `tokens` maps exported by
`@pumba-ui/tokens`, and the values are the live CSS variables, so a new token shows up after the
next build.

- Swatches read the computed color and refresh when `data-theme` changes or the OS theme changes.
- Typography shows each `--pumba-text-<style>-*` set applied to a sample sentence.
- Motion plays every duration with every easing on a track.

## Not included yet

- The Vitest addon, planned for when the first component arrives.
