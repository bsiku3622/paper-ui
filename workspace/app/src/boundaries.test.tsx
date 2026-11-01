// @vitest-environment node

import { readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ReactNode } from "react";
import ts from "typescript";
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

const parsed = (file: string, text: string) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const walk = (root: ts.Node, visit: (node: ts.Node) => void) => {
  visit(root);
  ts.forEachChild(root, (child) => walk(child, visit));
};

describe("the app's layout primitives", () => {
  it("take a literal size as a prop, not through style", () => {
    const PARTS = new Set(["Box", "Stack", "Inline", "Grid", "Surface", "Paint"]);
    const SIZES = new Set(["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight"]);
    const hits: string[] = [];
    for (const [file, text] of views) {
      walk(parsed(file, text), (node) => {
        if (!ts.isJsxOpeningLikeElement(node) || !PARTS.has(node.tagName.getText())) return;
        for (const attribute of node.attributes.properties) {
          if (!ts.isJsxAttribute(attribute) || attribute.name.getText() !== "style") continue;
          const value = attribute.initializer && ts.isJsxExpression(attribute.initializer) ? attribute.initializer.expression : undefined;
          if (!value || !ts.isObjectLiteralExpression(value)) continue;
          for (const property of value.properties) {
            if (ts.isPropertyAssignment(property) && SIZES.has(property.name.getText()) && (ts.isStringLiteralLike(property.initializer) || ts.isNumericLiteral(property.initializer))) {
              hits.push(`${file}: ${node.tagName.getText()} ${property.getText()}`);
            }
          }
        }
      });
    }
    expect(hits).toEqual([]);
  });
});

describe("the app's styles", () => {
  it("select :hover only inside the condition that a pointer can hover", () => {
    const insideGate = (node: ts.Node): boolean => {
      for (let at: ts.Node | undefined = node.parent; at; at = at.parent) {
        if (ts.isPropertyAssignment(at) && ts.isStringLiteralLike(at.name) && at.name.text === "(hover: hover)") return true;
      }
      return false;
    };
    const ungated: string[] = [];
    for (const [file, text] of stylesheets) {
      walk(parsed(file, text), (node) => {
        const written = ts.isStringLiteralLike(node) || ts.isTemplateExpression(node) ? node.getText() : "";
        if (written.includes(":hover") && !insideGate(node)) ungated.push(`${file}: ${written}`);
      });
    }
    expect(ungated).toEqual([]);
  });

  it("copy no axis by hand: the control sizes and statuses come from the vocabulary", () => {
    const HAND_COPIES = [/(?<!"xs",\s*)"sm",\s*"md",\s*"lg"/, /"sm"\s*\|\s*"md"\s*\|\s*"lg"/, /"info"\s*\|\s*"success"\s*\|\s*"warning"\s*\|\s*"error"/];
    expect(sources.filter(([, text]) => HAND_COPIES.some((copy) => copy.test(text))).map(([file]) => file)).toEqual([]);
  });

  it("draw a router link through the Link or Button Atom, not on its own", () => {
    expect(views.filter(([, text]) => /<RouterLink\b/.test(text)).map(([file]) => file)).toEqual([]);
  });
});
