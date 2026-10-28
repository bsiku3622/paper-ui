// The part of the site map that imports nothing: the Vite docs plugin loads it in Node, where the
// package entry (components, CSS) cannot be imported. site-map.ts re-exports all of it.

// The five Foundations systems, in the order they stack: each reads only the ones before it.
export const FOUNDATIONS = [
  { id: "color", label: "Color", summary: "원본 palette와, semantic color role이 지금 테마에서 고르는 값을 확인합니다." },
  { id: "typography", label: "Typography", summary: "글자 크기, 굵기, 위계와 서체를 확인합니다." },
  { id: "shape", label: "Shape", summary: "요소 하나의 형태 — 곡률, 선, 크기, 안쪽 여백을 확인합니다." },
  { id: "layout", label: "Layout", summary: "요소 사이의 관계 — 간격, 페이지 틀, breakpoint, elevation을 확인합니다." },
  { id: "motion", label: "Motion", summary: "전이 시간과 곡선, 상황별 움직임을 확인합니다." },
] as const;
export type FoundationId = (typeof FOUNDATIONS)[number]["id"];

// The docs, group by group, in sidebar order. `id` is the folder under docs/ ('' is the top level),
// `label` the sidebar heading and `ko` the heading of the map in docs/README.md. Each name in `docs` is a
// file in that folder without .md; README is the group's overview.
export type DocGroup = { id: string; label: string; ko: string; docs: readonly string[] };
export const DOC_GROUPS: readonly DocGroup[] = [
  { id: "", label: "", ko: "", docs: ["README"] },
  { id: "get-started", label: "Getting Started", ko: "시작하기", docs: ["philosophy", "install"] },
  { id: "foundations", label: "Foundations", ko: "Foundations", docs: ["README", ...FOUNDATIONS.map(({ id }) => id)] },
  { id: "primitives", label: "Primitives", ko: "Primitives", docs: ["README", "layout", "content", "interaction", "a11y"] },
  { id: "atoms", label: "Atoms", ko: "Atoms", docs: ["README", "states"] },
];

// A doc as the Docs page lists it: `slug` is the path after /docs/ ('' for the overview).
export type DocEntry = { slug: string; group: string; title: string; file: string };

export const docSlug = (group: string, doc: string): string => (doc === "README" ? group : group ? `${group}/${doc}` : doc);
export const docFile = (group: string, doc: string): string => `${group ? `${group}/` : ""}${doc}.md`;
