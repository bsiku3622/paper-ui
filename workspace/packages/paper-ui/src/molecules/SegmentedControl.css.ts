import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

export const segmentedRoot = style({ display: "inline-flex", gap: tokens.shape.atom.segmentedTrackGap, padding: tokens.shape.atom.segmentedTrackPad, background: tokens.color.paper.well });
export const segmentedRootShape = styleVariants({ rounded: { borderRadius: tokens.shape.radius.interaction }, pill: { borderRadius: tokens.shape.radius.full } });
export const segmentedItem = style({ appearance: "none", background: "transparent", border: "none", cursor: "pointer", fontFamily: tokens.text.font.sans, fontWeight: tokens.text.weight.medium, color: tokens.color.ink.soft, transition: stateTransition("background", "color"), selectors: { "&:hover": { color: tokens.color.ink.base, backgroundImage: `linear-gradient(0deg, ${tokens.color.interaction.hover}, ${tokens.color.interaction.hover})` } } });
export const segmentedItemSize = styleVariants(ladderRules());
export const segmentedItemShape = styleVariants({ rounded: { borderRadius: `calc(${tokens.shape.radius.interaction} - ${tokens.shape.atom.segmentedTrackPad})` }, pill: { borderRadius: tokens.shape.radius.full } });
export const segmentedItemActive = style({ background: tokens.color.paper.raised, color: tokens.color.ink.base });
