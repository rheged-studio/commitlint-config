/* eslint-disable canonical/filename-match-exported --
   commitlint resolves a shareable config from its module's *default* export, so
   the entry must stay `src/index.ts`; its filename cannot match the exported
   identifier. Mirrors how `@rheged-studio/eslint-config` disables this rule. */
import type { UserConfig } from "@commitlint/types";

/**
 * `@rheged-studio/commitlint-config` — the estate's shared commitlint ruleset.
 *
 * It single-sources the allowed Conventional-Commit types into one published
 * package so that both consumers of the commit gate — the reusable CI workflow
 * (`reusable-validate-commits.yml`) and the local husky `pre-push` range check —
 * float on the *same* list with zero drift (A-823 / A-979).
 *
 * The config extends `@commitlint/config-conventional` and retains its
 * non-empty type/subject defaults plus `defaultIgnores` for `Merge …` /
 * `Revert …` / `fixup!` / `squash!` messages. It pins four rules explicitly so
 * an upstream change cannot silently move the estate's gate:
 *
 * - `type-enum` — the estate's release-aligned types (A-823 / A-979).
 * - `header-max-length` — 72 (Git's usual subject ceiling; A-1413).
 * - `body-max-line-length` — 256 (A-1413).
 * - `footer-max-line-length` — 256, so `BREAKING CHANGE:` sentences are not
 *   left trapped at config-conventional's 100 (A-1413).
 *
 * URL lines remain exempt via `@commitlint/ensure` (`/\bhttps?:\/\/\S+/`).
 * There is no identity denylist.
 *
 * `type-enum` is set *explicitly* — even though the list currently mirrors
 * config-conventional's own default — so that an upstream change to
 * config-conventional's default type set can never silently move the estate's
 * gate. The list is aligned to the release-please bump rules: `feat` → minor;
 * `fix`/`perf`/`revert` → patch; the remaining types cut no release.
 */
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [2, "always", 256],
    "footer-max-line-length": [2, "always", 256],
    "header-max-length": [2, "always", 72],
    "type-enum": [
      2, // error
      "always",
      [
        "feat",
        "fix",
        "perf",
        "revert",
        "chore",
        "docs",
        "ci",
        "build",
        "refactor",
        "test",
        "style",
      ],
    ],
  },
};

export default config;
