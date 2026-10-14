---
title: Catch up agent-skills shared bundles to HEAD
release_note: ""
version: 1.0.1
created_at: "2026-08-05T13:47:54Z"
merged_at: "2026-08-05T14:04:30Z"
branch: a-1266-catch-up-agent-skills-commitlint-config
pr: 21
commit: "6125782"
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - R-1266
affected_packages:
  - infrastructure
stats:
  files_changed: 75
  loc_added: 2583
  loc_removed: 1032
  commits: 1
---

## Changed

**Re-vendor shared agent-skills to source `main` ([R-1266](https://linear.app/rheged-studio/issue/R-1266))**

- Wipe + re-copy shared skill bundles on `.claude` and `.agents` from `acme-skunkworks/agent-skills`
- Restore per-skill `config.json` ([R-706](https://linear.app/rheged-studio/issue/R-706)) and reconcile via `initialise-skills`
- Land `triage-pr` human-envelope / review-wait / `deferNonBlocking` and `send-it.triage` where those skills are installed
- Preserve repo-local skills; keep Linear identity `Rheged Studio` / `rheged-studio`
