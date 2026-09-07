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
//
// ⚠ `tabPadX` 는 곡률이 여백을 먹는 문제다. 항목이 알약이 되면 좌우 반경이 높이의 절반까지
//   커져서 글자와 가장자리 사이가 실제보다 멀어 보이고, 세 항목이 늘어선 트랙이 길어진다.
//   각진 상태를 기준으로 잡힌 여백은 알약에서 과해지므로 한 단 줄인다.
//
// ⚠ `fieldRadius` 도 같은 갈래다. Button 과 Field 가 둘 다 `radius.interaction` 을 읽는데
//   (`atoms/Button.css.ts`, `atoms/Field.css.ts`), 999px 는 짧은 버튼에서만 알약으로 읽힌다.
//   폭이 긴 검색 입력에 같은 값을 주면 양 끝이 반원인 캡슐이 되어 과해진다. 알약을
//   **모든 컨트롤의 기본**으로 두는 대신 **어떤 컴포넌트가 999 를 고르는가**의 문제로 바꾼다 —
//   Button 은 고르고 Field 는 안 고른다. 태그(`button` vs `input`)로 갈리므로 셀렉터가 안정적이다.

export type Shape = {
  label: string;
  motto: string;
  radius: { interaction: string; layoutSm: string; layoutMd: string; layoutLg: string };
  pillRadius: string;
  // 세그먼트 트랙(role="tablist")의 곡률. radius 사다리와 따로 두는 이유는 아래 ⚠ 참고.
  trackRadius: string;
  // 넓고 낮은 항목(사이드바 행 등)의 곡률. 아래 ⚠ 참고.
  navRadius: string;
  // 입력 계열(input·textarea·select)의 곡률. 아래 ⚠ 참고.
  fieldRadius: string;
  // 사이드바 치수. 형태 언어가 곡률에서 끝나지 않는 shape 을 위해 연다.
  sidebar: {
    width: string; pad: string; gap: string;
    itemHeight: string; itemPadX: string; filterHeight: string;
  };
  // 999 를 고른 컴포넌트의 셀렉터. 빈 문자열이면 알약을 따로 고르는 자리가 없다는 뜻이다.
  pillTargets: string;
  // 세그먼트 항목의 좌우 여백. 알약이 되면 곡률이 여백 위에 얹혀 같은 값도 넓어 보인다.
  tabPadX: string;
  // 세그먼트 항목 사이 간격.
  trackGap: string;
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
    fieldRadius: ".375rem",
    sidebar: { width: "13.5rem", pad: ".75rem", gap: ".75rem", itemHeight: "1.875rem", itemPadX: ".5rem", filterHeight: "1.75rem" },
    borderWidth: "1px",
    focusRingWidth: "2px",
    focusRingOffset: "2px",
    checkboxRadius: ".1875rem",
    shadowOverlay: "0 6px 18px -5px rgba(24, 25, 28, .16), 0 2px 5px -2px rgba(24, 25, 28, .09)",
    shadowOverlayMinimal: "0 1px 2px 0 rgba(24, 25, 28, .06)",
    pillTargets: "",
    tabPadX: ".625rem",
    trackGap: "2px",
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
    fieldRadius: ".75rem",
    sidebar: { width: "13.5rem", pad: ".75rem", gap: ".75rem", itemHeight: "1.875rem", itemPadX: ".5rem", filterHeight: "1.75rem" },
    borderWidth: "1px",
    focusRingWidth: "3px",
    focusRingOffset: "3px",
    checkboxRadius: ".375rem",
    shadowOverlay: "0 16px 40px -12px rgba(24, 25, 28, .22), 0 6px 14px -6px rgba(24, 25, 28, .12)",
    shadowOverlayMinimal: "0 2px 8px -2px rgba(24, 25, 28, .10)",
    pillTargets: "",
    tabPadX: ".625rem",
    trackGap: "2px",
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
    fieldRadius: "0",
    sidebar: { width: "13.5rem", pad: ".75rem", gap: ".75rem", itemHeight: "1.875rem", itemPadX: ".5rem", filterHeight: "1.75rem" },
    borderWidth: "1.5px",
    focusRingWidth: "2px",
    focusRingOffset: "0px",
    checkboxRadius: "0",
    shadowOverlay: "0 0 0 1.5px rgba(24, 25, 28, .22), 12px 12px 0 -2px rgba(24, 25, 28, .10)",
    shadowOverlayMinimal: "0 0 0 1px rgba(24, 25, 28, .12)",
    pillTargets: "",
    tabPadX: ".625rem",
    trackGap: "2px",
  },

  // 손이 닿는 것과 내용을 담는 것을 형태로 갈라놓는다. 버튼·입력은 완전한 알약이고
  // 카드·모달은 거의 직각이다. 한 화면 안에서 두 곡률이 부딪히는 게 이 shape 의 전부다.
  //
  // ⚠ 예외를 두지 않는다 — 긴 입력도, 사이드바 행도 999 다. Lozenge 가 "알약을 고르는" 쪽이라면
  //   이쪽은 "알약이 기본" 인 쪽이고, 둘을 나란히 놓아야 그 차이가 무엇을 뜻하는지 보인다.
  capsule: {
    label: "Capsule",
    motto: "누르는 것은 알약, 담는 것은 판",
    radius: { interaction: "999px", layoutSm: "2px", layoutMd: "3px", layoutLg: "4px" },
    pillRadius: "999px",
    trackRadius: "999px",
    navRadius: "999px",
    fieldRadius: "999px",
    sidebar: { width: "13.5rem", pad: ".75rem", gap: ".75rem", itemHeight: "1.875rem", itemPadX: ".5rem", filterHeight: "1.75rem" },
    borderWidth: "1px",
    focusRingWidth: "2px",
    focusRingOffset: "2px",
    checkboxRadius: "2px",
    shadowOverlay: "0 8px 24px -8px rgba(24, 25, 28, .18), 0 3px 6px -3px rgba(24, 25, 28, .10)",
    shadowOverlayMinimal: "0 1px 2px 0 rgba(24, 25, 28, .07)",
    pillTargets: "",
    tabPadX: ".5625rem",
    trackGap: "1px",
  },
  // Paper 를 그대로 두고 **알약을 고른 컴포넌트만** 999 를 갖는다. 알약을 모든 컨트롤의
  // 기본값으로 만들면 셋 다 무너진다 — 긴 검색 입력은 스타디움이 되고, 두 글자짜리 링크는
  // 포커스 링까지 원이 되며, 그 지경이 되면 알약이 아무것도 뜻하지 않는다.
  //
  // 그래서 이 shape 의 값은 Paper 와 같고, 차이는 규칙 두 줄이다 — `button` 과
  // `[role="tab"]` 만 999 를 고른다. Badge 는 원래부터 pillRadius 를 쓰므로 그대로 남는다.
  // 그림자만 Stripe 결로 남겨 뒀다(낮고 푸른 기가 도는 겹 그림자).
  lozenge: {
    label: "Lozenge",
    motto: "알약은 기본값이 아니라 선택이다",
    radius: { interaction: ".375rem", layoutSm: ".375rem", layoutMd: ".5rem", layoutLg: ".75rem" },
    pillRadius: "999px",
    trackRadius: "999px",
    navRadius: ".375rem",
    fieldRadius: ".375rem",
    // 기본 폭에서 한 뼘만. 15rem 까지 열었더니 항목이 흩어진 링크로 읽혀서 되돌렸고,
    // 그 사이 어디쯤이 목록으로 남으면서 숨은 트인다.
    sidebar: { width: "14.5rem", pad: ".8125rem", gap: ".625rem", itemHeight: "2rem", itemPadX: ".625rem", filterHeight: "1.8125rem" },
    borderWidth: "1px",
    focusRingWidth: "2px",
    focusRingOffset: "2px",
    checkboxRadius: ".1875rem",
    shadowOverlay: "0 8px 24px 0 rgba(0, 55, 112, .08), 0 2px 6px 0 rgba(0, 55, 112, .04)",
    shadowOverlayMinimal: "0 1px 3px 0 rgba(0, 55, 112, .08)",
    // 알약을 고르는 자리는 셋뿐이다 — 세그먼트, 그리고 hero 의 CTA 둘. 일반 Button 은
    // 빼 뒀다. 알약이 드물수록 그게 무엇을 뜻하는지가 또렷해지고, 남은 자리가 "여기가
    // 이 화면에서 가장 중요한 행동" 이라는 신호가 된다. Badge 는 원래 pillRadius 를 읽는다.
    pillTargets: '[role="tab"],.home-cta button',
    tabPadX: ".5625rem",
    trackGap: "1px",
  },
} as const satisfies Record<string, Shape>;

export type ShapeKey = keyof typeof SHAPES;
export const SHAPE_KEYS = Object.keys(SHAPES) as ShapeKey[];
