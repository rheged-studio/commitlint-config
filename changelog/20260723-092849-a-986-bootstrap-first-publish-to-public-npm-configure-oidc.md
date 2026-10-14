---
title: Bootstrap first publish to public npm at 1.0.0
release_note: First public release of @acme-skunkworks/commitlint-config on npm.
created_at: "2026-07-23T09:28:49Z"
merged_at: "2026-07-23T09:53:01Z"
branch: a-986-bootstrap-first-publish-to-public-npm-configure-oidc-trusted
pr: 8
commit: 6bb3451
author: rob@acmeskunkworks.io
co_authors: []
category: chore
breaking: false
issues:
  - R-986
stats:
  files_changed: 3
  loc_added: 40
  loc_removed: 3
  commits: 2
version: 1.0.1
---

## Changed

- Seeded `package.json` and `.release-please-manifest.json` at `1.0.0`, the initial
  published version for the bootstrap first publish to public npm
  ([R-986](https://linear.app/rheged-studio/issue/R-986)). The `1.0.0` tarball was
  published manually via the passkey/WebAuthn browser flow — npm has no
  pending-Trusted-Publisher flow and enforces interactive 2FA on the first publish of a
  new package, so publish #1 cannot go through CI. Seeding the manifest hands bump
  control to release-please from the next release onward.
- Normalised `repository.url` to the `git+https://` form, clearing the
  `npm warn publish "repository.url" was normalized` warning that surfaced on every
  publish.

This is a `chore` (no release): the `1.0.0` release itself was cut by the manual publish,
so the PR title must not signal release-please to bump on top of the version already live
on npm. From publish #2, releases flow through CI via OIDC Trusted Publishing once the
Trusted Publisher is configured and the Release workflow is enabled.
