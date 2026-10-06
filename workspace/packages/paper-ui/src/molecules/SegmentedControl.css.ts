import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

export const segmentedRoot = style({ display: "inline-flex", gap: tokens.shape.component.segmentedTrackGap, padding: tokens.shape.component.segmentedTrackPad, background: tokens.color.control.track });
export const segmentedRootShape = styleVariants({ rounded: { borderRadius: tokens.shape.radius.interaction }, pill: { borderRadius: tokens.shape.radius.full } });
export const segmentedItem = style({ appearance: "none", background: "transparent", border: "none", cursor: "pointer", color: tokens.color.ink.secondary, transition: stateTransition("background", "color"), selectors: { "&:hover": { color: tokens.color.ink.primary, backgroundImage: `linear-gradient(0deg, ${tokens.color.interaction.bgHover.onSurface}, ${tokens.color.interaction.bgHover.onSurface})` } } });
export const segmentedItemSize = styleVariants(ladderRules());
export const segmentedItemShape = styleVariants({ rounded: { borderRadius: `calc(${tokens.shape.radius.interaction} - ${tokens.shape.component.segmentedTrackPad})` }, pill: { borderRadius: tokens.shape.radius.full } });
export const segmentedItemActive = style({ background: tokens.color.bg.raised, color: tokens.color.ink.primary });
