# API conventions

This document defines how Pumba's public API looks and behaves. It is the acceptance
criterion for every component in the library: a component is not done until it follows
these rules.

Each decision has a one-line **Why**. Decisions that are not settled yet are marked
**Pending** and are resolved when the first component is built.

## 1. What counts as public API

The public API is everything a consumer can depend on:

- Imports and exports of `@pumba-ui/*` packages.
- Component props and the values of their variants.
- Token names (`--pumba-*`).
- Documented `data-*` attributes (`data-variant`, `data-size`, state attributes).
- The composition structure of compound components (`Dialog.Root`, `Dialog.Content`, ...).
- The root element of each component and its `.pumba-*` class.

Everything else is internal: the structure of inner elements and undocumented classes.

**Why:** consumers can only rely on what is documented, so we can refactor internals
without a major release.

## 2. Prefixes

- Tokens (CSS custom properties) use `--pumba-`.
- Component classes use `.pumba-` (for example `.pumba-button`).

**Why:** it avoids collisions with the consumer's styles and makes the origin of every
variable and class obvious.

## 3. Simple components

Simple components (Button, Badge, Card, ...) follow these rules:

- **Flat props.** No nested configuration objects.
- **Extend native props.** A `Button` accepts everything a `<button>` accepts, typed with
  `React.ComponentProps<"button">`.
- **Forward the rest.** Unknown props are spread onto the root element with `...rest`.
- **Combine `className`.** The consumer's `className` is appended to the component's own
  class, never a replacement for it.
- **`ref` is a regular prop.** React 19 does not need `forwardRef`.

**Why:** consumers can treat a Pumba component as the native element it wraps, and add
their own classes without losing the base styles.

### Icons in Button

Icons are regular children, and their order decides the side:
`<Button><CheckIcon />Save</Button>` puts the icon before the label, and the reverse puts it
after. Icons come from `packages/ui/src/icons.ts` and should carry `aria-hidden="true"`.
`iconOnly` makes the button square; its icon is the only child and the consumer must provide
an `aria-label`. While `loading`, the spinner is added before the content, and an `iconOnly`
button shows only the spinner.

**Why:** it is the same shape as plain HTML and needs no props, so there is nothing new to
learn or to keep in the contract.

### Input

`Input` is a native `<input>`: `value` and `defaultValue` work as they do natively, so it is
controlled or uncontrolled by the consumer. Its `size` is `sm`, `md` or `lg`, reflected as
`data-size`, and it **replaces** the native numeric `size` attribute, which is left out of the
type so every component keeps one meaning for `size`. Control widths come from CSS.

A text field is filled, not outlined: its background is `field` (`field-hover` under the pointer)
and its border is transparent until the state needs one (read-only, invalid). The fill must stand
apart from both the page and a surface, which the contrast test checks only for text; the fill
against its surroundings is a visual choice, so a field always needs a visible label.

`invalid` writes `aria-invalid="true"` and `data-invalid`, and gives the field an error-colored
border of double width, so the state is not carried by color alone. The error message is the
consumer's: a visible text associated with `aria-describedby`, and ideally an icon. `disabled`
and `readOnly` also write `data-disabled` and `data-readonly`. The consumer provides the label
(`<label htmlFor>` or `aria-label`); a `Field` component that wires label, hint and error
together is not built yet.

**Why:** the native element already gives validation, autofill, mobile keyboards and form
participation, so wrapping it would only add things to keep in sync.

### Example: simple component

```tsx
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={className ? `pumba-button ${className}` : "pumba-button"}
      data-variant={variant}
      data-size={size}
      {...rest}
    />
  );
}
```

> This example illustrates the rules above. The final implementation (including `render`,
> see section 5) is decided when the first component is built.

## 4. Variants

Variants are string unions with a default value, reflected as `data-*` attributes.

- `variant` maps to `data-variant`, `size` maps to `data-size`.
- The default value is **always written** to the attribute: `<Button>` renders
  `data-variant="primary"`.
- Classes only identify the component (`.pumba-button`); variants and states are expressed
  with attributes (`[data-variant="primary"]`, `[data-size="lg"]`).

**Why:** one mechanism for the states exposed by headless libraries and for variants, no
special case for the default, and less code inside components.

## 5. Polymorphism: the `render` prop

Every component that renders its own DOM element accepts a `render` prop, as Base UI does.

`render` replaces the component's default element with the one the consumer passes. The
component injects its own props (class, `data-*`, event handlers, `ref`) into that element.
The element passed is a template, it does not carry the component's styles.

```tsx
<Button render={<a href="/docs" />}>Docs</Button>
// <a href="/docs" class="pumba-button" data-variant="primary" data-size="md">Docs</a>
```

It also accepts a function for full control: `render={(props, state) => <span {...props} />}`.

Requirement for the consumer: the element (or custom component) must forward `ref` and
spread all received props onto its underlying DOM node.

Every component ships with a test that renders it with `render={<a />}` and asserts that it
keeps its class, its `data-*` attributes and its `ref`.

Reference: <https://base-ui.com/react/handbook/composition>

**Implementation.** Components call Base UI's `useRender` and `mergeProps` internally. The
public `render` prop is typed `ReactElement | ((props) => ReactElement)`, so no Base UI type
appears in a signature (section 7). `mergeProps` joins the component's class with the
consumer's `className` and chains event handlers.

**Why:** one simple, testable rule instead of deciding component by component, and one place
(Base UI) that merges props and refs correctly.

### A separate `Link` component

Navigation is a `Link` component (a real `<a>`), not a `Button` variant. `Button
variant="link"` is reserved for actions styled as text.

**Why:** a `<button>` used for navigation is announced as "button" by screen readers,
which is an accessibility problem.

## 6. Compound components

Complex components are composed of parts: `Dialog.Root`, `Dialog.Content`, and so on.
Base UI types are never exposed in Pumba's public API.

**Why:** parts let the consumer arrange, wrap or omit pieces without a prop for every case,
and keeping Base UI types out of the API lets us change the headless layer without a
breaking change.

### Card

Card is compound: `Card.Root`, `Card.Header`, `Card.Content` and `Card.Footer`. Every part is a
`div` that accepts `render` and extends the native props. `Card.Root` carries the surface
(`surface`, `border`, `radius-surface`, `shadow-raised`), the `space-inset` padding and the
`space-stack` gap between parts; `Card.Footer` lays out its children in a row. Card has no
`variant` or `size` because nothing needs one yet.

The parts are plain `div`s and not `<header>` or `<footer>`: outside a sectioning element those
tags become landmarks, so a dashboard with many cards would announce a banner and a footer per
card. A consumer who wants a landmark uses `render`.

**Why:** headers and footers repeat in every dashboard card, so the parts keep spacing and
alignment in one place instead of in each consumer. The generator only creates the root, so the
parts are written by hand in the same file.

### Dialog

Dialog is compound, on Base UI: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title`,
`Dialog.Description` and `Dialog.Close`. No Base UI type appears in a signature. `Dialog.Root`
renders no element; it takes `open` with `onOpenChange(open)` when controlled and `defaultOpen`
when not. The other parts accept `render` and the native props of their element.

`Dialog.Content` renders the portal, the backdrop and the dialog itself, so the consumer never
assembles them. It takes an optional `container`, the element the dialog is rendered into. This is
needed to theme a subtree: the portal goes to `document.body` by default, outside any
`data-theme` wrapper, so a dialog opened from a dark subtree would come out light.
`Dialog.Close` is a separate part so the consumer decides where closing lives: an icon-only
Button with an `aria-label`, or a "Cancel" button.

`Dialog.Trigger` and `Dialog.Close` are buttons, so a Button placed inside them would nest two
buttons. Instead, when their only child is an element, they render that element in place of their
own and give it their behavior and class: `<Dialog.Trigger><Button>Open</Button></Dialog.Trigger>`
produces one `<button>` that is both. This reads like the icons in a Button and keeps the Button's
own props where the consumer writes them. `render` still works for the other cases, and a trigger
or close that renders something other than a `<button>` must pass `nativeButton={false}`.

Long content scrolls inside the dialog, in a body element that keeps its scrollbar within the
dialog's padding, so the bar never touches the rounded corners. The body has its own padding,
offset by an equal negative margin, so the focus ring of the first and last controls is not
clipped by its scroll area.

Visuals use `surface-raised`, `radius-surface` and `shadow-overlay`, with the new `scrim` token
for the layer behind (each component applies its own opacity). Enter and exit are animated with
Base UI's `data-starting-style` and `data-ending-style`, with `motion-duration-transition` and
the enter and exit easings, and do not animate under `prefers-reduced-motion`. Focus trapping,
closing with Escape, returning focus to the trigger and the `aria-labelledby` and
`aria-describedby` links come from Base UI and are tested in the browser with a story `play`
function. Stories that start open set `docs.story.inline` to `false` so they render in their own
frame and do not cover the Docs page.

**Why:** accessible modals take years to get right (section 7), and the parts let a consumer
arrange the header, body and actions without a prop for every layout.

### Controlled and uncontrolled

Both modes are supported, with the names React developers already expect:

| Mode | Props |
| --- | --- |
| Uncontrolled | `defaultOpen` |
| Controlled | `open` + `onOpenChange` |

**Why:** it mirrors `defaultValue` / `value` on native inputs, so we do not invent our own
convention.

### Example: compound component

```tsx
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Delete project</Dialog.Title>
    <Dialog.Description>This action cannot be undone.</Dialog.Description>
  </Dialog.Content>
</Dialog.Root>
```

> Illustrative. Part names are finalized when the component is built.

## 7. Headless layer

Base UI is the headless layer **where it exists and adds something** (behavior or
accessibility that plain HTML does not give). Where it does not, we use semantic HTML.

- Complex components (Dialog, Select, Menu, ...) use Base UI.
- Components Base UI does not offer (Badge, Card) use semantic HTML.
- Components that exist in both (Button, Input, Separator, Avatar) are decided case by case
  in each component's card.
- **Button** uses the native `<button>`, with Base UI's `useRender` only for `render`. Base
  UI's Button adds `focusableWhenDisabled` and role/keyboard handling for non-button elements,
  and no consumer needs either yet. Revisit if one does.
- **Input** uses the native `<input>` with `useRender` for `render`. Base UI's Input only adds
  `data-invalid`, `data-touched` and `data-focused` inside `Field.Root`, and Pumba has no `Field`
  yet, so those attributes would not appear on a standalone control. Revisit when a `Field`
  component is built.
- Base UI types are never part of the public API.

**Why:** accessible dialogs, menus and selects take years to get right, so we do not
reimplement them; a `<span>` does not need a library.

### When to re-evaluate Base UI

Re-evaluate the choice of Base UI if any of these happens:

1. **Coverage:** we need a complex component Base UI does not offer (for example a
   DatePicker or a ColorPicker).
2. **Maintenance:** the library stops receiving updates or accessibility fixes.
3. **Cost of switching:** replacing it would require a breaking change in Pumba's public API.
   Because Base UI types are never exposed, this should not happen; if it ever does, that is
   a signal to revisit the decision earlier.

## 8. What is a breaking change

Pumba follows [semver](https://semver.org).

- **Major:** anything that can break a consumer's code.
- **Minor:** new features that are backward compatible.
- **Patch:** fixes that do not change the public contract.

| Change | Release |
| --- | --- |
| Remove or rename a prop, token, export or variant value | Major |
| Change the root element or its `.pumba-*` class | Major |
| Change or remove a documented `data-*` attribute | Major |
| Add a prop, variant value, token or component | Minor |
| Change inner elements or undocumented classes | Patch |
| Fix a bug without changing the contract | Patch |

**Why:** the contract is what is documented; inner structure can change freely.

## 9. States

States come in two kinds, with different rules.

### Interaction states (set by the browser)

Written twice: as a pseudo-class and as an attribute that forces the state.

| State | Pseudo-class | Forcing attribute |
| --- | --- | --- |
| Hover | `:hover` | `[data-hovered]` |
| Pressed | `:active` | `[data-pressed]` |
| Keyboard focus | `:focus-visible` | `[data-focus-visible]` |

```css
.pumba-button:hover,
.pumba-button[data-hovered] {
  background: var(--pumba-color-primary-hover);
}
```

These attributes are never set by components. They exist so that Storybook and tests can
show a state without a real mouse or keyboard.

**Why:** a pseudo-class can only be activated by the browser, so it cannot be pinned in
Storybook or in visual tests. Base UI does not expose hover, pressed or focus attributes
(its Button only exposes `data-disabled`), so Pumba defines them. The names follow the
React Aria convention.

### Component states (set by Base UI)

Attributes exposed by Base UI are used as they are, without a pseudo-class duplicate,
because they describe a real component state: `data-disabled`, `data-checked`,
`data-unchecked`, `data-indeterminate`, `data-open`, `data-closed`, `data-popup-open`,
`data-starting-style`, `data-ending-style`, among others. Consult each Base UI component's
documentation for its full list.

Storybook and tests trigger them with the real prop (`disabled`, `defaultChecked`,
`defaultOpen`), so no artificial attribute is needed.

**Caveat:** some attributes only appear inside `Field.Root` (for example `data-invalid`,
`data-touched` and `data-focused` on Checkbox). Do not assume them on a standalone control.

## 10. Default size

The default size (`md`) lives in the base class. `[data-size="md"]` has no styles of its own;
only the other sizes override the base.

```css
.pumba-button {
  padding: var(--pumba-space-2) var(--pumba-space-4); /* md */
}

.pumba-button[data-size="sm"] {
  padding: var(--pumba-space-1) var(--pumba-space-3);
}

.pumba-button[data-size="lg"] {
  padding: var(--pumba-space-3) var(--pumba-space-6);
}
```

The `data-size="md"` attribute is still written to the DOM (see section 4) so consumers can
select on it, but Pumba's own CSS never depends on it.

This rule applies to `size` only. `variant` has no base-class default: every variant,
including the default one, is styled explicitly under `[data-variant="..."]`.

**Why:** a component rendered without the attribute (through `render`, or with partial CSS)
still looks reasonable instead of unstyled. Variants differ too much (whole color sets) for
one of them to live in the base class.

## 11. File conventions

Each component lives in its own folder, with kebab-case file names:

```text
packages/ui/src/button/
├── button.tsx
├── button.css
├── button.stories.tsx
├── button.test.tsx
└── index.ts
```

New components are generated with `pnpm add:component <Name>` (PascalCase, for example
`Button` or `ButtonGroup`). The command creates the folder, adds the export to `src/index.ts`
and the stylesheet to `src/styles/styles.css`, and fails without changing anything if the
folder already exists. The templates live in `packages/ui/scripts/templates/`. Compound
components (several parts) are not generated yet.

Relative imports inside `src` carry the `.js` extension (`import { Button } from "./button.js"`),
even though the file is `.ts` or `.tsx`. TypeScript resolves them to the source, and the
emitted `.d.ts` files stay valid under Node's ESM rules.

**Why:** what changes together lives together, so touching a component means touching one
folder. Kebab-case avoids case-sensitivity problems between macOS and Linux (CI) and matches
the CSS class names.

## 12. CSS location

CSS is plain CSS, placed next to each component (`button.css`). There is no separate styles
package for now.

A component's CSS must not depend on React: it only relies on `.pumba-*` classes, `data-*`
attributes and `--pumba-*` tokens. If an adapter for another framework ever appears, the CSS
can be extracted mechanically to a `@pumba-ui/styles` package that every adapter imports.

**Why:** a published package has a single set of dependencies, so supporting several
frameworks means one package per framework and a shared styles package. Keeping the CSS
framework-agnostic from the start makes that extraction cheap.

**Caveat:** sharing the CSS only works if every adapter emits the same `data-*` attributes.
Headless libraries name their state attributes differently, so an adapter would have to map
them to Pumba's attributes.

## 13. CSS layers and Tailwind

Pumba declares its layers under the `pumba.*` namespace, in this order:

```css
@layer pumba.reset, pumba.tokens, pumba.base, pumba.components;
```

`styles.css` starts with this statement. The names are namespaced so they never merge with
Tailwind v4's own `base` and `components` layers.

**Why:** layers are ordered by declaration, and a later layer wins regardless of selector
specificity. Namespacing lets the consumer place Pumba as a single unit relative to
Tailwind, and unlayered consumer CSS always beats any layer.

### Without Tailwind

Import the styles. Nothing else is needed:

```css
@import "@pumba-ui/ui/styles.css";
```

Consumer CSS outside any layer wins over Pumba without raising specificity.

### With Tailwind v4

Declare the layer order **once, before any import**, with `pumba` between `components` and
`utilities`, then import normally:

```css
@layer theme, base, components, pumba, utilities;
@import "tailwindcss";
@import "@pumba-ui/ui/styles.css";
```

Result: Tailwind utilities (`bg-red-500`) win over Pumba, and Pumba wins over Tailwind's
`base` (preflight).

### Alternative: `layer()` import

Importing with `layer(pumba)` also works, **but only if the order statement is still
declared first**:

```css
@layer theme, base, components, pumba, utilities;
@import "tailwindcss";
@import "@pumba-ui/ui/styles.css" layer(pumba);
```

Layers then appear as `pumba.pumba.*` in devtools, because the inner `pumba.*` names are
nested inside the wrapper layer. It works, but the first form is recommended.

### Two failure modes

- **`layer(pumba)` without the order statement:** `pumba` is declared after `utilities`, so
  Pumba overrides Tailwind utilities and `bg-red-500` stops working.
- **Importing Pumba before Tailwind without the statement:** `pumba` becomes the first
  (lowest priority) layer, and Tailwind's preflight overrides Pumba's styles (a button
  ends up with a transparent background).

### How this was verified

Tested with Vite 8.3.1 and Tailwind 4.3.3 (`@tailwindcss/vite`), measuring computed styles in
a Chromium-based browser. Imports are resolved at build time by Vite/Tailwind, not by the
browser. Other bundlers were not tested.

| Case | Utility class | Pumba vs preflight |
| --- | --- | --- |
| Order statement + plain import | Utility wins | Pumba wins |
| Order statement + `layer(pumba)` | Utility wins | Pumba wins |
| `layer(pumba)`, no statement | Pumba wins (bug) | Pumba wins |
| Pumba imported first, no statement | Utility wins | Preflight wins (bug) |
| No Tailwind, unlayered consumer CSS | n/a | Consumer CSS wins |

## 14. Mapping tokens to Tailwind v4

A consumer with Tailwind v4 exposes Pumba tokens as utilities by mapping them in an
`@theme inline` block, in the matching Tailwind namespace:

```css
@import "tailwindcss";
@import "@pumba-ui/ui/styles.css";

@theme inline {
  --color-brand: var(--pumba-color-brand);
  --spacing-gutter: var(--pumba-space-4);
}
```

This generates `bg-brand`, `text-brand`, `p-gutter`, and so on. Namespaces used: `--color-*`,
`--spacing-*`, `--radius-*`, `--font-*`, `--shadow-*` (see the Tailwind theme docs for the
full list).

The `inline` keyword is required. Without it, Tailwind resolves `var(--pumba-color-brand)`
at `:root`, so a token overridden in a subtree (for example `[data-theme="dark"]`) keeps its
root value. With `inline`, the utility references the Pumba variable directly, so it follows
the theme wherever it is applied.

Reference: <https://tailwindcss.com/docs/theme>

**Why:** Pumba's tokens change with the theme, and `inline` is what keeps Tailwind
utilities in sync with them.

### How this was verified

Same setup as section 13 (Vite 8.3.1, Tailwind 4.3.3, Chromium-based browser). With a token
overridden inside `[data-theme="dark"]`:

| Mapping | `bg-brand` at root | `bg-brand` inside `data-theme="dark"` |
| --- | --- | --- |
| `@theme inline` | blue | orange (follows the theme) |
| `@theme` (no `inline`) | blue | blue (stuck at the root value) |

## 15. Reset

The reset is optional. It ships as its own file, `@pumba-ui/ui/reset.css`, and `styles.css`
does not include it. Its rules live in the `pumba.reset` layer, the lowest-priority Pumba
layer.

```css
@import "@pumba-ui/ui/reset.css";
@import "@pumba-ui/ui/styles.css";
```

Components defend themselves with their own base styles, so they look right with or without
the reset.

With Tailwind, do not import the reset: Tailwind's preflight already fills that role.

**Why:** a consumer with Tailwind already has a reset, and two resets fighting over the
same elements produce hard-to-trace differences. Without Tailwind, the consumer decides
whether they want Pumba's.

## 16. Tokens and theming

Tokens come in two layers, defined in `@pumba-ui/tokens` as DTCG JSON and compiled to CSS
variables and TypeScript names.

| Layer | Prefix | Example | Used by |
| --- | --- | --- | --- |
| Primitive | `--pumba-primitive-` | `--pumba-primitive-color-brand-600` | Only the semantic layer |
| Semantic | `--pumba-` | `--pumba-color-accent` | Components and consumers |

A component never references a primitive. A semantic token points at a primitive with
`var()`, so each value lives in one place and changing a primitive (for example the font)
reaches every component that uses it.

**Why:** primitives answer "what values exist", semantic tokens answer "what is this value
for". Restyling the library, or adding a theme, means re-pointing semantic tokens without
touching any component.

### Semantic token names

| Group | Names |
| --- | --- |
| Color | `background`, `surface`, `surface-raised`, `text`, `text-secondary`, `text-disabled`, `border`, `border-strong`, `scrim`, `field`, `field-hover`, `accent`, `accent-hover`, `accent-pressed`, `accent-subtle`, `accent-text`, `focus`, and `success`, `error`, `warning` each with `-subtle` and `-text` |
| Space | The scale `space-0` to `space-24`, plus `space-control-x`, `space-control-y`, `space-gap`, `space-stack`, `space-inset` |
| Radius | `radius-control`, `radius-surface`, `radius-pill` |
| Shadow | `shadow-raised`, `shadow-overlay` |
| Motion | `motion-duration-feedback`, `motion-duration-transition`, `motion-easing-standard`, `motion-easing-enter`, `motion-easing-exit` |
| Typography | `text-heading`, `text-subheading`, `text-body`, `text-label`, `text-caption`, `text-code`, each expanded into `-font-family`, `-font-size`, `-font-weight`, `-line-height` and `-letter-spacing` |

CSS has no variable that holds several properties, so a typography style is five variables:

```css
.pumba-button {
  font-family: var(--pumba-text-label-font-family);
  font-size: var(--pumba-text-label-font-size);
  font-weight: var(--pumba-text-label-font-weight);
  line-height: var(--pumba-text-label-line-height);
  letter-spacing: var(--pumba-text-label-letter-spacing);
}
```

To change the typeface of the whole library, change `font-family.sans` in
`packages/tokens/src/primitives/typography.json`. To give headings their own, add a
primitive (for example `font-family.display`) and point `text.heading` at it.

### Light and dark

Color tokens use `light-dark()`, and `color-scheme` decides which side wins:

```css
:root { color-scheme: light dark; }          /* follows the OS (prefers-color-scheme) */
[data-theme="dark"]  { color-scheme: dark; } /* manual override, on any element */
[data-theme="light"] { color-scheme: light; }
```

- With no attribute, the theme follows the OS.
- `data-theme` on `<html>` forces a theme for the whole page. On any other element it
  themes only that subtree, because `light-dark()` is resolved where the variable is used.
- A themed subtree sets its own `color`, since text color is inherited from the parent.

**Why:** the alternative, overriding every variable inside `[data-theme="dark"]` plus a
`prefers-color-scheme` media query, repeats each color twice and needs the dark values in two
places. With `light-dark()` each token declares both values once. The cost is browser
support: it needs a browser from 2024 or later.

Radii nest: `radius-surface` equals `radius-control` plus `space-inset`. Anything inside a
surface that follows the surface's corner, such as an image or a button in a card's footer, uses
`radius-control` and lines up with the card without extra math. `pnpm --filter @pumba-ui/tokens
test` checks the equality.

Only colors change with the theme. Space, radius, typography and motion are the same in both.

### Avoiding the wrong-theme flash

If the user's choice is stored (for example in `localStorage`), apply it before the first
paint with a blocking inline script in `<head>`, not after React mounts:

```html
<script>
  const theme = localStorage.getItem("theme");
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
</script>
```

**Why:** the CSS alone never flashes, because `prefers-color-scheme` is known before
rendering. The flash appears when a stored preference is applied by JavaScript after the page
has painted with the OS theme.

### Contrast

Text and background pairs meet WCAG AA (4.5:1 for text, 3:1 for UI components such as
`accent`, `focus` and `border-strong`) in both themes. `pnpm --filter @pumba-ui/tokens test`
checks every pair, so changing a primitive that breaks a pair fails the test.

### How this was verified

Built `dist/tokens.css` and loaded it in a Chromium-based browser. With the OS in dark mode and
no attribute, `--pumba-color-surface` resolved to the dark value. `data-theme="dark"` and
`data-theme="light"` on `<html>` forced each theme, and on a `<div>` themed only that subtree.

## 17. Tests

Component tests run with Vitest, Testing Library and jsdom (`pnpm --filter @pumba-ui/ui
test`). The generated test covers, for every component:

- its class and the default `data-variant` and `data-size`,
- the consumer's `className` appended to its own,
- the `ref`,
- `render={<a />}`, keeping class, `data-*` attributes and `ref` (section 5),
- no accessibility violations according to axe-core.

The axe `color-contrast` rule is disabled in these tests because jsdom does not compute
styles. Contrast is covered by the token test (see "Contrast" in section 16).

Stories are also tests. `pnpm --filter @pumba-ui/storybook test` runs every story in a real
browser through the Storybook Vitest addon, and any axe violation fails it
(`a11y: { test: "error" }`). Each component has a `...Dark` story (section 18), so both themes
are checked. Run `pnpm --filter @pumba-ui/storybook exec playwright install chromium`
once to get the browser.

**Why:** the same five checks for every component keep the contract of sections 3 to 5 from
depending on someone remembering to test it.

## 18. Stories

Stories are the living documentation of a component and also its test (section 17), so they
follow one shape for every component. `Button` and `Card` are the reference.

- **Title.** `Components/<Name>`, with `tags: ["autodocs"]` coming from the preview.
- **One idea per story.** Name the story after what it shows: `Default`, `Variants`, `Sizes`,
  `WithIcons`, `IconOnly`, `Disabled`, `Loading`, `AsLink`. A group of related values goes in one
  story as a row, not in one story per value. `Default` takes its values from the controls, so
  `args` and `argTypes` stay on the meta.
- **Real content.** Use text, icons and other Pumba components a consumer would actually write
  ("Add to cart", a `Card` with a footer), not "Lorem ipsum" or bare labels. Icons come from
  `src/icons.ts`, with `aria-hidden="true"` when the text already names the action. Add an icon
  to `icons.ts` only when a story uses it.
- **Compose with what exists.** When a component needs a context (Button in a Card footer, Card
  with Buttons), build it from the real components. When the component it needs does not exist
  yet, leave that story out until it does.
- **State stories.** One story per interaction state forced with its attribute (`Hovered`,
  `Pressed`, `FocusVisible`), plus a `ForcedStates` story that shows every state of every
  variant, so states can be reviewed without a mouse.
- **Dark theme.** A `...Dark` story wraps the content in an element with `data-theme="dark"`,
  its own `background` and `color`, and renders the light story inside it. Do not use
  `globals: { theme: "dark" }`: on the Docs page every story shares one document, so the last one
  would turn the whole page dark.
- **Layout.** A decorator on the meta centers the story. Layout styles go in
  `<name>.stories.css`, with classes prefixed `<name>-story-`, never in `style` props and never in
  the component's CSS. The file is only created when a story needs it and is not part of the
  published package.
- **Images.** Sample images live in `packages/assets/` and are served at `/assets/` by
  Storybook, so a story uses `src="/assets/<file>"` and gives the image a real `alt`.
- **Accessibility.** Every story runs axe in the browser (section 17), so each one must pass.
  A story that exists to show a failing case does not belong in the file.

**Why:** the same shape means a reader finds a component's variants, states and examples in the
same place every time, and a new story is copied from an existing one instead of invented.
