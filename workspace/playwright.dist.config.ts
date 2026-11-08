import { defineConfig, devices } from "@playwright/test";

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
