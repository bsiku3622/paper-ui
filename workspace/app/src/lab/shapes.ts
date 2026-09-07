// shape 후보 — 팔레트와 마찬가지로 각 항목이 하나의 주장이다.
//
// 여기서 다루는 값은 전부 paper-ui 가 이미 CSS 변수로 내보내는 것들이라, 패키지 코드를
// 한 줄도 고치지 않고 런타임에 덮어쓸 수 있다. radius 사다리가 네 칸뿐이어서 shape 하나를
// 통째로 바꾸는 데 열 개 남짓한 변수면 충분하다.
//
// ⚠ `pillRadius` 까지 건드리는 게 핵심이다. 이 값을 안 바꾸면 Badge·Tabs 트랙만 늘 알약으로
//   남아서, 각지게 가려는 shape 이 절반만 각져 보인다.
//
// ⚠ `trackRadius` 는 사다리에 없는 값이라 따로 둔다. Tabs 는 트랙에 `radius.layout.md` 를,
//   안쪽 항목에 `radius.interaction` 을 쓴다(`molecules/Tabs.css.ts`). 두 값이 멀어지면 —
//   Capsule 처럼 항목이 999px 이고 트랙이 3px 이면 — 알약의 곡선과 트랙의 직각 사이에
//   초승달 모양 빈틈이 생겨 깨져 보인다. 알약을 담는 그릇은 알약이어야 한다. 사다리 값을
//   올려 맞추면 카드까지 둥글어지므로, `[role="tablist"]` 에만 거는 규칙으로 분리했다.
//
// ⚠ `navRadius` 도 같은 이유로 뗐다. `radius.interaction` 하나가 버튼과 사이드바 행을 함께
//   담당하는데(`Navbar.css.ts`, `.home-navitem`), 999px 는 좁고 높은 버튼에서만 알약으로
//   읽힌다. 폭이 넓고 높이가 낮은 행에 같은 값을 주면 양 끝이 반원이 되어 과해진다.
//   Vercel 이 "nav 는 6px, 마케팅 CTA 는 100px, 한 화면에서 섞지 말 것" 이라고 못 박는 게
//   같은 문제다. **알약은 손이 닿는 좁은 컨트롤에만 준다.**
//
//   ⚠ 이건 lab 이 만든 문제가 아니라 토큰 구조가 극단에서 드러낸 한계다. Capsule 이나
//     Lozenge 를 실제로 채택한다면 `radius.interaction` 을 control 과 nav 로 쪼개야 한다.

export type Shape = {
  label: string;
  motto: string;
  radius: { interaction: string; layoutSm: string; layoutMd: string; layoutLg: string };
  pillRadius: string;
  // 세그먼트 트랙(role="tablist")의 곡률. radius 사다리와 따로 두는 이유는 아래 ⚠ 참고.
  trackRadius: string;
  // 넓고 낮은 항목(사이드바 행 등)의 곡률. 아래 ⚠ 참고.
  navRadius: string;
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
    trackRadius: ".5rem",
    navRadius: ".375rem",
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
    trackRadius: "1.25rem",
    navRadius: ".75rem",
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
    trackRadius: "0",
    navRadius: "0",
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
    trackRadius: "999px",
    navRadius: ".5rem",
    borderWidth: "1px",
    focusRingWidth: "2px",
    focusRingOffset: "2px",
    checkboxRadius: "2px",
    shadowOverlay: "0 8px 24px -8px rgba(24, 25, 28, .18), 0 3px 6px -3px rgba(24, 25, 28, .10)",
    shadowOverlayMinimal: "0 1px 2px 0 rgba(24, 25, 28, .07)",
  },
  // Stripe 가 실제로 쓰는 배치다 — 버튼은 전부 알약이고 카드는 12px 로 둥글다. Capsule 이
  // 두 곡률을 부딪히게 두는 반면, 이쪽은 둘 사이를 잇는다. 알약이 튀지 않고 화면에 녹는다.
  lozenge: {
    label: "Lozenge",
    motto: "컨트롤은 알약, 판은 둥글게",
    radius: { interaction: "999px", layoutSm: ".5rem", layoutMd: ".75rem", layoutLg: "1rem" },
    pillRadius: "999px",
    trackRadius: "999px",
    navRadius: ".5rem",
    borderWidth: "1px",
    focusRingWidth: "2px",
    focusRingOffset: "2px",
    checkboxRadius: ".25rem",
    shadowOverlay: "0 8px 24px 0 rgba(0, 55, 112, .08), 0 2px 6px 0 rgba(0, 55, 112, .04)",
    shadowOverlayMinimal: "0 1px 3px 0 rgba(0, 55, 112, .08)",
  },
} as const satisfies Record<string, Shape>;

export type ShapeKey = keyof typeof SHAPES;
export const SHAPE_KEYS = Object.keys(SHAPES) as ShapeKey[];
