import { defineConfig, devices } from "@playwright/test";

import { APP_PORT, HARNESS_PORT, app, harness } from "./tests/support/harness";

// Fixed ports with --strictPort and no server reuse, so a server from another worktree never answers for this one.
type Engine = "firefox" | "webkit";

type EngineExclusion = { spec: string; test: string; engine: Engine; platform?: NodeJS.Platform; reason: string; until: string };

const ENGINE_EXCLUSIONS: readonly EngineExclusion[] = [
  {
    spec: "primitives/a11y.spec.ts",
    test: "[primitives.focus-scope.options] FocusScope contains focus and restores the opener",
    engine: "webkit",
    platform: "darwin",
    reason: "macOS WebKit tabs to a button only with Option+Tab, and React Aria's contain leaves a Tab with Alt held to the browser, so the third press leaves the page instead of wrapping to the first input. WebKit on other platforms tabs with Tab and runs the test.",
    until: "engine",
  },
];

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Playwright greps "<project> <spec> <describe…> <title>", the spec path being relative to testDir.
const excludedIn = (engine: Engine) => {
  const entries = ENGINE_EXCLUSIONS.filter((entry) => entry.engine === engine && (entry.platform ?? process.platform) === process.platform);
  return entries.length > 0 ? new RegExp(entries.map((entry) => `${escape(entry.spec)} ${escape(entry.test)}$`).join("|")) : undefined;
};

const CROSS_ENGINE = ["foundations/shape.spec.ts", "primitives/**/*.spec.ts", "atoms/**/*.spec.ts"];

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["dist/**"],
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: app(),
    colorScheme: "light",
    locale: "ko-KR",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "chromium-dark",
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
      testMatch: ["foundations/theme.spec.ts", "foundations/color.spec.ts", "app/routes.spec.ts"],
    },
    {
      name: "chromium-reduced-motion",
      use: { ...devices["Desktop Chrome"], contextOptions: { reducedMotion: "reduce" } },
      testMatch: ["foundations/motion.spec.ts"],
    },
    {
      name: "chromium-forced-colors",
      use: { ...devices["Desktop Chrome"], contextOptions: { forcedColors: "active" } },
      testMatch: ["atoms/forced-colors.spec.ts"],
    },
    {
      name: "firefox",
      // macOS Firefox gives Tab only to text fields; widen it to every control.
      use: { ...devices["Desktop Firefox"], launchOptions: { firefoxUserPrefs: { "accessibility.tabfocus": 7 } } },
      testMatch: CROSS_ENGINE,
      grepInvert: excludedIn("firefox"),
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: CROSS_ENGINE,
      grepInvert: excludedIn("webkit"),
    },
  ],
  webServer: [
    {
      name: "app",
      command: `pnpm --filter @paper-ui/app dev --port ${APP_PORT} --strictPort`,
      url: app(),
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      name: "harness",
      command: `pnpm --filter @paper-ui/harness dev --port ${HARNESS_PORT} --strictPort`,
      url: harness(),
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
