---
description: Open a pull request against dev using the repo's PR template
argument-hint: <card id, e.g. VIT-3, or "none">
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git log:*), Bash(git diff:*), Bash(git rev-parse:*), Bash(gh pr create:*), Bash(gh pr view:*), Read
---

Open a pull request for the current branch. Card: $ARGUMENTS

## Rules

- Everything in the PR (title and body) is written in English.
- Base branch is `dev`. Use `main` only if the current branch is `dev` (a release).
- Never run `git push`. If the branch is not on the remote, stop and give the user the exact
  `git push -u origin <branch>` command.
- Stop if the current branch is `main` or `dev`.
- If no card was given, ask "which card, or `none`?". Do not invent one and do not leave it
  empty. `none` is a valid answer: write `Card: none`.

## Steps

1. Run `git status`, `git branch --show-current`, and check the branch exists on the remote
   (`git rev-parse --abbrev-ref @{upstream}`).
2. Read the commits and the diff against the base: `git log dev..HEAD --oneline` and
   `git diff dev...HEAD --stat`, then read the relevant changes.
3. Read `.github/pull_request_template.md` and fill in every section:
   - **Card:** `Card: <card id>` or `Card: none`.
   - **Summary / Changes:** what the diff actually contains, not what was planned.
   - **How it was tested:** only what was really run in this session. If nothing was run,
     say so.
   - **Not tested:** anything not verified. Write "Nothing" only if that is true.
   - **Checklist:** tick only what was verified.
4. Title format: Conventional Commits, `type(scope): description`. Types are `feat`, `fix`,
   `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`, `style` and `revert`; the scope is
   optional. An accessibility change is `fix(a11y)` or `feat(a11y)`, and a change that breaks the
   public API adds `!` after the type. Lowercase description, imperative, no card id in the
   title. CI rejects a title that does not follow this (`commitlint.config.mjs`).
5. Show the title and body to the user and wait for a clear yes.
6. Run `gh pr create --base dev --title "<title>" --body "<body>"` and print the PR URL.
