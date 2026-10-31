// @vitest-environment node
//
// Every generated block of the docs is current: the text between its markers is what render() gives from the
// sources. UPDATE_DOCS=1 (pnpm docs:sync) rewrites a stale block instead of failing on it. A block that names no
// file, or whose marker is missing from a file, fails here too.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { GENERATED_BLOCKS } from "./blocks";
import { readBlock, replaceBlock } from "./markers";
import { REPO } from "./paths";

const UPDATE = process.env.UPDATE_DOCS === "1";

describe("generated docs", () => {
  it("names every block once, and every block names at least one file", () => {
    const ids = GENERATED_BLOCKS.map((block) => block.id);
    expect(new Set(ids).size, "unique ids").toBe(ids.length);
    for (const block of GENERATED_BLOCKS) expect(block.files.length, block.id).toBeGreaterThan(0);
  });

  // CommonMark reads a line that starts with a comment as an HTML block to its end, so any text after the comment
  // on that line would show raw. A comment that opens a line stands alone.
  it("never lets a marker start a line that goes on with text", () => {
    const files = [...new Set(GENERATED_BLOCKS.flatMap((block) => block.files))];
    const hits = files.flatMap((file) =>
      readFileSync(join(REPO, file), "utf-8").split("\n").flatMap((line, index) => (/^ {0,3}<!--/.test(line) && line.replace(/<!--.*?-->/g, "").trim() !== "" ? [`${file}:${index + 1}`] : [])),
    );
    expect(hits).toEqual([]);
  });

  for (const block of GENERATED_BLOCKS) {
    for (const file of block.files) {
      it(`[${block.id}] ${file} holds the block as the sources state it`, () => {
        const path = join(REPO, file);
        const text = readFileSync(path, "utf-8");
        const expected = block.render();
        const actual = readBlock(text, block.id);
        if (actual === undefined) throw new Error(`${file} has no generated:${block.id} markers`);
        if (UPDATE) {
          if (actual !== expected) writeFileSync(path, replaceBlock(text, block, expected));
          return;
        }
        expect(actual).toBe(expected);
      });
    }
  }
});
