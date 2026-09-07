// 두 번째 앱 목업 전용 스타일 — 사이드바를 다시 설계한 안.
//
// 첫 목업(.home-mockup)은 그대로 둔다. 이쪽은 같은 화면을 다른 사이드바로 짜서 나란히
// 비교하려는 것이고, 그래서 클래스 이름을 통째로 분리했다.
//
// 인터랙션은 전부 CSS transition 이다. 활성 표시를 배경으로 칠하는 대신 인디케이터 하나를
// 움직이면, 어느 항목이 켜졌는지가 아니라 **어디에서 어디로 옮겨 갔는지** 가 보인다.

import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

const BP = tokens.layout.breakpoint;
const ROW = "2.125rem"; // 항목 한 칸. 인디케이터가 이 값의 배수로 움직인다.

globalStyle(".mb", {
  border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  borderRadius: tokens.shape.radius.layout.lg,
  overflow: "hidden",
  background: tokens.color.paper.raised,
  boxShadow: tokens.shape.shadow.overlay,
});

globalStyle(".mb-body", {
  display: "grid",
  gridTemplateColumns: "var(--mb-side, 14.5rem) minmax(0, 1fr)",
  minHeight: "27rem",
  transition: "grid-template-columns .28s cubic-bezier(.22,.61,.36,1)",
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

globalStyle(".mb-side", {
  display: "flex",
  flexDirection: "column",
  gap: tokens.shape.gap.sm,
  padding: tokens.shape.padding.sm.interaction,
  borderRight: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  background: tokens.color.paper.sunken,
  overflow: "hidden",
  "@media": {
    [`screen and (max-width: ${BP.md})`]: { display: "none" },
  },
});

/* ── 머리 — 로고와 접기 ─────────────────────────────────────────────── */
globalStyle(".mb-head", {
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  height: ROW,
  paddingInline: tokens.shape.padding.xs.interaction,
});

globalStyle(".mb-fold", {
  marginLeft: "auto",
  display: "grid",
  placeItems: "center",
  width: "1.5rem",
  height: "1.5rem",
  flex: "none",
  border: 0,
  borderRadius: tokens.shape.radius.interaction,
  background: "transparent",
  color: tokens.color.ink.faint,
  cursor: "pointer",
  transition: "background .16s ease, color .16s ease",
});
globalStyle(".mb-fold:hover", {
  background: tokens.color.interaction.hover,
  color: tokens.color.ink.base,
});
/* 화살표가 접힘 상태를 각도로 말한다 — 아이콘을 갈아 끼우지 않는다. */
globalStyle(".mb-fold span", { transition: "transform .28s cubic-bezier(.22,.61,.36,1)" });
globalStyle('.mb[data-fold="true"] .mb-fold span', { transform: "rotate(180deg)" });

/* 접히면 3.5rem 안에 로고와 버튼이 같이 못 들어간다. 로고를 물리고 버튼만 남긴다 —
   접기 버튼이 잘리면 되돌릴 방법이 사라진다. */
globalStyle('.mb[data-fold="true"] .mb-brand', { display: "none" });
globalStyle('.mb[data-fold="true"] .mb-fold', { marginLeft: 0, marginInline: "auto" });

/* 라벨 없는 섹션 화살표는 접힌 상태에서 뜻을 잃는다. */
globalStyle('.mb[data-fold="true"] .mb-sec', { visibility: "hidden" });

/* ── 목록 — 인디케이터가 움직이는 자리 ──────────────────────────────── */
globalStyle(".mb-list", { position: "relative", display: "flex", flexDirection: "column" });

/* 활성 표시는 항목마다 칠하는 배경이 아니라, 목록 위를 미끄러지는 판 하나다. */
globalStyle(".mb-mark", {
  position: "absolute",
  insetInline: 0,
  top: 0,
  height: ROW,
  borderRadius: tokens.shape.radius.interaction,
  background: tokens.color.interaction.selected,
  transform: "translateY(calc(var(--mb-i, 0) * " + ROW + "))",
  transition: "transform .3s cubic-bezier(.22,.61,.36,1)",
  pointerEvents: "none",
});

globalStyle(".mb-item", {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  height: ROW,
  paddingInline: tokens.shape.padding.xs.interaction,
  border: 0,
  borderRadius: tokens.shape.radius.interaction,
  background: "transparent",
  color: tokens.color.ink.soft,
  font: "inherit",
  fontSize: tokens.text.size.caption,
  textAlign: "left",
  cursor: "pointer",
  transition: "color .16s ease",
});
globalStyle(".mb-item:hover", { color: tokens.color.ink.base });
globalStyle('.mb-item[data-on="true"]', {
  color: tokens.color.ink.base,
  fontWeight: tokens.text.weight.medium,
});

/* 글리프는 접혔을 때 남는 유일한 단서라, 자리를 고정으로 잡아 둔다. */
globalStyle(".mb-glyph", {
  flex: "none",
  display: "grid",
  placeItems: "center",
  width: "1.25rem",
  height: "1.25rem",
  fontSize: tokens.text.size.label,
  color: tokens.color.ink.faint,
  transition: "color .16s ease, transform .22s cubic-bezier(.22,.61,.36,1)",
});
globalStyle('.mb-item[data-on="true"] .mb-glyph', { color: tokens.color.ink.base });
globalStyle(".mb-item:hover .mb-glyph", { transform: "scale(1.14)" });

globalStyle(".mb-label", {
  flex: 1,
  minWidth: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  opacity: 1,
  transition: "opacity .18s ease",
});
globalStyle('.mb[data-fold="true"] .mb-label', { opacity: 0 });

/* 카운트는 평소 옅게 있다가 hover·활성에서 또렷해진다 — 늘 보이면 목록이 시끄럽다. */
globalStyle(".mb-count", {
  flex: "none",
  fontSize: tokens.text.size.label,
  fontVariantNumeric: "tabular-nums",
  color: tokens.color.ink.faint,
  opacity: 0.45,
  transition: "opacity .18s ease, transform .22s cubic-bezier(.22,.61,.36,1)",
});
globalStyle(".mb-item:hover .mb-count", { opacity: 1, transform: "translateX(-2px)" });
globalStyle('.mb-item[data-on="true"] .mb-count', { opacity: 1, color: tokens.color.ink.soft });
globalStyle('.mb[data-fold="true"] .mb-count', { opacity: 0 });

/* ── 섹션 — 접히는 필터 무리 ────────────────────────────────────────── */
globalStyle(".mb-sec", {
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.xs,
  height: "1.75rem",
  paddingInline: tokens.shape.padding.xs.interaction,
  border: 0,
  background: "transparent",
  color: tokens.color.ink.faint,
  font: "inherit",
  fontSize: tokens.text.size.label,
  letterSpacing: tokens.text.tracking.label,
  cursor: "pointer",
  transition: "color .16s ease",
});
globalStyle(".mb-sec:hover", { color: tokens.color.ink.soft });
globalStyle(".mb-sec span", { transition: "transform .24s cubic-bezier(.22,.61,.36,1)" });
globalStyle('.mb-sec[data-open="false"] span', { transform: "rotate(-90deg)" });

globalStyle(".mb-group", {
  display: "grid",
  gridTemplateRows: "1fr",
  transition: "grid-template-rows .28s cubic-bezier(.22,.61,.36,1), opacity .2s ease",
  opacity: 1,
});
globalStyle('.mb-group[data-open="false"]', { gridTemplateRows: "0fr", opacity: 0 });
globalStyle(".mb-group > div", { overflow: "hidden", minHeight: 0 });

globalStyle(".mb-dot", { width: ".5rem", height: ".5rem", flex: "none" });

/* ── 발 — 사용자 ────────────────────────────────────────────────────── */
globalStyle(".mb-foot", {
  marginTop: "auto",
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  height: ROW,
  paddingInline: tokens.shape.padding.xs.interaction,
  borderTop: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
  paddingTop: tokens.shape.padding.xs.interaction,
});

globalStyle(".mb-main", { display: "flex", flexDirection: "column", minWidth: 0 });

/* 본문 행 — 선택된 필터에 따라 사라지고 나타난다. */
globalStyle(".mb-row", {
  transition: "opacity .22s ease, transform .22s cubic-bezier(.22,.61,.36,1)",
})
