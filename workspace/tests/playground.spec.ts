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
  await page.goto("/#/playground");
  await page.getByTestId("text-title").waitFor();
});

// ── 타입 스케일 — 6 variant 의 크기·굵기가 토큰과 일치 ──────────────────────
const TYPE = {
  title: { size: "22px", weight: "650" },
  heading: { size: "15px", weight: "600" },
  label: { size: "12px", weight: "500" },
  body: { size: "14px", weight: "400" },
  numeric: { size: "14px", weight: "450" },
  caption: { size: "13px", weight: "400" },
} as const;

for (const [variant, spec] of Object.entries(TYPE)) {
  test(`type · ${variant} 는 ${spec.size} / weight ${spec.weight}`, async ({ page }) => {
    const el = page.getByTestId(`text-${variant}`);
    await expect(el).toHaveCSS("font-size", spec.size);
    await expect(el).toHaveCSS("font-weight", spec.weight);
  });
}

test("type · numeric 는 mono + tabular", async ({ page }) => {
  const el = page.getByTestId("text-numeric");
  await expect(el).toHaveCSS("font-variant-numeric", "tabular-nums");
  const fam = await el.evaluate((n) => getComputedStyle(n).fontFamily);
  expect(fam).toMatch(/mono/i);
});

// ── 색 토큰 — :root 의 CSS var 가 기대 hex 와 일치 ─────────────────────────
const VARS: Record<string, string> = {
  "--paper-color-paper-base": "#ffffff",
  "--paper-color-paper-subtle": "#f7f7f8",
  "--paper-color-paper-muted": "#ececee",
  "--paper-color-ink-base": "#18181b",
  "--paper-color-ink-soft": "#71717a",
  "--paper-color-ink-faint": "#a1a1aa",
  "--paper-color-border-base": "#e8e8ea",
  "--paper-color-accent-blue-solid": "#2563eb",
  "--paper-color-accent-green-solid": "#16a34a",
  "--paper-color-accent-red-solid": "#dc2626",
  "--paper-color-primary-base": "#18181b",
  "--paper-color-focus-ring": "#2563eb",
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

// ── Badge status → 색 ───────────────────────────────────────────────────────
const BADGE = { info: "#1d4ed8", success: "#15803d", error: "#b91c1c" } as const;
for (const [status, ink] of Object.entries(BADGE)) {
  test(`badge · ${status} 글자색 = ${ink}`, async ({ page }) => {
    await expect(page.getByTestId(`badge-${status}`)).toHaveCSS("color", hexToRgb(ink));
  });
}

// ── Button — solid 는 검정 채움 + weight 550, disabled 는 비활성 ────────────
test("button · solid 는 검정 채움 + weight 550", async ({ page }) => {
  const b = page.getByTestId("btn-solid");
  await expect(b).toHaveCSS("background-color", hexToRgb("#18181b"));
  await expect(b).toHaveCSS("font-weight", "550");
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

// ── 콘솔 에러가 없다 ────────────────────────────────────────────────────────
test("no console errors on playground", async ({ page }: { page: Page }) => {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto("/#/playground");
  await page.getByTestId("text-title").waitFor();
  await page.waitForTimeout(500);
  expect(errs).toEqual([]);
});
