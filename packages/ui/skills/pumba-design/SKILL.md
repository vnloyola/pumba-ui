---
name: pumba-design
description: Design rules for building interfaces with the Pumba design system (@pumba-ui/ui and @pumba-ui/tokens). Use when creating or reviewing pages, layouts or components in a project that depends on @pumba-ui/ui, to choose variants, tokens, spacing, elevation and states the way Pumba intends.
---

# Pumba design rules

Pumba is warm, simple and firm: near-pure grays, one mahogany accent, one font family, strong
contrast and no decorative effects. These rules keep a page inside that direction.

Read `node_modules/@pumba-ui/ui/USAGE.md` first: it covers setup, theming, shared props, compound
components and the accessibility the app provides. The props of each component are in the
package's `.d.ts` files. This skill does not repeat them; it covers the choices the types allow but
the design does not.

## 1. Use a Pumba component before building one

If Pumba has it, use it and adjust layout with `className`. Do not rebuild a button, field, badge,
card, tabs or dialog with plain elements, and do not restyle a `.pumba-*` class to get a look a
variant already gives.

Good:

```tsx
<Button variant="secondary" size="sm">Export</Button>
```

Avoid:

```tsx
<button className="rounded-lg border px-3 py-1 text-sm">Export</button>
```

## 2. One primary action per region

The accent is the only color with emphasis, so it marks the one action the region is for. Other
actions are `secondary`, and low-priority or repeated ones (toolbars, rows) are `ghost`.

Good:

```tsx
<Card.Footer>
  <Button variant="ghost">Cancel</Button>
  <Button>Save changes</Button>
</Card.Footer>
```

Avoid:

```tsx
<Card.Footer>
  <Button>Cancel</Button>
  <Button>Save changes</Button>
</Card.Footer>
```

## 3. Destructive means it cannot be undone

`destructive` is for deleting or other irreversible actions, and it is confirmed in a `Dialog`
whose title names the object. The button that opens that dialog keeps its natural width and sits
apart from the everyday actions (at the end of the page or in its own card), never as a
full-width bar. The confirm button repeats the verb; the way out is `secondary`.
"Sign out" or "Remove filter" are not destructive.

Good:

```tsx
<Dialog.Content>
  <Dialog.Title>Delete "Q3 report"?</Dialog.Title>
  <Dialog.Description>The report and its 12 comments are deleted for everyone.</Dialog.Description>
  <div className="dialog-actions">
    <Dialog.Close>
      <Button variant="secondary">Keep report</Button>
    </Dialog.Close>
    <Dialog.Close>
      <Button variant="destructive" onClick={deleteReport}>Delete report</Button>
    </Dialog.Close>
  </div>
</Dialog.Content>
```

Avoid:

```tsx
<Button variant="destructive" onClick={deleteReport}>Delete</Button>
```

## 4. Every value comes from a semantic token

Colors, spacing, radii, shadows and type sizes come from `--pumba-*` tokens. No hex, `rgb()`,
`oklch()`, Tailwind palette colors (`slate-500`, `blue-600`) or `--pumba-primitive-*`. Primitives
and literals do not switch with the theme, so they break dark mode.

Good:

```css
.page-header {
  border-bottom: 1px solid var(--pumba-color-border);
  color: var(--pumba-color-text-secondary);
  padding-block: var(--pumba-space-4);
}
```

Avoid:

```css
.page-header {
  border-bottom: 1px solid #e5e7eb;
  color: var(--pumba-primitive-color-neutral-500);
  padding-block: 18px;
}
```

## 5. Spacing has roles

Inside a surface the padding is `--pumba-space-inset`, the vertical gap between blocks is
`--pumba-space-stack`, and the gap between controls in a row is `--pumba-space-gap`. Anything
else takes a step of the numbered scale (`--pumba-space-1` to `--pumba-space-24`); no value off
the scale.

Good:

```css
.settings-panel {
  display: grid;
  gap: var(--pumba-space-stack);
  padding: var(--pumba-space-inset);
}
```

Avoid:

```css
.settings-panel {
  display: grid;
  gap: 14px;
  padding: 22px;
}
```

## 6. Elevation is surfaces and borders, not shadows

Layers read through `background`, `surface` and `surface-raised` plus a `border`. A card already
has its shadow. `--pumba-shadow-overlay` is only for things that float above the page (popovers,
dialogs). No gradients, glows, blurs or colored shadows.

Good:

```css
.sidebar {
  background: var(--pumba-color-surface);
  border-inline-end: 1px solid var(--pumba-color-border);
}
```

Avoid:

```css
.sidebar {
  background: linear-gradient(180deg, #fff, #f5f5f5);
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.2);
}
```

## 7. Radii nest, they are not invented

Surfaces use `--pumba-radius-surface`, controls and anything inside a surface that follows its
corner (an image in a card) use `--pumba-radius-control`, and pills use `--pumba-radius-pill`.
The surface radius equals the control radius plus the inset, so a child that fills a card's padding
lines up with its corner.

Good:

```css
.card-cover {
  border-radius: var(--pumba-radius-control);
}
```

Avoid:

```css
.card-cover {
  border-radius: 6px;
}
```

## 8. Hierarchy from the text styles

One family. Titles, subtitles, body, labels, captions and code use the `--pumba-text-<style>-*`
tokens (`heading`, `subheading`, `body`, `label`, `caption`, `code`), each with its
`font-family`, `font-size`, `font-weight`, `line-height` and `letter-spacing`. Do not add a font,
a size or a weight outside them. Secondary text is `--pumba-color-text-secondary`, not lighter
opacity.

Good:

```css
.page-title {
  font-family: var(--pumba-text-heading-font-family);
  font-size: var(--pumba-text-heading-font-size);
  font-weight: var(--pumba-text-heading-font-weight);
  line-height: var(--pumba-text-heading-line-height);
  letter-spacing: var(--pumba-text-heading-letter-spacing);
}
```

Avoid:

```css
.page-title {
  font-family: "Inter", sans-serif;
  font-size: 28px;
  font-weight: 800;
  opacity: 0.9;
}
```

## 9. State is never color alone

Success, error and warning always come with text that names them, and ideally an icon (Pumba
exports none; any icon set works). A red
border alone, or a green dot alone, is not enough: the error hue sits close to the mahogany accent.

Good:

```tsx
<Badge variant="error">
  <TriangleAlert aria-hidden="true" />
  Payment failed
</Badge>
```

Avoid:

```tsx
<Badge variant="error" aria-label="Payment failed" />
```

## 10. Status colors are for status

`Badge` is `neutral` by default and `accent` to highlight something. `success`, `error` and
`warning` describe a real state (paid, failed, expiring), never a category or decoration.

Good:

```tsx
<Badge>Draft</Badge>
<Badge variant="accent">New</Badge>
<Badge variant="success">Paid</Badge>
```

Avoid:

```tsx
<Badge variant="success">Marketing</Badge>
<Badge variant="warning">Engineering</Badge>
```

## 11. Fields are filled, with the label above

An `Input` is filled and borderless by design. Do not add a border or a shadow to make it stand
out; give it a visible label above, and put hints and errors as text below it. A hint is
`--pumba-color-text-secondary`; an error message is `--pumba-color-error-text`, in the caption
style.

Good:

```tsx
<label htmlFor="email">Email</label>
<Input id="email" type="email" invalid aria-describedby="email-error" />
<p id="email-error" className="field-error">Enter an email like name@example.com.</p>
```

```css
.field-error {
  color: var(--pumba-color-error-text);
  font-size: var(--pumba-text-caption-font-size);
  line-height: var(--pumba-text-caption-line-height);
}
```

Avoid:

```tsx
<Input placeholder="Email" style={{ border: "1px solid red" }} />
```

## 12. Check both themes

Every page is reviewed in light and dark (`data-theme` on `<html>`). A subtree with its own
`data-theme` sets its own `background` and `color`, and a dialog opened from it receives that
subtree as `container`.

Good:

```tsx
<section data-theme="dark" className="promo" ref={setPromo}>
  <Dialog.Root>
    <Dialog.Trigger><Button>Details</Button></Dialog.Trigger>
    <Dialog.Content container={promo}>…</Dialog.Content>
  </Dialog.Root>
</section>
```

```css
.promo {
  background: var(--pumba-color-background);
  color: var(--pumba-color-text);
}
```

Avoid:

```tsx
<section data-theme="dark">…</section>
```
