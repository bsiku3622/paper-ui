import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const run = (command, args, options = {}) => execFileSync(command, args, { cwd: packageDir, stdio: "inherit", ...options });

const check = (tarball) => {
  run("pnpm", ["exec", "publint", "run", tarball, "--strict"]);
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
