import config from ".";
import lint from "@commitlint/lint";
import load from "@commitlint/load";
import { describe, expect, it } from "vitest";

/**
 * The estate's allowed Conventional-Commit types — kept in lock-step with the
 * `type-enum` override in `./index.ts`. Duplicated here deliberately so the test
 * is an independent spec of the intended list, not a tautology over the source.
 */
const ALLOWED_TYPES = [
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
] as const;

/**
 * Estate length pins (A-1413) — independent of the source so a silent drift in
 * `./index.ts` fails the spec rather than tautologically matching it.
 */
const HEADER_MAX_LENGTH = 72;
const BODY_MAX_LINE_LENGTH = 256;
const FOOTER_MAX_LINE_LENGTH = 256;

const HEADER_PREFIX = "feat: ";
const FOOTER_PREFIX = "BREAKING CHANGE: ";

/**
 * Guy Hepner Tempest #2831 — wrapable English, 174 characters, no newlines.
 */
const TEMPEST_BODY =
  "Unattended capture files each follow-up beside the parent issue: its milestone, else its live project, else Follow-up issues. Every minted issue requires the follow-up label.";

// Resolve the config the way commitlint itself does: `load` walks `extends`,
// merging `@commitlint/config-conventional`'s defaults under our overrides,
// so the tests exercise the *effective* ruleset a consumer gets.
// The default conventional-commits parser handles `type: subject` correctly for
// every assertion below, so no `parserOpts` override is needed.
const { defaultIgnores, ignores, rules } = await load(config);

function lintMessage(message: string) {
  return lint(message, rules, {
    defaultIgnores,
    ignores,
  });
}

function headerOfLength(length: number): string {
  return HEADER_PREFIX + "x".repeat(length - HEADER_PREFIX.length);
}

function bodyOfLength(length: number): string {
  return `${HEADER_PREFIX}subject\n\n${"x".repeat(length)}`;
}

function footerOfLength(length: number): string {
  return `${HEADER_PREFIX}subject\n\n${FOOTER_PREFIX}${"x".repeat(length - FOOTER_PREFIX.length)}`;
}

describe("@rheged-studio/commitlint-config", () => {
  it("extends @commitlint/config-conventional", () => {
    expect(config.extends).toContain("@commitlint/config-conventional");
  });

  it("pins type-enum to the estate's allowed types", () => {
    expect(config.rules?.["type-enum"]).toEqual([
      2,
      "always",
      [...ALLOWED_TYPES],
    ]);
  });

  it("pins header-max-length, body-max-line-length and footer-max-line-length", () => {
    expect(config.rules?.["header-max-length"]).toEqual([
      2,
      "always",
      HEADER_MAX_LENGTH,
    ]);
    expect(config.rules?.["body-max-line-length"]).toEqual([
      2,
      "always",
      BODY_MAX_LINE_LENGTH,
    ]);
    expect(config.rules?.["footer-max-line-length"]).toEqual([
      2,
      "always",
      FOOTER_MAX_LINE_LENGTH,
    ]);
  });

  it.each(ALLOWED_TYPES)("accepts a `%s` commit", async (type) => {
    const { valid } = await lintMessage(`${type}: describe the change`);
    expect(valid).toBe(true);
  });

  it("rejects a type outside the allowed set", async () => {
    const { errors, valid } = await lintMessage("wip: half-done work");
    expect(valid).toBe(false);
    expect(errors.map((error) => error.name)).toContain("type-enum");
  });

  it("retains the config-conventional default rejecting an empty subject", async () => {
    const { errors, valid } = await lintMessage("feat:");
    expect(valid).toBe(false);
    expect(errors.map((error) => error.name)).toContain("subject-empty");
  });

  it("ignores merge, revert, fixup and squash commits via defaultIgnores", async () => {
    for (const message of [
      "Merge branch 'main' into feature",
      'Revert "feat: something"',
      "fixup! feat: something",
      "squash! feat: something",
    ]) {
      const { valid } = await lintMessage(message);
      expect(valid).toBe(true);
    }
  });

  it(`accepts a header of ${HEADER_MAX_LENGTH} characters`, async () => {
    const { valid } = await lintMessage(headerOfLength(HEADER_MAX_LENGTH));
    expect(valid).toBe(true);
  });

  it(`rejects a header of ${HEADER_MAX_LENGTH + 1} characters`, async () => {
    const { errors, valid } = await lintMessage(
      headerOfLength(HEADER_MAX_LENGTH + 1),
    );
    expect(valid).toBe(false);
    expect(errors.map((error) => error.name)).toContain("header-max-length");
  });

  it(`accepts a body line of ${BODY_MAX_LINE_LENGTH} characters`, async () => {
    const { valid } = await lintMessage(bodyOfLength(BODY_MAX_LINE_LENGTH));
    expect(valid).toBe(true);
  });

  it(`rejects a body line of ${BODY_MAX_LINE_LENGTH + 1} characters`, async () => {
    const { errors, valid } = await lintMessage(
      bodyOfLength(BODY_MAX_LINE_LENGTH + 1),
    );
    expect(valid).toBe(false);
    expect(errors.map((error) => error.name)).toContain("body-max-line-length");
  });

  it(`accepts a footer line of ${FOOTER_MAX_LINE_LENGTH} characters`, async () => {
    const { valid } = await lintMessage(footerOfLength(FOOTER_MAX_LINE_LENGTH));
    expect(valid).toBe(true);
  });

  it(`rejects a footer line of ${FOOTER_MAX_LINE_LENGTH + 1} characters`, async () => {
    const { errors, valid } = await lintMessage(
      footerOfLength(FOOTER_MAX_LINE_LENGTH + 1),
    );
    expect(valid).toBe(false);
    expect(errors.map((error) => error.name)).toContain(
      "footer-max-line-length",
    );
  });

  it("exempts a body line that contains a URL from body-max-line-length", async () => {
    const urlLine = `see https://example.com/${"a".repeat(300)}`;
    expect(urlLine.length).toBeGreaterThan(BODY_MAX_LINE_LENGTH);
    const { valid } = await lintMessage(
      `${HEADER_PREFIX}subject\n\n${urlLine}`,
    );
    expect(valid).toBe(true);
  });

  it("accepts the 174-character Tempest trial body", async () => {
    expect(TEMPEST_BODY.length).toBe(174);
    const { valid } = await lintMessage(
      `docs(triage-pr): route follow-ups by milestone, then project\n\n${TEMPEST_BODY}`,
    );
    expect(valid).toBe(true);
  });
});
