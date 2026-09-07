// palette × shape 조합을 실시간으로 갈아 끼우는 개발용 패널.
//
// ⚠ 이 패널 자체는 paper-ui 토큰을 한 개도 쓰지 않는다. 토큰으로 그리면 팔레트를 바꿀 때
//   조작 UI 까지 같이 변해서 — Acid 를 고르면 패널이 형광이 된다 — 무엇을 보고 있는지
//   판단할 기준면이 사라진다. 그래서 lab.css 에 자기 색을 따로 갖는다.

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@studio-baeks/paper-ui";

import { applyLab, paletteSwatch } from "./apply";
import { PALETTES, PALETTE_KEYS, type PaletteKey } from "./palettes";
import { SHAPES, SHAPE_KEYS, type ShapeKey } from "./shapes";
import "./lab.css";

const STORE = "pui-lab";

// `touched` 가 false 면 사용자가 아직 아무것도 고르지 않은 상태다. 그때는 테마조차
// 건드리지 않는다 — lab 을 얹었다는 이유만으로 시스템의 기본 동작(테마 system 추종,
// e2e 가 재는 토큰 값)이 달라지면 안 되기 때문이다.
type Saved = { palette: PaletteKey; shape: ShapeKey; open: boolean; touched: boolean };

const read = (): Saved => {
  const fallback: Saved = { palette: "paper", shape: "paper", open: true, touched: false };
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return fallback;
    const v = JSON.parse(raw) as Partial<Saved>;
    return {
      palette: v.palette && v.palette in PALETTES ? v.palette : fallback.palette,
      shape: v.shape && v.shape in SHAPES ? v.shape : fallback.shape,
      open: v.open ?? true,
      touched: v.touched ?? false,
    };
  } catch {
    return fallback;
  }
};

export const LabBar = () => {
  const [{ palette, shape, open, touched }, setState] = useState<Saved>(read);
  const { setTheme } = useTheme();

  // 팔레트가 자기 테마를 갖는다. Neon Night 는 다크에서만 성립하므로 고를 때 따라 넘어간다.
  useEffect(() => {
    if (!touched) return;
    applyLab(palette, shape);
    setTheme(PALETTES[palette].theme);
  }, [palette, shape, touched, setTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ palette, shape, open, touched }));
    } catch {
      /* 시크릿 창 등에서 막혀도 lab 은 계속 동작해야 한다 */
    }
  }, [palette, shape, open, touched]);

  const pick = useCallback(
    (patch: Partial<Saved>) => setState((s) => ({ ...s, ...patch, touched: true })),
    [],
  );

  // 숫자키로 팔레트, Shift+숫자로 shape. 입력 중에는 잡지 않는다.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (el?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1) return;
      if (e.shiftKey) {
        const k = SHAPE_KEYS[n - 1];
        if (k) pick({ shape: k });
      } else {
        const k = PALETTE_KEYS[n - 1];
        if (k) pick({ palette: k });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick]);

  if (!open) {
    return (
      <button type="button" className="lab-fab" onClick={() => setState((s) => ({ ...s, open: true }))}>
        Lab
      </button>
    );
  }

  return (
    <aside className="lab" aria-label="팔레트와 shape 조합 실험">
      <header className="lab-head">
        <span className="lab-title">Lab</span>
        <span className="lab-combo">
          {PALETTES[palette].label} × {SHAPES[shape].label}
        </span>
        <button type="button" className="lab-x" onClick={() => setState((s) => ({ ...s, open: false }))} aria-label="패널 접기">
          ×
        </button>
      </header>

      <div className="lab-group">
        <div className="lab-legend">팔레트</div>
        {PALETTE_KEYS.map((key, i) => {
          const p = PALETTES[key];
          return (
            <button
              key={key}
              type="button"
              className={`lab-row${key === palette ? " is-on" : ""}`}
              onClick={() => pick({ palette: key })}
            >
              <span className="lab-sw" aria-hidden>
                {paletteSwatch(key).map((c, j) => (
                  <i key={j} style={{ background: c }} />
                ))}
              </span>
              <span className="lab-text">
                <b>
                  {p.label}
                  {p.theme === "dark" ? <em className="lab-tag">dark</em> : null}
                </b>
                <small>{p.motto}</small>
              </span>
              <kbd>{i + 1}</kbd>
            </button>
          );
        })}
      </div>

      <div className="lab-group">
        <div className="lab-legend">shape</div>
        {SHAPE_KEYS.map((key, i) => {
          const s = SHAPES[key];
          return (
            <button
              key={key}
              type="button"
              className={`lab-row${key === shape ? " is-on" : ""}`}
              onClick={() => pick({ shape: key })}
            >
              <span className="lab-shape" aria-hidden>
                <i style={{ borderRadius: s.radius.layoutMd, borderWidth: s.borderWidth }} />
                <i className="lab-shape-pill" style={{ borderRadius: s.radius.interaction, borderWidth: s.borderWidth }} />
              </span>
              <span className="lab-text">
                <b>{s.label}</b>
                <small>{s.motto}</small>
              </span>
              <kbd>⇧{i + 1}</kbd>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
