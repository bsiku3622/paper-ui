import { defineConfig, devices } from "@playwright/test";

// The dist specs: they run against what a consumer installs, never against the workspace. scripts/smoke-dist.mjs packs the
// package, builds a React 19 and a React 18 consumer from the tarball and runs this config, handing each consumer's
// folder and port in the environment. Each build is served by `vite preview` on a strict port, and the stylesheet spec
// reads the tarball's dist/paper-ui.css. The main config (playwright.config.ts) ignores tests/dist.

const need = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set: the dist specs run only through \`pnpm smoke:dist\`.`);
  return value;
};

const consumers = [19, 18].map((react) => ({ react, dir: need(`DIST_CONSUMER_${react}`), port: Number(need(`DIST_PORT_${react}`)) }));

export default defineConfig({
  testDir: "./tests/dist",
  fullyParallel: true,
  reporter: [["list"]],
  projects: [
    ...consumers.map(({ react, port }) => ({
      name: `react-${react}`,
      testMatch: "consumer.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${port}`, colorScheme: "light" as const },
    })),
    { name: "stylesheet", testMatch: "stylesheet.spec.ts", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: consumers.map(({ react, dir, port }) => ({
    name: `react-${react}`,
    command: `pnpm exec vite preview --host localhost --port ${port} --strictPort`,
    cwd: dir,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  })),
});
