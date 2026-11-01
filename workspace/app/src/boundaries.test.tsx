// @vitest-environment node

import { readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Icon } from "@studio-baeks/paper-ui";

import { GripIcon, InfoIcon, PlusIcon, SearchIcon } from "./compositions/icons";
import { glyph } from "./playground/registry/demo";

// What the app has promised about itself and no type can hold: read from the source of every app module.

const SRC = fileURLToPath(new URL(".", import.meta.url));
const sources = readdirSync(SRC, { recursive: true, encoding: "utf-8" })
  .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
  .map((file) => [`./${file.split(sep).join("/")}`, readFileSync(join(SRC, file), "utf-8")] as const);
const views = sources.filter(([file]) => file.endsWith(".tsx"));
const stylesheets = sources.filter(([file]) => file.endsWith(".css.ts"));

const drawing = (node: ReactNode) => /<svg[^>]*>(.*)<\/svg>/.exec(renderToStaticMarkup(<>{node}</>))?.[1];

describe("the app's drawings", () => {
  it("are drawn only in the files that declare why", () => {
    // The set, the wordmark, the Playground's samples (their code panel shows the path) and the Shape specimens.
    const DRAWS = ["./compositions/icons.tsx", "./playground/foundations/ShapePage.tsx", "./playground/foundations/kit.tsx", "./playground/registry/demo.tsx", "./site/Logo.tsx"];
    const found = views.filter(([, text]) => /<(path|circle|rect|line|polygon|polyline|ellipse)\b/.test(text)).map(([file]) => file);
    expect(found.sort()).toEqual(DRAWS);
  });

  it("are the same shapes in the Playground's samples as in the set", () => {
    expect(drawing(glyph.grip)).toBe(drawing(<GripIcon />));
    expect(drawing(glyph.plus)).toBe(drawing(<PlusIcon />));
    expect(drawing(glyph.search)).toBe(drawing(<SearchIcon />));
    expect(drawing(<Icon>{glyph.info}</Icon>)).toBe(drawing(<InfoIcon />));
  });
});

describe("the app's layout primitives", () => {
  it("take a literal size as a prop, not through style", () => {
    const LITERAL = /<(?:Box|Stack|Inline|Grid|Surface)\b[^>]*?\bstyle=\{\{[^}]*\b(?:width|minWidth|maxWidth|height|minHeight|maxHeight)\s*:\s*["'\d]/g;
    const hits = views.flatMap(([file, text]) => (text.match(LITERAL) ?? []).map((match) => `${file}: ${match}`));
    expect(hits).toEqual([]);
  });
});

describe("the app's styles", () => {
  it("select :hover only where a pointer can hover", () => {
    const REACH = 200;
    const ungated = stylesheets.flatMap(([file, text]) =>
      [...text.matchAll(/:hover/g)].filter((match) => {
        const gate = text.lastIndexOf("(hover: hover)", match.index);
        return gate === -1 || match.index - gate > REACH;
      }).map((match) => `${file}: ${text.slice(match.index - 30, match.index + 10)}`),
    );
    expect(ungated).toEqual([]);
  });

  it("copy no axis by hand: the control sizes come from the vocabulary", () => {
    const LADDER = /\[\s*"sm",\s*"md",\s*"lg"\s*\]/;
    expect(sources.filter(([, text]) => LADDER.test(text)).map(([file]) => file)).toEqual([]);
  });
});
