---
title: Pin header-max-length 72 and body/footer line length 256
release_note: The shared commitlint gate now errors at header 72 and body/footer line length 256.
created_at: "2026-09-30T13:22:35Z"
merged_at: "2026-09-30T16:32:09Z"
branch: a-1413-pin-header-max-length-72-and-bodyfooter-line-length-256
pr: 44
commit: ce6e46d
author: rob@rheged.studio
co_authors: []
category: feature
breaking: true
issues:
  - A-1413
stats:
  files_changed: 5
  loc_added: 190
  loc_removed: 22
  commits:
---

## Breaking

`header-max-length` is now **72** (was 100, inherited). `body-max-line-length` and
`footer-max-line-length` are now **256** (were 100). CI installs this package
unpinned, so the required commits check flips on publish of 2.0.0.

Keep Conventional subjects at or under 72 characters (the whole first line:
`type(scope): subject`). Wrap or shorten wrapable prose so body and footer lines
stay at or under 256. URL lines remain exempt (`/\bhttps?:\/\/\S+/`). There is
no identity denylist.

Merge of this change waits on [A-2055](https://linear.app/rheged-studio/issue/A-2055) (and its skill fan-out) so authors already
emit short subjects before the gate tightens.

## Changed

- Pin `header-max-length` 72, `body-max-line-length` 256, and
  `footer-max-line-length` 256 in `src/index.ts` alongside the existing
  `type-enum` pin ([A-1413](https://linear.app/rheged-studio/issue/A-1413)).
- Extend the colocated behavioural tests with independent number pins, 72/73
  header, 256/257 body and footer, URL exemption, and the 174-character Tempest
  trial body.
- Rewrite the README bot-authored-commits section and the CLAUDE.md ruleset
  blurb so they describe the pinned lengths rather than "only `type-enum`".
