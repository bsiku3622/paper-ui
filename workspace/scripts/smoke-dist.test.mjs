import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CONSUMERS, CONSUMER_WORKSPACE, SERVER_ENTRIES, boundaryProblems, consumerManifest, hasClientDirective, loadedFiles, serverImport, specifiersOf } from "./smoke-dist.mjs";

// A built package as a map of path → text.
const built = (files) => (path) => {
  assert.ok(path in files, `${path} is read but not in the fixture`);
  return files[path];
};

const CLEAN = {
  "dist/index.js": '"use client";import{a}from"./chunks/index-1.js";import"react";export{a};',
  "dist/chunks/index-1.js": 'import{createContext}from"react";export const a=1;',
  "dist/tokens.js": 'import{k}from"./chunks/color-modes-1.js";export const tokens={};',
  "dist/chunks/color-modes-1.js": "export const k=1;",
  "dist/theme-boot.js": 'import{k}from"./chunks/color-modes-1.js";export const themeBootScript=()=>k;',
};

test("[install.entry.tokens-server-safe] [install.entry.table] passes a package whose server entries load no React and whose root entry opens with use client", () => {
  assert.deepEqual(boundaryProblems(built(CLEAN)), []);
});

test("[install.entry.tokens-server-safe] reports React, a stylesheet or a client directive anywhere in what /tokens or /theme-boot load", () => {
  const react = { ...CLEAN, "dist/chunks/color-modes-1.js": 'import{useId}from"react";export const k=1;' };
  assert.deepEqual(boundaryProblems(built(react)), [
    "dist/chunks/color-modes-1.js (loaded by dist/tokens.js) imports react",
    "dist/chunks/color-modes-1.js (loaded by dist/theme-boot.js) imports react",
  ]);
  const aria = { ...CLEAN, "dist/tokens.js": 'import"@react-aria/utils";export const tokens={};' };
  assert.deepEqual(boundaryProblems(built(aria)), ["dist/tokens.js (loaded by dist/tokens.js) imports @react-aria/utils"]);
  const css = { ...CLEAN, "dist/theme-boot.js": 'import"./paper-ui.css";export const themeBootScript=1;', "dist/paper-ui.css": "" };
  assert.deepEqual(boundaryProblems((path) => (path.endsWith(".css") ? "" : css[path])), ["dist/theme-boot.js (loaded by dist/theme-boot.js) imports ./paper-ui.css"]);
  const client = { ...CLEAN, "dist/chunks/color-modes-1.js": '"use client";export const k=1;' };
  assert.equal(boundaryProblems(built(client)).filter((problem) => problem.includes("use client")).length, 2);
});

test("[install.entry.tokens-server-safe] [install.runtime.environments] reports a root entry that does not open with use client", () => {
  assert.deepEqual(boundaryProblems(built({ ...CLEAN, "dist/index.js": 'import"react";export const a=1;' })), ['dist/index.js does not open with "use client"']);
  assert.ok(hasClientDirective('/* banner */\n"use client";export {};'));
  assert.ok(!hasClientDirective('export const note = "use client";'));
});

test("[install.entry.tokens-server-safe] reads import, export-from, bare and dynamic specifiers, and follows only relative ones", () => {
  const code = 'import a from"./a.js";export{b}from"./b.js";import"./c.css";const d=()=>import("./d.js");import{e}from"react";';
  assert.deepEqual(specifiersOf(code), ["./a.js", "./b.js", "./c.css", "./d.js", "react"]);
  const files = { "dist/x.js": code, "dist/a.js": "", "dist/b.js": "", "dist/c.css": "", "dist/d.js": "" };
  assert.deepEqual([...loadedFiles("dist/x.js", built(files)).keys()].sort(), Object.keys(files).sort());
});

test("[install.entry.tokens-server-safe] imports both server entries under the react-server condition and fails when the export is missing", () => {
  assert.deepEqual(SERVER_ENTRIES.map(([entry]) => entry), ["@studio-baeks/paper-ui/tokens", "@studio-baeks/paper-ui/theme-boot"]);
  const run = (entry, name) => spawnSync("node", ["--conditions=react-server", "-e", serverImport(entry, name)], { encoding: "utf8" });
  const module = "data:text/javascript,export const tokens = {}";
  assert.equal(run(module, "tokens").status, 0);
  assert.equal(run(module, "themeBootScript").status, 1);
});

test("[install.smoke.steps] packs a tarball, checks it, scans its stylesheet, then builds both consumers and runs the specs against them, in that order", () => {
  const source = readFileSync(new URL("./smoke-dist.mjs", import.meta.url), "utf8");
  const main = source.slice(source.indexOf("const main = () =>"));
  const steps = ['"pack"', '"check:package"', "boundaryProblems(", "browser-baseline.mjs", "CONSUMERS", '"tsconfig.bundler.json", "tsconfig.node16.json"', '"vite", "build"', '"--conditions=react-server"', "playwright.dist.config.ts"];
  const places = steps.map((step) => main.indexOf(step));
  for (const [index, place] of places.entries()) assert.ok(place >= 0, steps[index]);
  assert.deepEqual(places, [...places].sort((a, b) => a - b));
  assert.deepEqual(CONSUMERS.map(({ react }) => react), [19, 18]);
});

test("[install.package.peers] takes React 18.2 or 19 as a peer, is ESM only, and runs the consumer at the floor of that range", () => {
  const { peerDependencies, type, exports: entries } = JSON.parse(readFileSync(new URL("../packages/paper-ui/package.json", import.meta.url), "utf8"));
  assert.deepEqual(peerDependencies, { react: "^18.2.0 || ^19.0.0", "react-dom": "^18.2.0 || ^19.0.0" });
  assert.equal(type, "module");
  assert.equal(JSON.stringify(entries).includes('"require"'), false);
  assert.equal(CONSUMERS.find(({ react }) => react === 18).range, "18.2.0");
});

test("[install.entry.tokens-server-safe] describes a consumer that installs the tarball and React at the version under test, and compiles no CSS", () => {
  for (const { react, range } of CONSUMERS) {
    const manifest = consumerManifest({ react, range, tarball: "/tmp/paper.tgz" });
    assert.equal(manifest.dependencies["@studio-baeks/paper-ui"], "file:/tmp/paper.tgz");
    assert.equal(manifest.dependencies.react, range);
    assert.equal(manifest.dependencies["react-dom"], range);
    assert.equal(manifest.devDependencies["@types/react"], `^${react}.0.0`);
    assert.deepEqual(Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }).filter((name) => name.includes("vanilla-extract")), []);
  }
  assert.deepEqual(CONSUMERS.map(({ react }) => react), [19, 18]);
});

test("[install.setup.consumer-build] builds its consumer with the React plugin alone and the workspace file the install page gives, and the page names the plugin an app's .css.ts needs", () => {
  const manifest = consumerManifest({ react: 19, range: "^19.0.0", tarball: "/tmp/paper.tgz" });
  assert.deepEqual(Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }).filter((name) => /plugin|vanilla-extract/.test(name)), ["@vitejs/plugin-react"]);
  const config = readFileSync(new URL("../fixtures/harness/vite.config.dist.ts", import.meta.url), "utf8");
  assert.match(config, /plugins: \[react\(\)\]/);
  const page = readFileSync(new URL("../../docs/get-started/install.md", import.meta.url), "utf8");
  assert.ok(page.includes(`\`\`\`yaml\n${CONSUMER_WORKSPACE}\`\`\``), "the page gives the workspace file the smoke writes");
  assert.ok(page.includes("plugins: [react(), vanillaExtractPlugin()]"), "the page gives the plugin for an app's own .css.ts");
});
