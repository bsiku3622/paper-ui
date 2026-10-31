// states.css.ts — the two global rules a state needs. The tint property is registered, so a state can move it and
// a transition can carry it; and the ring baseline draws the keyboard focus of an element that has no ring owner.
//
// What a state looks like is tokens/state-recipes.ts. A ring owner (a Button, a field frame) keeps the native
// outline off and draws the ring itself on its own radius; this baseline draws only the ring and never touches
// an element's corners, so a heading or a bare link gets a square ring.

import { createGlobalVar } from "@vanilla-extract/css";

import { focusRing, STATE_TINT_PROPERTY } from "../tokens";
import { layered } from "../tokens/layers.css";

const base = layered("base");

createGlobalVar(STATE_TINT_PROPERTY, { syntax: "<color>", inherits: false, initialValue: "transparent" });

base.globalStyle(":where(:focus-visible)", focusRing);
