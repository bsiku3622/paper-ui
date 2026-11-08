// 컴포넌트 상세 — preview·controls·code 레이아웃. 전부 tokens.* (raw 값 없음).

import { globalStyle, style, styleVariants } from "@vanilla-extract/css";

import { SURFACE_FILLS, codeRule, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

import { navHeight } from "../site/shell.css";

const BP = tokens.layout.breakpoint;
const narrow = `screen and (max-width: ${BP.md})`;

export const detailBody = style({
  display: "grid",
  gridTemplateColumns: `1fr ${tokens.shape.dimension.width.lg}`,
  gap: tokens.layout.gap.xl,
  alignItems: "start",
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { gridTemplateColumns: "1fr" },
  },
});

// preview 와 코드의 칼럼. 줄어들 수 있어야 넓은 코드가 칼럼 안에서 스크롤한다.
export const previewColumn = style({ minWidth: 0 });

// Props 패널은 스크롤을 따라 헤더 아래에 머문다. 헤더가 정적인 좁은 폭에서는 본문 흐름에 놓인다.
export const propsPanel = style({
  top: `calc(${navHeight} + ${tokens.layout.gap.xl})`,
  "@media": { [narrow]: { position: "static" } },
});

// preview 무대 — 세 surface와 control track 배경에서 가독성을 비교한다.
export const previewFrame = style({ position: "relative" });
export const previewStage = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: tokens.shape.dimension.height.lg,
  padding: tokens.shape.inset["2xl"],
  borderRadius: tokens.shape.radius.surface.lg,
  overflow: "auto",
  isolation: "isolate",
});
export const previewStageTrack = style({ background: tokens.color.control.track });

export const surfaceSwitcher = style({
  position: "absolute",
  top: tokens.layout.gap.sm,
  left: tokens.layout.gap.sm,
  display: "flex",
  gap: tokens.layout.gap.xs,
});
const PREVIEW_BACKGROUNDS = [...SURFACE_FILLS, "track"] as const;
export const surfaceButton = styleVariants(
  Object.fromEntries(PREVIEW_BACKGROUNDS.map((background) => [background, { background: background === "track" ? tokens.color.control.track : tokens.color.bg[background] }])) as Record<(typeof PREVIEW_BACKGROUNDS)[number], { background: string }>,
  (face) => ({
    display: "grid",
    placeItems: "center",
    width: tokens.shape.control.height.xs,
    height: tokens.shape.control.height.xs,
    padding: 0,
    ...lineRule(),
    borderRadius: tokens.shape.radius.full,
    color: tokens.color.ink.primary,
    cursor: "pointer",
    ...face,
    selectors: {
      '&[aria-pressed="true"]': { borderColor: tokens.color.border.strong },
    },
    "@media": { "(hover: hover)": { selectors: { "&:hover": { borderColor: tokens.color.border.hover } } } },
  }),
);

// 자기 면과 외곽이 사용성의 일부인 미리보기(Draggable 무대)는 무대 테두리 안에 다시 가두지 않는다.
export const previewStageFlush = style({
  justifyContent: "stretch",
  minHeight: "auto",
  padding: `${tokens.shape.control.height.lg} 0 0`,
  border: 0,
  borderRadius: 0,
});

// The code is a card of its own: its face and shadow are the Surface's. A line shows only when the code does not parse.
export const codeBlock = style({
  position: "relative",
  overflow: "hidden",
});

export const codeEditor = style({
  display: "block",
  width: "100%",
  minHeight: tokens.shape.dimension.height.xl,
  boxSizing: "border-box",
  resize: "vertical",
  margin: 0,
  paddingBlock: tokens.shape.inset.xl,
  paddingInline: tokens.shape.inset.lg,
  border: 0,
  outline: 0,
  background: "transparent",
  overflowX: "auto",
  ...codeRule("block"),
  fontStyle: "normal",
  color: tokens.color.ink.primary,
  tabSize: 2,
});

export const codeBlockError = style({ ...lineRule(), borderColor: tokens.color.accent.error.soft });
export const codeError = style({ display: "block", paddingInline: tokens.shape.inset.lg, paddingBottom: tokens.shape.inset.sm });

globalStyle(`${codeBlock} pre`, {
  margin: 0,
  paddingBlock: tokens.shape.inset.xl,
  paddingInline: tokens.shape.inset.lg,
  overflowX: "auto",
  ...codeRule("block"),
  fontStyle: "normal",
  color: tokens.color.ink.primary,
  tabSize: 2,
});

export const codeActions = style({
  position: "absolute",
  top: tokens.layout.gap.sm,
  right: tokens.layout.gap.sm,
  display: "flex",
  alignItems: "center",
  gap: tokens.layout.gap.xs,
});
export const codeEdit = style({ minWidth: tokens.shape.control.height.sm });
