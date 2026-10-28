import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

import { checkContracts, readRepository } from "./check-contracts.mjs";

// In-memory fixtures. Test sources are built from the title, so this file's own text claims no contract.
const doc = (text, path = "docs/sample.md") => ({ path, text });
const source = (call, literal, path = "src/sample.test.ts") => ({ path, text: `${call}(${literal}, () => {});\n` });
const spec = (title, call = "it") => source(call, JSON.stringify(title));
const sentence = (id) => `Intro.\n\n[contract:${id}]: #\nThe contract sentence.\n`;
const errorsOf = (docs, tests) => checkContracts({ docs, tests });
// A scratch repository on disk, { "docs/…": text, "workspace/…": text }, handed to `run` as its workspace path.
const withRepository = (files, run) => {
  const root = mkdtempSync(join(tmpdir(), "check-contracts-"));
  try {
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    }
    return run(join(root, "workspace"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

test("[guardrails.contracts.one-to-one] a marker and a test with the same id pass, in every title form", () => {
  assert.deepEqual(errorsOf([doc(sentence("atoms.sample.case"))], [spec("[atoms.sample.case] works")]), []);
  for (const call of ["describe", "test", "test.describe", "it.only", "test.describe.serial"]) {
    assert.deepEqual(errorsOf([doc(sentence("atoms.sample.case"))], [spec("[atoms.sample.case] works", call)]), [], call);
  }
  // A template-literal title, and one test that claims two contracts at once.
  const both = doc("[contract:atoms.sample.one]: #\n[contract:atoms.sample.two]: #\n\n| a | b |\n| --- | --- |\n");
  const template = source("test", "`[atoms.sample.one] [atoms.sample.two] at ${width}px`", "tests/sample.spec.ts");
  assert.deepEqual(errorsOf([both], [template]), []);
  // A marker may open right after a heading, a closed fence or a thematic break.
  for (const before of ["## Section\n", "```ts\nx\n```\n", "---\n"]) {
    assert.deepEqual(errorsOf([doc(`${before}[contract:atoms.sample.case]: #\nThe contract sentence.\n`)], [spec("[atoms.sample.case] works")]), [], before);
  }
  // Several tests may share an id, and a title that opens with another bracketed word claims nothing.
  assert.deepEqual(errorsOf([doc(sentence("atoms.sample.case"))], [spec("[atoms.sample.case] one"), spec("[atoms.sample.case] two"), spec("[data-pui-theme] holds")]), []);
});

test("[guardrails.contracts.one-to-one] a duplicate doc id fails", () => {
  const errors = errorsOf([doc(sentence("atoms.sample.case")), doc(sentence("atoms.sample.case"), "docs/other.md")], [spec("[atoms.sample.case] works")]);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^docs\/other\.md:3 duplicate contract atoms\.sample\.case \(first at docs\/sample\.md:3\)$/);
});

test("[guardrails.contracts.one-to-one] a doc id without a test fails", () => {
  const errors = errorsOf([doc(sentence("atoms.sample.case"))], [spec("[atoms.sample.other] works"), spec("atoms.sample.case without brackets")]);
  assert.ok(errors.some((error) => /^docs\/sample\.md:3 contract atoms\.sample\.case has no test/.test(error)), errors.join("\n"));
});

test("[guardrails.contracts.one-to-one] a test id without a doc marker fails", () => {
  const errors = errorsOf([doc(sentence("atoms.sample.case"))], [spec("[atoms.sample.case] works"), spec("[atoms.sample.ghost] works")]);
  assert.deepEqual(errors, ["src/sample.test.ts:1 test claims contract atoms.sample.ghost, which no docs marker defines"]);
});

test("[guardrails.contracts.one-to-one] a marker not followed by a content block fails", () => {
  const tests = [spec("[atoms.sample.case] works")];
  for (const text of ["Intro.\n\n[contract:atoms.sample.case]: #\n", "Intro.\n\n[contract:atoms.sample.case]: #\n\n## Next section\n", "Intro.\n\n[contract:atoms.sample.case]: #\n\n---\n"]) {
    const errors = errorsOf([doc(text)], tests);
    assert.deepEqual(errors, ["docs/sample.md:3 contract marker is not followed by a content block"], text);
  }
});

test("[guardrails.contracts.one-to-one] a marker that would render as text fails", () => {
  const tests = [spec("[atoms.sample.case] works")];
  // Inside a paragraph, inside a table, and right above a table (GitHub prints it there).
  assert.match(errorsOf([doc("A paragraph line.\n[contract:atoms.sample.case]: #\nMore.\n")], tests)[0], /continues the block above it/);
  assert.match(errorsOf([doc("| a |\n| --- |\n[contract:atoms.sample.case]: #\n| b |\n")], tests)[0], /continues the block above it/);
  assert.match(errorsOf([doc("[contract:atoms.sample.case]: #\n| a |\n| --- |\n")], tests)[0], /right above a table/);
  // Markers inside fenced code are examples, not markers.
  assert.deepEqual(errorsOf([doc(`${sentence("atoms.sample.case")}\n\`\`\`md\n[contract:atoms.sample.example]: #\n\`\`\`\n`)], tests), []);
});

test("[guardrails.contracts.one-to-one] a skipped, todo, fixme or failing test covers nothing", () => {
  const marked = [doc(sentence("atoms.sample.case"))];
  for (const call of ["it.skip", "test.skip", "describe.skip", "test.describe.skip", "it.todo", "test.fixme", "test.fail", "it.fails"]) {
    const errors = errorsOf(marked, [spec("[atoms.sample.case] works", call)]);
    assert.equal(errors.length, 1, call);
    assert.match(errors[0], /^docs\/sample\.md:3 contract atoms\.sample\.case has no test whose title starts with \[atoms\.sample\.case\] and asserts it/, call);
  }
  // A test that runs next to a skipped one covers the contract, and a skipped title still has to name a defined one.
  assert.deepEqual(errorsOf(marked, [spec("[atoms.sample.case] parked", "it.skip"), spec("[atoms.sample.case] runs")]), []);
  assert.deepEqual(errorsOf([], [spec("[atoms.sample.ghost] parked", "it.skip")]), ["src/sample.test.ts:1 test claims contract atoms.sample.ghost, which no docs marker defines"]);
});

test("[guardrails.contracts.one-to-one] the specs under tests/dist are read and other dist directories are not", () => {
  const built = spec("[install.sample.built] works", "test").text;
  const ghost = spec("[install.sample.ghost] works", "test").text;
  withRepository({
    "docs/sample.md": sentence("install.sample.built"),
    "workspace/tests/dist/built.spec.ts": built,
    // Build output named dist is not read, in tests or nested inside tests/dist.
    "workspace/tests/foundations/dist/ghost.spec.ts": ghost,
    "workspace/tests/dist/dist/ghost.spec.ts": ghost,
  }, (workspace) => {
    const repository = readRepository(workspace);
    assert.deepEqual(repository.tests.map(({ path }) => path), ["workspace/tests/dist/built.spec.ts"]);
    assert.deepEqual(checkContracts(repository), []);
  });
  // A dist spec is held to the same rules: its id needs a marker, and a marker needs its test.
  withRepository({ "docs/sample.md": sentence("install.sample.built"), "workspace/tests/dist/built.spec.ts": built + ghost }, (workspace) => {
    assert.deepEqual(checkContracts(readRepository(workspace)), ["workspace/tests/dist/built.spec.ts:2 test claims contract install.sample.ghost, which no docs marker defines"]);
  });
  withRepository({ "docs/sample.md": sentence("install.sample.built"), "workspace/tests/dist/built.spec.ts": ghost }, (workspace) => {
    const errors = checkContracts(readRepository(workspace));
    assert.equal(errors.length, 2, errors.join("\n"));
    assert.ok(errors.some((error) => /^docs\/sample\.md:3 contract install\.sample\.built has no test/.test(error)), errors.join("\n"));
  });
});

test("[guardrails.contracts.one-to-one] malformed ids fail in docs and in titles", () => {
  assert.match(errorsOf([doc("[contract:Atoms.sample]: #\nText.\n")], [])[0], /malformed contract marker/);
  assert.match(errorsOf([doc("[contract:widgets.sample.case]: #\nText.\n")], [])[0], /malformed contract marker/);
  assert.match(errorsOf([], [spec("[atoms.sample] works")])[0], /malformed contract id "\[atoms\.sample\]"/);
});

test("[guardrails.contracts.one-to-one] the repository's docs and tests map one to one", () => {
  const repository = readRepository();
  assert.ok(repository.docs.length > 0 && repository.tests.length > 0, "the repository has docs and tests");
  assert.deepEqual(checkContracts(repository), []);
});
