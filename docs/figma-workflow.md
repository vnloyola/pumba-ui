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

`pnpm --filter @pumba-ui/tokens build` writes `dist/figma.json` with two collections. In Figma they become three, because the Starter plan allows one mode per collection:

| Figma collection | Contents | Mode |
| --- | --- | --- |
| `Primitives` | color, radius, space, font-size, font-weight, line-height, letter-spacing | `Value` |
| `Semantic` | color, radius, space | `Light` |
| `Semantic Dark` | color only; radius and space do not change between themes | `Dark` |

Semantic variables are aliases of primitives, written as `{Primitives.color.brand.600}` in the JSON and as variable aliases in Figma, so a primitive still has a single value. `Semantic Dark` repeats the names of the semantic colors, so a layer is bound to the theme by choosing the collection. With a plan that allows two modes, the two semantic collections can merge into one with `Light` and `Dark` modes, which is what the JSON describes.

Every variable carries a scope (fill, text, stroke, gap, corner radius) and a web code syntax such as `var(--pumba-color-accent)`, the same name the CSS uses.

Left out because a Figma variable cannot hold them: shadows, font families, motion, and the composite text styles. Text styles and shadows are created in Figma from the values in `src/primitives` and `src/semantic/typography.json`. The `Foundations` page holds the six text styles (`text/heading`, `text/subheading`, `text/body`, `text/label`, `text/caption`, `text/code`) with a specimen of each, and the five color scales with every swatch bound to its primitive variable. Text styles use literal values, so a change to a font size or weight in the JSON has to be repeated in the style by hand.

## 3. Color and units

- **OKLCH to hex.** Figma stores sRGB, so each OKLCH color is converted to a hex value, clipped to the sRGB gamut. The conversion rounds to 8 bits per channel, so a color imported into Figma and read back can differ by one step. The JSON keeps the exact OKLCH value, which is why the flow only goes one way.
- **Dimensions in pixels.** `rem` is multiplied by 16 and the unit is dropped (`0.5rem` becomes `8`), since Figma numbers have no unit. A user's browser font size does not exist in Figma.
- **Letter spacing in percent.** `em` is multiplied by 100 (`-0.025em` becomes `-2.5`).
- **Line height.** It stays the unitless multiplier from the tokens (`1.25`); use it as 125% in a text style.

## 4. Import

1. Run `pnpm build`.
2. Create the variables from `packages/tokens/dist/figma.json` in the `Pumba` file. Claude does this through the Figma MCP server: it reads the file and writes the collections with the `use_figma` tool, which also sets scopes and code syntax. The TokensBrücke plugin (Import tokens, beta) or Figma's own Variables import can also read the file; the plugin reads modes from `$extensions.mode`.
3. Check that `Primitives`, `Semantic` and `Semantic Dark` exist, that every semantic variable is an alias, and that none uses all scopes.

The plugin reimport updates existing variables by name. Through the MCP route, ask Claude to update the values of the existing variables; it does not recreate them.

## 5. What changes where

| Change | Where | Then |
| --- | --- | --- |
| A primitive or semantic value (a hue, a radius) | The JSON in `src/` | `pnpm build`, reimport into Figma |
| A token name | The JSON in `src/` | A major change (section 8 of `docs/api-conventions.md`); reimport |
| A variable value tried out in Figma | Figma, as an experiment | Copy the decision back to the JSON; the next import overwrites Figma |
| A text style, a shadow style | Figma only | Keep it in step with the tokens by hand |

Renaming a variable in Figma does not rename the token, and the next import will bring the original name back.
