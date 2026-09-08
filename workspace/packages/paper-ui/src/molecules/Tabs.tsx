// Tabs — 같은 자리에 다른 장(章).
//
// raw <button> 대신 <Box as="button"> — Molecule 이 raw 태그에 닿는 유일한 통로.
//
// 접근성(WAI-ARIA Tabs): 활성 탭만 Tab 순서에 있고(roving tabindex), 좌우(·상하) 화살표와
// Home/End 로 탭 사이를 옮긴다(포커스를 따라 활성도 바뀐다). 패널을 쓰면 `panelId` 로
// aria-controls 를 잇는다 — 탭 id 는 `${panelId}-tab` 라, 패널에서 aria-labelledby 로 되짚는다.

import { useId, type KeyboardEvent } from "react";

import { Box, Inline } from "../primitives";
import { joinClass } from "../internal/joinClass";
import type { ControlSize } from "../tokens";
import { tabsList, tabsListShape, tabItem, tabItemSize, tabItemShape, tabItemActive } from "./Tabs.css";

export type TabItem = { value: string; label: string; panelId?: string };

export type TabsProps = {
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  // 크기 3 단 (sm·md·lg). 세그먼트는 컴팩트해서 기본 sm.
  size?: ControlSize;
  // 실루엣 — Button·Badge·Field·Select 와 같은 어휘. 트랙과 항목이 함께 갈린다
  // (default 의 안쪽 반경은 바깥 − 트랙 여백으로 동심을 맞춘다).
  shape?: "default" | "pill";
  className?: string;
};

export const Tabs = ({ items, value, onChange, size = "sm", shape = "default", className }: TabsProps) => {
  const uid = useId();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = items.findIndex((t) => t.value === value);
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % items.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    const t = items[next];
    if (!t) return;
    onChange(t.value);
    // 활성이 바뀌면 그 탭으로 포커스도 옮긴다(roving).
    e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <Inline
      role="tablist"
      className={joinClass(tabsList, tabsListShape[shape], className)}
      onKeyDown={onKeyDown}
    >
      {items.map((t) => {
        const selected = t.value === value;
        return (
          <Box
            key={t.value}
            as="button"
            type="button"
            role="tab"
            id={`${uid}-${t.value}`}
            aria-selected={selected}
            aria-controls={t.panelId}
            tabIndex={selected ? 0 : -1}
            className={joinClass(tabItem, tabItemSize[size], tabItemShape[shape], selected && tabItemActive)}
            onClick={() => onChange(t.value)}
          >
            {t.label}
          </Box>
        );
      })}
    </Inline>
  );
};
