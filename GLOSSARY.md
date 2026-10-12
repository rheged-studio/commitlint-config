# Commitlint Config

The estate's shared commitlint ruleset, published as `@rheged-studio/commitlint-config`. It single-sources what a valid commit message is, so CI and the local hook can never disagree.

## Language

### The package

**Preset**:
The published package itself: a default-exported `UserConfig` that extends `@commitlint/config-conventional` and pins a handful of rules on top.
_Avoid_: Shared config, ruleset package, plugin

**Consumer**:
Any repo or workflow that points its own commitlint config at the preset via `extends`.
_Avoid_: Downstream, client, adopter

**Float on latest**:
The deliberate policy that the commit gate tracks the preset's latest published version rather than a pinned one, so a ruleset change reaches floating consumers on their next run.
_Avoid_: Auto-update, unpinned

### Rules

**Pinned rule**:
A rule the preset sets explicitly (`type-enum`, `header-max-length`, `body-max-line-length`, `footer-max-line-length`) so an upstream change in config-conventional cannot silently move the gate.
_Avoid_: Override, custom rule

**Allowed type**:
One of the eleven Conventional Commit types in `type-enum`: `feat`, `fix`, `perf`, `revert`, `chore`, `docs`, `ci`, `build`, `refactor`, `test`, `style`.
_Avoid_: Commit prefix, commit kind

**Bump signal**:
The release level a commit carries, aligned to release-please: `feat` is minor; `fix`, `perf` and `revert` are patch; every other type cuts no release.
_Avoid_: Release type, version hint

**Breaking marker**:
A `!` after the type or a `BREAKING CHANGE:` footer, which promotes any type to a major bump. `BREAKING CHANGE:` is an upstream token and stays unchanged.
_Avoid_: Breaking flag, major tag

**Header ceiling**:
The `header-max-length` of 72 characters, counting the whole first line (`type(scope): subject`). It is why Dependabot bumps must stay grouped.
_Avoid_: Subject limit, title limit

**Line ceiling**:
The 256-character limit on each body line (`body-max-line-length`) and footer line (`footer-max-line-length`). The footer limit exists so `BREAKING CHANGE:` sentences are not trapped at 100.
_Avoid_: Body limit, wrap limit

**URL exemption**:
The carve-out that lets a line containing an unbreakable `http(s)` URL pass the line ceiling, so Dependabot compare links are accepted.
_Avoid_: Link exception

**Default ignores**:
The commitlint behaviour, inherited from config-conventional, that skips `Merge …`, `Revert …`, `fixup!` and `squash!` messages automatically.
_Avoid_: Skip list, exclusions

### The gate

**Commit gate**:
The two-layer check that every commit on a branch is valid under the preset: the `validate-commits` CI check and the local `pre-push` range check.
_Avoid_: Commit lint, message check

**`validate-commits`**:
The CI layer of the commit gate, the `reusable-validate-commits` workflow, which validates a PR's `base..head` commit range and is the authority.
_Avoid_: Commit CI, commitlint job

**Range check**:
The local layer of the commit gate: `commitlint --from origin/main --to HEAD` run by the husky `pre-push` hook, best-effort and skipped when tooling or `origin/main` is missing.
_Avoid_: Pre-push lint, local commitlint

**Identity denylist**:
A per-author `ignores` entry that would exempt bots from the gate. The preset has none and should not gain one: bots are validated like everyone else.
_Avoid_: Bot exemption, bot ignore
