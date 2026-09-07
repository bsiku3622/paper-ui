// 타이포 후보.
//
// lab 의 첫 판에는 이 축이 없었다. 색과 모서리만 갈아 끼우니 조합을 아무리 바꿔도
// "같은 화면에 색만 다른" 인상이 남았다. awesome-design-md 의 DESIGN.md 들을 보면
// 정체성을 결정하는 게 대개 색이 아니라 여기다 — Vercel 은 48px 헤드라인에 tracking
// -2.4px 를 걸고, Linear 는 80px 에 -3.0px 를 건다. 둘 다 "이 규칙이 깨지면 시스템이
// 가장 먼저 무너진다" 고 적어 놨다.
//
// 현재 시스템(compact)의 사다리는 12px → 32px 로 최대·최소 비가 2.67 배뿐이고,
// label 12 · caption 13 · body 14 · subheading 15 는 1px 씩 올라가 사실상 같은 크기다.
// tracking 자체는 -.03em 으로 나쁘지 않은데 display 가 32px 라 절대값이 -0.96px 에
// 그친다. 크기가 작으면 tracking 을 아무리 조여도 인상이 안 생긴다.

const REM = (px: number): string => `${px / 16}rem`;

export type TypeScale = {
  label: string; caption: string; body: string; subheading: string;
  heading: string; title: string; display: string;
};

export type Type = {
  label: string;
  motto: string;
  fontSans: string;
  size: TypeScale;
  tracking: TypeScale;
  leading: TypeScale;
  controlFontSize: { sm: string; md: string; lg: string };
};

const SANS = '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "D2Coding", monospace';

export const TYPES = {
  // 기준점. 현재 시스템 값 그대로다.
  compact: {
    label: "Compact",
    motto: "위계는 크기가 아니라 무게로",
    fontSans: SANS,
    size: { label: REM(12), caption: REM(13), body: REM(14), subheading: REM(15), heading: REM(18), title: REM(22), display: REM(32) },
    tracking: { label: ".01em", caption: "0", body: "-.006em", subheading: "-.01em", heading: "-.015em", title: "-.02em", display: "-.03em" },
    leading: { label: "1.4", caption: "1.45", body: "1.5", subheading: "1.4", heading: "1.35", title: "1.25", display: "1.12" },
    controlFontSize: { sm: REM(14), md: REM(14), lg: REM(14) },
  },

  // 본문은 거의 그대로 두고 위쪽만 크게 벌린다. 사다리 비가 2.67 배에서 5 배로 넓어지고,
  // display 60px 에 -.045em 이면 절대 tracking 이 -2.7px 라 Linear·Vercel 과 같은 대역에 선다.
  editorial: {
    label: "Editorial",
    motto: "제목이 본문의 네 배는 되어야 제목이다",
    fontSans: SANS,
    size: { label: REM(12), caption: REM(13), body: REM(15), subheading: REM(17), heading: REM(24), title: REM(36), display: REM(60) },
    tracking: { label: ".02em", caption: "0", body: "-.008em", subheading: "-.015em", heading: "-.025em", title: "-.035em", display: "-.045em" },
    leading: { label: "1.4", caption: "1.45", body: "1.55", subheading: "1.35", heading: "1.2", title: "1.08", display: "1.02" },
    controlFontSize: { sm: REM(13), md: REM(14), lg: REM(15) },
  },

  // 본문 서체까지 mono 로 내린다. 한글은 mono 스택 끝의 D2Coding 이 받고, 없으면 시스템이
  // 대신 그린다. 크기 폭을 좁혀 모든 줄이 같은 무게로 읽히게 만든다 — 위계를 크기가 아니라
  // 자리와 색으로만 준다는 뜻이다.
  terminal: {
    label: "Terminal",
    motto: "모든 글자가 같은 폭을 갖는다",
    fontSans: MONO,
    size: { label: REM(12), caption: REM(12), body: REM(13), subheading: REM(13), heading: REM(15), title: REM(18), display: REM(24) },
    tracking: { label: "0", caption: "0", body: "0", subheading: "0", heading: "0", title: "-.01em", display: "-.02em" },
    leading: { label: "1.45", caption: "1.45", body: "1.45", subheading: "1.45", heading: "1.35", title: "1.3", display: "1.2" },
    controlFontSize: { sm: REM(12), md: REM(13), lg: REM(13) },
  },

  // 읽는 데 최적화한다. 본문을 16px 로 올리고 행간을 1.65 까지 연다. 음수 tracking 을
  // 거의 쓰지 않는 게 핵심이다 — 조인 글자는 밀도를 만들지만 긴 글에서는 피로해진다.
  humanist: {
    label: "Humanist",
    motto: "읽는 것이 먼저다",
    fontSans: SANS,
    size: { label: REM(13), caption: REM(14), body: REM(16), subheading: REM(17), heading: REM(20), title: REM(26), display: REM(40) },
    tracking: { label: ".01em", caption: "0", body: "0", subheading: "0", heading: "-.005em", title: "-.012em", display: "-.02em" },
    leading: { label: "1.45", caption: "1.6", body: "1.65", subheading: "1.5", heading: "1.4", title: "1.25", display: "1.15" },
    controlFontSize: { sm: REM(14), md: REM(15), lg: REM(16) },
  },
} as const satisfies Record<string, Type>;

export type TypeKey = keyof typeof TYPES;
export const TYPE_KEYS = Object.keys(TYPES) as TypeKey[];
