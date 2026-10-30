// build-types.mjs — one bundled declaration file per entry, at the boundary the JS bundle uses.
//
// tsc emits the declarations of src (tests and the token inspector excluded, tsconfig.build.json) into
// .types; rollup-plugin-dts folds each entry (index, tokens, theme-boot) into a single file in dist; .types
// is removed. The root entry keeps the tokens entry external and imports it as ./tokens.js, the way
// dist/index.js reaches it. A bundled declaration that names React Aria or its type packages fails the build:
// the public types are Paper's own, and React Aria stays behind src/internal/aria.

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";
import { dts } from "rollup-plugin-dts";

import { ariaLeaks } from "./aria-leak.mjs";

const at = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const types = at(".types");
const tokensEntry = at(".types/tokens/public.d.ts");

const bundle = async (input, file, paths = {}) => {
  const build = await rollup({ input: at(input), plugins: [dts()], external: (id, _importer, isResolved) => isResolved && id in paths });
  await build.write({ file: at(file), format: "es", paths });
  await build.close();
};

const ENTRIES = ["dist/index.d.ts", "dist/tokens.d.ts", "dist/theme-boot.d.ts"];
const assertNoAria = () => {
  const leaks = ENTRIES.flatMap((file) => ariaLeaks(file, readFileSync(at(file), "utf8")));
  if (leaks.length > 0) throw new Error(`The bundled declarations name React Aria:\n${leaks.join("\n")}`);
};

rmSync(types, { recursive: true, force: true });
execFileSync(process.execPath, [createRequire(import.meta.url).resolve("typescript/bin/tsc"), "-p", at("tsconfig.build.json")], { stdio: "inherit" });
try {
  await bundle(".types/index.d.ts", "dist/index.d.ts", { [tokensEntry]: "./tokens.js" });
  await bundle(".types/tokens/public.d.ts", "dist/tokens.d.ts");
  await bundle(".types/theme/boot.d.ts", "dist/theme-boot.d.ts");
  assertNoAria();
} finally {
  rmSync(types, { recursive: true, force: true });
}
