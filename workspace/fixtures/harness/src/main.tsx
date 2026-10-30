// The e2e harness: one page that uses the package the way a consumer does — the stylesheet through
// styles.css, components through the root entry — and renders the case named by ?case=.
import "@studio-baeks/paper-ui/styles.css";

import { StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";

import { CASE_NAMES, type CaseName } from "./case-names.js";
import { ElevationCase } from "./cases/elevation.js";
import { GeometryCase } from "./cases/geometry.js";
import { LayersCase } from "./cases/layers.js";
import { LayoutCase } from "./cases/layout.js";
import { ThemeCase } from "./cases/theme.js";
import { TypographyCase } from "./cases/typography.js";

const CASES: Record<CaseName, ComponentType> = { geometry: GeometryCase, theme: ThemeCase, layers: LayersCase, layout: LayoutCase, elevation: ElevationCase, typography: TypographyCase };

const isCase = (name: string | null): name is CaseName => CASE_NAMES.some((known) => known === name);

const name = new URLSearchParams(window.location.search).get("case");
if (!isCase(name)) throw new Error(`Unknown harness case "${name}"; use ?case=${CASE_NAMES.join("|")}.`);
const Case = CASES[name];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Case />
  </StrictMode>,
);
