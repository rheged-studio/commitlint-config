---
title: Enable merge commits in initialise Trunk payload and re-vendor send-it
release_note: ""
created_at: "2026-08-03T21:18:00Z"
merged_at: "2026-08-03T21:03:57Z"
branch: a-1177-enable-estate-merge-commits-keep-squash-allowed-for-release
pr: 17
commit: 69a6a70
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - R-1177
stats:
  files_changed: 15
  loc_added: 266
  loc_removed: 154
  commits: 2
version: 1.0.1
---

## Changed

**Estate merge-commit cutover ([R-1177](https://linear.app/rheged-studio/issue/R-1177))**

- `initialise-package-repo` Trunk payload — `allowed_merge_methods: ["merge","squash"]`
- Re-vendor `send-it` **0.7.0** + refresh `AGENTS.md` (fan-outs paused, [R-809](https://linear.app/rheged-studio/issue/R-809))
