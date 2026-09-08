// EdgeLab — 괘선 강도를 사이트를 돌아다니면서 고르는 자리.
//
// 값을 코드에서 한 번 바꾸고 스크린샷으로 판단하면 늘 한 화면만 보게 된다. 괘선은
// 표·카드·입력·탭이 한 화면에 같이 있을 때 비로소 갈리므로, **켜 둔 채 사이트를 돌아다니며**
// 고르는 게 맞다. `?lab=edge` 로 켜면 세션에 남아 이동해도 따라온다.
//
// 화면의 회색 선은 한 벌이라 base 하나만 고르면 된다 — strong 은 늘 그 한 단 위다.
// 컨트롤만 따로 진하게 하지 않는 건 그게 바로 어긋남으로 읽히기 때문이다(카드는 안 보이는데
// 그 위 검색창만 진하면 한 화면에 회색이 두 벌이 된다).
//
// 앱 전용 도구다 — 라이브러리에 안 들어간다. 고르고 나면 tokens/colors.ts 의 BORDER 두
// 줄에 값을 옮기고 이 파일은 지운다.

import { useEffect, useState } from "react";

// 지금 값에서 ink.soft 쪽으로 캐스트를 유지한 채 훑는다. 라벨은 흰 면(다크는 raised) 대비.
const STEPS = [
  { r: "1.2", light: "#e8e8ea", dark: "#2b2b31", note: "지금" },
  { r: "1.4", light: "#dadadc", dark: "#2c2c32", note: "" },
  { r: "1.7", light: "#c6c6ca", dark: "#393940", note: "" },
  { r: "2.0", light: "#b7b7bb", dark: "#44444a", note: "" },
  { r: "2.5", light: "#a3a3a9", dark: "#525258", note: "" },
  { r: "3.0", light: "#94949b", dark: "#5e5e64", note: "WCAG" },
] as const;

const KEY = "pui-edge-lab";

const apply = (i: number) => {
  document.getElementById(KEY)?.remove();
  if (i < 0) return;
  const base = STEPS[i]!;
  const strong = STEPS[Math.min(i + 1, STEPS.length - 1)]!;
  // ⚠ 셀렉터를 `:root:root` 로 겹쳐 쓴다. 토큰은 평범한 `:root` 에 굽혀 있어 특정도가 같고,
  // 그러면 **문서 순서**로 갈리는데 dev 서버의 HMR 이 스타일을 다시 꽂는 순서를 보장하지
  // 않는다(실제로 값이 안 먹었다). 한 단 올려 두면 순서와 무관하게 이긴다.
  // 다크 스코프도 같은 이유로 함께 올린다 — 테마를 토글해도 따라와야 한다.
  const el = document.createElement("style");
  el.id = KEY;
  el.textContent = `
    :root:root { --pui-color-border-base: ${base.light}; --pui-color-border-strong: ${strong.light}; }
    :root[data-theme="dark"] { --pui-color-border-base: ${base.dark}; --pui-color-border-strong: ${strong.dark}; }
    @media (prefers-color-scheme: dark) {
      :root:root:not([data-theme="light"]) { --pui-color-border-base: ${base.dark}; --pui-color-border-strong: ${strong.dark}; }
    }`;
  document.head.appendChild(el);
};

export const EdgeLab = () => {
  const [on, setOn] = useState(false);
  const [idx, setIdx] = useState(0);

  // `?lab=edge` 로 한 번 켜면 세션에 남는다 — 페이지를 옮겨도 조건이 유지돼야 비교가 된다.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lab");
    const live = q === "edge" || sessionStorage.getItem(KEY) !== null;
    if (!live) return;
    const saved = Number(sessionStorage.getItem(KEY) ?? "0");
    setOn(true);
    setIdx(saved);
    apply(saved);
  }, []);

  useEffect(() => {
    if (!on) return;
    sessionStorage.setItem(KEY, String(idx));
    apply(idx);
  }, [on, idx]);

  if (!on) return null;

  const step = STEPS[idx]!;
  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        borderRadius: 10,
        background: "var(--pui-color-paper-raised)",
        boxShadow: "0 8px 24px 0 rgba(0,55,112,.14), 0 2px 6px 0 rgba(0,55,112,.08)",
        border: "1px solid var(--pui-color-border-base)",
        font: "12px/1.4 var(--pui-text-font-sans, system-ui)",
        color: "var(--pui-color-ink-base)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <strong style={{ fontWeight: 600 }}>괘선 강도</strong>
        <span style={{ color: "var(--pui-color-ink-faint)", fontVariantNumeric: "tabular-nums" }}>
          {step.r}:1 {step.note && `· ${step.note}`}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {STEPS.map((s, i) => (
          <button
            key={s.r}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={i === idx}
            style={{
              width: 34,
              height: 28,
              cursor: "pointer",
              borderRadius: 6,
              fontVariantNumeric: "tabular-nums",
              font: "inherit",
              color: i === idx ? "var(--pui-color-primary-fg)" : "var(--pui-color-ink-soft)",
              background: i === idx ? "var(--pui-color-primary-base)" : "transparent",
              border: `1px solid ${i === idx ? "transparent" : "var(--pui-color-border-base)"}`,
            }}
          >
            {s.r}
          </button>
        ))}
      </div>
      <div style={{ color: "var(--pui-color-ink-faint)" }}>
        base {step.light} · strong 은 한 단 위
      </div>
      <button
        type="button"
        onClick={() => {
          sessionStorage.removeItem(KEY);
          apply(-1);
          setOn(false);
        }}
        style={{
          height: 26,
          cursor: "pointer",
          borderRadius: 6,
          font: "inherit",
          color: "var(--pui-color-ink-soft)",
          background: "transparent",
          border: "1px solid var(--pui-color-border-base)",
        }}
      >
        끄기
      </button>
    </div>
  );
};
