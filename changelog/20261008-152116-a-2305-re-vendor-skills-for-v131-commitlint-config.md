---
title: Re-vendor skills for mattpocock/skills 1.3.1
release_note:
created_at: "2026-10-08T15:21:16Z"
merged_at:
branch: a-2305-re-vendor-skills-for-v131-commitlint-config
pr:
commit:
category: chore
breaking: false
issues:
  - A-2305
stats: {}
version:
---

## Changed

- Re-vendored the Rheged ship set and Matt Pocock catalogue bundles to
  mattpocock/skills 1.3.1, refreshing `skills-lock.json` and both agent mirrors.
- Added `implement-spec`, `retro`, and Rheged `pr`; removed upstream-dropped
  `resolving-merge-conflicts`; kept repo-local `initialise-package-repo`.
- Set `triage-pr` to unattended Phase B defaults (`humanEnvelope: false`,
  `followUpLabel: follow-up`, `followUpProject: Follow-up issues`).
