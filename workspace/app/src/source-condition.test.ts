// @vitest-environment node

import { fileURLToPath } from "node:url";
import { createServer, loadConfigFromFile } from "vite";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
const stylesheet = fileURLToPath(new URL("./docs/prose.css.ts", import.meta.url));

describe("the app's stylesheets", () => {
  // A dist older than the source would hand a stylesheet a name that does not exist yet, on this machine and not in CI.
  it("read the package's source, as the vanilla-extract compiler starts its server from the config file", async () => {
    const loaded = await loadConfigFromFile({ command: "serve", mode: "test" }, undefined, root);
    if (!loaded) throw new Error("the app has a Vite config");
    // What the compiler does with that config: spreads it, replaces `ssr`, and resolves in the ssr environment.
    const server = await createServer({
      ...loaded.config,
      plugins: [],
      configFile: false,
      root,
      logLevel: "silent",
      appType: "custom",
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true },
      ssr: { noExternal: true },
    });
    try {
      const resolved = await server.environments.ssr.pluginContainer.resolveId("@studio-baeks/paper-ui/tokens", stylesheet);
      expect(resolved?.id).toMatch(/packages\/paper-ui\/src\/tokens\/public\.ts$/);
    } finally {
      await server.close();
    }
  });
});
