// check-package.mjs — publint (strict) and attw (esm-only) over the tarball, which is what a consumer installs.
//
//   pnpm check:package            packs the package (prepack builds it) and checks the tarball
//   pnpm check:package <tarball>  checks a tarball that already exists, as scripts/smoke-dist.mjs does

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const run = (command, args, options = {}) => execFileSync(command, args, { cwd: packageDir, stdio: "inherit", ...options });

const check = (tarball) => {
  run("pnpm", ["exec", "publint", "run", tarball, "--strict"]);
  // The stylesheet entry is not a module: attw has no types to resolve for it.
  run("pnpm", ["exec", "attw", tarball, "--profile", "esm-only", "--exclude-entrypoints", "./styles.css"]);
};

const given = process.argv[2];
if (given) {
  check(resolve(given));
} else {
  const scratch = mkdtempSync(join(tmpdir(), "paper-ui-pack-"));
  try {
    run("pnpm", ["pack", "--pack-destination", scratch]);
    check(join(scratch, readdirSync(scratch).find((file) => file.endsWith(".tgz"))));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
