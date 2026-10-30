# Design direction

The visual personality of Pumba and the concrete decisions that follow from it. Each decision has a value and a one-line reason. Color decisions are validated by the contrast test in `@pumba-ui/tokens` (`pnpm test`).

## 1. Personality

**Warm, simple and firm.** Pumba is named after a Rottweiler: black coat, mahogany markings, calm and sturdy. The system is minimalist, with soft blacks and a single mahogany accent.

It speaks to developers who build their own interfaces and want something sober that does not feel cold.

| Quality | What it means in practice |
| --- | --- |
| Warm | Neutrals lean warm, not blue. Medium radii, no sharp corners. |
| Simple | One accent color, one font family, restrained shadows. |
| Firm | Strong contrast, clear focus, no decorative effects. |

## 2. Color

All scales are OKLCH, steps 50 to 950, with light and dark values coming from the semantic layer.

| Decision | Value | Why |
| --- | --- | --- |
| Neutral hue | 60, chroma 0.004 to 0.017 | Warm grays and soft blacks read as the coat, not as a default blue-gray. |
| Brand hue | 55 (mahogany), chroma up to 0.14 | The markings of the breed. One accent only. |
| Accent in light mode | `brand.600` | Gives white text at least 4.5:1. |
| Accent in dark mode | `brand.400` | Keeps 3:1 against dark surfaces, with dark text on top. |
| Success hue | 150 | Unchanged, clearly apart from the brand. |
| Error hue | 25 | Unchanged, red stays apart from mahogany by chroma and by an icon. |
| Warning hue | 90 | Moved from 80 so it does not blend with the brand at hue 55. |
| Warning in light mode | `warning.500`, `oklch(0.64 0.14 90)` | A darker step turns olive; this is the darkest yellow that still passes 3:1. |

Brand scale (hue 55): 50 `0.97 0.015`, 100 `0.94 0.03`, 200 `0.88 0.06`, 300 `0.80 0.09`, 400 `0.70 0.12`, 500 `0.60 0.14`, 600 `0.52 0.14`, 700 `0.45 0.12`, 800 `0.38 0.10`, 900 `0.31 0.08`, 950 `0.23 0.055`.

Chroma is lower than a blue scale at the same lightness because saturated orange-browns fall outside sRGB.

## 3. State tones

| State | Hue | Rule |
| --- | --- | --- |
| Success | 150 | Green. |
| Error | 25 | Red. |
| Warning | 90 | Yellow. |

State is never conveyed by color alone: every state also carries an icon or text. This is what keeps error and warning distinguishable from the mahogany accent for users with color vision deficiency.

## 4. Typography

| Role | Font | Why |
| --- | --- | --- |
| Text and headings | Figtree | Friendly, geometric and very legible. It matches the warm personality. |
| Code | JetBrains Mono | Clear at small sizes and pairs well with Figtree. |

Figtree is the default, not a requirement: the font is a token, so a consumer picks another one by redefining `--pumba-primitive-font-family-sans` or `--pumba-primitive-font-family-mono`, and every text style follows.

Headings use the same family as text: one family keeps the system simple, and weight and size give enough hierarchy.

Weights stay at 400, 500, 600 and 700. The type scale, line heights and letter spacing are unchanged.

Alternatives considered for text: DM Sans (more neutral, less warm), Plus Jakarta Sans (more expressive, less minimal), Instrument Sans (more sober, colder).

## 5. Radius, shadow and density

These follow the standard design-system scale; the existing tokens already express it.

| Decision | Value | Why |
| --- | --- | --- |
| Control radius | `radius.lg`, 0.75rem | Soft corners that feel friendly and modern. |
| Surface radius | `radius.2xl`, 1.5rem | Cards and panels sit one step above controls and read as clearly rounder. |
| Pill radius | `radius.full` | Badges and tags. |
| Raised shadow | `shadow.sm` | Elevation relies mostly on borders and surfaces. |
| Overlay shadow | `shadow.lg` | Reserved for popovers and dialogs. |
| Density | Medium: 4px spacing scale, 1rem base text | The default of most systems; compact or spacious can be added later if a consumer needs it. |

## 6. Out of scope

Loading Figtree and JetBrains Mono, and updating the typography tokens to use them, is implementation and is tracked separately from this direction.
