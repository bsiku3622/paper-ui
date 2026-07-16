// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Text — 장부의 손글씨                                                     ║
// ║                                                                          ║
// ║ 6 단. 장부에 필요한 목소리는 이게 전부다.                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 숫자는 mono 다 —
//   장부의 숫자는 세로로 자리가 맞아야 한다. 금액 열에서 1 과 8 의 폭이 다르면
//   눈이 합계를 못 따라간다. `numeric` variant 와 tabular-nums 가 그 자리.

export const FONT = {
  sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, 'Pretendard Variable', monospace",
} as const;

export const TEXT_VARIANTS = [
  "title", // 페이지 제목
  "heading", // 섹션 제목
  "label", // 라벨 · 표 머리 (mono · uppercase)
  "body", // 본문 ◀ default
  "numeric", // 금액 · 수량 (mono · tabular)
  "caption", // 부연 · 메타
] as const;
export type TextVariant = (typeof TEXT_VARIANTS)[number];

type TextSpec = {
  size: string;
  weight: string;
  lineHeight: string;
  tracking: string;
  family: "sans" | "mono";
  transform?: "uppercase";
  tabular?: boolean;
};

// body 15px 이 anchor — 장부는 읽는 문서지 대시보드가 아니다.
// 13px 로 조이면 밀도는 오르지만 읽기를 포기하게 된다.
export const TEXT_SPEC = {
  title: {
    size: "1.75rem", // 28px
    weight: "700",
    lineHeight: "1.25",
    tracking: "-0.02em",
    family: "sans",
  },
  heading: {
    size: "1.0625rem", // 17px
    weight: "600",
    lineHeight: "1.4",
    tracking: "-0.01em",
    family: "sans",
  },
  label: {
    size: "0.6875rem", // 11px — 표 머리 · 라벨. 작지만 mono·tracking 으로 읽힌다.
    weight: "500",
    lineHeight: "1.4",
    tracking: "0.07em",
    family: "mono",
    transform: "uppercase",
  },
  body: {
    size: "0.9375rem", // 15px ◀ anchor
    weight: "400",
    lineHeight: "1.55",
    tracking: "-0.01em",
    family: "sans",
  },
  numeric: {
    size: "0.9375rem", // 15px — body 와 같은 크기. 다른 건 자리맞춤뿐.
    weight: "450",
    lineHeight: "1.55",
    tracking: "0",
    family: "mono",
    tabular: true,
  },
  caption: {
    size: "0.8125rem", // 13px
    weight: "400",
    lineHeight: "1.5",
    tracking: "0",
    family: "sans",
  },
} as const satisfies Record<TextVariant, TextSpec>;

// variant 별 기본 잉크 농도 — caption · label 은 흐리게.
export const TEXT_INK: Record<TextVariant, "base" | "soft"> = {
  title: "base",
  heading: "base",
  label: "soft",
  body: "base",
  numeric: "base",
  caption: "soft",
};

export const TEXT_VALUES = {
  font: FONT,
} as const;
