// 네 축을 실시간으로 갈아 끼우는 개발용 패널.
//
// 처음에는 축을 묶은 캐릭터 프리셋을 위에 뒀는데, 실제로 고를 때는 축을 직접 만지는 쪽이
// 빨라서 걷어냈다. 프리셋이 하던 일 — 어떤 조합이 하나의 주장을 이루는가 — 은 낙점된 뒤
// DESIGN.md 로 쓰는 게 맞고, 고르는 도중에는 자유롭게 섞이는 편이 낫다.
//
// ⚠ 이 패널 자체는 paper-ui 토큰을 한 개도 쓰지 않는다. 토큰으로 그리면 팔레트를 바꿀 때
//   조작 UI 까지 같이 변해서 — Acid 를 고르면 패널이 형광이 된다 — 무엇을 보고 있는지
//   판단할 기준면이 사라진다. 그래서 lab.css 에 자기 색을 따로 갖는다.

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@studio-baeks/paper-ui";

import { applyLab, paletteSwatch, type Combo } from "./apply";
import { PALETTES, PALETTE_KEYS } from "./palettes";
import { SHAPES, SHAPE_KEYS, type ShapeKey } from "./shapes";
import { TYPES, TYPE_KEYS, type TypeKey } from "./types";
import { DENSITIES, DENSITY_KEYS, type DensityKey } from "./densities";
import "./lab.css";

const STORE = "pui-lab";

// `touched` 가 false 면 사용자가 아직 아무것도 고르지 않은 상태다. 그때는 테마조차
// 건드리지 않는다 — lab 을 얹었다는 이유만으로 시스템의 기본 동작(테마 system 추종,
// e2e 가 재는 토큰 값)이 달라지면 안 되기 때문이다.
type Saved = Combo & { open: boolean; touched: boolean };

const BASE: Saved = {
  palette: "paper", shape: "paper", type: "compact", density: "comfort",
  open: true, touched: false,
};

const read = (): Saved => {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return BASE;
    const v = JSON.parse(raw) as Partial<Saved>;
    return {
      palette: v.palette && v.palette in PALETTES ? v.palette : BASE.palette,
      shape: v.shape && v.shape in SHAPES ? v.shape : BASE.shape,
      type: v.type && v.type in TYPES ? v.type : BASE.type,
      density: v.density && v.density in DENSITIES ? v.density : BASE.density,
      open: v.open ?? true,
      touched: v.touched ?? false,
    };
  } catch {
    return BASE;
  }
};

export const LabBar = () => {
  const [s, setState] = useState<Saved>(read);
  const { setTheme } = useTheme();
  const { palette, shape, type, density, open, touched } = s;

  useEffect(() => {
    if (!touched) return;
    applyLab({ palette, shape, type, density });
    // 팔레트가 자기 테마를 갖는다. Neon Night 는 다크에서만 성립하므로 따라 넘어간다.
    setTheme(PALETTES[palette].theme);
  }, [palette, shape, type, density, touched, setTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(s));
    } catch {
      /* 시크릿 창 등에서 막혀도 lab 은 계속 동작해야 한다 */
    }
  }, [s]);

  const pick = useCallback(
    (patch: Partial<Combo>) => setState((p) => ({ ...p, ...patch, touched: true })),
    [],
  );

  // 숫자키로 팔레트, Shift+숫자로 형태. 입력 중에는 잡지 않는다.
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
      <button type="button" className="lab-fab" onClick={() => setState((p) => ({ ...p, open: true }))}>
        Lab
      </button>
    );
  }

  return (
    <aside className="lab" aria-label="디자인 축 실험">
      <header className="lab-head">
        <span className="lab-title">Lab</span>
        <span className="lab-combo">
          {PALETTES[palette].label} · {SHAPES[shape].label}
        </span>
        <button type="button" className="lab-x" onClick={() => setState((p) => ({ ...p, open: false }))} aria-label="패널 접기">
          ×
        </button>
      </header>

      <div className="lab-legend">팔레트</div>
      <div className="lab-pal">
        {PALETTE_KEYS.map((k) => {
          const p = PALETTES[k];
          return (
            <button
              key={k}
              type="button"
              className={`lab-swatch${k === palette ? " is-on" : ""}`}
              onClick={() => pick({ palette: k })}
              title={p.motto}
            >
              <span className="lab-sw" aria-hidden>
                {paletteSwatch(k).map((col, j) => (
                  <i key={j} style={{ background: col }} />
                ))}
              </span>
              <span className="lab-name">
                {p.label}
                {p.theme === "dark" ? <em className="lab-tag">D</em> : null}
              </span>
            </button>
          );
        })}
      </div>
      <p className="lab-motto">{PALETTES[palette].motto}</p>

      <div className="lab-legend">형태</div>
      <div className="lab-axis">
        {SHAPE_KEYS.map((k) => (
          <button key={k} type="button" className={`lab-chip${k === shape ? " is-on" : ""}`}
            onClick={() => pick({ shape: k as ShapeKey })} title={SHAPES[k].motto}>
            {SHAPES[k].label}
          </button>
        ))}
      </div>
      <p className="lab-motto">{SHAPES[shape].motto}</p>

      <div className="lab-legend">타이포</div>
      <div className="lab-axis">
        {TYPE_KEYS.map((k) => (
          <button key={k} type="button" className={`lab-chip${k === type ? " is-on" : ""}`}
            onClick={() => pick({ type: k as TypeKey })} title={TYPES[k].motto}>
            {TYPES[k].label}
          </button>
        ))}
      </div>

      <div className="lab-legend">밀도</div>
      <div className="lab-axis">
        {DENSITY_KEYS.map((k) => (
          <button key={k} type="button" className={`lab-chip${k === density ? " is-on" : ""}`}
            onClick={() => pick({ density: k as DensityKey })} title={DENSITIES[k].motto}>
            {DENSITIES[k].label}
          </button>
        ))}
      </div>
    </aside>
  );
};
