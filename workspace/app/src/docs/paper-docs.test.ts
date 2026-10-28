// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { build, type Rollup } from "vite";
import { afterEach, describe, expect, it } from "vitest";

import { collectDocs, paperDocs } from "../../vite/paper-docs";
import type { DocGroup } from "../site/site-core";

const GROUPS: DocGroup[] = [
  { id: "", label: "", ko: "", docs: ["README"] },
  { id: "guide", label: "Guide", ko: "안내", docs: ["intro", "README"] },
];

const dirs: string[] = [];
const docsDir = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), "paper-docs-"));
  dirs.push(dir);
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), text);
  }
  return dir;
};
const VALID = { "README.md": "# Home\n", "guide/README.md": "# Guide\n", "guide/intro.md": "# Intro\n\ntext\n" };

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("collectDocs", () => {
  it("lists the docs with slug, group, title and file, in DOC_GROUPS order", async () => {
    expect(await collectDocs({ dir: docsDir(VALID), groups: GROUPS })).toEqual([
      { slug: "", group: "", title: "Home", file: "README.md" },
      { slug: "guide/intro", group: "guide", title: "Intro", file: "guide/intro.md" },
      { slug: "guide", group: "guide", title: "Guide", file: "guide/README.md" },
    ]);
  });

  it("rejects a doc that DOC_GROUPS does not list", async () => {
    const dir = docsDir({ ...VALID, "guide/extra.md": "# Extra\n", "stray/note.md": "# Note\n" });
    await expect(collectDocs({ dir, groups: GROUPS })).rejects.toThrow(/docs\/guide\/extra\.md is not listed[\s\S]*docs\/stray\/note\.md is not listed/);
  });

  it("rejects a listed doc without a file", async () => {
    const dir = docsDir({ "README.md": "# Home\n", "guide/README.md": "# Guide\n" });
    await expect(collectDocs({ dir, groups: GROUPS })).rejects.toThrow(/docs\/guide\/intro\.md is listed but has no file/);
  });

  it("rejects a group that lists no docs", async () => {
    await expect(collectDocs({ dir: docsDir(VALID), groups: [...GROUPS, { id: "empty", label: "Empty", ko: "빈", docs: [] }] })).rejects.toThrow(/group "empty" lists no docs/);
  });

  it("rejects a doc whose first line is not a '# Title'", async () => {
    await expect(collectDocs({ dir: docsDir({ ...VALID, "guide/intro.md": "Intro text\n# Intro\n" }), groups: GROUPS })).rejects.toThrow(/docs\/guide\/intro\.md: .*# Title/);
  });
});

describe("paperDocs", () => {
  const bundle = (dir: string) =>
    build({
      configFile: false,
      logLevel: "silent",
      plugins: [
        paperDocs({ dir, groups: GROUPS }),
        { name: "entry", resolveId: (id) => (id === "entry" ? "\0entry" : null), load: (id) => (id === "\0entry" ? 'import { DOCS } from "virtual:paper-docs"; console.log(DOCS);' : null) },
      ],
      build: { write: false, minify: false, rollupOptions: { input: "entry" } },
    });

  it("serves virtual:paper-docs to a build", async () => {
    const { output } = (await bundle(docsDir(VALID))) as Rollup.RollupOutput;
    const code = output.map((chunk) => ("code" in chunk ? chunk.code : "")).join("");
    expect([...code.matchAll(/"title": "([^"]+)"/g)].map((match) => match[1])).toEqual(["Home", "Intro", "Guide"]);
  });

  it("fails a build on an unlisted doc, a missing doc or a doc without a title", async () => {
    await expect(bundle(docsDir({ ...VALID, "extra.md": "# Extra\n" }))).rejects.toThrow(/not listed in DOC_GROUPS/);
    await expect(bundle(docsDir({ "README.md": "# Home\n", "guide/README.md": "# Guide\n" }))).rejects.toThrow(/listed but has no file/);
    await expect(bundle(docsDir({ ...VALID, "README.md": "Home\n" }))).rejects.toThrow(/# Title/);
  });
});
