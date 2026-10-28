// The five Foundations systems, in the order they stack: each reads only the ones before it.
export const FOUNDATION_SECTIONS = [
  ["color", "Color", "원본 palette와, semantic color role이 지금 테마에서 고르는 값을 확인합니다."],
  ["typography", "Typography", "글자 크기, 굵기, 위계와 서체를 확인합니다."],
  ["shape", "Shape", "요소 하나의 형태 — 곡률, 선, 크기, 안쪽 여백을 확인합니다."],
  ["layout", "Layout", "요소 사이의 관계 — 간격, 페이지 틀, breakpoint, elevation을 확인합니다."],
  ["motion", "Motion", "전이 시간과 곡선, 상황별 움직임을 확인합니다."],
] as const;
export type FoundationSlug = (typeof FOUNDATION_SECTIONS)[number][0];
