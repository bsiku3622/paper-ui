import assert from "node:assert/strict";
import { test } from "node:test";

import { definitionsIn, orphans, readRepository, referencesIn } from "./check-testids.mjs";

const found = (code) => definitionsIn("app/src/x.tsx", code).map(({ id, template }) => (template ? `${id}…` : id));
const read = (code) => referencesIn(code).map(({ id, template }) => (template ? `${id}…` : id));

test("[guardrails.testids.no-orphans] reads a data-testid and a testid prop, quoted, braced or templated, and skips a bare variable", () => {
  assert.deepEqual(
    found('<a data-testid="one" /><b data-testid={"two"} /><c data-testid={`three-${size}`} /><d testid="four" /><e data-testid={name} /><f {...{ "data-testid": "five" }} />'),
    ["one", "two", "three-…", "four", "five"],
  );
});

test("[guardrails.testids.no-orphans] reads a lookup by test id, a [data-testid] selector, and a prefix selector", () => {
  const asked = read('page.getByTestId("a"); page.getByTestId(`b-${n}`); locator("[data-testid=c]"); locator(`[data-testid="d-${n}"]`); locator("[data-testid^=e-]")');
  for (const expected of ["a", "b-…", "c", "d-…", "e-…"]) assert.ok(asked.includes(expected), expected);
});

test("[guardrails.testids.no-orphans] counts the ids a file that looks things up by test id spells in a table, and none in a file that does not", () => {
  assert.ok(read('const IDS = ["soft", "error"]; for (const id of IDS) page.getByTestId(id);').includes("soft"));
  assert.deepEqual(read('const label = "soft";'), []);
});

test("[guardrails.testids.no-orphans] reads no id in what a lookup by role, label or text is given, however the lookup is spelled", () => {
  const lookups = [
    'page.getByTestId("x"); page.getByRole("textarea");',
    'page.getByTestId("x"); page.getByRole("button", { name: "textarea", exact: true });',
    'page.getByTestId("x"); page.getByLabel("textarea", { exact: true });',
    'page.getByTestId("x"); page.getByText(`textarea`);',
    'screen.getByTestId("x"); screen.getByLabelText("textarea"); screen.queryByRole("textarea"); screen.findAllByText("textarea");',
  ];
  for (const code of lookups) assert.deepEqual(read(code).filter((id) => id !== "x"), [], code);
  // The same word kept in a table the file loops over is still a read.
  assert.ok(read('const IDS = ["textarea"]; for (const id of IDS) page.getByTestId(id); page.getByRole("button");').includes("textarea"));
});

test("[guardrails.testids.no-orphans] finds a fixture no test reads, and reads a template on its literal start", () => {
  const definitions = [
    { id: "kept", template: false, file: "a" },
    { id: "dead", template: false, file: "a" },
    { id: "tier-", template: true, file: "a" },
    { id: "gone-", template: true, file: "a" },
    { id: "row-3", template: false, file: "a" },
  ];
  const references = [
    { id: "kept", template: false },
    { id: "tier-lifted", template: false },
    { id: "row-", template: true },
  ];
  assert.deepEqual(orphans({ definitions, references }).map(({ id }) => id), ["dead", "gone-"]);
});

test("[guardrails.testids.no-orphans] leaves no data-testid in the app or the harness that no test reads", () => {
  const { definitions, references } = readRepository();
  assert.ok(definitions.length > 100, "the app and the harness define their test ids");
  assert.ok(references.length > 100, "the tests refer to them");
  assert.deepEqual(orphans({ definitions, references }).map(({ file, id }) => `${file}: ${id}`), []);
});
