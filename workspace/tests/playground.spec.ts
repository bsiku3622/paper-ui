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

// ── 타입 스케일 — 7 variant 의 크기·굵기가 토큰과 일치 ──────────────────────
const TYPE = {
  display: { size: "32px", weight: "700" },
  title: { size: "22px", weight: "700" },
  heading: { size: "18px", weight: "600" },
  subheading: { size: "15px", weight: "600" },
  body: { size: "14px", weight: "450" },
  caption: { size: "13px", weight: "450" },
  label: { size: "12px", weight: "600" },
} as const;

for (const [variant, spec] of Object.entries(TYPE)) {
  test(`type · ${variant} 는 ${spec.size} / weight ${spec.weight}`, async ({ page }) => {
    const el = page.getByTestId(`text-${variant}`);
    await expect(el).toHaveCSS("font-size", spec.size);
    await expect(el).toHaveCSS("font-weight", spec.weight);
  });
}

// family=mono 는 variant 위에 교차하는 축 — body 크기를 유지한 채 서체만 등폭.
test("type · family=mono 는 크기 유지 + 등폭 서체", async ({ page }) => {
  const el = page.getByTestId("text-mono");
  const fam = await el.evaluate((n) => getComputedStyle(n).fontFamily);
  expect(fam).toMatch(/mono/i);
  await expect(el).toHaveCSS("font-size", "13.3px"); // body(14) × MONO_SCALE 0.95 — mono 가 크게 읽혀 살짝 줄인다
});

// ── 색 토큰 — :root 의 CSS var 가 기대 hex 와 일치 ─────────────────────────
const VARS: Record<string, string> = {
  "--pui-color-paper-canvas": "#fcfcfc",
  "--pui-color-paper-raised": "#ffffff",
  "--pui-color-paper-sunken": "#f4f4f5",
  "--pui-color-paper-well": "#e2e2e5",
  "--pui-color-ink-base": "#18181b",
  "--pui-color-ink-soft": "#71717a",
  "--pui-color-ink-faint": "#a1a1aa",
  "--pui-color-border-base": "#e8e8ea",
  "--pui-color-accent-info-solid": "#2563eb",
  "--pui-color-accent-success-solid": "#15803d",
  "--pui-color-accent-warning-solid": "#b45309",
  "--pui-color-accent-error-solid": "#dc2626",
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

// ── 다크 — [data-theme=dark] 스코프가 색 var 세트를 통째로 교체한다 (T4) ──────
// var 이름은 그대로, 스코프만 바뀌면 값이 바뀐다. 면 사다리(raised>canvas)·ink 반전·
// primary 반전을 대표로 검증한다.
// 다크는 canvas 가 최암이고 나머지가 그 위로 쌓인다(라이트와 방향이 반대다).
// 이 순서가 뒤집히면 table head 가 몸통보다 어두운 구멍이 된다.
const DARK_VARS: Record<string, string> = {
  "--pui-color-paper-canvas": "#101013", // 지면 — 앵커(사다리를 접는 축)
  "--pui-color-paper-well": "#252529",
  "--pui-color-paper-sunken": "#161619",
  "--pui-color-paper-raised": "#0d0d10", // ⚠ 최암 — 다크는 사다리가 라이트의 거울이다(BLACK 에 raised 가 가장 가깝다)
  "--pui-color-ink-base": "#e9e9eb",
  "--pui-color-primary-base": "#e8e8ea",
  // ⚠ **다크 채움(accent solid)은 밝다** — 라이트(L .53~.58)를 canvas 축으로 접은 L .645 다.
  // 여기를 눌러 두면 두 계약이 한꺼번에 깨진다: solid→면 대비가 3:1 을 못 넘고
  // (예전 .44 에서 1.79~2.45), status Banner 의 글자가 2.2~2.5 로 무너진다. 채움 위 글자는
  // paper.raised 가 아니라 **solid-fg** 다 — 다크의 raised 는 최암이라 종이색이 아니다.
  "--pui-color-accent-info-solid": "#5492ec",
  "--pui-color-accent-error-solid": "#df6768",
  "--pui-color-accent-info-solid-fg": "#0a1930",
};
test("dark · [data-theme=dark] 로 색 var 가 다크 세트로 바뀐다", async ({ page }) => {
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  const got = await page.evaluate((names: string[]) => {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]));
  }, Object.keys(DARK_VARS));
  for (const [name, hex] of Object.entries(DARK_VARS)) expect(got[name], name).toBe(hex);
});

// ── 정렬 — Field 와 Button 이 같은 top(baseline)에 앉는다 (과거 회귀 버그) ──
test("align · Field 와 Button 의 top 이 일치", async ({ page }) => {
  const f = await page.getByTestId("align-field").boundingBox();
  const b = await page.getByTestId("align-button").boundingBox();
  expect(f && b).toBeTruthy();
  expect(Math.abs(f!.y - b!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(f!.height - b!.height)).toBeLessThanOrEqual(1);
});

// ── 포커스 링 — Field 포커스 시 보더 *바깥* 파란 링(outline). 전역·Checkbox 와 같은
// outside-the-border 방식으로 통일. Field 는 input group 이라 data-testid 는 래퍼에,
// 포커스는 안쪽 input, 링은 래퍼(:focus-within)의 outline 으로 뜬다. ─────────────────
test("focus · Field 포커스 시 보더 바깥 파란 링(outline)", async ({ page }) => {
  const wrap = page.getByTestId("align-field");
  await wrap.locator("input").focus();
  await expect(wrap).toHaveCSS("outline-color", hexToRgb("#2563eb"));
  await expect(wrap).toHaveCSS("outline-style", "solid");
  await expect(wrap).toHaveCSS("outline-width", "2px");
  await expect(wrap).toHaveCSS("outline-offset", "2px");
});

// ── Badge status → 색 (info·success·warning·danger) ─────────────────────────
const BADGE = { info: "#1d4ed8", success: "#15803d", warning: "#b45309", error: "#b91c1c" } as const;
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
  await expect(page.getByTestId("btn-soft")).toHaveCSS("background-color", hexToRgb("#e2e2e5"));
});
test("button · status=danger 는 빨강 채움", async ({ page }) => {
  // 기본 variant=solid 에 status=danger → error.solid 배경
  await expect(page.getByTestId("btn-danger")).toHaveCSS("background-color", hexToRgb("#dc2626"));
});
test("button · disabled 는 비활성", async ({ page }) => {
  await expect(page.getByTestId("btn-disabled")).toBeDisabled();
});

// ── radius — 기본은 시스템 곡선 6, radius="full" 이면 알약 999 ───────────────
//
// 모디파이어 클래스와 root 클래스는 특정도가 같아 *순서* 로만 갈린다 — 나중에 import 가
// 뒤집히면 알약이 조용히 안 먹는다. 계산값으로 못 박아 그 회귀를 여기서 잡는다.
test("radius · 기본은 6, full 은 999 (Button·Badge 같은 어휘)", async ({ page }) => {
  await expect(page.getByTestId("btn-radius-default")).toHaveCSS("border-radius", "6px");
  await expect(page.getByTestId("btn-radius-full")).toHaveCSS("border-radius", "999px");
  await expect(page.getByTestId("badge-radius-default")).toHaveCSS("border-radius", "6px");
  await expect(page.getByTestId("badge-radius-full")).toHaveCSS("border-radius", "999px");
});

// ── iconOnly — 정사각이다. size 사다리의 paddingInline 을 실제로 이기는가 ────────
//
// buttonIconOnly 와 buttonSize 는 특정도가 같아 소스 순서로만 갈린다. 순서가 뒤집히면
// 사다리의 13px 이 살아남아 34 가 아니라 44 로 그려진다 — aspect-ratio 가 붙어 있어도
// 콘텐츠 폭이 그걸 넘기므로 조용히 깨진다. 계산값으로 못 박는다.
test("button · iconOnly 는 정사각(md 34×34)", async ({ page }) => {
  const box = await page.getByTestId("btn-icononly").boundingBox();
  expect(box).not.toBeNull();
  expect(Math.round(box!.width)).toBe(34);
  expect(Math.round(box!.height)).toBe(34);
});

// ── Tabs — 활성 탭이 흰 pill 로 떠오르고 클릭으로 바뀐다 ────────────────────
test("tabs · 클릭하면 활성이 바뀐다", async ({ page }) => {
  const two = page.getByRole("tab", { name: "둘" });
  await two.click();
  await expect(two).toHaveCSS("background-color", hexToRgb("#ffffff"));
});

// ── Modal — 포커스 트랩·복귀·배경 inert + Esc 닫힘 (a11y 계약) ────────────────
test("modal · 열리면 포커스 진입·배경 inert, Esc 닫힘·포커스 복귀", async ({ page }) => {
  const trigger = page.getByTestId("modal-open");
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  // 열리면 포커스가 다이얼로그(패널)로 들어간다.
  await expect(dialog).toBeFocused();
  // 접근 이름 — aria-labelledby 가 제목에 연결된다(문자열/노드 무관).
  expect(await dialog.getAttribute("aria-labelledby")).toBeTruthy();
  // 배경이 inert 로 잠긴다 (body 형제 중 하나 이상 — 대개 앱 루트).
  expect(await page.evaluate(() => [...document.body.children].some((el) => el.hasAttribute("inert")))).toBe(true);

  // Tab 을 눌러도 포커스가 다이얼로그 밖으로 새지 않는다(트랩).
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return !!d && d.contains(document.activeElement);
    }),
  ).toBe(true);

  // Esc 로 닫히고 포커스가 트리거로 복귀한다.
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
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

  // variant=soft 로 바꾸면 코드와 preview 가 함께 바뀐다 (컨트롤 순서: color · variant …)
  await page.locator(".detail-body select").nth(1).selectOption("soft");
  await expect(code).toContainText('variant="soft"');
  // color=primary(기본) + variant=soft → 회색 secondary(paper.well)
  await expect(stageBtn).toHaveCSS("background-color", hexToRgb("#e2e2e5"));
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
