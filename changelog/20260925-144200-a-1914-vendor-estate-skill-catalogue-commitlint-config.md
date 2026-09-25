---
title: Vendor estate skill catalogue (A-1914)
release_note: ""
version:
created_at: "2026-09-25T14:42:00Z"
merged_at:
branch: a-1914-vendor-estate-skill-catalogue-commitlint-config
pr:
commit:
author:
co_authors: []
category: chore
breaking: false
issues:
  - A-1914
affected_packages:
  - infrastructure
stats:
  files_changed:
  loc_added:
  loc_removed:
---

## Changed

**Vendor Rheged + Matt Pocock estate catalogue ([A-1914](https://linear.app/rheged-studio/issue/A-1914))**

- Install the full estate skill catalogue via `rheged-skills-setup --install --write` (Rheged ship set + Matt Pocock packs) into `.claude/skills/` and `.agents/skills/`
- Retire legacy `initialise-skills` (bundles and command shim); reconcile configs from HEAD ([A-706](https://linear.app/rheged-studio/issue/A-706))
- Preserve disk-only `initialise-package-repo`; refresh `.claude/skills.lock` and `skills-lock.json`
- Linear identity unchanged: Rheged Studio / `rheged-studio` / issue key `A`
