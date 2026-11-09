import "@studio-baeks/paper-ui/styles.css";
import { sourceVars } from "@studio-baeks/paper-ui/tokens";

import { StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";

import { CASE_NAMES, type CaseName } from "./case-names.js";
import { AccentsCase } from "./cases/accents.js";
import { DragCase } from "./cases/drag.js";
import { ElevationCase } from "./cases/elevation.js";
import { ExportsCase } from "./cases/exports.js";
import { CarryCase, GeometryCase } from "./cases/geometry.js";
import { LayersCase } from "./cases/layers.js";
import { ControlCase } from "./cases/control.js";
import { LayoutCase } from "./cases/layout.js";
import { GroundCase } from "./cases/ground.js";
import { MarksCase } from "./cases/marks.js";
import { MotionCase } from "./cases/motion.js";
import { OverridesCase } from "./cases/overrides.js";
import { ProviderOverridesCase } from "./cases/provider-overrides.js";
import { PressCase } from "./cases/press.js";
import { ProviderCase } from "./cases/provider.js";
import { StatesCase } from "./cases/states.js";
import { ThemeCase } from "./cases/theme.js";
import { TypographyCase } from "./cases/typography.js";
import { ShapesCase } from "./cases/shapes.js";

const CASES: Record<CaseName, ComponentType> = { geometry: GeometryCase, control: ControlCase, carry: CarryCase, theme: ThemeCase, layers: LayersCase, layout: LayoutCase, elevation: ElevationCase, typography: TypographyCase, motion: MotionCase, press: PressCase, states: StatesCase, marks: MarksCase, ground: GroundCase, drag: DragCase, overrides: OverridesCase, "provider-overrides": ProviderOverridesCase, exports: ExportsCase, accents: AccentsCase, provider: ProviderCase, shapes: ShapesCase };

const isCase = (name: string | null): name is CaseName => CASE_NAMES.some((known) => known === name);

Object.assign(window, { __paper: { sourceVars } });

const name = new URLSearchParams(window.location.search).get("case");
if (!isCase(name)) throw new Error(`Unknown harness case "${name}"; use ?case=${CASE_NAMES.join("|")}.`);
const Case = CASES[name];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Case />
  </StrictMode>,
);
