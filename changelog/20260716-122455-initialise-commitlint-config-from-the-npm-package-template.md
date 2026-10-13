---
title: Initialise commitlint-config from the npm package template
release_note:
created_at: "2026-07-16T12:24:55Z"
merged_at: "2026-07-16T13:15:15Z"
branch: a-985-initialise-commitlint-config-repo-from-the-npm-package
pr: 3
commit: d74a5e7
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - R-985
stats:
  files_changed: 75
  loc_added: 1146
  loc_removed: 832
  commits: 4
version: 1.0.1
---

## Changed

- Reset `changelog/` to just its `README.md`, dropping the 16 dated entries
  copied from `npm-package-template` so the post-merge enricher cannot stamp
  this package's first version onto the template's own history.
- Rewrote the `package.json` identity to `@acme-skunkworks/commitlint-config`
  with a real description, keywords, and repository/homepage/bugs URLs. The
  build, script, and dependency shell is unchanged, and `src/` still ships the
  template placeholder until the real commitlint config is authored.
- Pulled the locked shared agent-skills set into both the Claude Code and
  Cursor trees, generated each skill's resolved `config.json` from this repo's
  own facts (issue key `A`, base branch `main`, Linear team ACME Skunkworks,
  workspace `acme-skunkworks`), and recorded the versions in
  `.claude/skills.lock`.
- Applied the GitHub settings that "Use this template" does not copy: the
  `main`-restricted `npm-release` environment, the `GO/NO GO` required-check
  ruleset, and the `Trunk` changelog bypass for `road-runner-bot`.
