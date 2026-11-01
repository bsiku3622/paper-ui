import { globalStyle, style } from "@vanilla-extract/css";
import { STATE_TINT_PROPERTY, stateStyle, tokens, transition, typographyRule } from "@studio-baeks/paper-ui/tokens";

import { DEMO_LAYOUT, DEMO_MEDIA, px } from "./layout";

const compact = `screen and (max-width: ${tokens.layout.breakpoint.sm})`;
const line = `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`;

export const topbar = style({ height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${tokens.shape.inset.xl}`, borderBottom: line, background: tokens.color.bg.raised });
export const brand = style({ gap: tokens.layout.gap.sm, color: "inherit", textDecoration: "none" });
export const brandMark = style({ width: tokens.shape.control.height.sm, height: tokens.shape.control.height.sm, display: "grid", placeItems: "center", borderRadius: tokens.shape.radius.control });
export const topActions = style({ gap: tokens.layout.gap.sm, "@media": { [compact]: { flex: "1 1 auto", minWidth: 0, justifyContent: "flex-end" } } });
export const search = style({ width: 245, "@media": { [compact]: { width: "auto", flex: "1 1 auto", minWidth: 0 } } });
// The workspace name and the divider before it give way to the search on a narrow topbar.
export const workspaceLabel = style({ "@media": { [compact]: { display: "none" } } });
export const filterSearch = style({ width: 190 });
export const layout = style({
  display: "grid",
  gridTemplateColumns: `${px(DEMO_LAYOUT.track.nav)} minmax(0,1fr) ${px(DEMO_LAYOUT.track.rail)}`,
  gap: tokens.layout.gap.xl,
  maxWidth: px(DEMO_LAYOUT.frame),
  margin: "0 auto",
  padding: tokens.shape.inset.xl,
  alignItems: "start",
  "@media": {
    [DEMO_MEDIA.rail]: { gridTemplateColumns: `${px(DEMO_LAYOUT.track.navNarrow)} minmax(0,1fr)` },
    [DEMO_MEDIA.nav]: { gridTemplateColumns: "1fr", padding: tokens.shape.inset.lg },
  },
});
export const sidebar = style({ top: tokens.shape.inset.xl, display: "flex", flexDirection: "column", gap: tokens.layout.gap.xl, padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.xs}`, "@media": { [DEMO_MEDIA.nav]: { position: "static", display: "none" } } });
export const workspacePicker = style({ gap: tokens.layout.gap.sm, padding: `0 ${tokens.shape.inset.sm}` });
export const navItem = style({ width: "100%", justifyContent: "flex-start" });
export const user = style({ marginTop: "auto", paddingTop: tokens.shape.inset.md, borderTop: line, display: "flex", alignItems: "center", gap: tokens.layout.gap.sm });
export const main = style({ minWidth: 0 });
export const breadcrumb = style({ gap: tokens.layout.gap.sm });
export const projectHeading = style({ marginBlock: tokens.layout.gap.lg, gap: tokens.layout.gap.md, flexWrap: "wrap" });
export const percent = style({ minWidth: 64 });
export const work = style({ marginTop: tokens.layout.gap.xl, minWidth: 0 });
export const toolbar = style({ gap: tokens.layout.gap.sm, flexWrap: "wrap" });
// The status filter is one roving group of buttons, side by side.
export const filters = style({ display: "flex", alignItems: "center" });
export const taskList = style({ background: tokens.color.bg.raised, minWidth: 0 });
export const taskTable = style({ width: "100%", borderCollapse: "collapse", textAlign: "left", whiteSpace: "nowrap" });
globalStyle(`${taskTable} th`, { ...typographyRule("label"), height: tokens.shape.control.height.lg, padding: `0 ${tokens.shape.inset.md}`, color: tokens.color.ink.tertiary, borderBottom: line });
globalStyle(`${taskTable} td`, { height: 60, padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`, borderBottom: line });
globalStyle(`${taskTable} tbody tr:last-child td`, { borderBottom: 0 });
// A row answers like any item: the state recipe's tint, only where a pointer can hover.
export const taskRow = style([stateStyle.item, { transition: transition("hover", STATE_TINT_PROPERTY) }]);
export const empty = style({ display: "block", padding: tokens.shape.inset.xl, textAlign: "center" });
export const tableFooter = style({ padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`, borderTop: line });
export const rightRail = style({
  top: tokens.shape.inset.xl,
  "@media": {
    [DEMO_MEDIA.rail]: { gridColumn: "2", position: "static", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", alignItems: "start" },
    [DEMO_MEDIA.nav]: { gridColumn: "1", gridTemplateColumns: "repeat(2,minmax(0,1fr))" },
    [DEMO_MEDIA.stack]: { gridTemplateColumns: "1fr" },
  },
});
export const weekDays = style({ marginTop: tokens.layout.gap.md });
export const agenda = style({ marginTop: tokens.layout.gap.md });
export const agendaItem = style({ alignItems: "start", gap: tokens.layout.gap.md, paddingTop: tokens.shape.inset.sm, borderTop: line });
export const activity = style({ display: "flex", flexDirection: "column", gap: tokens.layout.gap.md });
