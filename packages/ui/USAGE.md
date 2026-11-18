# Using @pumba-ui/ui

A guide for whoever builds an app with Pumba, person or agent. It covers what the types do not
say. For the props of each component, read the type declarations shipped in this package:
`dist/index.d.ts` and `dist/<component>/<component>.d.ts`. For the token names, read
`@pumba-ui/tokens/dist/index.d.ts` (`TokenName`). The full contract is
[`docs/api-conventions.md`](https://github.com/vnloyola/pumba-ui/blob/main/docs/api-conventions.md).

The design rules (which variant, token, spacing or elevation to pick) are in
`skills/pumba-design/SKILL.md`, next to this file, and match the installed version. To register
them as a skill, add `.claude/skills/pumba-design/SKILL.md` to the project with only a pointer, so
it never goes stale:

```markdown
---
name: pumba-design
description: Design rules for building UI with @pumba-ui/ui. Use when creating or reviewing pages, layouts or components that use Pumba.
---

Read `node_modules/@pumba-ui/ui/skills/pumba-design/SKILL.md` and follow it.
```

## Setup

Import the styles once, in the app's entry CSS. They hold the tokens, a minimal base and every
component, and load the Figtree and JetBrains Mono fonts.

```css
@import "@pumba-ui/ui/reset.css"; /* optional; skip it with Tailwind */
@import "@pumba-ui/ui/styles.css";
```

With Tailwind v4, declare the layer order first, before any import:

```css
@layer theme, base, components, pumba, utilities;
@import "tailwindcss";
@import "@pumba-ui/ui/styles.css";
```

Pumba's CSS lives in the layers `pumba.reset, pumba.tokens, pumba.base, pumba.components`. Your
CSS outside any layer always wins over it, without raising specificity.

Pumba does not style the page itself. Give the root its background, text color and font:

```css
body {
  background: var(--pumba-color-background);
  color: var(--pumba-color-text);
  font-family: var(--pumba-text-body-font-family);
  font-size: var(--pumba-text-body-font-size);
  line-height: var(--pumba-text-body-line-height);
}
```

Components render from React Server Components without a wrapper: each component file already
ships `"use client"`.

## Tokens and theme

- Style your own layout with the semantic tokens (`--pumba-color-*`, `--pumba-space-*`,
  `--pumba-radius-*`, `--pumba-shadow-*`, `--pumba-text-*`), never with literal colors, sizes or
  `--pumba-primitive-*` tokens. Primitives are the raw palette and do not change meaning with the
  theme.
- Colors follow the OS. `data-theme="dark"` or `data-theme="light"` on `<html>` forces a theme
  for the page; on any other element it themes only that subtree, which then needs its own
  `background` and `color`.
- To apply a stored theme without a flash, set `data-theme` from a blocking inline script in
  `<head>`, not after React mounts.
- A surface inside a surface follows its corner with `--pumba-radius-control`: the surface radius
  is the control radius plus `--pumba-space-inset`.

## Props every component shares

- Native props: a component accepts everything its element accepts (`Button` takes `type`,
  `form`, `onClick`…). Unknown props reach the element.
- `className` is added to the component's own class, never replaces it. Do not restyle
  `.pumba-*` classes to change a variant: pick the variant.
- `variant` and `size` are string unions written to `data-variant` and `data-size`, default value
  included, so `[data-variant="secondary"]` is a valid selector. The default size is `md`.
- `render` changes the element a component renders and keeps its class, attributes and behavior:
  `<Button render={<a href="/docs" />}>Docs</Button>` is an `<a>` styled as a button. The element
  passed must forward `ref` and spread the props it receives. A Base UI part (`Tabs.Tab`,
  `Dialog.Trigger`, `Dialog.Close`) that renders something other than a `<button>` also needs
  `nativeButton={false}`.
- `ref` is a regular prop.
- A `Button` is as wide as its content only in a row. As a direct child of a grid or a
  column flexbox it stretches, so give it `justify-self: start` (grid) or `align-self: start`
  (flex), or put it in a row.

## Compound components

`Card`, `Tabs` and `Dialog` are objects of parts. Use the parts, in this shape:

```tsx
<Card.Root render={<form onSubmit={save} />}>
  <Card.Header>
    <h2 className="card-title">Project details</h2>
  </Card.Header>
  <Card.Content>…</Card.Content>
  <Card.Footer>
    <Button variant="ghost" type="button" onClick={cancel}>Cancel</Button>
    <Button type="submit">Save</Button>
  </Card.Footer>
</Card.Root>

<Tabs.Root defaultValue="overview">
  <Tabs.List aria-label="Project">
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="settings">Settings</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs.Root>

<Dialog.Root>
  <Dialog.Trigger>
    <Button variant="destructive">Delete project</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Delete project</Dialog.Title>
    <Dialog.Description>This cannot be undone.</Dialog.Description>
    <div className="dialog-actions">
      <Dialog.Close>
        <Button variant="secondary">Cancel</Button>
      </Dialog.Close>
      <Dialog.Close>
        <Button variant="destructive" onClick={deleteProject}>Delete project</Button>
      </Dialog.Close>
    </div>
  </Dialog.Content>
</Dialog.Root>
```

- `Card.Root` stacks its parts with `--pumba-space-stack`, and `Card.Footer` lays out its
  children in a row with `--pumba-space-gap`, so buttons go straight in the footer. `Card.Header`
  has no type style: put your own heading in it. To make the card a form, render the root as one
  (`render={<form />}`) instead of wrapping the parts, so the spacing between parts stays.
- `Tabs.Tab` and `Tabs.Panel` pair by the same string `value`. `Tabs.Root` takes `defaultValue`,
  or `value` with `onValueChange(value)`.
- `Dialog.Root` takes `defaultOpen`, or `open` with `onOpenChange(open)`.
- `Dialog.Trigger` and `Dialog.Close` with a single element child give it their behavior, so a
  `Button` inside them is one `<button>`. Do not nest them in a `Button` or the other way around
  with `render`.
- `Dialog.Content` already renders the portal, the backdrop and the scrolling body, and stacks its
  children in a column. Do not add your own overlay. Put the actions in your own row
  (`display: flex; justify-content: flex-end; gap: var(--pumba-space-gap)`), or each button
  stretches to the dialog's width. The confirming action is a `Button` with its `onClick` inside a
  `Dialog.Close`, so it runs and closes the dialog.
- A `Card.Root` rendered as a link (`render={<a href="…" />}`) is a single link: put no button or
  other link inside it.

## Accessibility you provide

- `Button` with `iconOnly` needs an `aria-label`. Icons next to a text label get
  `aria-hidden="true"`. Pumba exports no icons: use any icon set.
- `Input` always has a visible label (`<label htmlFor>`); a placeholder is not a label. With
  `invalid`, show the error as visible text linked with `aria-describedby`.
- State is never carried by color alone: a `Badge` with `variant="error"` or `"success"` has text
  that names the state, ideally with an icon.
- A `Dialog.Content` has a `Dialog.Title`. Give `Tabs.List` an `aria-label` when nothing else
  names it.
- Use `Button` for actions and a link (`<a>`, or `render={<a />}`) for navigation.

## Layers and stacking

`Dialog.Content` is rendered into `document.body`, outside your app's tree. Two consequences:

- Give the app's root its own stacking context, so the z-index of a sticky header or a sidebar
  stays inside it and the dialog is drawn above:

  ```css
  #root {
    isolation: isolate;
  }
  ```

  A dialog drawn under something is fixed in the app's CSS, never inside the component.
- A dialog opened from a subtree with its own `data-theme` comes out with the page's theme. Pass
  that subtree as `container`: `<Dialog.Content container={element}>`.
