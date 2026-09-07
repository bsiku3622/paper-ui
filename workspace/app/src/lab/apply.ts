// 네 축(색·형태·타이포·밀도)을 런타임에 적용한다.
//
// paper-ui 는 토큰을 전부 평범한 CSS 변수로 내보내므로, 패키지를 건드리지 않고
// `documentElement` 의 인라인 스타일로 덮어쓰면 된다. 인라인은 특이도 계산을 거치지 않고
// 항상 이기기 때문에, 색이 `:root[data-theme=…]` 에 정의돼 있어도 안전하게 눌린다.
//
// ⚠ 그래서 이 lab 은 시스템의 어느 값도 바꾸지 않는다. 끄면 원래 토큰이 그대로 드러난다.

import { PALETTES, type PaletteKey } from "./palettes";
import { SHAPES, type ShapeKey } from "./shapes";
import { TYPES, type TypeKey } from "./types";
import { DENSITIES, type DensityKey } from "./densities";

const STATUS = ["info", "success", "warning", "error"] as const;
const STEPS = ["label", "caption", "body", "subheading", "heading", "title", "display"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const paletteVars = (key: PaletteKey): Record<string, string> => {
  const p = PALETTES[key];
  const v: Record<string, string> = {
    "--pui-color-paper-raised": p.paper.raised,
    "--pui-color-paper-canvas": p.paper.canvas,
    "--pui-color-paper-sunken": p.paper.sunken,
    "--pui-color-paper-well": p.paper.well,
    "--pui-color-ink-base": p.ink.base,
    "--pui-color-ink-soft": p.ink.soft,
    "--pui-color-ink-faint": p.ink.faint,
    "--pui-color-border-base": p.border.base,
    "--pui-color-border-strong": p.border.strong,
    "--pui-color-primary-base": p.primary.base,
    "--pui-color-primary-fg": p.primary.fg,
    "--pui-color-primary-hover": p.primary.hover,
    "--pui-color-focus-ring": p.focusRing,
    "--pui-color-interaction-hover": p.interaction.hover,
    "--pui-color-interaction-selected": p.interaction.selected,
    "--pui-color-interaction-active": p.interaction.active,
    "--pui-color-scrim": p.scrim,
  };
  for (const s of STATUS) {
    const a = p.accent[s];
    v[`--pui-color-accent-${s}-solid`] = a.solid;
    // CSS 변수 이름은 kebab 이라 solidFg 가 solid-fg 로 나온다.
    v[`--pui-color-accent-${s}-solid-fg`] = a.solidFg;
    v[`--pui-color-accent-${s}-ink`] = a.ink;
    v[`--pui-color-accent-${s}-wash`] = a.wash;
    v[`--pui-color-accent-${s}-edge`] = a.edge;
  }
  return v;
};

const shapeVars = (key: ShapeKey): Record<string, string> => {
  const s = SHAPES[key];
  return {
    "--pui-shape-radius-interaction": s.radius.interaction,
    "--pui-shape-radius-layout-sm": s.radius.layoutSm,
    "--pui-shape-radius-layout-md": s.radius.layoutMd,
    "--pui-shape-radius-layout-lg": s.radius.layoutLg,
    "--pui-shape-constants-pill-radius": s.pillRadius,
    "--pui-shape-constants-border-width": s.borderWidth,
    "--pui-shape-constants-focus-ring-width": s.focusRingWidth,
    "--pui-shape-constants-focus-ring-offset": s.focusRingOffset,
    // 체크박스는 사다리를 안 타고 자기 radius 를 갖는 자리라 따로 맞춰 준다.
    "--pui-shape-atom-checkbox-radius": s.checkboxRadius,
    "--pui-shape-checkbox-sm-radius": s.checkboxRadius,
    "--pui-shape-checkbox-md-radius": s.checkboxRadius,
    "--pui-shape-checkbox-lg-radius": s.checkboxRadius,
    "--pui-shape-shadow-overlay": s.shadowOverlay,
    "--pui-shape-shadow-overlay-minimal": s.shadowOverlayMinimal,
  };
};

const typeVars = (key: TypeKey): Record<string, string> => {
  const t = TYPES[key];
  const v: Record<string, string> = { "--pui-text-font-sans": t.fontSans };
  for (const s of STEPS) {
    v[`--pui-text-size-${s}`] = t.size[s];
    v[`--pui-text-tracking-${s}`] = t.tracking[s];
    v[`--pui-text-leading-${s}`] = t.leading[s];
  }
  v["--pui-shape-control-font-size-sm"] = t.controlFontSize.sm;
  v["--pui-shape-control-font-size-md"] = t.controlFontSize.md;
  v["--pui-shape-control-font-size-lg"] = t.controlFontSize.lg;
  return v;
};

const densityVars = (key: DensityKey): Record<string, string> => {
  const d = DENSITIES[key];
  const v: Record<string, string> = {};
  for (const s of SIZES) {
    v[`--pui-shape-gap-${s}`] = d.gap[s];
    v[`--pui-shape-padding-${s}-interaction`] = d.padInteraction[s];
    v[`--pui-shape-padding-${s}-layout`] = d.padLayout[s];
  }
  v["--pui-shape-control-padding-x-sm"] = d.controlPadX.sm;
  v["--pui-shape-control-padding-x-md"] = d.controlPadX.md;
  v["--pui-shape-control-padding-x-lg"] = d.controlPadX.lg;
  return v;
};

export type Combo = {
  palette: PaletteKey;
  shape: ShapeKey;
  type: TypeKey;
  density: DensityKey;
};

// 변수로 못 가는 보정은 규칙 한 줄로 건다. 지금은 세그먼트 트랙 하나뿐이다 —
// Tabs 는 트랙에 `radius.layout.md`, 항목에 `radius.interaction` 을 쓰는데 두 값이 멀어지면
// 알약이 각진 그릇에 안 맞는다. `role="tablist"` 는 마크업이 보장하는 셀렉터라
// vanilla-extract 의 해시 클래스에 기대지 않아도 된다. `:root` 를 앞에 붙여 특이도를
// 0,1,1 로 올리면 !important 없이 컴포넌트 규칙(0,1,0)을 이긴다.
let sheet: HTMLStyleElement | null = null;

const applyRules = (css: string): void => {
  if (!sheet) {
    sheet = document.createElement("style");
    sheet.dataset.puiLab = "";
    document.head.appendChild(sheet);
  }
  sheet.textContent = css;
};

let applied: string[] = [];

export const applyLab = (c: Combo | null): void => {
  const root = document.documentElement;
  for (const name of applied) root.style.removeProperty(name);
  applied = [];
  if (!c) {
    applyRules("");
    return;
  }

  const sh = SHAPES[c.shape];
  const sb = sh.sidebar;
  applyRules(
    c.shape === "paper"
      ? ""
      : `:root [role="tablist"]{border-radius:${sh.trackRadius}}` +
        // 알약을 모든 컨트롤의 기본으로 두지 않고, 어떤 컴포넌트가 999 를 고르는지의
        // 문제로 바꾼다. `pillTargets` 가 그 목록이고, 나머지는 사다리 값을 그대로 쓴다.
        `:root input,:root textarea,:root select{border-radius:${sh.fieldRadius}}` +
        (sh.pillTargets
          ? sh.pillTargets.split(",").map((t: string) => `:root ${t.trim()}{border-radius:999px}`).join("")
          : "") +
        `:root .home-navitem{border-radius:${sh.navRadius};height:${sb.itemHeight};padding-inline:${sb.itemPadX}}` +
        `:root .home-filterrow{height:${sb.filterHeight};padding-inline:${sb.itemPadX}}` +
        `:root .home-filterhead{padding-inline:${sb.itemPadX}}` +
        `:root .home-mockup-side{padding:${sb.pad};gap:${sb.gap}}` +
        // 사이드바 폭은 그리드가 쥐고 있고, 접히는 규칙이 미디어 쿼리 안에 있다.
        // 같은 조건으로 감싸지 않으면 좁은 화면에서도 2 열로 남아 사이드바가 되살아난다.
        `@media (min-width:769px){:root .home-mockup-body{grid-template-columns:${sb.width} minmax(0,1fr)}}`,
  );

  // 각 축의 첫 항목(`paper`/`compact`/`comfort`)은 기준점이라 곧 시스템 기본값이다.
  // 같은 값을 인라인으로 덮어써 봐야 얻는 게 없고, 덮는 순간 "lab 이 꺼진 상태" 와
  // 구분이 사라진다. 그래서 아무것도 쓰지 않는다.
  const next = {
    ...(c.palette !== "paper" ? paletteVars(c.palette) : {}),
    ...(c.shape !== "paper" ? shapeVars(c.shape) : {}),
    ...(c.type !== "compact" ? typeVars(c.type) : {}),
    ...(c.density !== "comfort" ? densityVars(c.density) : {}),
  };
  for (const [name, value] of Object.entries(next)) {
    root.style.setProperty(name, value);
    applied.push(name);
  }
};

export const paletteSwatch = (key: PaletteKey): string[] => {
  const p = PALETTES[key];
  return [p.paper.canvas, p.paper.raised, p.primary.base, p.accent.info.solid, p.accent.error.solid];
};
