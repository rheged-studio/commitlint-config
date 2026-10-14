---
title: Add npm ecosystem to Dependabot with Conventional commit prefixes
release_note:
created_at: "2026-07-28T15:09:05Z"
merged_at: "2026-07-28T16:05:51Z"
branch: a-980-dependabot-conventional-commit-templates
pr: 11
commit: 1f1905c
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - R-980
stats:
  files_changed: 4
  loc_added: 97
  loc_removed: 1
  commits: 4
version: 1.0.1
---

## Added

- An `npm` package ecosystem in `.github/dependabot.yml`
  ([R-980](https://linear.app/rheged-studio/issue/R-980)), grouped weekly so one lockfile
  churn lands or reverts atomically. Its `commit-message` template sets `prefix`,
  `prefix-development` and `include: scope`, so bumps read `chore(deps): …` and
  `chore(deps-dev): …`. Setting both prefixes matters: `prefix` alone leaves
  development-dependency bumps on Dependabot's own default subject, which is not
  Conventional and would fail the gate once it becomes a required check ([R-983](https://linear.app/rheged-studio/issue/R-983)).
- A "Bot-authored commits" section in the README recording every automated commit
  producer and its subject, and stating that bots are validated like everyone else —
  there is **no identity denylist**, and a per-identity `ignores` entry is a documented
  last resort rather than a first move.

## Changed

- Threaded the no-identity-denylist point through `CLAUDE.md`, pointing at the new README
  section before anyone reaches for an `ignores` entry.

## Notes

- The existing `github-actions` ecosystem is deliberately **unchanged**: its `prefix: "ci"`
  already produces `ci(deps): …`, which is Conventional, semantically accurate for workflow
  bumps, and consistent across the estate. `chore` is reserved for the npm ecosystem so the
  two remain distinguishable; both are no-release types, so neither cuts a version alone.
- Verified against this repo's own ruleset rather than assumed: the real historical
  Dependabot, release-please (`chore: release main`) and changelog-enrich
  (`chore(changelog): …`) commits all pass. The one genuine ceiling is `header-max-length`
  (100), which is why bumps stay grouped; `body-max-line-length` ignores unbreakable lines,
  so Dependabot's long compare URLs do not trip it.
