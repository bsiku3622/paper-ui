// shape 후보 — 팔레트와 마찬가지로 각 항목이 하나의 주장이다.
//
// 여기서 다루는 값은 전부 paper-ui 가 이미 CSS 변수로 내보내는 것들이라, 패키지 코드를
// 한 줄도 고치지 않고 런타임에 덮어쓸 수 있다. radius 사다리가 네 칸뿐이어서 shape 하나를
// 통째로 바꾸는 데 열 개 남짓한 변수면 충분하다.
//
// ⚠ `pillRadius` 까지 건드리는 게 핵심이다. 이 값을 안 바꾸면 Badge·Tabs 트랙만 늘 알약으로
//   남아서, 각지게 가려는 shape 이 절반만 각져 보인다.

export type Shape = {
  label: string;
  motto: string;
  radius: { interaction: string; layoutSm: string; layoutMd: string; layoutLg: string };
  pillRadius: string;
  borderWidth: string;
  focusRingWidth: string;
  focusRingOffset: string;
  checkboxRadius: string;
  shadowOverlay: string;
  shadowOverlayMinimal: string;
};

export const SHAPES = {
  // 기준점. 현재 시스템 값 그대로다.
  paper: {
    label: "Paper",
    motto: "모서리는 눈에 띄지 않는다",
    radius: { interaction: ".375rem", layoutSm: ".375rem", layoutMd: ".5rem", layoutLg: ".75rem" },
    pillRadius: "999px",
    borderWidth: "1px",
    focusRingWidth: "2px",
    focusRingOffset: "2px",
    checkboxRadius: ".1875rem",
    shadowOverlay: "0 6px 18px -5px rgba(24, 25, 28, .16), 0 2px 5px -2px rgba(24, 25, 28, .09)",
    shadowOverlayMinimal: "0 1px 2px 0 rgba(24, 25, 28, .06)",
  },

  // 둥근 UI 가 흔히 실패하는 지점은 radius 만 키우고 선을 그대로 두는 것이다. 선이 남으면
  // 큰 곡률이 테두리를 따라 도는 게 보여서 유치해진다. 그래서 여기서는 선을 머리카락처럼
  // 얇게 남기고 깊이를 전부 그림자로 옮겼다.
  pillow: {
    label: "Pillow",
    motto: "경계는 선이 아니라 그림자가 만든다",
    radius: { interaction: ".75rem", layoutSm: ".875rem", layoutMd: "1.25rem", layoutLg: "1.75rem" },
    pillRadius: "999px",
    borderWidth: "1px",
    focusRingWidth: "3px",
    focusRingOffset: "3px",
    checkboxRadius: ".375rem",
    shadowOverlay: "0 16px 40px -12px rgba(24, 25, 28, .22), 0 6px 14px -6px rgba(24, 25, 28, .12)",
    shadowOverlayMinimal: "0 2px 8px -2px rgba(24, 25, 28, .10)",
  },

  // 곡률을 한 칸도 남기지 않는다. 알약 트랙까지 사각으로 내린다. 깊이는 그림자가 아니라
  // 한 겹의 선으로 표현한다 — 떠 있는 게 아니라 겹쳐 놓인 것으로 읽힌다.
  blade: {
    label: "Blade",
    motto: "선이 유일한 구조다",
    radius: { interaction: "0", layoutSm: "0", layoutMd: "0", layoutLg: "0" },
    pillRadius: "0",
    borderWidth: "1.5px",
    focusRingWidth: "2px",
    focusRingOffset: "0px",
    checkboxRadius: "0",
    shadowOverlay: "0 0 0 1.5px rgba(24, 25, 28, .22), 12px 12px 0 -2px rgba(24, 25, 28, .10)",
    shadowOverlayMinimal: "0 0 0 1px rgba(24, 25, 28, .12)",
  },

  // 손이 닿는 것과 내용을 담는 것을 형태로 갈라놓는다. 버튼·입력은 완전한 알약이고
  // 카드·모달은 거의 직각이다. 한 화면 안에서 두 곡률이 부딪히는 게 이 shape 의 전부다.
  capsule: {
    label: "Capsule",
    motto: "누르는 것은 알약, 담는 것은 판",
    radius: { interaction: "999px", layoutSm: "2px", layoutMd: "3px", layoutLg: "4px" },
    pillRadius: "999px",
    borderWidth: "1px",
    focusRingWidth: "2px",
    focusRingOffset: "2px",
    checkboxRadius: "2px",
    shadowOverlay: "0 8px 24px -8px rgba(24, 25, 28, .18), 0 3px 6px -3px rgba(24, 25, 28, .10)",
    shadowOverlayMinimal: "0 1px 2px 0 rgba(24, 25, 28, .07)",
  },
} as const satisfies Record<string, Shape>;

export type ShapeKey = keyof typeof SHAPES;
export const SHAPE_KEYS = Object.keys(SHAPES) as ShapeKey[];
