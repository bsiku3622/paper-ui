import { defineConfig, devices } from "@playwright/test";

import { APP_PORT, HARNESS_PORT, app, harness } from "./tests/support/harness";

// 구조 assert 중심 e2e — 앱과 @paper-ui/harness 페이지에서 정렬·색·포커스·타입의 계산값을 검증한다.
// 픽셀 스냅샷은 쓰지 않는다 (환경차에 취약하고, 여기선 계산값이 정본).
// 서버 둘은 실행이 직접 띄운다. 포트를 고정해 --strictPort 로 띄우고 이미 떠 있는 서버를 재사용하지 않으므로,
// 늘 이 작업 트리를 검사하고 포트를 다른 서버가 쥐고 있으면 그 서버를 검사하는 대신 실패한다.
// 포트는 E2E_APP_PORT · E2E_HARNESS_PORT 로 옮긴다. tests/dist 는 배포본 전용 설정이 돌린다.

type Engine = "firefox" | "webkit";

// 한 엔진에서만 실패하는 테스트. 그 대상을 다시 짓는 `until` 단계가 그 엔진에서 다시 켤 때까지 끈다.
type EngineExclusion = { spec: string; test: string; engine: Engine; reason: string; until: string };

const ENGINE_EXCLUSIONS: readonly EngineExclusion[] = [
  {
    spec: "primitives/a11y.spec.ts",
    test: "FocusScope contains focus and restores the opener",
    engine: "webkit",
    reason: "macOS WebKit reaches the close button only with Option+Tab, which FocusScope contain leaves to the browser, so focus does not wrap.",
    until: "S32",
  },
];

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Playwright 는 "<project> <spec> <describe…> <title>" 을 grep 한다 — spec 은 testDir 기준 경로,
// test 는 그 뒤의 전부(describe 제목들, 테스트 제목)다.
const excludedIn = (engine: Engine) => {
  const entries = ENGINE_EXCLUSIONS.filter((entry) => entry.engine === engine);
  return entries.length > 0 ? new RegExp(entries.map((entry) => `${escape(entry.spec)} ${escape(entry.test)}$`).join("|")) : undefined;
};

// Firefox · WebKit 은 패키지 자신의 렌더링과 입력 처리를 다루는 spec 을 돈다.
const CROSS_ENGINE = ["foundations/shape.spec.ts", "primitives/**/*.spec.ts", "atoms/**/*.spec.ts"];

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["dist/**"],
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: app(),
    colorScheme: "light",
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
      // macOS 의 Firefox 도 Tab 을 텍스트 필드에만 준다 — 모든 컨트롤로 넓힌다.
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
