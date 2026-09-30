# @rheged-studio/commitlint-config

Shared [commitlint](https://commitlint.js.org) configuration for Rheged Studio packages.

It **single-sources** the estate's allowed [Conventional Commit](https://www.conventionalcommits.org) types into one published package, consumed by both layers of the commit gate so the ruleset can never drift between them:

- the reusable CI workflow (`reusable-validate-commits.yml`) that validates a PR's `base..head` commit range, and
- the local husky `pre-push` hook that runs the same range check before a push ever reaches CI.

It extends [`@commitlint/config-conventional`](https://www.npmjs.com/package/@commitlint/config-conventional) and pins `type-enum` plus the estate's length rules (`header-max-length` 72, `body-max-line-length` 256, `footer-max-line-length` 256). Everything else is inherited.

## Install

```sh
pnpm add -D @rheged-studio/commitlint-config @commitlint/cli
```

`@commitlint/config-conventional` is a runtime dependency of this package, so installing this config pulls it in automatically — you do not need to add it yourself.

## Usage

Point your commitlint config at this package:

```js
// commitlint.config.mjs
export default {
  extends: ["@rheged-studio/commitlint-config"],
};
```

The example uses `.mjs` so the `export default` works regardless of the consuming project's module type. In an ESM project (`"type": "module"`) a plain `commitlint.config.js` works too; in a CommonJS project use `.mjs` (as above) or `module.exports` in a `.js`/`.cjs` file.

Then validate a commit-message range — exactly what the CI workflow and the pre-push hook do:

```sh
# lint every commit on the branch that isn't on the base
pnpm exec commitlint --from "origin/main" --to "HEAD"
```

## Allowed commit types

The `type-enum` rule is set explicitly and is aligned to the estate's release-please bump rules:

| Type       | Release bump | Notes                                  |
| ---------- | ------------ | -------------------------------------- |
| `feat`     | minor        | A new feature                          |
| `fix`      | patch        | A bug fix                              |
| `perf`     | patch        | A performance improvement              |
| `revert`   | patch        | Reverts a previous commit              |
| `chore`    | none         | Tooling / housekeeping                 |
| `docs`     | none         | Documentation only                     |
| `ci`       | none         | CI configuration and pipelines         |
| `build`    | none         | Build system or external dependencies  |
| `refactor` | none         | Neither fixes a bug nor adds a feature |
| `test`     | none         | Adding or correcting tests             |
| `style`    | none         | Formatting; no code-behaviour change   |

A `!` marker or a `BREAKING CHANGE:` footer promotes any type to a **major** bump.

Length rules are pinned explicitly ([A-1413](https://linear.app/rheged-studio/issue/A-1413)) so an upstream change to config-conventional's 100-character defaults cannot silently move the gate:

- `header-max-length` — **72** (error). Counts the whole first line (`type(scope): subject`). Git's usual subject ceiling.
- `body-max-line-length` — **256** (error).
- `footer-max-line-length` — **256** (error), so `BREAKING CHANGE:` sentences are not left trapped at 100.

URL lines remain exempt (`/\bhttps?:\/\/\S+/`). Everything else is inherited from `@commitlint/config-conventional` unchanged, including:

- a non-empty commit type and subject, and
- `defaultIgnores` — merge (`Merge …`), revert (`Revert …`), `fixup!` and `squash!` messages are skipped automatically, so this config never needs to blanket-ignore them by author identity.

## Bot-authored commits

**There is no identity denylist.** Bots are validated exactly like everyone else — the config has no `ignores` entry, and none should be added. Every automated commit producer in the estate already emits a Conventional subject, verified against this ruleset:

| Producer                        | Subject                                           |
| ------------------------------- | ------------------------------------------------- |
| Dependabot (`github-actions`)   | `ci(deps): bump the actions group with 3 updates` |
| Dependabot (npm)                | `chore(deps): …` / `chore(deps-dev): …`           |
| release-please                  | `chore: release main`                             |
| `reusable-changelog-enrich.yml` | `chore(changelog): enrich post-merge metadata`    |

Dependabot's subjects come from a `commit-message` template in each repo's `.github/dependabot.yml`, which sets `prefix` (plus `prefix-development` for the npm ecosystem) and `include: scope`. Without that template Dependabot falls back to inferring a prefix from recent commit history — which may yield a Conventional subject, but is not guaranteed to, and can leave a bare `Bump …` that would fail the gate. The explicit template is what makes the output deterministic, which is why it is a prerequisite for making the gate a required check rather than an optional nicety ([A-980](https://linear.app/rheged-studio/issue/A-980)).

The length pins are the real ceiling when reading a bot commit:

- **`header-max-length` (72) is the subject ceiling.** This is why Dependabot bumps stay grouped — a grouped subject stays short (`bump the actions group with 3 updates`), whereas an ungrouped multi-package subject can run past 72 characters and fail. An ungrouped `@rheged-studio/markdownlint-config` bump sits at exactly 72.
- **`body-max-line-length` and `footer-max-line-length` (256) ignore unbreakable lines.** Dependabot bodies contain compare URLs well over 256 characters; those pass, because the rule only trips on over-long lines that could have been wrapped (`/\bhttps?:\/\/\S+/`). A wrapable prose line still fails above 256.

Should a bot ever need an exception, prefer fixing its commit template. A per-identity `ignores` entry is a documented last resort, not a first move.

## Versioning: float on latest

The gate is designed to track this config's **latest published version** rather than pinning it, mirroring how the estate floats on its shared GitHub workflows (`@v1`). The reusable CI workflow installs the config fresh on each run, so a caret range with no committed lockfile resolves to the latest published version — a ruleset change reaches the gate on its next run, with no per-repo bump PR.

Where a consumer instead commits a lockfile (for example the local pre-push hook running in a repo that pins its dev-dependencies), the resolved version stays put until it is updated: the package is Dependabot-versioned like the estate's other shared packages, so those consumers get update PRs. The trade-off is deliberate — because a ruleset change reaches the floating consumers immediately, edits must be made carefully.

## Development

```sh
pnpm install
pnpm build   # tsc → dist/ (the published artifact)
pnpm test    # vitest — behavioural tests over the resolved ruleset
pnpm tsc     # type-check
pnpm lint    # eslint
```

The ruleset itself is `src/index.ts`; `src/index.test.ts` exercises the _effective_ config by resolving `extends` through `@commitlint/load` and linting sample messages with `@commitlint/lint`.

## Licence

MIT
