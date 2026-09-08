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

// ── shape — 기본은 시스템 곡선 6, shape="pill" 이면 알약 999 ─────────────────
//
// 모디파이어 클래스와 root 클래스는 특정도가 같아 *순서* 로만 갈린다 — 나중에 import 가
// 뒤집히면 알약이 조용히 안 먹는다. 계산값으로 못 박아 그 회귀를 여기서 잡는다.
test("shape · 기본은 6, pill 은 999 (Button·Badge 같은 어휘)", async ({ page }) => {
  await expect(page.getByTestId("btn-shape-default")).toHaveCSS("border-radius", "6px");
  await expect(page.getByTestId("btn-shape-pill")).toHaveCSS("border-radius", "999px");
  await expect(page.getByTestId("badge-shape-default")).toHaveCSS("border-radius", "6px");
  await expect(page.getByTestId("badge-shape-pill")).toHaveCSS("border-radius", "999px");
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

// ── Tabs — 활성 탭이 흰 면으로 떠오르고 클릭으로 바뀐다 ────────────────────
//
// shape 표본이 둘이라 이름만으로는 탭이 특정되지 않는다 — 각진 쪽 트랙 안에서 찾는다.
test("tabs · 클릭하면 활성이 바뀐다", async ({ page }) => {
  const two = page.getByTestId("tabs-shape-default").getByRole("tab", { name: "둘" });
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

// ── 컨트롤 공통 base — 넷이 같은 여백·글자를 쓰는가 ──────────────────────────
//
// Button·Field 는 공통 사다리를 쓰고, Select 는 그걸 스프레드로 가져오며(오른쪽만 화살표
// 자리로 덮는다), Textarea 는 height 를 뺀 두 축을 같은 토큰에서 가져온다. 넷 중 하나가
// 사다리를 손으로 베끼기 시작하면 여기서 걸린다 — 실제로 Select 가 Box 여백(12)을 쓰고
// 있어서 Field 보다 1px 좁았다.
test("control base · 넷이 높이·글자를 공유하고 가로만 역할로 갈린다", async ({ page }) => {
  // 공유하는 축 — 글자는 넷 다 14.
  for (const id of ["base-button", "base-field", "base-select", "base-textarea"]) {
    await expect(page.getByTestId(id)).toHaveCSS("font-size", "14px");
  }
  // 갈리는 축 — 버튼은 라벨의 비율(13), 입력류는 높이가 만든 세로와 같은 값(9).
  await expect(page.getByTestId("base-button")).toHaveCSS("padding-left", "13px");
  for (const id of ["base-field", "base-select", "base-textarea"]) {
    await expect(page.getByTestId(id)).toHaveCSS("padding-left", "9px");
  }
  // 화살표 자리는 오른쪽만 넓다 — 통로로 한 축 더 덮는다.
  await expect(page.getByTestId("base-select")).toHaveCSS("padding-right", "24px");
  // Textarea 의 세로 여백은 (34 − 테두리 2 − 줄상자 21) / 2 = 5.5.
  await expect(page.getByTestId("base-textarea")).toHaveCSS("padding-top", "5.5px");
});

// ── 입력류 안의 글자는 사방 같은 거리에 앉는다 ───────────────────────────────
//
// 선언값이 아니라 **잉크의 자리**를 잰다. Textarea 의 세로 선언은 5.5 지만 줄상자에 반 줄
// 여백(3.5)이 들어 있어 잉크는 9 에 앉고, Field 는 높이 34 가 만드는 세로가 이미 9 다.
// 선언값을 정사각(9/9)으로 맞추면 되레 첫 줄이 3.5 내려가 어긋나 보인다.
test("input · Field·Textarea 의 글자가 테두리에서 사방 같은 거리에 앉는다", async ({ page }) => {
  const ink = await page.evaluate(() => {
    const q = (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
    const ta = q("base-textarea");
    const c = getComputedStyle(ta);
    const half = (parseFloat(c.lineHeight) - parseFloat(c.fontSize)) / 2;
    const field = q("base-field");
    const cf = getComputedStyle(field);
    return {
      taTop: parseFloat(c.borderTopWidth) + parseFloat(c.paddingTop) + half,
      taLeft: parseFloat(c.borderLeftWidth) + parseFloat(c.paddingLeft),
      fieldTop: (field.getBoundingClientRect().height - parseFloat(cf.fontSize)) / 2,
      fieldLeft: parseFloat(cf.borderLeftWidth) + parseFloat(cf.paddingLeft),
    };
  });
  expect(ink.taTop).toBeCloseTo(ink.taLeft, 1);
  expect(ink.fieldTop).toBeCloseTo(ink.fieldLeft, 1);
  expect(ink.taTop).toBeCloseTo(ink.fieldTop, 1); // 둘이 서로도 같다
});

// ── Field 와 Textarea 의 첫 줄은 같은 자리에서 시작한다 ─────────────────────
//
// 두 값이 아니라 두 *결과* 를 비교한다. Field 는 34 짜리 상자에 21 짜리 줄상자를 가운데
// 두고(계산은 브라우저가), Textarea 는 padding 으로 같은 자리를 만든다 — 산식이 어긋나면
// 여기서 갈린다. 실제로 예전 산식((height − 14) / 2)에서는 4.5px 어긋나 있었다.
test("control base · Field 와 Textarea 의 첫 줄이 같은 높이에서 시작한다", async ({ page }) => {
  const tops = await page.evaluate(() => {
    const q = (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
    const field = q("base-field");
    const input = field.tagName === "INPUT" ? field : (field.querySelector("input") as HTMLElement);
    const wrap = input.closest("div") as HTMLElement;
    const ta = q("base-textarea");
    const cs = getComputedStyle(ta);
    return {
      field: input.getBoundingClientRect().top - wrap.getBoundingClientRect().top,
      textarea: parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop),
    };
  });
  expect(tops.field).toBeCloseTo(tops.textarea, 1);
});

// ── shape=pill — 컨트롤 어휘 하나. 여백은 안 따라 움직인다 ──────────────────
//
// Field·Select 는 반경만 바뀌고 컨트롤 사다리(md 13)를 그대로 지킨다. 알약이 여백까지
// 건드리기 시작하면 같은 size 의 형제와 글자 시작점이 갈린다 — shape 은 실루엣 축이다.
test("pill · 곡선만 바뀌고 각자의 가로 여백은 그대로다", async ({ page }) => {
  for (const id of ["field-pill", "select-pill", "button-pill-row"]) {
    await expect(page.getByTestId(id)).toHaveCSS("border-radius", "999px");
  }
  // 알약이 됐다고 여백이 따라 움직이지 않는다 — 각진 형제와 글자 시작점이 같다.
  await expect(page.getByTestId("field-pill")).toHaveCSS("padding-left", "9px");
  await expect(page.getByTestId("select-pill")).toHaveCSS("padding-left", "9px");
  await expect(page.getByTestId("button-pill-row")).toHaveCSS("padding-left", "13px");
});

// ── Tabs shape — 트랙과 항목이 함께 갈리고, 각진 쪽은 동심이다 ─────────────
//
// 안쪽 반경을 상수로 박지 않고 `바깥 − 트랙 여백` 으로 계산한다. 두 곡선의 중심이 같아야
// 트랙과 활성 면 사이 간격이 모서리에서도 일정하다. 여백은 shape 을 안 따라간다.
test("tabs · shape 이 트랙·항목에 함께 걸리고 안쪽은 동심(6 − 3 = 3)", async ({ page }) => {
  const def = page.getByTestId("tabs-shape-default");
  await expect(def.getByRole("tablist")).toHaveCSS("border-radius", "6px");
  await expect(def.getByRole("tab").first()).toHaveCSS("border-radius", "3px");

  const pill = page.getByTestId("tabs-shape-pill");
  await expect(pill.getByRole("tablist")).toHaveCSS("border-radius", "999px");
  await expect(pill.getByRole("tab").first()).toHaveCSS("border-radius", "999px");

  // 여백은 두 shape 이 같다 — 실루엣 축이지 밀도 축이 아니다(sm 사다리 10).
  for (const root of [def, pill]) {
    await expect(root.getByRole("tab").first()).toHaveCSS("padding-left", "10px");
  }
});

// ── Badge — 높이는 세 단, 글자는 12 고정 ────────────────────────────────────
//
// 밀도와 가독성은 다른 축이다. 예전엔 11·12·14 로 높이를 따라가서 sm 이 가독성 하한
// 아래로 떨어졌다. 글자가 다시 height 를 따라가면 여기서 걸린다.
test("badge · 높이 20·22·24 와 여백 6·8·10 이 같은 보폭, 글자는 셋 다 12", async ({ page }) => {
  const SPEC = { "badge-sm": [20, "6px"], "badge-md": [22, "8px"], "badge-lg": [24, "10px"] } as const;
  for (const [id, [h, padX]] of Object.entries(SPEC)) {
    await expect(page.getByTestId(id)).toHaveCSS("font-size", "12px");
    // 여백이 Δ2 로 높이(Δ2)와 나란히 움직인다 — 예전 Box 여백 사다리는 Δ4 라 두 배 빨랐다.
    await expect(page.getByTestId(id)).toHaveCSS("padding-left", padX);
    const box = await page.getByTestId(id).boundingBox();
    expect(Math.round(box!.height)).toBe(h);
  }
});

// ── 작은 표식들 — 폼 한 줄에서 같은 열에 앉는다 ──────────────────────────────
//
// 세 사다리(icon · checkbox · switch)가 따로 사는데 서로 묶여 있다. Icon 이 Checkbox 와
// 같은 16 이면 아트보드 안 여백 때문에 아이콘만 작아 보이고, Switch 손잡이를 Checkbox 에
// 맞추면 트랙이 그만큼 커진다. 숫자로 못 박아 둔다 — 눈으로 고른 값이라 우연히 되돌리기 쉽다.
test("mark · 아이콘 18 · 체크박스 16 · 스위치 32×18 이 한 열에 앉는다", async ({ page }) => {
  // SVG 에는 offsetWidth 가 없고 Spinner 는 돌고 있어 bounding box 가 회전에 따라 커진다
  // — 둘 다 computed 값으로 잰다.
  const S = {
    "mark-checkbox": ["16px", "16px"],
    "mark-radio": ["16px", "16px"],
    // 아이콘·스피너는 아트보드가 한 단 위 — 잉크가 아트보드의 75~83% 라서다.
    "mark-icon": ["18px", "18px"],
    "mark-spinner": ["18px", "18px"],
    // 손잡이 = checkbox − 2 → 트랙 = checkbox + 2.
    "mark-switch": ["32px", "18px"],
  };
  for (const [id, [w, h]] of Object.entries(S)) {
    await expect(page.getByTestId(id)).toHaveCSS("width", w);
    await expect(page.getByTestId(id)).toHaveCSS("height", h);
  }
});

// ── Switch 켜짐 — 손잡이가 사방 같은 간격으로 반대쪽 끝에 붙는다 ──────────────
//
// 여백 (h − thumb) / 2 를 사방에 걸면 이동 거리가 w − h 로 떨어진다. 예전엔 좌우만
// borderWidth(1px)를 빌려 써서 위아래 2 · 좌우 1 로 어긋나 있었다(스위치엔 테두리도 없다).
test("switch · 손잡이 여백이 사방 같고, 켜짐 이동이 w − h 다", async ({ page }) => {
  const g = await page.getByTestId("mark-switch").evaluate((el: HTMLElement) => {
    const track = { w: parseFloat(getComputedStyle(el).width), h: parseFloat(getComputedStyle(el).height) };
    const a = getComputedStyle(el, "::after");
    const thumb = parseFloat(a.width);
    const left = parseFloat(a.left);
    // matrix(1,0,0,1,tx,ty) — checked 상태의 가로 이동.
    const tx = parseFloat(a.transform.split(",")[4] ?? "0");
    return { inset: (track.h - thumb) / 2, left, tx, travel: track.w - track.h, right: track.w - (left + tx) - thumb };
  });
  expect(g.left).toBeCloseTo(g.inset, 1); // 좌 = 상하
  expect(g.right).toBeCloseTo(g.inset, 1); // 켜졌을 때 우 = 상하
  expect(g.tx).toBeCloseTo(g.travel, 1); // 이동 = w − h
});

// ── outline — 테두리가 곧 형태라, 지면 대비 3:1 을 진다 ─────────────────────
//
// 값이 아니라 **계약**을 못 박는다. 어느 hue 를 골랐느냐가 아니라 "지면에서 떨어져
// 보이는가" 가 규칙이고, hue 마다 고유 명도가 달라 같은 램프 인덱스로는 그 규칙을 못
// 지킨다. 예전엔 wash 의 괘선(edge, 200 톤)을 빌려 써서 넷 다 1.18~1.41 이었다.
test("outline · 테두리가 지면 대비 3:1 을 넘는다 (다섯 색 전부)", async ({ page }) => {
  const ratios = await page.evaluate(() => {
    const lum = (rgb: string) => {
      const [r, g, b] = rgb.match(/[\d.]+/g)!.slice(0, 3).map((v) => Number(v) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const ratio = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x! + 0.05) / (y! + 0.05);
    };
    const bg = getComputedStyle(document.body).backgroundColor;
    const out: Record<string, number> = {};
    for (const c of ["primary", "info", "success", "warning", "error"]) {
      const el = document.querySelector(`[data-testid="outline-${c}"]`)!;
      out[c] = ratio(bg, getComputedStyle(el).borderTopColor);
    }
    return out;
  });
  for (const [name, r] of Object.entries(ratios)) {
    expect(r, `${name} outline 테두리 대비`).toBeGreaterThanOrEqual(2.9);
  }
});

// ── 컨트롤의 경계는 자기 면 위에서 3:1 이다 ─────────────────────────────────
//
// 빈 Field 는 상자 말고 아무 단서가 없고, 꺼진 Checkbox 도 마찬가지다. 그 선이 안 보이면
// 컴포넌트가 안 보인다(WCAG 1.4.11 이 비텍스트에 3:1 을 요구하는 자리). 카드 헤어라인은
// 여기 없다 — 그건 면을 나누는 선이라 물러나 있는 게 맞고, 값도 따로 산다(border.base).
test("control edge · 입력·체크박스의 경계가 자기 면 위에서 3:1 을 넘는다", async ({ page }) => {
  const ratios = await page.evaluate(() => {
    const lum = (rgb: string) => {
      const [r, g, b] = rgb.match(/[\d.]+/g)!.slice(0, 3).map((v) => Number(v) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const ratio = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x! + 0.05) / (y! + 0.05);
    };
    const out: Record<string, number> = {};
    // 켜진 체크박스는 채움으로 읽히니 **꺼진 상태**를 잰다 — 경계가 유일한 단서인 자리다.
    for (const [name, el] of [
      ["field", document.querySelector('[data-testid="base-field"]')],
      ["select", document.querySelector('[data-testid="base-select"]')],
      ["textarea", document.querySelector('[data-testid="base-textarea"]')],
      ["checkbox(off)", document.querySelector('[data-testid="mark-checkbox-off"]')],
      ["radio(off)", document.querySelector('[data-testid="mark-radio-off"]')],
    ] as [string, HTMLElement][]) {
      const cs = getComputedStyle(el);
      // 자기 면 위에서 잰다 — 경계가 갈라놓는 두 색 중 밝은 쪽(입력은 흰 면)이 기준이다.
      out[name] = ratio(cs.borderTopColor, cs.backgroundColor);
    }
    return out;
  });
  for (const [name, r] of Object.entries(ratios)) {
    expect(r, `${name} 경계 대비`).toBeGreaterThanOrEqual(2.9);
  }
});

// ── Alert — Button·Badge 와 같은 매트릭스를 물고, 글자는 면의 색을 받는다 ────
//
// Text 는 variant 마다 자기 잉크를 못 박는다(caption = ink.soft). 색이 깔린 면 안에서
// 그러면 면이 정한 글자색을 덮어써 — 예전엔 옅은 빨강 면 위에 회색 본문이 있었다.
// ink="inherit" 가 그 자리를 비켜 준다.
test("alert · variant 가 면의 무게를 정하고, 글자는 면 색을 받는다", async ({ page }) => {
  const soft = page.getByTestId("alert-soft");
  const solid = page.getByTestId("alert-solid");

  // 면의 무게가 실제로 갈린다 — soft 는 옅은 면, solid 는 채운 면.
  const bgs = await page.evaluate(() =>
    ["alert-soft", "alert-solid", "alert-quiet"].map(
      (id) =>
        getComputedStyle(document.querySelector(`[data-testid="${id}"] > *`)!).backgroundColor,
    ),
  );
  expect(new Set(bgs).size).toBe(3); // 셋이 서로 다른 면

  // 글자색 = 면이 정한 색. 어느 variant 든 컨테이너와 본문이 같은 색이어야 한다.
  for (const root of [soft, solid]) {
    const same = await root.evaluate((el: HTMLElement) => {
      const box = el.firstElementChild as HTMLElement;
      const body = box.querySelector(".pui-text-caption:not([class*=srOnly])") as HTMLElement;
      return getComputedStyle(box).color === getComputedStyle(body).color;
    });
    expect(same).toBe(true);
  }
});

// ── Modal — 긴 본문이어도 패널이 화면을 넘지 않는다 ──────────────────────────
//
// backdrop 이 position:fixed 이고 열려 있는 동안 body 스크롤도 잠근다 — 패널이 뷰포트보다
// 커지면 넘친 부분에 닿을 방법이 **아예 없다.** 실제로 700px 화면에서 패널이 1069px 로
// 자라 확인·취소 버튼이 화면 밖에 있었다. 상한을 두고 본문만 구른다.
test("modal · 긴 본문이어도 패널이 화면 안에 있고 푸터가 보인다", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 640 });
  await page.getByTestId("modal-open-long").click();
  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();

  const fits = await panel.evaluate((el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, vh: window.innerHeight };
  });
  expect(fits.top).toBeGreaterThanOrEqual(0);
  expect(fits.bottom).toBeLessThanOrEqual(fits.vh);

  // 푸터가 잘리지 않아 실제로 누를 수 있다.
  await expect(page.getByTestId("long-modal-confirm")).toBeInViewport();

  // 넘치는 건 본문뿐 — 제목·푸터는 붙박이다.
  const scrolls = await page
    .getByTestId("long-modal-body")
    .evaluate((el: HTMLElement) => {
      const body = el.parentElement!; // Box padding="lg" (modalBody)
      return { overflow: getComputedStyle(body).overflowY, taller: body.scrollHeight > body.clientHeight };
    });
  expect(scrolls.overflow).toBe("auto");
  expect(scrolls.taller).toBe(true);

  await page.keyboard.press("Escape");
});

// ── 사이트 GNB — 자기 시스템의 Navbar 로 짜여 있고, 항목은 진짜 링크다 ──────
//
// 오래 이 사이트는 헤더를 손으로 다시 짜고 있었다. Navbar 항목이 <button> 이라 라우터
// 링크가 될 수 없어서였다 — 가운데 클릭으로 새 탭도 못 열고 주소도 없다. 자기 시스템으로
// 자기 사이트의 헤더를 못 짜는 건 시스템 쪽 결함이라 `as` 를 열어 고쳤다. 되돌아가지 않게
// 못 박는다.
test("navbar · GNB 항목이 <a href> 이고 현재 항목만 aria-current", async ({ page }) => {
  await page.goto("/docs");
  const nav = page.locator("header nav");
  const links = nav.locator("a");
  await expect(links).toHaveCount(4);
  for (const href of ["/", "/demo", "/playground", "/docs"]) {
    await expect(nav.locator(`a[href="${href}"]`)).toHaveCount(1);
  }
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(nav.locator('[aria-current="page"]')).toHaveAttribute("href", "/docs");
  // 링크로 왔어도 밑줄·파란 글자 같은 <a> 기본값이 남아 있으면 안 된다.
  await expect(links.first()).toHaveCSS("text-decoration-line", "none");
});

// ── 홈 CTA — 버튼처럼 생긴 자리가 링크면, 링크 하나만 그린다 ──────────────────
//
// <Link><Button/></Link> 로 감싸면 <a> 안에 <button> 이라 같은 자리에서 탭이 두 번
// 멈추고 링 모양도 둘로 갈린다 — <a> 는 자기 반경이 없어 전역 :focus-visible 의 6px 을
// 쓰고, 안쪽 <button> 은 알약 999px 을 쓴다. 중첩 자체도 유효하지 않은 마크업이다.
// as={Link} 로 하나만 그리게 한 뒤, 그 회귀를 탭 이동으로 잡는다.
test("home · CTA 는 링크 하나 — 탭 정지도 링도 하나", async ({ page }) => {
  await page.goto("/");
  const docs = page.getByRole("link", { name: "문서 읽기" });
  await expect(docs).toHaveCount(1);
  // 버튼이 안에 들어앉아 있지 않다.
  await expect(docs.locator("button")).toHaveCount(0);
  // 알약 곡선은 링크 자신이 든다.
  await expect(docs).toHaveCSS("border-radius", "999px");
  // 한 번의 Tab 이 다음 CTA 로 간다 — 같은 자리에 두 번 멈추지 않는다.
  await docs.focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "컴포넌트 보기" })).toBeFocused();
});
