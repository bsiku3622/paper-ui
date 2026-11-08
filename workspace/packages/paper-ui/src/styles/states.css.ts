import { createGlobalVar } from "@vanilla-extract/css";

import { focusRing, STATE_TINT_PROPERTY } from "../tokens";
import { layered } from "../tokens/layers.css";

const base = layered("base");

createGlobalVar(STATE_TINT_PROPERTY, { syntax: "<color>", inherits: false, initialValue: "transparent" });

base.globalStyle(":where(:focus-visible)", focusRing);
