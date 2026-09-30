---
title: Vendor send-it 0.9.1 and commit 0.2.0
release_note: ""
created_at: "2026-09-30T15:16:00Z"
branch: a-2069-fan-out-72-char-commit-headers-commitlint-config
author: rob@rheged.studio
co_authors: []
category: chore
breaking: false
issues:
  - A-2069
merged_at: "2026-09-30T16:16:21Z"
commit: 1715d0d
pr: 45
stats:
  loc_added: 119
  loc_removed: 26
  files_changed: 14
---

## Changed

**Mechanical skills re-vendor for 72-character commit headers ([A-2069](https://linear.app/rheged-studio/issue/A-2069), parent [A-2059](https://linear.app/rheged-studio/issue/A-2059))**

- Re-copy `send-it` 0.8.2 → 0.9.1 and `commit` 0.1.3 → 0.2.0 from `rheged-studio/agent-skills` `main` on `.claude` and `.agents` mirrors
- Restore per-skill `config.json` after `--copy` (A-706); `triage-pr` untouched
