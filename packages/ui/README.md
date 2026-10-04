# @pumba-ui/ui

Accessible React components for the Pumba design system.

## Install

```bash
pnpm add @pumba-ui/ui
```

`react` and `react-dom` (19 or later) are peer dependencies: your app provides them, so there
is only one copy of React.

## Styles

Import the stylesheet once, in your app's entry CSS or JS:

```css
@import "@pumba-ui/ui/styles.css";
```

It contains the tokens (`--pumba-*`), a minimal base and every component's styles. The reset is
**not** included.

### Layers

Pumba's CSS lives in layers under the `pumba.*` namespace, declared in this order:

```css
@layer pumba.reset, pumba.tokens, pumba.base, pumba.components;
```

`styles.css` starts with that statement. Your CSS outside any layer always wins over Pumba
without raising specificity.

### Without Tailwind

Nothing else is needed. To also use Pumba's reset, import it first:

```css
@import "@pumba-ui/ui/reset.css";
@import "@pumba-ui/ui/styles.css";
```

### With Tailwind v4

Declare the layer order **once, before any import**, with `pumba` between `components` and
`utilities`. Do not import `reset.css`: Tailwind's preflight already does that job.

```css
@layer theme, base, components, pumba, utilities;
@import "tailwindcss";
@import "@pumba-ui/ui/styles.css";
```

Tailwind utilities then win over Pumba, and Pumba wins over Tailwind's `base`. Without the
order statement the result depends on import order and one of the two stops working. See
section 13 of `docs/api-conventions.md` for the cases tested.

## Theme

Colors follow the OS (`prefers-color-scheme`). Set `data-theme="light"` or `data-theme="dark"`
on `<html>`, or on any element to theme only its subtree.

## Development

```bash
pnpm --filter @pumba-ui/ui build           # dist/: index.js, .d.ts, styles.css, reset.css
pnpm --filter @pumba-ui/ui check:package   # publint and arethetypeswrong
```

The build uses three tools: Vite bundles the JavaScript, `tsc` emits the types, and
`scripts/build-css.mjs` inlines the CSS imports. Relative imports in `src` carry the `.js`
extension so the emitted types resolve under Node's ESM rules.
