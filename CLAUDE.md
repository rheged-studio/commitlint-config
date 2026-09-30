# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Claude Code reads only `CLAUDE.md`, so the `@AGENTS.md` line below imports the canonical shared
block (which Cursor reads from `AGENTS.md` natively). Estate-wide guidance lives there;
repo-specific guidance follows below.

@AGENTS.md

## Repo

`@rheged-studio/commitlint-config` — the estate's shared [commitlint](https://commitlint.js.org)
ruleset. `src/index.ts` default-exports a `UserConfig` that `extends`
`@commitlint/config-conventional` (retaining its non-empty type/subject and `defaultIgnores`
behaviour for `Merge …`/`Revert …`/`fixup!`/`squash!`) and pins `type-enum` plus the estate's
length rules: `header-max-length` 72, `body-max-line-length` 256, `footer-max-line-length` 256
(A-1413). The allowed types are `feat, fix, perf, revert, chore, docs, ci, build, refactor,
test, style`. `type-enum` is set explicitly — even though it currently mirrors
config-conventional's default — so an upstream change can't silently move the estate's commit gate,
and it is kept aligned to the release-please bump rules (`feat` → minor; `fix`/`perf`/`revert` →
patch; the rest → no release). See A-823 / A-979 / A-1413 for the rationale. Consumers install it
and point their own `commitlint.config` at it (see the [README](README.md#usage) for the
consumer-facing usage and [allowed types](README.md#allowed-commit-types)).

Bots are validated like everyone else — there is **no identity denylist**, and none should be added.
Every automated producer (Dependabot, release-please, `reusable-changelog-enrich.yml`) already emits
a Conventional subject; Dependabot's comes from the `commit-message` template in each repo's
`.github/dependabot.yml`, which this repo also carries. See A-980 and
[README](README.md#bot-authored-commits) before adding any `ignores` entry.

This repo was spawned from `npm-package-template` (A-985) and inherits its build/lint/test/release
shell; the sections below describe that shell as it actually applies to **this package**.

## Decisions live in Linear, not ADRs

Architectural and process decisions are recorded as **Linear issues**, not in-repo ADR files. The
issue IDs threaded through this document and the code comments (e.g. `A-823`, `A-979`, `A-326`,
`A-447`, `A-639`) are the durable decision record: follow the ID to Linear for the full rationale.
Capture new decisions as Linear issues and reference their IDs in commits, PR bodies, and comments
rather than adding a `docs/adr/` tree. This package's work is catalogued in the **Commitlint**
project in Linear (team **Rheged Studio**).

## Package manager and Node

pnpm, pinned via `packageManager` in `package.json` (`pnpm@10.33.0`). Node 22 required (`.nvmrc`,
`engines.node: ">=22"`, `engine-strict=true` in `.npmrc`).

## Commands

```bash
pnpm install        # install deps (runs prepare → husky hook install)
pnpm run build      # tsc → dist/ (the published artifact; consumers import from dist)
pnpm tsc            # type-check only — src/ (no emit) + tooling/tests via tsconfig.tools.json
pnpm lint           # eslint over src/**/*.ts
pnpm lint:fix       # auto-fix
pnpm lint:md        # markdownlint (CI: lint reusable caller)
pnpm lint:yaml      # yamllint . (semantic YAML check; warnings non-blocking)
pnpm lint:workflows # actionlint on .github/workflows/
pnpm lint:sh        # shellcheck on infrastructure/scripts/*.sh + .husky/*
pnpm test           # vitest run (src/**/*.test.ts + infrastructure/tests/**)
pnpm test:watch     # vitest in watch mode
pnpm test:sh        # bats on infrastructure/tests/*.bats
pnpm validate:changelog # schema-check changelog/*.md via changelog-core (CI: lint reusable caller)
pnpm format         # prettier write
pnpm clean          # remove node_modules + dist
```

`act:*` (local workflow runs) and `ci:*` (post-push run triage) are convenience wrappers — see
"Validating workflows locally with `act`" and the note at the end of that section.

## Agent skills

This repo adopts the shared `@rheged-studio/agent-skills` bundles, installed via
[skills.sh](https://skills.sh) under `.claude/skills/` (mirrored to `.agents/skills/` for Cursor).
The installed skills are:

- **`/send-it`** — the all-in-one finisher: commits uncommitted work as atomic Conventional Commits,
  runs the change-gated lint preflight, writes a dated `changelog/` entry (for **every** PR — "record
  everything, filter later"; non-release entries stay version-less), composes the Conventional
  Commits PR title, pushes, opens or updates a draft PR, and moves linked Linear issues to In Review.
  Prefer it over hand-rolled `git commit` + `git push` + `gh pr create`.
- **`/preflight`** — the change-gated, branch-scoped lint preflight (delegated to by `/send-it`).
- **`/changelog`** — authors, refreshes, or repairs the dated `changelog/` entry for the current
  branch (delegated to by `/send-it`).
- **`/linear-sync`** — transitions the Linear issue(s) linked to the current branch to a target
  workflow state.
- **`/cleanup-repo`** — prunes merged Git branches and worktrees, then clears filesystem cruft,
  behind a single confirmation gate.
- **`/triage-pr`** — drives a PR from draft-with-failing-CI to merge-ready.

`/send-it` decides release-type by the change's **semantic category** (the Conventional-Commit type
of the work it commits), not by which paths the diff touches; `/preflight` blocks on errors only by
default; `/changelog` add-links is branch-scoped by default.

> A repo-local `/initialise-package-repo` skill still sits under `.claude/skills/` (plus its
> `infrastructure/tests/initialise-package-repo-*.test.mjs`). It is leftover template scaffolding for
> spawning **new** repos from the template — it already ran on this repo (A-985) and plays no part in
> this package's ongoing workflow.

## Source layout

TypeScript source lives under `src/`, compiled by `tsc` to `dist/` (declarations + source maps).
`src/index.ts` is the published entry point (the ruleset itself); `src/index.test.ts` is its
colocated behavioural test. Only `dist/` is published (`files: ["dist"]`); `exports`/`main`/`module`/
`types` all point into it. The workflow/release shell — `.github/`, `infrastructure/`, `.husky/`,
`changelog/`, `release-please-config.json`, `.release-please-manifest.json` — is **not** part of the
published artifact.

The ruleset test resolves the **effective** config via `@commitlint/load` and lints sample messages
via `@commitlint/lint`, so it asserts real commitlint behaviour (each allowed type accepted, `wip:`
rejected, `subject-empty` still enforced, `defaultIgnores` honoured, header 72 / body and footer 256
pinned independently, URL lines exempt) rather than just the config object's shape.

## Build / type-check / lint topology

The published `dist/` must contain **only** the compiled `src/`, but the tooling and tests still need
type-checking and type-aware linting. Three tsconfigs keep those concerns separate:

- **`tsconfig.json`** — the build config. `rootDir: ./src`, `include: ["src/**/*.ts"]` (excludes
  `**/*.test.ts`), emits to `dist/`. `pnpm build` (`tsc`) uses it, so `dist/` stays src-only. Do
  **not** widen its `include` to "fix" linting — that re-emits tooling/tests into `dist/`.
- **`tsconfig.tools.json`** — `noEmit`, `extends ./tsconfig.json`, covers `eslint.config.ts`,
  `src/**/*.test.ts`, `infrastructure/scripts/**`, `infrastructure/tests/**`, `vitest.config.ts`.
  `pnpm tsc` runs it as a second pass to type-check the tooling, tests, and the ESLint config.
- **`tsconfig.eslint.json`** — `noEmit`, the linter's project. Spans `src/**` + the infra `.ts`.
  `eslint.config.ts` pins `parserOptions.project` to it so the base preset's type-aware rules
  (`project: true`) resolve every linted file regardless of directory. Without this pin ESLint would
  fail with "file not found by the project service" on infra files (they aren't in the src-only
  `tsconfig.json`).

`extends` merges `compilerOptions`, but a child's `include`/`exclude` **replace** the base's rather
than merging — so the two extra configs restate their own `include`/`exclude`.

## Linting and formatting

This package dogfoods the org's own shared configs:

- **ESLint** — `eslint.config.ts` consumes `@rheged-studio/eslint-config`, composing the `base`
  stack plus the `typescript` overrides, then adds two local blocks: an `infrastructure/**/*.{ts,mjs}`
  override (`complexity: off` + `import/no-extraneous-dependencies` with `devDependencies: true`,
  since the shell scripts legitimately import devDeps), and the `tsconfig.eslint.json` project pin
  (see above). The config is authored in `.ts` (loaded by `jiti`, a devDependency ESLint v9.18+
  requires for TypeScript config) and wrapped in `defineConfig`, so the whole array is type-checked
  against the preset's shipped types. `pnpm tsc` type-checks it via `tsconfig.tools.json`.
- **Markdown** — `.markdownlint-cli2.jsonc` extends `@rheged-studio/markdownlint-config`.
  Pre-commit auto-fixes staged `**/*.{md,mdx}` via lint-staged (`|| true`, so it never blocks); the
  `lint` reusable caller (markdown lane) enforces. (There is no root `CHANGELOG.md` to exclude —
  release-please runs with `skip-changelog`.)
- **Prettier** — `pnpm format` runs `prettier --write .`; `.prettierignore` excludes `node_modules`,
  `dist`, `pnpm-lock.yaml`, and `tsconfig.json`.

## GitHub Actions repo config

Non-secret knobs shared by `ci.yml` and `pkg-release.yml` live in
**`infrastructure/repo-config.yaml`**, loaded at runtime via `reusable-load-repo-config.yml@v1`
(A-779), which allowlist-validates every value before writing it to `GITHUB_OUTPUT` (guards
newline/`=` injection; A-330).

| Key                         | Value / purpose                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `defaultBranch`             | `main` — keep in sync with static `on:` triggers (GitHub cannot derive `on.push.branches` from this file).              |
| `nodeVersionFile`           | `.nvmrc` — passed to `actions/setup-node` `node-version-file`.                                                          |
| `npmRegistryUrl`            | `https://registry.npmjs.org` — public npm registry (`setup-node` when talking to npmjs).                                |
| `npmScope`                  | `@rheged-studio` — package scope; equals the owning GitHub org so `setup-node` scopes `.npmrc` for the GH Packages leg. |
| `githubPackagesRegistryUrl` | `https://npm.pkg.github.com` — GitHub Packages npm registry (the secondary publish target).                             |

Secrets (`GITHUB_TOKEN`), OIDC Trusted Publishing, and release-please behaviour are unchanged — not
in this file.

## Local hooks

`pnpm install` runs `prepare` (`husky`), which installs the hooks under `.husky/`. Three hooks fire:

- **`pre-commit`** — runs `pnpm lint-staged`. Auto-fixes only the staged files: `prettier --write`
  for everything, `eslint --fix` for `**/*.{ts,tsx,js,mjs,cjs}`, `sort-package-json` + `eslint --fix`
  for `**/package.json`, `markdownlint-cli2 --fix` for `**/*.{md,mdx}`, `yamllint` (read-only check)
  for `**/*.{yml,yaml}`, `actionlint` (read-only check) for `.github/workflows/*.{yml,yaml}`. The
  auto-fixers carry an `|| true` fallback so they never block — CI is the gate. The two YAML linters
  are best-effort: if the tool isn't on `PATH` locally, the hook prints an install hint and skips.
- **`commit-msg`** — strips any `Co-Authored-By: Claude … <noreply@anthropic.com>` trailer.
  Backstops the global `~/.claude/CLAUDE.md` rule (Claude is tooling, not a contributor).
- **`pre-push`** — blocks direct pushes to `main`; humans should use `/send-it` to open a PR. Bot
  users (`github-actions[bot]`, `road-runner-bot[bot]`) and the release-please release commit
  (`chore(main): release <version>`) bypass. It also runs `pnpm lint:workflows` + `pnpm lint:yaml`
  as a last-line gate before CI, then a best-effort `commitlint --from origin/main --to HEAD`
  range check (A-982) — skips with an installation hint if `@commitlint/cli` isn't available
  locally, if `dist/index.js` is missing (this repo's config extends the built artefact; run
  `pnpm build` after clone/clean), or if `origin/main` is not a resolvable ref; CI's
  `reusable-validate-commits` gate is still the authority. This repo dogfoods via
  `commitlint.config.mjs` extending `./dist/index.js` (consumers use the published package
  name).

Hooks are dormant in CI: `ci.yml` and the reusable release workflow (called by `pkg-release.yml`)
set `HUSKY=0` so the `prepare` script no-ops during `pnpm install`.

To bypass any hook in an emergency: `git commit --no-verify` or `git push --no-verify` — not
recommended.

## CI gate (`GO/NO GO`)

`ci.yml` ends with a single **`GO/NO GO`** aggregator job — the one stable, estate-canonical gate
(A-412/A-424). It `needs:` every real job (`config`, `lint`, `build-test`, `changelog-completeness`),
runs `if: ${{ always() }}`, and a one-line `jq` verdict over `toJSON(needs)` succeeds **iff** every
job `result` is `success` or `skipped`. The `lint` and `build-test` jobs are thin callers of the
shared reusable workflows (see below); `config` is in `needs` so a config failure — which would skip
the callers, and skips are accepted — still fails the gate directly.

- **Why a check-run, not a commit status.** The gate is the job's _intrinsic_ check-run, named
  `GO/NO GO`. A commit status is writable by any push-scoped token (forgeable); a **check-run can
  only be minted by a GitHub App** — here, the repo's own Actions run — so a push-scoped token or a
  fork contributor cannot forge it. It is required on `main` via a ruleset pinned to the GitHub
  Actions integration (`integration_id: 15368`).
- **Footguns (A-418).** The gate must **never** be path-filtered (a path-filtered required check sits
  Pending forever and blocks merges); `always()` is mandatory or the aggregator skips and never
  reports.

The Conventional-Commit **PR-title** check (`validate-pr-title.yml`, the release bump signal, A-405)
and the fanned **`validate-payload`** check run as separate required workflows, not inside the
`GO/NO GO` aggregator.

## Shared reusable CI callers (A-447)

The `lint` and `build-test` jobs in `ci.yml` are thin callers of the estate's shared reusable
workflows in `rheged-studio/shared-workflows` (floating on `@v1`).

- **`lint`** → `reusable-lint.yml` runs ESLint + markdownlint + yamllint/actionlint + dated-changelog
  validation in one job (`lint / Lint`). `eslint-args` passes **directory paths** (`src`), not globs
  — the Layer-1 action word-splits `eslint $ESLINT_ARGS` with `globstar` off, so a `**` glob would
  mis-expand; a directory lets ESLint's flat config resolve the file set recursively. `changelog-
script: validate:changelog` (the reusable default is `changelog:validate`). The yaml lane uses
  shared-workflows' centralised `.yamllint.yml` (A-438), so the repo's local `.yamllint.yml` now only
  feeds the pre-commit hook.
- **`build-test`** → `reusable-build-test.yml` runs build (verification) + Vitest + ShellCheck + bats
  (`build-test / Build & Test`). `shellcheck-paths` passes the scripts dir + the three extensionless
  husky hooks explicitly. `bats: true` runs `pnpm exec bats` — which is why **`bats` is a
  devDependency** (`bats@1.13.0`); the bats tests are self-contained (no `bats-support`/`bats-assert`).
- **`config`** loads `repo-config.yaml` once and feeds `node-version-file` to the callers (and to
  `changelog-completeness`) via `needs` — caller jobs can't run a `load-repo-config` step inline.

The callers run on **all** branches including `release-please--*` (no skip), so the changelog lane
validates the finalised entries before the release PR merges.

## Validating workflows and YAML

Two non-Node tools augment Prettier's formatting pass with the semantic checks Prettier can't see
(Actions schema, `${{ … }}` expression typos, duplicate keys, etc.). Since A-447, **CI runs them
inside the `lint` reusable caller** (the yaml lane); the install scripts below are the
local/pre-commit + reference path.

- **`actionlint`** — Go binary. Local install: `brew install actionlint` (macOS) or
  `bash <(curl -fsSL https://raw.githubusercontent.com/rhysd/actionlint/v1.7.5/scripts/download-actionlint.bash)` elsewhere.
- **`yamllint`** — Python tool. Local install: `brew install yamllint` (macOS) or
  `pip install --user yamllint==1.37.1` elsewhere.

`.yamllint.yml` at the repo root extends defaults, demotes line-length / indentation to warnings
(Prettier owns formatting), allows the GitHub Actions truthy values (`on`, `off`, `yes`, `no`), and
ignores `node_modules/`, `dist/`, `pnpm-lock.yaml`. It is **local + pre-commit only** since A-447 —
CI's yaml lane uses shared-workflows' centralised config. The local install-and-run logic lives in
`infrastructure/scripts/ensure-yamllint.sh` / `ensure-actionlint.sh` — CI-unused now but kept as
unit-tested reference (see `infrastructure/README.md`).

## Validating workflows locally with `act`

`actionlint` and `yamllint` catch schema and expression-level mistakes. They say nothing about
whether a workflow actually _works_ end-to-end — Node/pnpm setup ordering, env propagation,
conditional skips. [`act`](https://github.com/nektos/act) closes that gap by running the workflow
against your local Docker daemon.

**Install:** `brew install act` (macOS) or
`bash <(curl -fsSL https://raw.githubusercontent.com/nektos/act/master/install.sh)` (Linux).
Requires a running container engine (Docker Desktop, Colima, or podman). `pnpm act:list` is the smoke
test. `.actrc` pins `ubuntu-latest` to `catthehacker/ubuntu:act-latest` (matching real
`ubuntu-latest`); don't remove it (the default `act` image silently breaks Node/pnpm setups).

The `ci.yml` `config`, `pr-title`, and `changelog-completeness` jobs run fully under `act`. The
`lint` / `build-test` jobs and `pkg-release.yml` are thin callers of remote reusable workflows, so
`act` must fetch them (needs network + a `GITHUB_TOKEN`) and can't run them fully offline — the
decisive check is the real PR run. `claude-*.yml` need `CLAUDE_CODE_OAUTH_TOKEN` and aren't loaded by
the scoped `act:*` scripts.

```bash
pnpm act:list           # smoke test — enumerate every job in .github/workflows/
pnpm act:ci             # run ci.yml as a PR event, using .github/act-events/pull_request.json
pnpm act:release:dry    # run pkg-release.yml — fetches the remote reusable workflow, then stops at OIDC-bound steps
```

The PR event fixture at `.github/act-events/pull_request.json` sets `pull_request.head.ref` /
`base.ref` / `title` so the changelog-completeness gate and the PR-title lint resolve against a real
ref and title.

**Post-push triage** (after `/send-it`): `pnpm ci:list` shows recent runs, `pnpm ci:watch` streams
the latest, `pnpm ci:view` opens a specific run. All three require `gh auth login` first.

## `infrastructure/`

`act` validates workflow _wiring_; it says nothing about whether the logic _inside_ a `run:` block
is correct. `infrastructure/` is the home for that logic: shell + TS extracted from workflow `run:`
blocks, runnable and unit-tested in isolation. The full conventions document is
`infrastructure/README.md`; the high-level rules: shell + bats for CLI orchestration, TypeScript +
vitest for parsing/branching/octokit; inputs via env not argv; pure functions exported for tests;
idempotent; pinned versions in env defaults.

The five `scripts/*.sh` are **CI-unused reference** now — `ensure-yamllint.sh` / `ensure-actionlint.sh`
/ `ensure-bats.sh` since A-447 (the reusable callers install those tools themselves), and
`publish-via-raw-npm.sh` / `publish-to-github-packages.sh` since A-639 (the reusable release workflow
inlines publishing). They remain as unit-tested reference shell (still exercised by `pnpm test:sh`)
documenting the install-and-verify and idempotent-publish patterns.

Changelog validate / completeness / enrich / finalise are provided by
`@rheged-studio/changelog-core` (`pnpm validate:changelog`, `pnpm exec changelog-core
check-completeness`). Post-merge write-back is the `changelog-enrich` job in `pkg-release.yml`
calling `reusable-changelog-enrich.yml` (A-808 / A-821).

CI (A-447): the `build-test` reusable caller runs ShellCheck (`infrastructure/scripts` + the husky
hooks), Vitest, and bats against this directory; the `lint` caller runs `validate:changelog`; the
`changelog-completeness` job runs the completeness gate. Locally, `pnpm lint:sh` / `pnpm test:sh`
skip with install hints if `shellcheck` / `bats` aren't on PATH — `pnpm test` (vitest) always runs
because vitest is a node devDep.

## Dated changelog (`changelog/`)

The `changelog/` directory is the **only** changelog in the repo — there is no root `CHANGELOG.md`
(release-please runs with `skip-changelog`, A-371). It keeps **one dated Markdown file per PR** — a
browsable, per-change, machine-readable record (the `version` field, stamped at release only on
release-triggering entries, ties an entry back to the published release it shipped in). The reusable
release workflow sources its GitHub-release notes from the version-stamped entries. Full schema and
lifecycle in **`changelog/README.md`**.

Two-stage lifecycle — post-merge enrichment runs in-repo via `reusable-changelog-enrich.yml` on every
push to `main` (A-808 / A-821):

1. **PR-time** — `/send-it` writes `changelog/<YYYYMMDD-HHMMSS>-<slug>.md` with the PR-time fields
   (and empty enrichment placeholders) for **every** PR — a non-release entry simply stays
   version-less and is filtered out of release notes. CI's changelog-completeness gate enforces the
   one hard coupling: a release-triggering `feat`/`fix`/breaking PR title **must** carry an entry.
2. **Post-merge / release** — `pkg-release.yml`'s `changelog-enrich` job (`mode: finalise`) resolves
   the just-merged PR, fills `merged_at`/`commit`/`pr`/`stats`, and stamps `version` only when
   `package.json`'s version has no matching git tag (release-please cut). Write-back pushes only
   `changelog/**` as `road-runner-bot[bot]`. Dormant while Release is disabled (see below).

`validate:changelog` (`pnpm exec changelog-core validate`) enforces the schema (CI: the `lint`
reusable caller's changelog lane). Required frontmatter is relaxed to
`title`/`created_at`/`category`/`breaking` so backfilled and in-flight entries both pass.

## Release workflow

> **Currently disabled on this repo.** The package has not had its first publish yet (version
> `0.0.0`, no `v0.0.0` tag), so the Release workflow is switched off
> (`gh workflow disable Release`) to avoid a failing publish — and an auto-opened failure issue — on
> every push to `main`. The first publish is bootstrapped by hand (A-986; see "Bootstrap publish"
> below), and Release is enabled (`gh workflow enable Release`) as part of that. Everything below
> describes the workflow as it runs once the package is published.
>
> **Thin caller (A-639).** The release workflow is `.github/workflows/pkg-release.yml` — a thin
> caller of the estate's shared `reusable-pkg-release.yml`. A `config` job loads
> `infrastructure/repo-config.yaml` and passes `npm-scope` / `node-version-file` / the registry URLs
> to the reusable workflow, which holds all the release logic. The file is `pkg-release.yml` (npm
> Trusted Publishing binds its OIDC subject to repository + workflow **filename**, so configure the
> Trusted Publisher against `pkg-release.yml`), but the workflow **name** stays `Release` so
> `gh workflow enable/disable Release` still works.

### Day-to-day releases (CI via OIDC)

Once the package exists on npm AND its Trusted Publisher is configured against this repo's
`pkg-release.yml`, every release flows through CI:

1. Make changes on a feature branch; `/send-it` bundles, writes the dated `changelog/<slug>.md`
   entry, sets a **Conventional Commits PR title** (still required by CI; no longer the sole
   post-merge bump signal under merge commits), pushes, opens a PR. Feature PRs land as **merge
   commits**. CI runs build/lint, the conventional-PR-title lint, and the changelog-completeness
   gate.
2. After merge, **Clacks** (road-runner-bot, a 15-min cron) runs
   `release-please release-pr` — which ranks Conventional Commits on `main` (A-824) and writes
   `package.json` + `.release-please-manifest.json` — and opens the
   "`chore(main): release <version>`" release PR. On a later tick it **squash-merges** that release
   PR once the `GO/NO GO` check-run is green (fan-out PRs also stay squash).
3. The orchestrator's merge pushes to `main`, re-firing `pkg-release.yml`. An unprivileged `build`
   job builds + `npm pack`s the tarball once and uploads it as an artifact; the `release` job sees a
   **freshly bumped, untagged version**, downloads that exact tarball, and publishes it to npm via
   OIDC Trusted Publishing (no token, no OTP) + provenance attestation, plus git tags + a GitHub
   release. A `publish-github-packages` job downloads the **same** tarball and mirrors it to GitHub
   Packages with a GitHub-native build-provenance attestation. The sibling `changelog-enrich` job
   (`mode: finalise`) fills post-merge changelog metadata and stamps `version` on the release cut.

**The release workflow is publish-only.** It does **not** create the release PR — that lives in the
orchestrator, where the App key stays private ("Allow GitHub Actions to create and approve pull
requests" is deliberately off). A version-vs-tag detect step gates the publish: a feature-merge
(version unchanged → its `v<version>` tag exists) is a clean green no-op; a release-PR merge (version
freshly bumped → no tag yet) publishes. This keyless gate needs no Changesets. The bot's private key
never touches this public repo's CI.

**Cross-boundary hardening (A-326).** npm Trusted Publishing binds its OIDC subject to repository +
workflow filename only — not the trigger event, ref, or actor — so anything able to run
`pkg-release.yml` against an arbitrary ref could mint a valid publish credential. Three layers close
that:

- **No `workflow_dispatch` (in the caller).** `pkg-release.yml`'s only trigger is `push: [main]`;
  re-run a failed release via "Re-run jobs" on the original push run. Keep `workflow_dispatch` out of
  the caller — the reusable workflow can't stop a caller adding it.
- **Branch-restricted `npm-release` environment (repo settings).** Both privileged jobs (`release`
  and `publish-github-packages`) run under the `npm-release` environment, which permits deployments
  **only from `refs/heads/main`**, so a non-main ref is rejected before the OIDC token is mintable.
  No required reviewers — releases stay hands-off; this is a structural ref gate, not a manual
  approval.
- **Explicit ref guard (in the reusable workflow).** Every publish/tag step and the GitHub Packages
  job `if:` also carries `github.event_name == 'push' && github.ref == 'refs/heads/main' && …` —
  redundant with the environment, kept as the in-workflow structural defence.

**Build once, publish the exact artifact (A-328).** Build-time code (`pnpm install` + `tsc` +
`npm pack`) runs **only** in the unprivileged `build` job (`contents: read`, no `id-token`/`packages`/
`contents: write`). Both publish legs download and ship that one tarball, so a compromised build-time
dependency never runs alongside a mintable publish credential, and the npm tarball, the GitHub
Packages tarball, and the attested digest are guaranteed byte-identical.

**The publish leg calls npm directly.** The reusable workflow inlines the raw-npm publish —
`npm publish "$TARBALL" --access public --provenance` on the prebuilt tarball — after upgrading npm
to a pinned version ≥ 11.5.1 (the floor Trusted Publishing needs; the Node-22-bundled npm is older).
It is idempotent: if `npm view name@version` succeeds it exits 0 instead of re-publishing (which
would 409). `infrastructure/scripts/publish-via-raw-npm.sh` is the unit-tested reference for that
logic (A-174).

**GitHub Packages — secondary target (A-323).** npmjs.org (OIDC + provenance) is the canonical public
source; GitHub Packages is a secondary mirror. The `publish-github-packages` job is gated
`needs: release` + the same main-only ref guard + `npm-release` environment; `packages: write` is
scoped to this job only (never to the `release` job holding `id-token: write`). Auth is the ephemeral
per-job `GITHUB_TOKEN`; provenance is a GitHub-native `actions/attest-build-provenance` over the exact
tarball. It **hard-codes the target to `https://npm.pkg.github.com`, aborting if the registry URL
drifts** (A-330), since the `GITHUB_TOKEN` is a bearer credential.
`infrastructure/scripts/publish-to-github-packages.sh` is the unit-tested reference.

> **Watch-item:** the npm leg's git tag + GitHub release are created explicitly in the reusable
> workflow's `release` job (`npm publish` creates neither on its own), sourcing the notes from the
> matching dated `changelog/` entries.

Don't reintroduce `NPM_TOKEN` **as a CI secret** unless OIDC is verified broken. The local
`.env`-based `NPM_TOKEN` is a different concern — laptop-driven publishes only, never CI.

**Choosing the bump.** There is no changeset file. Feature PRs land as merge commits; release-please
ranks Conventional Commits on `main` (A-824): `fix:` → patch, `feat:` → minor, a `!`
breaking marker (or a `BREAKING CHANGE:` footer) → major. Conventional PR titles stay required (CI)
but are no longer the sole post-merge bump signal for feature work. Commitlint / `validate-commits`
remain the per-commit gate. `/send-it` derives a Conventional title automatically; for
a hand-opened PR, set the title yourself. Non-release types (`docs:`/`chore:`/`ci:`/`refactor:`/
`test:`/`build:`/`style:`/`perf:`) don't cut a release unless a landed commit does. The orchestrator
squash-merges the release PR; fan-out stays squash.

### Manual publish (break-glass — CI-down only, after the package exists)

> **Break-glass, not a routine path (A-331).** Reach for it only when CI/OIDC is genuinely down. The
> `.env` `NPM_TOKEN` is a long-lived credential: store it in a secrets manager retrieved
> just-in-time, give it the shortest viable lifetime, and rotate immediately on any exposure. It
> never touches CI, and manual publishes ship without a provenance badge so they can't masquerade as
> verified CI ones.

```bash
NPM_TOKEN=$(grep '^NPM_TOKEN=' .env | cut -d'=' -f2-)
# Write the token to a throwaway npmrc — never persist it in your standing ~/.npmrc:
TMP_NPMRC=$(mktemp)
printf '//registry.npmjs.org/:_authToken=%s\n' "$NPM_TOKEN" > "$TMP_NPMRC"
export NPM_CONFIG_USERCONFIG="$TMP_NPMRC"
npm whoami                     # verify
pnpm run release:manual:dry    # simulate — verifies tarball + auth
pnpm run release:manual        # actual publish (npm publish --access public --provenance=false)
rm -f "$TMP_NPMRC"; unset NPM_CONFIG_USERCONFIG   # token never lands in ~/.npmrc
```

The token must be a **Granular Access Token with "Bypass 2FA" enabled at creation time** — without
that flag every publish hits `EOTP`. Tokens are immutable; if you forgot the flag, revoke and
regenerate. `--provenance=false` is intentional (provenance needs a GitHub Actions OIDC issuer a
laptop lacks). Don't try `pnpm run release:manual -- --dry-run` — the chained-script + `--` separator
confuses npm; use `release:manual:dry`.

## Bootstrap publish — the first publish (A-986)

The very first publish of a brand-new npm package **cannot go through CI**, for two compounding
reasons:

- npm (unlike PyPI) has no pending-Trusted-Publisher flow. The package must exist on the registry
  before the Trusted Publisher form is reachable at `npmjs.com/package/<name>/access`.
- npm enforces 2FA at the publish endpoint for the first publish of a new package, irrespective of
  account/org/token bypass settings. A Granular bypass-2FA token does **not** help for publish #1
  (only #2 onwards). With a recent npm (default `auth-type=web`), that 2FA is satisfied **in the
  browser via a passkey/WebAuthn approval** — so the first publish completes interactively from a
  laptop.

So bootstrap is always: manual first publish (approve in the browser) → configure Trusted Publisher →
enable Release → CI takes over from publish #2.

**Pre-flight:** you belong to the target npm org with publish rights; npm CLI ≥ 11.5.1
(`npm install -g npm@latest`); a passkey/security key registered on your npm account, an interactive
browser, and `auth-type=web` (the npm default — don't override it). `package.json` and
`.release-please-manifest.json` are at the version you want to ship — for this fresh package, edit
both directly to the initial version (e.g. `0.1.0`); release-please takes over bumping from
publish #2 once the manifest is seeded.

**Sequence:**

1. Set `package.json` + `.release-please-manifest.json` to the initial version. There is no root
   `CHANGELOG.md` to write — the dated `changelog/` entry carries the release notes.
2. `pnpm run release:manual:dry` — verify tarball + auth. (Dry-run does **not** exercise the
   2FA/browser step, so a green dry-run doesn't by itself predict a green real publish.)
3. `pnpm run release:manual` — npm opens your browser and prompts for a passkey/WebAuthn approval
   (Touch ID / Face ID / security key). Approve it and the scoped package publishes.
4. Configure Trusted Publisher: `https://www.npmjs.com/package/@rheged-studio/commitlint-config/access`
   → GitHub Actions → org, repo, workflow filename (`pkg-release.yml`), environment blank.
5. `gh workflow enable Release`. From here on, releases go through CI.

**Fallback (recovery-code OTP):** for headless / no-browser contexts, or an account without a
passkey. Generate single-use recovery codes at npmjs.com → Profile → Two-Factor Authentication →
Manage Recovery Codes. Pass the code through the environment rather than on the command line (a
`--otp=<code>` argument leaks via shell history and `ps`):

```bash
read -rs NPM_CONFIG_OTP        # paste a recovery code — it won't echo
export NPM_CONFIG_OTP
npm publish --access public --provenance=false
unset NPM_CONFIG_OTP
```

Regenerate your recovery codes immediately after — the used one is burnt.

Things that look like solutions but aren't: toggling "Require 2FA for write actions" off; disabling
org-level 2FA; a bypass-2FA Granular token (works for publish #2+, not #1); `oathtool`/TOTP (npm has
phased TOTP out of new accounts). The passkey/WebAuthn browser flow is the answer for publish #1.
