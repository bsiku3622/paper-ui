import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, STATUS, stateTransition } from "../tokens";
import type { StatusName, TextVariant } from "../tokens";
import { TEXT_VARIANTS } from "../tokens";
import { outlinedControlProfile, outlinedControlHover } from "../styles/color-profile";
import { ladderRules } from "../internal/sizeLadder";

// Field 는 input group — 래퍼가 면·테두리·포커스링·상태·크기를 지고, 안쪽 input 은
// 투명·무테로 값만 담는다. leading/trailing 어도먼트(아이콘·$·단위·clear·비밀번호)가
// input 양옆에 앉는다. 크기(height·paddingInline·fontSize)는 fieldSize 가 래퍼에 준다.
export const fieldWrap = style({
  ...outlinedControlProfile,
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  width: "100%",
  borderRadius: tokens.shape.radius.interaction,
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  cursor: "text",
  transition: stateTransition("border-color", "background"),
  selectors: {
    // neutral hover는 배경을 흔들지 않고 전용 border.hover 선으로 형태를 가볍게 세운다.
    '&[data-pui-status="default"]:hover:has(input:enabled)': {
      ...outlinedControlHover,
    },
    // keyboard focus — 안쪽 input 이 :focus-visible일 때만 래퍼 *바깥* 에 파란 링.
    // 클릭은 caret과 edge만 남기고, Tab 탐색 위치에만 ring을 쓴다.
    "&:not([data-pui-pointer-focus]):has(input:focus-visible)": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.interaction.focus}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:has(input:disabled)": { opacity: 0.5, cursor: "not-allowed" },
  },
});

// Raised 는 기본 입력 표면, sunken 은 검색·필터처럼 주변 canvas 안에 잠기는 입력 표면.
// 양쪽 모두 semantic surface token만 사용하고 경계선은 같은 border.base를 유지한다.
export const fieldSurface = styleVariants({
  raised: { background: tokens.color.bg.raised },
  sunken: { background: tokens.color.bg.sunken },
});

// 안쪽 input — 면·테두리·아웃라인 없음. 폰트·색은 래퍼에서 상속.
//
// 브라우저 기본 폼 스타일이 letter-spacing: normal 을 명시해 래퍼의 자간 상속을 끊을 수
// 있으므로 안쪽 input 에서 이어 붙인다. placeholder 와 입력값이 같은 기준선으로 읽힌다.
export const fieldInput = style({
  flex: 1,
  minWidth: 0,
  // Chromium의 input은 자체 overflow: clip을 쓰므로, line-height만 높여도 caret가 작은
  // input box 경계에서 잘릴 수 있다. 입력면 높이 전체를 확보하고 줄상자는 내부에서 중앙에 둔다.
  height: "100%",
  border: "none",
  // 전역 :focus-visible의 radius는 wrapper가 아니라 input 자신에게도 적용된다. Native
  // input은 overflow: clip이라 선택 highlight와 caret을 그 둥근 경계에서 잘라낸다.
  // Field의 ring은 wrapper가 소유하므로 안쪽 입력 면은 직각 clipping box로 둔다.
  borderRadius: 0,
  background: "transparent",
  outline: "none",
  font: "inherit",
  // control line-height(1)까지 물려받으면 브라우저 caret와 한글 fallback glyph가
  // 한 줄 상자에 눌려 위아래가 잘릴 수 있다. 입력 잉크에는 본문 행간을 주고 래퍼 안에서
  // 중앙 정렬해 caret 높이만 확보한다.
  lineHeight: tokens.text.style.body.leading,
  letterSpacing: "inherit",
  color: "inherit",
  padding: 0,
  margin: 0,
  selectors: {
    "&::placeholder": { color: tokens.color.ink.tertiary },
    // 전역 :focus-visible rule보다 높은 특정도로 input 자체의 ring은 끈다. ring의 주인은
    // keyboard focus를 읽는 wrapper다.
    "&:focus-visible": { outline: "none", borderRadius: 0 },
  },
});

// size 3 단 — 베이스에서 **가로 여백만** inputPaddingX(7 · 9 · 12)로 갈아 끼운다.
// 글자 preset은 Field 역할의 class가 정하고 폼 한 줄의 높이는 Button과 공유한다.
//
// Field·Select·Textarea가 같은 form geometry를 공유한다. 자세한 계산은 tokens/shape.ts.
export const fieldSize = styleVariants(
  ladderRules((s) => ({ paddingInline: tokens.shape.inputPaddingX[s] })),
);

export const fieldFontSize = styleVariants(
  Object.fromEntries(TEXT_VARIANTS.map((variant) => [variant, { fontSize: tokens.text.style[variant].size }])) as Record<TextVariant, { fontSize: string }>,
);

// status — semantic Form은 accent ink 선으로 상태를 분명히 표시한다.
export const fieldStatus = styleVariants(
  Object.fromEntries(
    STATUS.map((s) => {
      const accent = tokens.color.accent[s];
      return [s, { borderColor: accent.ink }];
    }),
  ) as Record<StatusName, { borderColor: string }>,
);

// 어도먼트 — leading/trailing 슬롯(아이콘·$·단위). 흐린 잉크, 축소 안 됨.
export const fieldAdornment = style({
  display: "inline-flex",
  alignItems: "center",
  color: tokens.color.ink.secondary,
  flexShrink: 0,
});

// 액션 버튼 — clear(×)·비밀번호 보기(👁). 흐린 잉크, hover 때 또렷.
export const fieldAction = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  appearance: "none",
  border: "none",
  background: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  color: tokens.color.ink.tertiary,
  transition: stateTransition("color"),
  selectors: {
    "&:hover": { color: tokens.color.ink.primary },
    "&:focus-visible": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.interaction.focus}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
      borderRadius: tokens.shape.radius.interaction,
    },
  },
});

// 수치 표기 — sans 그대로 숫자 글리프만 등폭(tabular-nums). 정렬은 안 건드린다 — align 이 따로. (input 에.)
export const fieldNumeric = style({
  fontVariantNumeric: "tabular-nums",
});

// 정렬 축 — numeric 과 직교. 논리값(start·center·end)이라 RTL 도 따라간다. 우측정렬 숫자열 = numeric + end.
export const fieldAlign = styleVariants({
  start: { textAlign: "start" },
  center: { textAlign: "center" },
  end: { textAlign: "end" },
});

// 알약 — 모서리를 높이의 절반까지. 검색창이 이 어휘의 본진이다(아이콘 + 둥근 입력).
// 반경은 래퍼 하나에만 있고 포커스 링이 outline 이라, 링이 곡선을 저절로 따라간다.
//
// 여백은 안 건드린다. shape 은 실루엣 축이지 밀도 축이 아니라, 알약이라고 해서 컨트롤
// 사다리(10·13·17)를 벗어나면 같은 size 의 형제와 글자 시작점이 갈린다.
//
// fieldWrap 뒤에 와서 같은 특정도를 순서로 이긴다(반경을 정하는 건 fieldWrap 뿐 —
// fieldSize 는 height·padding·font 만, fieldStatus 는 borderColor 만 정한다).
export const fieldPill = style({ borderRadius: tokens.shape.radius.full });
