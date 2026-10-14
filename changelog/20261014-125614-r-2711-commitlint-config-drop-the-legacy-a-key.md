---
title: Drop the legacy A issue key from skill configs
release_note:
created_at: "2026-10-14T12:56:14Z"
merged_at: "2026-10-14T12:57:33Z"
branch: r-2711-commitlint-config-drop-the-legacy-a-key
pr: 54
commit: bb8ed85
author: rob@rheged.studio
co_authors: []
category: chore
breaking: false
issues:
  - R-2711
stats:
  files_changed: 10
  loc_added: 36
  loc_removed: 9
  commits:
version:
---

## Changed

- Set `issueKeys` to `["R"]` in the changelog, cleanup-repo, Linear-sync and triage-pr configs
  (both `.claude/skills` and `.agents/skills`) and in the root `config.json`. Linear renamed the
  team key A to R on 2026-10-13 and no `a-` branches or PRs remain open.
