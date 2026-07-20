import { defineConfig, devices } from "@playwright/test";

// 구조 assert 중심 e2e — playground 페이지를 대상으로 정렬·색·포커스·타입을
// 검증한다. 픽셀 스냅샷은 쓰지 않는다 (환경차에 취약하고, 여기선 계산값이 정본).
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    colorScheme: "light",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // 테스트가 dev 서버를 알아서 띄운다 (이미 떠 있으면 재사용).
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
