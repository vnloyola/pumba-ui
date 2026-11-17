---
description: Build a new @pumba-ui/ui component following the repo's conventions
argument-hint: <ComponentName> [card id]
---

Build the component `$ARGUMENTS` in `packages/ui`. The contract is `docs/api-conventions.md`;
read the sections named below instead of relying on memory, and do not copy them anywhere.

## Before writing code

1. Read the card, if one was given, and sections 3 to 7 of `docs/api-conventions.md`.
2. Decide what the card leaves open and the conventions do not settle: native element or Base UI
   (section 7), simple or compound (section 6), which variants and sizes a consumer actually
   needs. If a decision is missing from the conventions, ask the user before deciding.
3. Check which semantic tokens it needs. A new token is a minor change in `@pumba-ui/tokens` and
   must keep the contrast test passing.

## Build

1. `pnpm add:component <Name>` creates the folder, the export and the stylesheet import. It only
   generates a simple component; write the parts of a compound one by hand in the same file, with
   the `index.ts` object of section 6 ("Server Components").
2. Props, `className`, `render`, `data-variant` / `data-size` and states: sections 3, 4, 5, 9
   and 10. No Base UI type in a public signature.
3. CSS: semantic tokens only, `.pumba-*` classes and `data-*` attributes (sections 9, 10, 12).
   Icons only through `src/icons.ts`.
4. Tests: the five checks of section 17, plus a story `play` function for keyboard behavior that
   jsdom cannot run.
5. Stories: section 18, with `Button` and `Card` as the reference, including the `...Dark` story.

## Record and check

1. Write the decisions of step 2 in `docs/api-conventions.md`, in the component's subsection with
   its **Why**.
2. If the consumer needs to know something the types do not say (composition, accessibility it
   provides, stacking), update `packages/ui/USAGE.md`. If it brings a design rule an agent would
   get wrong, add it to `skills/pumba-design/SKILL.md` with Good and Avoid.
3. Run `pnpm lint && pnpm build && pnpm typecheck && pnpm test` and
   `pnpm --filter @pumba-ui/ui check:package`. New stories change the visual baselines: the PR
   needs the `update-visual-baselines` label.
4. Scan the diff for comment lines and for work outside the card. The PR title is
   `feat(<name>): add the <name> component`. Report what was and was not verified.
