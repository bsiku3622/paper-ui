export const FOUNDATIONS = [
  { id: "color", label: "Color", summary: { ko: "원본 palette와, semantic color role이 지금 테마에서 고르는 값을 확인합니다.", en: "Check the source palette and the values the semantic color roles pick in the current theme." } },
  { id: "typography", label: "Typography", summary: { ko: "글자 크기, 굵기, 위계와 서체를 확인합니다.", en: "Check type size, weight, hierarchy and typeface." } },
  { id: "shape", label: "Shape", summary: { ko: "요소 하나의 형태 — 곡률, 선, 크기, 안쪽 여백을 확인합니다.", en: "The form of one element: curvature, line, size and inner space." } },
  { id: "layout", label: "Layout", summary: { ko: "요소 사이의 관계 — 간격, 페이지 틀, breakpoint, elevation을 확인합니다.", en: "The relations between elements: spacing, page frame, breakpoints and elevation." } },
  { id: "motion", label: "Motion", summary: { ko: "전이 시간과 곡선, 상황별 움직임을 확인합니다.", en: "Check transition durations and curves, and the motion for each situation." } },
] as const;
export type FoundationId = (typeof FOUNDATIONS)[number]["id"];

export type DocGroup = { id: string; label: string; ko: string; docs: readonly string[] };
export const DOC_GROUPS: readonly DocGroup[] = [
  { id: "", label: "", ko: "", docs: ["README"] },
  { id: "get-started", label: "Getting Started", ko: "시작하기", docs: ["philosophy", "install", "theming"] },
  { id: "foundations", label: "Foundations", ko: "Foundations", docs: ["README", ...FOUNDATIONS.map(({ id }) => id)] },
  { id: "primitives", label: "Primitives", ko: "Primitives", docs: ["README", "element", "content", "a11y", "paint", "control", "press", "select", "float", "drag", "focus", "field", "layout"] },
  { id: "atoms", label: "Atoms", ko: "Atoms", docs: ["README", "states"] },
  { id: "components", label: "Components", ko: "Components", docs: ["README", "date-picker"] },
];

export type DocEntry = { slug: string; group: string; title: string; file: string; titleEn?: string };

export const EN_DOCS_DIR = "en";

export const docSlug = (group: string, doc: string): string => (doc === "README" ? group : group ? `${group}/${doc}` : doc);
export const docFile = (group: string, doc: string): string => `${group ? `${group}/` : ""}${doc}.md`;
