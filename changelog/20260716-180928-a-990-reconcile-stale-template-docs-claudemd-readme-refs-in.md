---
title: Reconcile stale template docs in CLAUDE.md
release_note:
created_at: "2026-07-16T18:09:28Z"
merged_at: "2026-07-16T19:13:45Z"
branch: a-990-reconcile-stale-template-docs-claudemd-readme-refs-in
pr: 6
commit: a893a05
author: rob@acmeskunkworks.io
co_authors: []
category: docs
breaking: false
issues:
  - R-990
stats:
  files_changed: 2
  loc_added: 431
  loc_removed: 256
  commits: 3
version: 1.0.1
---

## Changed

- Rewrote `CLAUDE.md` to describe this package — `@acme-skunkworks/commitlint-config`,
  the shared commitlint ruleset — instead of the `npm-package-template` it was spawned
  from ([R-985](https://linear.app/rheged-studio/issue/R-985)). The Repo, Source layout, and Release sections now document the real
  `src/index.ts` ruleset (extends `@commitlint/config-conventional`, overrides
  `type-enum`; [R-823](https://linear.app/rheged-studio/issue/R-823)/[R-979](https://linear.app/rheged-studio/issue/R-979)), and the stale "src is a placeholder never published"
  rationale is gone.
- Removed every dangling `README.md#…` cross-reference. The template-only anchors
  (`#setup`, `#the-npm-release-environment`, `#npm-oidc-trusted-publishing`,
  `#release-orchestrator-onboarding`, `#claude-review-prerequisites`,
  `#the-required-check-ruleset`) have 404'd since [R-979](https://linear.app/rheged-studio/issue/R-979) rewrote the README into a
  package doc; only the live `#usage` / `#allowed-commit-types` links remain.

## Removed

- The template-generation checklist and `initialise-package-repo` walkthrough — that
  setup already ran on this repo ([R-985](https://linear.app/rheged-studio/issue/R-985)) and is not guidance for working here.

Kept the `@AGENTS.md` import and the still-accurate build / lint / test / CI shell
documentation. The Release section is now framed as disabled pending the first publish
([R-986](https://linear.app/rheged-studio/issue/R-986)), with the bootstrap-publish runbook trimmed to the passkey/WebAuthn first-publish
path plus break-glass — the parts that apply because that publish happens in this repo.
