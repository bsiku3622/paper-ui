// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Text — 단정한 제품 타이포                                                ║
// ║                                                                          ║
// ║ 6 단. 복잡한 화면을 위한 밀도(body 14px)와 또렷한 위계.                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 서체 —
//   -apple-system 을 맨 앞에 둔다. macOS 에서 라틴은 San Francisco(SwiftUI 의
//   그 얼굴), 한글은 Pretendard 로 빠진다. 둘 다 humanist geometric 이라 섞여도
//   결이 맞는다. 숫자는 mono·tabular — 데이터 표의 열이 세로로 맞게.

export const FONT = {
  sans: "-apple-system, BlinkMacSystemFont, 'Pretendard Variable', Pretendard, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, 'Pretendard Variable', monospace",
} as const;

// ───── weight — 굵기 어휘 ───────────────────────────────────────────────────
//
// 컴포넌트가 "550" 같은 임의 숫자를 하드코딩하지 않게, 굵기도 토큰이다. Button ·
// Badge · Tab 은 여기서 골라 쓴다.
//
// 값이 반 단계 무겁다 (450·550, not 400·500). dense 시스템이라 글씨가 작은데
// 400 은 Retina 에서 힘이 빠진다 — 작은 자리일수록 half-step 을 얹어 밀도에
// 눌리지 않게 한다. 무거운 쪽(semibold·bold)은 이미 존재감이 있어 round 유지.
export const WEIGHT = {
  normal: "450", // 본문 · 부연 (읽기)
  medium: "550", // UI 컨트롤 — Button · Tab · Nav · Badge
  semibold: "600", // 라벨 · 헤딩 · 활성/강조
  bold: "700", // 타이틀
} as const;
export type WeightKey = keyof typeof WEIGHT;

export const TEXT_VARIANTS = [
  "title", // 페이지 제목
  "heading", // 섹션 · 카드 제목
  "label", // 폼 라벨 · 표 머리
  "body", // 본문 ◀ default
  "numeric", // 수치 · 키 (mono · tabular)
  "caption", // 부연 · 메타
] as const;
export type TextVariant = (typeof TEXT_VARIANTS)[number];

type TextSpec = {
  size: string;
  weight: string;
  lineHeight: string;
  tracking: string;
  family: "sans" | "mono";
  tabular?: boolean;
};

// body 14px 이 anchor — 복잡한 웹앱의 표준 밀도(shadcn text-sm · Atlassian).
// 굵기는 WEIGHT 어휘에서 고른다 — 크기가 작을수록 존재감을 위해 half-step 위로.
export const TEXT_SPEC = {
  title: {
    size: "1.375rem", // 22px
    weight: WEIGHT.bold, // 700 — 페이지 제목은 확실히 무겁게
    lineHeight: "1.3",
    tracking: "-0.02em",
    family: "sans",
  },
  heading: {
    size: "0.9375rem", // 15px — 섹션/카드 제목
    weight: WEIGHT.semibold, // 600
    lineHeight: "1.4",
    tracking: "-0.01em",
    family: "sans",
  },
  label: {
    size: "0.75rem", // 12px — 폼 라벨 · 표 머리. 작아서 semibold 로 또렷하게.
    weight: WEIGHT.semibold, // 600 (was 500)
    lineHeight: "1.4",
    tracking: "0.01em",
    family: "sans",
  },
  body: {
    size: "0.875rem", // 14px ◀ anchor
    weight: WEIGHT.normal, // 450 (was 400) — dense 밀도에 눌리지 않게 half-step
    lineHeight: "1.5",
    tracking: "-0.006em",
    family: "sans",
  },
  numeric: {
    size: "0.875rem", // 14px — body 크기, 자리맞춤만 다름
    weight: WEIGHT.normal, // 450
    lineHeight: "1.5",
    tracking: "0",
    family: "mono",
    tabular: true,
  },
  caption: {
    size: "0.8125rem", // 13px
    weight: WEIGHT.normal, // 450 (was 400)
    lineHeight: "1.45",
    tracking: "0",
    family: "sans",
  },
} as const satisfies Record<TextVariant, TextSpec>;

// variant 별 기본 잉크 농도 — label · caption 은 흐리게.
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
  weight: WEIGHT,
} as const;
