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

## How the package is built

Three tools, one job each:

- **Vite** bundles `src/index.ts` into one readable ESM file (`minify: false`; the consumer's
  bundler minifies). `react`, `react-dom`, `lucide-react` and `@base-ui/react` stay external, so
  the consumer installs each once. `emptyOutDir` is off because `dist/` also holds the types and
  CSS.
- **`tsc`** emits the declarations (`tsconfig.build.json`, which excludes tests and stories).
  Relative imports in `src` carry the `.js` extension so the emitted types resolve under Node's
  ESM rules.
- **`scripts/build-css.mjs`** inlines the CSS `@import`s with `postcss-import`, resolving
  `@pumba-ui/tokens/tokens.css` through the package's `exports` map the way a bundler would.
  The CSS is otherwise left as written, so the layer order statement stays at the top of
  `styles.css` and the files stay readable and unminified.

## Conventions

- `src/icons.ts` is the only file that imports `lucide-react`. Components import icons from it,
  so the icon library can change without touching them.
- Each component's CSS is added to `src/styles/styles.css` with
  `@import url("../<name>/<name>.css") layer(pumba.components);`.
- `reset.css` is optional and separate from `styles.css`. Tailwind users skip it.
- Every Pumba stylesheet starts with the layer order, which lives in `src/styles/layers.css`.
  The names sit under `pumba.*` so they never merge with Tailwind's own `base` and `components`
  layers.
- `src/placeholder` exists only to exercise the pipeline and is deleted when the first real
  component lands.
