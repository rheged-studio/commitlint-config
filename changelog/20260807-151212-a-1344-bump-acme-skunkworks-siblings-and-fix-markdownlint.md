---
title: Bump @acme-skunkworks siblings and fix markdownlint 3.x fallout
release_note: ""
created_at: "2026-08-07T15:12:12Z"
merged_at: "2026-08-11T13:04:01Z"
branch: a-1344-commitlint-config-bump-acme-skunkworks-devdeps-and-fix-lint
pr: 26
commit: e76407b
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - R-1344
stats:
  files_changed: 7
  loc_added: 65
  loc_removed: 22
  commits: 2
version: 1.0.2
---

## Changed

**Bump sibling `@acme-skunkworks/*` devDeps and adapt to markdownlint-config 3.x ([R-1344](https://linear.app/rheged-studio/issue/R-1344))**

- Raise `@acme-skunkworks/changelog-core` to `^1.1.1`, `@acme-skunkworks/eslint-config` to `^1.1.3`, and `@acme-skunkworks/markdownlint-config` to `^3.0.0` (leave self at 1.0.1)
- Exclude vendored skill trees and fan-out `AGENTS.md` from markdownlint (cli2 config, `lint:md` scripts, CI `markdown-globs`)
- Fix first-party MD040/MD044 findings in `infrastructure/README.md` and `README.md`
