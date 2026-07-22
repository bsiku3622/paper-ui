// playground.spec — 시스템의 계약을 playground 페이지에서 자동 검증한다.
//
// 픽셀 비교가 아니라 *계산값* 을 assert 한다: 타입 크기·굵기, 토큰 hex,
// 정렬(같은 baseline), 포커스 링 색, status→색 매핑, 상호작용(탭·모달·툴팁).
// 값을 하드코딩해 두어, 토큰이 의도치 않게 바뀌면 여기서 걸린다 (회귀 가드).

import { test, expect, type Page } from "@playwright/test";

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

test.beforeEach(async ({ page }) => {
  await page.goto("/playground");
  await page.getByTestId("text-title").waitFor();
});

// ── 타입 스케일 — 6 variant 의 크기·굵기가 토큰과 일치 ──────────────────────
const TYPE = {
  display: { size: "32px", weight: "700" },
  title: { size: "22px", weight: "700" },
  heading: { size: "18px", weight: "600" },
  subheading: { size: "15px", weight: "600" },
  body: { size: "14px", weight: "450" },
  caption: { size: "13px", weight: "450" },
  label: { size: "12px", weight: "600" },
  mono: { size: "14px", weight: "450" },
} as const;

for (const [variant, spec] of Object.entries(TYPE)) {
  test(`type · ${variant} 는 ${spec.size} / weight ${spec.weight}`, async ({ page }) => {
    const el = page.getByTestId(`text-${variant}`);
    await expect(el).toHaveCSS("font-size", spec.size);
    await expect(el).toHaveCSS("font-weight", spec.weight);
  });
}

test("type · mono 는 등폭 서체", async ({ page }) => {
  const el = page.getByTestId("text-mono");
  const fam = await el.evaluate((n) => getComputedStyle(n).fontFamily);
  expect(fam).toMatch(/mono/i);
});

// ── 색 토큰 — :root 의 CSS var 가 기대 hex 와 일치 ─────────────────────────
const VARS: Record<string, string> = {
  "--pui-color-paper-base": "#ffffff",
  "--pui-color-paper-subtle": "#f7f7f8",
  "--pui-color-paper-muted": "#ececee",
  "--pui-color-ink-base": "#18181b",
  "--pui-color-ink-soft": "#71717a",
  "--pui-color-ink-faint": "#a1a1aa",
  "--pui-color-border-base": "#e8e8ea",
  "--pui-color-accent-blue-solid": "#2563eb",
  "--pui-color-accent-green-solid": "#16a34a",
  "--pui-color-accent-amber-solid": "#d97706",
  "--pui-color-accent-red-solid": "#dc2626",
  "--pui-color-primary-base": "#18181b",
  "--pui-color-focus-ring": "#2563eb",
};

test("color · 토큰이 기대 hex 로 emit 된다", async ({ page }) => {
  const got = await page.evaluate((names: string[]) => {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]));
  }, Object.keys(VARS));
  for (const [name, hex] of Object.entries(VARS)) expect(got[name], name).toBe(hex);
});

// ── 정렬 — Field 와 Button 이 같은 top(baseline)에 앉는다 (과거 회귀 버그) ──
test("align · Field 와 Button 의 top 이 일치", async ({ page }) => {
  const f = await page.getByTestId("align-field").boundingBox();
  const b = await page.getByTestId("align-button").boundingBox();
  expect(f && b).toBeTruthy();
  expect(Math.abs(f!.y - b!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(f!.height - b!.height)).toBeLessThanOrEqual(1);
});

// ── 포커스 링 — Field 포커스 시 파란 링(테두리+그림자) ──────────────────────
test("focus · Field 포커스 시 파란 링", async ({ page }) => {
  const field = page.getByTestId("align-field");
  await field.focus();
  await expect(field).toHaveCSS("border-color", hexToRgb("#2563eb"));
  const shadow = await field.evaluate((n) => getComputedStyle(n).boxShadow);
  expect(shadow).not.toBe("none");
});

// ── Badge status → 색 (info·success·warning·danger) ─────────────────────────
const BADGE = { info: "#1d4ed8", success: "#15803d", warning: "#b45309", danger: "#b91c1c" } as const;
for (const [status, ink] of Object.entries(BADGE)) {
  test(`badge · ${status} 글자색 = ${ink}`, async ({ page }) => {
    await expect(page.getByTestId(`badge-${status}`)).toHaveCSS("color", hexToRgb(ink));
  });
}

// ── Button — variant × status. solid=검정 채움, soft=회색 면, status=danger=빨강 ─
test("button · solid 는 검정 채움 + weight 550", async ({ page }) => {
  const b = page.getByTestId("btn-solid");
  await expect(b).toHaveCSS("background-color", hexToRgb("#18181b"));
  await expect(b).toHaveCSS("font-weight", "550");
});
test("button · soft 는 회색 면(muted)", async ({ page }) => {
  await expect(page.getByTestId("btn-soft")).toHaveCSS("background-color", hexToRgb("#ececee"));
});
test("button · status=danger 는 빨강 채움", async ({ page }) => {
  // 기본 variant=solid 에 status=danger → red.solid 배경
  await expect(page.getByTestId("btn-danger")).toHaveCSS("background-color", hexToRgb("#dc2626"));
});
test("button · disabled 는 비활성", async ({ page }) => {
  await expect(page.getByTestId("btn-disabled")).toBeDisabled();
});

// ── Tabs — 활성 탭이 흰 pill 로 떠오르고 클릭으로 바뀐다 ────────────────────
test("tabs · 클릭하면 활성이 바뀐다", async ({ page }) => {
  const two = page.getByRole("tab", { name: "둘" });
  await two.click();
  await expect(two).toHaveCSS("background-color", hexToRgb("#ffffff"));
});

// ── Modal — 열고 Esc 로 닫힌다 ─────────────────────────────────────────────
test("modal · 열림 → Esc 닫힘", async ({ page }) => {
  await page.getByTestId("modal-open").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

// ── Tooltip — hover 시 나타난다 ────────────────────────────────────────────
test("tooltip · hover 시 나타난다", async ({ page }) => {
  await page.getByTestId("tooltip-trigger").hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
});

// ── 컴포넌트 상세 — prop 토글이 preview 와 코드를 함께 움직인다 ──────────────
test("detail · Button variant 토글이 preview 와 코드에 반영된다", async ({ page }) => {
  await page.goto("/playground/button");
  const stageBtn = page.locator(".preview-stage button");
  const code = page.locator(".code-block pre");
  await stageBtn.waitFor();

  // 기본 variant=solid → 코드에 variant 가 안 적힌다(기본값 생략), 배경은 검정
  await expect(code).not.toContainText('variant=');
  await expect(stageBtn).toHaveCSS("background-color", hexToRgb("#18181b"));

  // variant=soft 로 바꾸면 코드와 preview 가 함께 바뀐다 (첫 select = variant)
  await page.locator(".detail-body select").first().selectOption("soft");
  await expect(code).toContainText('variant="soft"');
  await expect(stageBtn).toHaveCSS("background-color", hexToRgb("#ececee"));
});

test("detail · 알 수 없는 slug 는 전수로 되돌린다", async ({ page }) => {
  await page.goto("/playground/nope");
  await expect(page).toHaveURL(/\/playground$/);
  await page.getByTestId("text-title").waitFor();
});

// 컴포넌트 사이를 사이드바로 옮기면 상태가 앞 컴포넌트 값을 물려받지 않고 새로 시작한다
// (과거 버그: variant="" · children=undefined 유령이 샜다).
test("detail · 컴포넌트 전환 시 상태가 초기화된다", async ({ page }) => {
  await page.goto("/playground/badge");
  await page.locator(".code-block pre").waitFor();
  // Badge → Button 을 사이드바 링크(클라이언트 이동)로 (링크 = a, 안에 Button)
  await page.locator('a[href="/playground/button"]').click();
  await expect(page).toHaveURL(/\/playground\/button$/);
  const code = page.locator(".code-block pre");
  await expect(code).toHaveText("<Button>버튼</Button>");
  await expect(code).not.toContainText("undefined");
  await expect(code).not.toContainText('variant=""');
});

// ── 콘솔 에러가 없다 ────────────────────────────────────────────────────────
test("no console errors on playground", async ({ page }: { page: Page }) => {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto("/playground");
  await page.getByTestId("text-title").waitFor();
  await page.waitForTimeout(500);
  expect(errs).toEqual([]);
});
