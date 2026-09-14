import { globalStyle, style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const commandRoot = style({ minWidth: tokens.shape.width.xl.layout, overflow: "hidden" });
export const commandSearch = style({ padding: tokens.shape.padding.sm.interaction });
export const commandList = style({
  maxHeight: tokens.shape.height.xl.layout,
  overflowY: "auto",
  padding: tokens.shape.padding.xs.interaction,
});
export const commandGroup = style({ display: "flex", flexDirection: "column", gap: tokens.shape.gap.xs });
globalStyle(`${commandGroup} + ${commandGroup}`, { marginTop: tokens.shape.gap.sm });
export const commandGroupLabel = style({ paddingInline: tokens.shape.padding.sm.interaction, paddingBlock: tokens.shape.gap.xs });
export const commandItem = style({
  width: "100%",
  minHeight: tokens.shape.height.lg.interaction,
  paddingInline: tokens.shape.padding.sm.interaction,
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  border: 0,
  borderRadius: tokens.shape.radius.interaction,
  background: "transparent",
  color: tokens.color.ink.base,
  fontFamily: tokens.text.font.sans,
  textAlign: "start",
  cursor: "pointer",
  transition: stateTransition("background"),
  selectors: {
    "&[aria-selected='true']": { background: tokens.color.interaction.selected },
    "&[aria-disabled='true']": { color: tokens.color.ink.faint, cursor: "default" },
  },
});
export const commandIcon = style({ display: "inline-flex", color: tokens.color.ink.soft });
export const commandCopy = style({ flex: 1, minWidth: 0 });
export const commandShortcut = style({ color: tokens.color.ink.faint, whiteSpace: "nowrap" });
export const commandEmpty = style({ padding: tokens.shape.padding.lg.interaction, textAlign: "center" });
globalStyle(`${commandList}:has([role="option"]) > ${commandEmpty}`, { display: "none" });
