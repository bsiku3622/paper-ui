// smoke-dist.mjs — runs the distribution contract on the tarball a consumer installs, not on the workspace.
//
//   1. packs the package (prepack builds it) into a temporary directory;
//   2. checks the tarball with publint and attw (the package's check:package);
//   3. checks the client boundary: dist/index.js opens with "use client", and dist/tokens.js and dist/theme-boot.js, with
//      every chunk they load, import no react and carry no "use client";
//   4. scans the tarball's dist/paper-ui.css against the browser floor (scripts/browser-baseline.mjs);
//   5. for React 19 and React 18, copies the e2e harness into a temporary consumer that installs the tarball and
//      nothing of vanilla-extract, type-checks it under both module resolutions with skipLibCheck off, builds it with
//      Vite, and imports /tokens and /theme-boot under the react-server condition;
//   6. runs playwright.dist.config.ts, which serves both builds with `vite preview` on strict ports and holds the
//      built stylesheet to the rules the docs declare.
//
// The helpers below are pure so scripts/smoke-dist.test.mjs holds the checks themselves to their contract without
// building anything. Everything runs only when this file is the entry.

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ───── The checks ──────────────────────────────────────────────────────────────────────────────────────────

const CLIENT_DIRECTIVE = /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*["']use client["']/;
const SPECIFIER = /\b(?:import|export)\b[^"'`;]*?\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;

export const hasClientDirective = (code) => CLIENT_DIRECTIVE.test(code);
export const specifiersOf = (code) => [...code.matchAll(SPECIFIER)].map((match) => match[1] ?? match[2] ?? match[3]);

// What a server-safe entry must never load: React, anything built on it, or a stylesheet.
const isReactBound = (specifier) => /^(?:react|react-dom)(?:\/|$)/.test(specifier) || specifier.startsWith("@react-aria/") || /\.css$/.test(specifier);

// The files an entry loads at import time: itself, and every relative module reached from it.
export const loadedFiles = (entry, read) => {
  const seen = new Map();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    const code = read(file);
    seen.set(file, code);
    for (const specifier of specifiersOf(code)) {
      if (specifier.startsWith(".")) queue.push(join(dirname(file), specifier));
    }
  }
  return seen;
};

// The problems of the client boundary in a built package. `read` maps a path inside the package to its text.
export const boundaryProblems = (read) => {
  const problems = [];
  if (!hasClientDirective(read("dist/index.js"))) problems.push('dist/index.js does not open with "use client"');
  for (const entry of ["dist/tokens.js", "dist/theme-boot.js"]) {
    for (const [file, code] of loadedFiles(entry, read)) {
      if (hasClientDirective(code)) problems.push(`${file} (loaded by ${entry}) carries "use client"`);
      for (const specifier of specifiersOf(code)) if (isReactBound(specifier)) problems.push(`${file} (loaded by ${entry}) imports ${specifier}`);
    }
  }
  return problems;
};

// The react-server import that proves an entry loads without React, as a node -e script: it exits 1 unless the
// entry's main export is there.
export const serverImport = (entry, name) => `import(${JSON.stringify(entry)}).then((m) => { if (!m[${JSON.stringify(name)}]) process.exit(1); })`;

// The entries a server component imports, each with the export that shows it loaded.
export const SERVER_ENTRIES = [
  ["@studio-baeks/paper-ui/tokens", "tokens"],
  ["@studio-baeks/paper-ui/theme-boot", "themeBootScript"],
];

// The consumer's package.json: the tarball, React at the version under test, the matching types, the build tools,
// and no vanilla-extract — the stylesheet is built, so a consumer needs nothing to compile it.
export const consumerManifest = ({ react, range, tarball }) => ({
  name: `paper-ui-consumer-react${react}`,
  private: true,
  type: "module",
  dependencies: {
    "@studio-baeks/paper-ui": `file:${tarball}`,
    react: range,
    "react-dom": range,
  },
  devDependencies: {
    "@types/react": `^${react}.0.0`,
    "@types/react-dom": `^${react}.0.0`,
    "@vitejs/plugin-react": "^4.7.0",
    typescript: "^5.6.0",
    vite: "^6.4.2",
  },
});

// What pnpm 11 needs of a Vite app to finish its first install; docs/get-started/install.md gives the same lines.
export const CONSUMER_WORKSPACE = "allowBuilds:\n  esbuild: true\n";

// React 19 as a caret range; React 18 at the floor of the peer range, so the lowest React the package claims runs.
export const CONSUMERS = [
  { react: 19, range: "^19.0.0", port: Number(process.env.E2E_DIST_PORT_19 ?? 41741) },
  { react: 18, range: "18.2.0", port: Number(process.env.E2E_DIST_PORT_18 ?? 41742) },
];

// ───── The run ─────────────────────────────────────────────────────────────────────────────────────────────

const workspace = fileURLToPath(new URL("..", import.meta.url));
const packageDir = join(workspace, "packages/paper-ui");
const harnessDir = join(workspace, "fixtures/harness");

const run = (command, args, options = {}) => execFileSync(command, args, { stdio: "inherit", ...options });
const step = (message) => console.log(`\nsmoke:dist — ${message}`);

const main = () => {
  const scratch = mkdtempSync(join(tmpdir(), "paper-ui-smoke-"));
  console.log(`smoke:dist — working in ${scratch}`);

  step("pack the package (prepack builds it)");
  const packed = join(scratch, "pack");
  mkdirSync(packed);
  run("pnpm", ["pack", "--pack-destination", packed], { cwd: packageDir });
  const tarball = join(packed, readdirSync(packed).find((file) => file.endsWith(".tgz")));

  step("check the tarball with publint and attw");
  run("pnpm", ["run", "check:package", tarball], { cwd: packageDir });

  step("check the client boundary of the tarball");
  const unpacked = join(scratch, "unpacked");
  mkdirSync(unpacked);
  run("tar", ["-xzf", tarball, "-C", unpacked]);
  const problems = boundaryProblems((path) => readFileSync(join(unpacked, "package", path), "utf8"));
  if (problems.length > 0) throw new Error(`The client boundary is broken:\n${problems.join("\n")}`);

  step("scan the tarball's stylesheet against the browser floor");
  run("node", [join(workspace, "scripts/browser-baseline.mjs"), join(unpacked, "package/dist/paper-ui.css")]);

  const consumers = {};
  for (const { react, range } of CONSUMERS) {
    const dir = join(scratch, `consumer-react${react}`);
    consumers[react] = dir;
    step(`build a React ${react} consumer (${range}) in ${relative(scratch, dir)}`);
    mkdirSync(dir);
    for (const path of ["index.html", "public", "src", "vite.config.dist.ts", "tsconfig.bundler.json", "tsconfig.node16.json"]) cpSync(join(harnessDir, path), join(dir, path), { recursive: true });
    writeFileSync(join(dir, "package.json"), `${JSON.stringify(consumerManifest({ react, range, tarball }), null, 2)}\n`);
    writeFileSync(join(dir, "pnpm-workspace.yaml"), CONSUMER_WORKSPACE);
    run("pnpm", ["install", "--prefer-offline"], { cwd: dir });
    for (const config of ["tsconfig.bundler.json", "tsconfig.node16.json"]) run("pnpm", ["exec", "tsc", "-p", config], { cwd: dir });
    run("pnpm", ["exec", "vite", "build", "-c", "vite.config.dist.ts"], { cwd: dir });
    for (const [entry, name] of SERVER_ENTRIES) run("node", ["--conditions=react-server", "-e", serverImport(entry, name)], { cwd: dir });
  }

  step("run the dist specs against both builds and the stylesheet");
  run("pnpm", ["exec", "playwright", "test", "-c", "playwright.dist.config.ts"], {
    cwd: workspace,
    env: {
      ...process.env,
      ...Object.fromEntries(CONSUMERS.flatMap(({ react, port }) => [[`DIST_CONSUMER_${react}`, consumers[react]], [`DIST_PORT_${react}`, String(port)]])),
      DIST_STYLESHEET: join(unpacked, "package/dist/paper-ui.css"),
    },
  });

  rmSync(scratch, { recursive: true, force: true });
  console.log("\nsmoke:dist passed");
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
