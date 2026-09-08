// Navbar — 지면 맨 위 한 줄. 높이가 line 이라 본문 격자와 이어진다.
//
// ⚠ **항목은 버튼일 수도 링크일 수도 있다.** 오래 `<button>` 만 그렸는데, 그러면 실제
// 사이트의 GNB 를 이걸로 못 짠다 — 가운데 클릭으로 새 탭을 못 열고, 주소가 없어 크롤러도
// 못 따라가고, 라우터와도 안 붙는다. 이 저장소의 사이트 GNB 자체가 그래서 라이브러리를
// 안 쓰고 손으로 다시 짜고 있었다. Button 의 `as` 와 같은 결함이고 같은 해법이다.
//
//   { value: "docs", label: "문서" }                        → <button>, onSelect 로 상태만
//   { value: "docs", label: "문서", as: "a", href: "/docs" } → <a>
//   { value: "docs", label: "문서", as: Link, to: "/docs" }  → 라우터 Link
//
// 태그가 갈리면 속성도 갈린다 — `type="button"` 은 진짜 버튼일 때만 붙이고, 나머지 키는
// 그대로 흘려 보낸다(href · to · target · rel …). 활성 표시는 양쪽 다 `aria-current="page"`.

import type { ElementType, ReactNode } from "react";

import { Box, Inline } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { navbarRoot, navbarInner, navItem, navItemActive } from "./Navbar.css";

export type NavItem = {
  value: string;
  label: string;
  // 이 항목이 실은 링크일 때의 통로. 안 주면 <button>.
  as?: ElementType;
  // as 로 갈아 끼운 태그의 속성. 데이터 API 라 키를 미리 못 정하므로 열어 둔다.
  [prop: string]: unknown;
};

export type NavbarProps = {
  brand?: ReactNode;
  items?: readonly NavItem[];
  active?: string;
  onSelect?: (value: string) => void;
  trailing?: ReactNode;
  // 내용이 서는 자리 — full(제품 chrome, 화면 끝까지) · content(사이트 헤더, 본문 격자).
  // 괘선과 면은 어느 쪽이든 화면 끝까지 간다. 나뉘는 건 안쪽 줄의 폭뿐이다.
  width?: "full" | "content";
};

export const Navbar = ({ brand, items = [], active, onSelect, trailing, width = "full" }: NavbarProps) => (
  <Box as="header" surface="canvas" paddingX="lg" className={navbarRoot}>
    <Inline gap="xl" justify="between" align="center" className={navbarInner[width]}>
      <Inline gap="xl" align="center">
        {brand}
        <Inline as="nav" gap="xs" align="center">
          {items.map(({ value, label, as, ...rest }) => (
            <Box
              key={value}
              as={as ?? "button"}
              {...(as ? null : { type: "button" as const })}
              aria-current={value === active ? "page" : undefined}
              className={joinClass(navItem, value === active && navItemActive)}
              onClick={() => onSelect?.(value)}
              {...rest}
            >
              {label}
            </Box>
          ))}
        </Inline>
      </Inline>
      {trailing}
    </Inline>
  </Box>
);
