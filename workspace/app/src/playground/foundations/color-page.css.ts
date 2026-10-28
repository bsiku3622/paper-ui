// The Color page's own layout, kept as it was. Surface, ink, border, radius and spacing come from Paper UI.
import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

globalStyle(".foundation-palette-scroll", { maxWidth: "100%", overflowX: "auto" });
globalStyle(".foundation-palette-matrix", { display: "grid", gridTemplateColumns: "minmax(6rem, 1.2fr) repeat(14, minmax(2.2rem, 1fr))", gap: tokens.layout.gap.sm, alignItems: "center", minWidth: "44rem" });
globalStyle(".foundation-palette-matrix > :nth-child(15n + 1)", { textAlign: "start" });
globalStyle(".foundation-palette-matrix > :nth-child(-n + 15)", { textAlign: "center", paddingBottom: tokens.shape.inset.xs });
globalStyle(".foundation-palette-swatch", { width: "100%", aspectRatio: "1" });
globalStyle(".foundation-color-columns, .foundation-color-row", { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(8rem, 10rem) minmax(8rem, 10rem)", gap: tokens.layout.gap.md, alignItems: "center" });
globalStyle(".foundation-color-columns", { paddingInline: tokens.shape.inset.md, "@media": { "screen and (max-width: 760px)": { gridTemplateColumns: "minmax(0, 1fr) minmax(7rem, 1fr) minmax(7rem, 1fr)" } } });
globalStyle(".foundation-color-row", { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(8rem, 10rem) minmax(8rem, 10rem)", gap: tokens.layout.gap.md, alignItems: "center", padding: tokens.shape.inset.lg, borderBottom: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, "@media": { "screen and (max-width: 760px)": { gridTemplateColumns: "minmax(0, 1fr) minmax(7rem, 1fr) minmax(7rem, 1fr)", gap: tokens.layout.gap.sm, padding: tokens.shape.inset.md } } });
globalStyle(".foundation-color-copy", { minWidth: 0 });
globalStyle(".foundation-color-token", { width: "fit-content", maxWidth: "100%", overflowWrap: "anywhere" });
globalStyle(".foundation-color-value", { minWidth: 0 });
globalStyle(".foundation-color-chip", { width: "100%", height: tokens.shape.control.height.sm, boxSizing: "border-box" });
globalStyle(".foundation-color-meta", { display: "grid", minWidth: 0 });
globalStyle(".foundation-color-meta > *", { gridArea: "1 / 1", minWidth: 0, overflowWrap: "anywhere" });
globalStyle(".foundation-color-hex", { visibility: "hidden" });
globalStyle(".foundation-color-value:hover .foundation-color-hex, .foundation-color-value:focus-visible .foundation-color-hex", { visibility: "visible" });
globalStyle(".foundation-color-value:hover .foundation-color-palette-token, .foundation-color-value:focus-visible .foundation-color-palette-token", { visibility: "hidden" });
globalStyle(".foundation-color-section", { minWidth: 0 });
globalStyle(".foundation-color-groups", { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: tokens.layout.gap.md, "@media": { "screen and (max-width: 760px)": { gridTemplateColumns: "1fr" } } });
globalStyle(".foundation-color-group", { minWidth: 0 });
globalStyle(".foundation-swatch-grid", { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))", gap: tokens.layout.gap.md, minWidth: 0 });
globalStyle(".foundation-swatch", { minWidth: 0 });
globalStyle(".foundation-swatch > *", { overflowWrap: "anywhere", minWidth: 0 });
globalStyle(".foundation-accent-table", { display: "grid", gap: tokens.layout.gap.xs, minWidth: 0 });
globalStyle(".foundation-accent-head, .foundation-accent-row", { display: "grid", gridTemplateColumns: "minmax(6rem, 1fr) repeat(5, minmax(0, 1fr))", gap: tokens.layout.gap.sm, alignItems: "center" });
globalStyle(".foundation-accent-head", { paddingBottom: tokens.shape.inset.xs });
globalStyle(".foundation-accent-cell", { width: "100%", height: tokens.shape.control.height.lg });
