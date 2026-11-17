# pumba

Accessible React components, design tokens and light/dark themes, published as
`@pumba-ui/tokens` and `@pumba-ui/ui`.

## Releases

Releases are automatic and follow the commit messages.

1. Open a PR into `dev` with a [Conventional Commits](https://www.conventionalcommits.org)
   title, such as `feat(button): add a loading state`. The squash merge uses the title as the
   commit message.
2. Release by merging `dev` into `main` with a merge commit, never a rebase.
3. The release workflow runs semantic-release on `main`: it calculates the next version,
   publishes both packages to npm with provenance, and creates the `vX.Y.Z` tag and the GitHub
   release with its notes.

Both packages share one version. While it is 0.x, `feat` and breaking changes (`!` or a
`BREAKING CHANGE:` footer) bump minor and `fix` bumps patch. A merge with only `chore`, `docs`,
`ci` and similar types publishes nothing. Older commits typed `feature` count as `feat`.

semantic-release starts at 1.0.0 when there is no previous tag, so before the first release the
workflow tags the root commit as `v0.0.0` and the first published version is `0.1.0`.

To see what a release would do, run `pnpm exec semantic-release --dry-run --no-ci` from `main`.
