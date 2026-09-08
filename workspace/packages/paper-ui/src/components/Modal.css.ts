import { style, keyframes } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// enter 모션의 등장 변위(offset·scale)를 motion.enter 에서 읽어 keyframe 에 인라인.
const { enter } = tokens.motion.role;
const fade = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const rise = keyframes({
  from: { opacity: 0, transform: `translateY(${enter.offset}) scale(${enter.scale})` },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: tokens.layout.z.modal,
  display: "grid",
  placeItems: "center",
  padding: tokens.shape.padding.xl.interaction,
  background: tokens.color.scrim, // 테마 인식 — 다크에선 더 짙어져 앞면을 띄운다
  animation: `${fade} ${tokens.motion.duration.base} ${tokens.motion.easing.standard}`,
});

export const modalPanel = style({
  width: "100%",
  maxWidth: tokens.shape.atom.modalWidth,
  animation: `${rise} ${enter.duration} ${enter.easing}`,
  // ⚠ **높이의 상한이 있어야 한다.** backdrop 은 position:fixed 이고 열려 있는 동안
  // body 스크롤도 잠근다 — 패널이 뷰포트보다 커지면 넘친 부분에 닿을 방법이 아예 없다.
  // 실측: 700px 화면에서 본문이 길면 패널이 1069px 로 자라 푸터 버튼이 화면 밖으로
  // 나갔다(확인·취소를 누를 수 없는 모달). 상한을 두고 넘치는 건 *본문만* 스크롤한다.
  // backdrop 의 좌우상하 여백(padding.xl = 24)을 양쪽 빼야 스크림이 남는다.
  maxHeight: `calc(100dvh - ${tokens.shape.padding.xl.interaction} * 2)`,
  // 제목·푸터는 붙박이, 본문만 늘었다 줄었다 — 그래서 패널이 세로 flex 다.
  display: "flex",
  flexDirection: "column",
  overflow: "hidden", // 곡선 밖으로 본문이 새지 않게
  selectors: {
    // 열릴 때 포커스가 패널로 들어오지만(트랩 진입점) 컨테이너라 링은 안 보인다 —
    // 링은 안쪽 컨트롤에만. (전역 :focus-visible 을 이긴다: &:focus 가 더 구체적)
    "&:focus, &:focus-visible": { outline: "none" },
  },
});

// 패널 안의 세로 축 — Stack 이 패널 높이를 그대로 받아야 본문이 남는 자리를 계산한다.
export const modalStack = style({ flex: 1, minHeight: 0 });

// 본문 — 넘치면 여기만 구른다. `minHeight: 0` 이 없으면 flex 자식의 기본 최소 높이가
// 콘텐츠 크기라 스크롤이 안 생기고 패널이 그대로 밀린다.
export const modalBody = style({ flex: 1, minHeight: 0, overflowY: "auto" });
