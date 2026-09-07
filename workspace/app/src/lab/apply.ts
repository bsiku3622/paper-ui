// 팔레트·shape 을 런타임에 적용한다.
//
// paper-ui 는 토큰을 전부 평범한 CSS 변수로 내보내므로, 패키지를 건드리지 않고
// `documentElement` 의 인라인 스타일로 덮어쓰면 된다. 인라인은 특이도 계산을 거치지 않고
// 항상 이기기 때문에, 색이 `:root[data-theme=…]` 에 정의돼 있어도 안전하게 눌린다.
//
// ⚠ 그래서 이 lab 은 시스템의 어느 값도 바꾸지 않는다. 끄면 원래 토큰이 그대로 드러난다.

import { PALETTES, type PaletteKey } from "./palettes";
import { SHAPES, type ShapeKey } from "./shapes";

const STATUS = ["info", "success", "warning", "error"] as const;

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

let applied: string[] = [];

export const applyLab = (palette: PaletteKey | null, shape: ShapeKey | null): void => {
  const root = document.documentElement;
  for (const name of applied) root.style.removeProperty(name);
  applied = [];

  // `paper` 는 기준점이라 곧 시스템 기본값이다. 같은 값을 인라인으로 덮어써 봐야 얻는 게
  // 없고, 덮는 순간 "lab 이 꺼진 상태" 와 구분이 사라진다. 그래서 아무것도 쓰지 않는다.
  const next = {
    ...(palette && palette !== "paper" ? paletteVars(palette) : {}),
    ...(shape && shape !== "paper" ? shapeVars(shape) : {}),
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
