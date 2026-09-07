// 캐릭터와 네 축을 실시간으로 갈아 끼우는 개발용 패널.
//
// 두 층으로 고른다. 캐릭터는 색·형태·타이포·밀도를 한꺼번에 세우고, 축은 그 상태에서
// 하나씩 흔들어 본다. 축을 건드리는 순간 캐릭터 이름이 떨어져 나가는 게 의도다 —
// 그 조합이 더 이상 원래 주장이 아니라는 걸 이름이 아니라 상태로 보여준다.
//
// ⚠ 이 패널 자체는 paper-ui 토큰을 한 개도 쓰지 않는다. 토큰으로 그리면 팔레트를 바꿀 때
//   조작 UI 까지 같이 변해서 — Acid 를 고르면 패널이 형광이 된다 — 무엇을 보고 있는지
//   판단할 기준면이 사라진다. 그래서 lab.css 에 자기 색을 따로 갖는다.

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@studio-baeks/paper-ui";

import { applyLab, paletteSwatch, type Combo } from "./apply";
import { CHARACTERS, CHARACTER_KEYS, type CharacterKey } from "./characters";
import { PALETTES, PALETTE_KEYS, type PaletteKey } from "./palettes";
import { SHAPES, SHAPE_KEYS, type ShapeKey } from "./shapes";
import { TYPES, TYPE_KEYS, type TypeKey } from "./types";
import { DENSITIES, DENSITY_KEYS, type DensityKey } from "./densities";
import "./lab.css";

const STORE = "pui-lab";

// `touched` 가 false 면 사용자가 아직 아무것도 고르지 않은 상태다. 그때는 테마조차
// 건드리지 않는다 — lab 을 얹었다는 이유만으로 시스템의 기본 동작(테마 system 추종,
// e2e 가 재는 토큰 값)이 달라지면 안 되기 때문이다.
type Saved = Combo & {
  character: CharacterKey | null;
  open: boolean;
  axes: boolean;
  touched: boolean;
};

const BASE: Saved = {
  character: "paper",
  palette: "paper", shape: "paper", type: "compact", density: "comfort",
  open: true, axes: false, touched: false,
};

const read = (): Saved => {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return BASE;
    const v = JSON.parse(raw) as Partial<Saved>;
    return {
      character: v.character && v.character in CHARACTERS ? v.character : null,
      palette: v.palette && v.palette in PALETTES ? v.palette : BASE.palette,
      shape: v.shape && v.shape in SHAPES ? v.shape : BASE.shape,
      type: v.type && v.type in TYPES ? v.type : BASE.type,
      density: v.density && v.density in DENSITIES ? v.density : BASE.density,
      open: v.open ?? true,
      axes: v.axes ?? false,
      touched: v.touched ?? false,
    };
  } catch {
    return BASE;
  }
};

export const LabBar = () => {
  const [s, setState] = useState<Saved>(read);
  const { setTheme } = useTheme();
  const { palette, shape, type, density, character, open, axes, touched } = s;

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

  // 축을 직접 건드리면 더 이상 그 캐릭터가 아니다.
  const axis = useCallback(
    (patch: Partial<Combo>) => setState((p) => ({ ...p, ...patch, character: null, touched: true })),
    [],
  );
  const pickCharacter = useCallback(
    (key: CharacterKey) =>
      setState((p) => ({ ...p, ...CHARACTERS[key], character: key, touched: true })),
    [],
  );

  // 숫자키로 캐릭터. 입력 중에는 잡지 않는다.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (el?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1) return;
      const k = CHARACTER_KEYS[n - 1];
      if (k) pickCharacter(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickCharacter]);

  if (!open) {
    return (
      <button type="button" className="lab-fab" onClick={() => setState((p) => ({ ...p, open: true }))}>
        Lab
      </button>
    );
  }

  const active = character ? CHARACTERS[character] : null;

  return (
    <aside className="lab" aria-label="디자인 캐릭터 실험">
      <header className="lab-head">
        <span className="lab-title">Lab</span>
        <span className="lab-combo">{active ? active.label : "custom"}</span>
        <button type="button" className="lab-x" onClick={() => setState((p) => ({ ...p, open: false }))} aria-label="패널 접기">
          ×
        </button>
      </header>

      <div className="lab-group">
        {CHARACTER_KEYS.map((key, i) => {
          const c = CHARACTERS[key];
          return (
            <button
              key={key}
              type="button"
              className={`lab-row${key === character ? " is-on" : ""}`}
              onClick={() => pickCharacter(key)}
            >
              <span className="lab-sw" aria-hidden>
                {paletteSwatch(c.palette).map((col, j) => (
                  <i key={j} style={{ background: col }} />
                ))}
              </span>
              <span className="lab-text">
                <b>
                  {c.label}
                  {PALETTES[c.palette].theme === "dark" ? <em className="lab-tag">dark</em> : null}
                </b>
                <small>{c.claim}</small>
              </span>
              <kbd>{i + 1}</kbd>
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="lab-rules">
          <ul className="lab-do">
            {active.do.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <ul className="lab-dont">
            {active.dont.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        className="lab-toggle"
        onClick={() => setState((p) => ({ ...p, axes: !p.axes }))}
        aria-expanded={axes}
      >
        {axes ? "축 접기" : "축 따로 만지기"}
      </button>

      {axes ? (
        <div className="lab-axes">
          <div className="lab-axis">
            <div className="lab-legend">팔레트</div>
            {PALETTE_KEYS.map((k) => (
              <button key={k} type="button" className={`lab-chip${k === palette ? " is-on" : ""}`}
                onClick={() => axis({ palette: k as PaletteKey })} title={PALETTES[k].motto}>
                {PALETTES[k].label}
              </button>
            ))}
          </div>
          <div className="lab-axis">
            <div className="lab-legend">형태</div>
            {SHAPE_KEYS.map((k) => (
              <button key={k} type="button" className={`lab-chip${k === shape ? " is-on" : ""}`}
                onClick={() => axis({ shape: k as ShapeKey })} title={SHAPES[k].motto}>
                {SHAPES[k].label}
              </button>
            ))}
          </div>
          <div className="lab-axis">
            <div className="lab-legend">타이포</div>
            {TYPE_KEYS.map((k) => (
              <button key={k} type="button" className={`lab-chip${k === type ? " is-on" : ""}`}
                onClick={() => axis({ type: k as TypeKey })} title={TYPES[k].motto}>
                {TYPES[k].label}
              </button>
            ))}
          </div>
          <div className="lab-axis">
            <div className="lab-legend">밀도</div>
            {DENSITY_KEYS.map((k) => (
              <button key={k} type="button" className={`lab-chip${k === density ? " is-on" : ""}`}
                onClick={() => axis({ density: k as DensityKey })} title={DENSITIES[k].motto}>
                {DENSITIES[k].label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
};
