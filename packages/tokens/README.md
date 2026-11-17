# @pumba-ui/tokens

Design tokens for Pumba: colors, spacing, radii, typography, shadows and motion, as CSS variables
with light and dark values.

`@pumba-ui/ui` already includes these tokens in its `styles.css`. Install this package on its own
when you want the tokens without the components, or the token names in TypeScript.

## Install

```bash
pnpm add @pumba-ui/tokens
```

## Use

Import the CSS once. Every token is a `--pumba-*` variable inside `@layer pumba.tokens`:

```css
@import "@pumba-ui/tokens/tokens.css";

.card {
  background: var(--pumba-color-surface);
  color: var(--pumba-color-text);
  border-radius: var(--pumba-radius-surface);
}
```

Colors follow the OS (`prefers-color-scheme`). Set `data-theme="light"` or `data-theme="dark"`
on `<html>`, or on any element to theme only its subtree.

In TypeScript, `tokens` maps each token name to its `var(--name)` string, typed with `TokenName`:

```ts
import { tokens } from "@pumba-ui/tokens";

element.style.color = tokens["pumba-color-text"];
```

`primitives` and `PrimitiveTokenName` do the same for the raw palette, which components and your
own code should not use directly. The names and the reasoning behind them are in section 16 of
[`docs/api-conventions.md`](https://github.com/vnloyola/pumba-ui/blob/main/docs/api-conventions.md).

## For maintainers

The source of truth is DTCG JSON in `src/`; `build.mjs` compiles it with Style Dictionary to CSS
variables and TypeScript names. It also writes `dist/figma.json` for the Figma import, which is
not published.

```bash
pnpm --filter @pumba-ui/tokens build   # dist/tokens.css, dist/index.js, dist/index.d.ts, dist/figma.json
pnpm --filter @pumba-ui/tokens test    # WCAG AA contrast of every text/background pair
```

### Source layout

| Folder | Root key | Output names |
| --- | --- | --- |
| `src/primitives/` | `primitive` | `--pumba-primitive-<path>` |
| `src/semantic/` | none | `--pumba-<path>` |

Primitives are raw values. Components must not use them. Semantic tokens are what components
and consumers use; see section 16 of `docs/api-conventions.md` for the names and the rationale.

### How the build works

- **References stay references.** A semantic token never copies a primitive's value: the
  `{primitive.color.neutral.50}` reference becomes `var(--pumba-primitive-color-neutral-50)`, so
  the primitive remains the single source of truth.
- **Modes.** A token with a `$extensions.mode` entry (`light` and `dark`) becomes
  `light-dark(<light>, <dark>)`. The `$value` is only the light fallback Style Dictionary needs.
- **Typography composites.** A `typography` token expands into one variable per property
  (`-font-family`, `-font-size`, `-font-weight`, `-line-height`, `-letter-spacing`). The css
  transform group's own typography shorthand is removed from the build because `font` has no
  place for `letter-spacing`.
- **Theme rules.** `:root` declares `color-scheme: light dark`, which follows the OS.
  `[data-theme="light"]` and `[data-theme="dark"]` override it on any element. They also set
  `color`, because text color is inherited as an already-computed value: without it, a themed
  subtree would keep the parent's text color.
- **Layer.** Everything is emitted inside `@layer pumba.tokens`.
- **TypeScript.** `index.js` and `index.d.ts` export `primitives` and `tokens` maps of
  `name -> var(--name)`, and the `PrimitiveTokenName` and `TokenName` types.

### Contrast test

`scripts/contrast.test.mjs` converts each OKLCH color to sRGB (clipped to the gamut), computes
the WCAG contrast ratio for every listed pair in both themes, and requires 4.5:1 for text and
3:1 for UI components. Every primitive file shares the `primitive` root, so the test merges them
before resolving references.
