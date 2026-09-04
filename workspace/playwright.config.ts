import { defineConfig, devices } from "@playwright/test";

// 구조 assert 중심 e2e — playground 페이지를 대상으로 정렬·색·포커스·타입을
// 검증한다. 픽셀 스냅샷은 쓰지 않는다 (환경차에 취약하고, 여기선 계산값이 정본).
// 포트는 env 로 연다 — 팔레트 두 안을 나란히 띄워 비교하는 동안 이 브랜치의 dev 서버가
// 5173 을 못 잡는 일이 잦다(먼저 뜬 쪽이 가져간다). 고정해 두면 그 브랜치에서 e2e 를
// 아예 못 돌린다.  PORT=5174 pnpm test:e2e
const PORT = process.env.PORT ?? "5173";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    colorScheme: "light",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // 테스트가 dev 서버를 알아서 띄운다 (이미 떠 있으면 재사용).
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
