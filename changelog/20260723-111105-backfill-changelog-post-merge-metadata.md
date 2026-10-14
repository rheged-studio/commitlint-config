---
title: Backfill post-merge metadata for the 1.0.0 changelog backlog
release_note:
created_at: "2026-07-23T11:11:05Z"
merged_at: "2026-07-23T11:21:55Z"
branch: backfill-changelog-post-merge-metadata
pr: 9
commit: 7e8f1f9
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues: []
stats:
  files_changed: 5
  loc_added: 58
  loc_removed: 28
  commits: 3
version: 1.0.1
---

## Changed

- Backfilled the post-merge metadata (`merged_at`, `pr`, `commit`, `stats`) on the
  four dated changelog entries for PRs #3, #4, #6 and #8. Those entries predate the
  release pipeline being enabled ([R-988](https://linear.app/rheged-studio/issue/R-988)),
  so the post-merge enricher never ran, and the fields were left blank — this restores
  the backlog to a complete record. Values were filled from each merged PR's own facts
  via the changelog skill's enrichment logic; `version` is intentionally left unstamped
  (it is owned by release-please and filled at release time), and each entry's original
  frontmatter formatting is preserved so only the blank fields change.
