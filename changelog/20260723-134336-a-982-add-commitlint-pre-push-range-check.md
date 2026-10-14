---
title: Add commitlint pre-push range check
release_note:
created_at: "2026-07-23T13:43:36Z"
merged_at: "2026-07-23T14:14:26Z"
branch: a-982-add-commitlint-pre-push-range-check-to-husky-estate-fan-out
pr: 10
commit: 522d01e
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - R-982
stats:
  files_changed: 6
  loc_added: 191
  loc_removed: 4
  commits: 6
version: 1.0.1
---

## Added

- Best-effort `commitlint --from origin/main --to HEAD` check in `.husky/pre-push`
  ([R-982](https://linear.app/rheged-studio/issue/R-982)), alongside the existing yamllint/actionlint steps. Skips with an
  installation hint when `@commitlint/cli` is missing, when `dist/index.js` is absent
  (this repo's config extends the built artefact; run `pnpm build` after clone/clean),
  or when `origin/main` is not a resolvable ref; bypassable with `git push --no-verify`.
  Complements CI's `reusable-validate-commits` gate rather than replacing it.
- Local `commitlint.config.mjs` that extends `./dist/index.js` so this package
  dogfoods its own ruleset (consumers still use `@acme-skunkworks/commitlint-config`).
- `@commitlint/cli` as a devDependency for the local range check.

## Changed

- Documented the pre-push commitlint dogfood path in `CLAUDE.md`.
