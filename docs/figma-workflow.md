# Figma workflow

How the Figma file `pumba` stays in step with the tokens. The DTCG JSON in `packages/tokens/src` is the source of truth; Figma only receives its values.

## 1. Connection mode

**JSON to Figma only.** The build generates `packages/tokens/dist/figma.json`, and that file is imported into Figma as variables.

| Mode | Decision | Why |
| --- | --- | --- |
| 1. JSON to Figma | Chosen | The JSON stays the single source of truth, and nothing in Figma can drift back into the code. |
| 2. Figma to JSON by hand | Not used | Needs a second converter and a PR for every change, with no benefit while one person owns both sides. |
| 3. Two-way sync (Tokens Studio) | Out of scope | Reconsidered once the palette has settled and design changes become frequent. |

## 2. What the export contains

`pnpm --filter @pumba-ui/tokens build` writes `dist/figma.json` with two collections:

| Collection | Contents | Modes |
| --- | --- | --- |
| `Primitives` | color, radius, space, font-size, font-weight, line-height, letter-spacing | One |
| `Semantic` | color, radius, space | Colors have `light` and `dark` |

Semantic variables are aliases of primitives, written as `{Primitives.color.brand.600}`, so a primitive still has a single value.

Left out because a Figma variable cannot hold them: shadows, font families, motion, and the composite text styles. Text styles and shadows are created by hand in Figma, using the values from `src/primitives` and `src/semantic/typography.json`.

## 3. Color and units

- **OKLCH to hex.** Figma stores sRGB, so each OKLCH color is converted to a hex value, clipped to the sRGB gamut. The conversion rounds to 8 bits per channel, so a color imported into Figma and read back can differ by one step. The JSON keeps the exact OKLCH value, which is why the flow only goes one way.
- **Dimensions in pixels.** `rem` is multiplied by 16 and the unit is dropped (`0.5rem` becomes `8`), since Figma numbers have no unit. A user's browser font size does not exist in Figma.
- **Letter spacing in percent.** `em` is multiplied by 100 (`-0.025em` becomes `-2.5`).
- **Line height.** It stays the unitless multiplier from the tokens (`1.25`); use it as 125% in a text style.

## 4. Import

1. Run `pnpm build`.
2. In Figma, open the `pumba` file and import `packages/tokens/dist/figma.json`: with Figma's own Variables import if your account has it, or with the TokensBrücke plugin (Import tokens, beta).
3. Check that `Primitives` and `Semantic` appear as collections and that `Semantic` colors have `Light` and `Dark` modes.

The plugin creates a collection per top-level key and reads modes from `$extensions.mode`. Reimporting updates existing variables by name.

## 5. What changes where

| Change | Where | Then |
| --- | --- | --- |
| A primitive or semantic value (a hue, a radius) | The JSON in `src/` | `pnpm build`, reimport into Figma |
| A token name | The JSON in `src/` | A major change (section 8 of `docs/api-conventions.md`); reimport |
| A variable value tried out in Figma | Figma, as an experiment | Copy the decision back to the JSON; the next import overwrites Figma |
| A text style, a shadow style | Figma only | Keep it in step with the tokens by hand |

Renaming a variable in Figma does not rename the token, and the next import will bring the original name back.
