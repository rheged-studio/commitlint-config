---
title: Re-vendor agent-skills v1.13.0 and changelog-core 1.2.0
release_note:
created_at: "2026-10-13T13:45:00Z"
merged_at: "2026-10-13T13:31:12Z"
branch: a-2771-commitlint-config-re-vendor-the-multi-team-skills-and
pr: 49
commit: be97e73
author: rob@rheged.studio
co_authors: []
category: chore
breaking: false
issues:
  - A-2771
  - A-2709
  - A-2684
stats:
  files_changed: 82
  loc_added: 2448
  loc_removed: 872
  commits:
version:
---

## Changed

- Re-vendored the agent-skills v1.13.0 bundles (multi-team Linear skills) into `.claude/skills` and
  `.agents/skills`, refreshing `skills-lock.json` and `.claude/skills.lock`. The repo-local
  `initialise-package-repo` skill is untouched.
- Set `issueKeys` to `["R", "A"]` in the changelog, cleanup-repo, Linear-sync and triage-pr configs
  and in the root `config.json`; recorded the detected review bot checks for `triage-pr`.
- Bumped the `@rheged-studio/changelog-core` devDependency to `^1.2.0`.
