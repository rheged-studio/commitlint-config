---
title: Remove Dependabot configuration
release_note:
created_at: "2026-11-18T11:19:31Z"
merged_at: "2026-11-18T11:51:56Z"
branch: disable-dependabot
pr: 57
commit: 505bd80
author: rob@rheged.studio
co_authors: []
category: chore
breaking: false
issues: []
stats:
  files_changed: 5
  loc_added: 42
  loc_removed: 51
  commits:
version:
---

## Removed

- Delete `.github/dependabot.yml`: Dependabot is switched off across the estate.

## Changed

- Update the README, `CLAUDE.md` and glossary so they no longer describe this repo's Dependabot
  commit-message template or Dependabot-driven update PRs.
