---
title: Sweep Linear issue references to R and C keys
release_note:
created_at: "2026-10-13T20:32:02Z"
merged_at:
branch: r-2710-commitlint-config-sweep-issue-references
pr:
commit:
author: rob@rheged.studio
co_authors: []
category: chore
breaking: false
issues:
  - R-2710
stats:
  files_changed:
  loc_added:
  loc_removed:
  commits:
version:
---

## Changed

- Rewrote 252 legacy Linear issue references (`A-`, `SK-`, `ASW-`, `AKW-`, `WTF-`) across 55 files to the new `R-` and `C-` keys, using the committed `linear-migrate` mapping ([R-2710](https://linear.app/rheged-studio/issue/R-2710)). The sweep raised no flags and left no unmapped IDs.
- Reformatted one line in `infrastructure/tests/initialise-package-repo-files.test.mjs` to satisfy Prettier after the shorter IDs.
- Left `branch:` lines, changelog file names and vendored skill bundles verbatim, by design.
