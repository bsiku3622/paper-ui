import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";
import { ladderRules } from "../internal/sizeLadder";

// 바 자체 — 지면 위에 붙어 따라오는 한 줄. 높이·면·아래 괘선만 정한다.
export const navbarRoot = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.layout.z.sticky,
  borderBottomWidth: tokens.shape.constants.borderWidth,
  borderBottomStyle: "solid",
  borderBottomColor: tokens.color.border.base,
});

// 안쪽 줄 — 바는 화면 끝까지 가되 내용은 어디에 서는가.
//
//   full     제품 chrome. 사이드바가 있는 앱의 상단 바는 화면 끝까지 쓴다.
//   content  사이트 헤더. 본문 격자와 같은 폭·같은 가운데선에 선다 — 로고와 첫 문단의
//            왼쪽이 어긋나면 헤더가 본문 위에 떠 있는 다른 물건처럼 읽힌다.
//
// 바(면·괘선)와 내용(폭)을 나눈 건 이 둘이 다른 축이기 때문이다. 괘선은 언제나 화면
// 끝까지 가야 하고, 내용은 격자를 따라야 한다.
export const navbarInner = styleVariants({
  full: { minHeight: tokens.shape.atom.navbar },
  content: {
    minHeight: tokens.shape.atom.navbar,
    maxWidth: tokens.layout.container.content,
    width: "100%",
    marginInline: "auto",
  },
});

// 항목 — 버튼일 수도 링크일 수도 있어서, **양쪽의 기본 스타일을 다 지운다.**
// `<a>` 는 밑줄과 파란 글자를, `<button>` 은 테두리와 회색 면을 기본으로 들고 온다.
// 둘 중 하나만 지우면 태그를 갈아 끼웠을 때 조용히 모양이 달라진다.
//
// 크기는 컨트롤 사다리 md 다 — 예전엔 `atom.navItem`(32)·`padding.sm`(8)이라는 자기
// 값을 들고 있었는데, nav 항목도 누르는 자리라 옆의 Button·Field 와 같은 열에 서야 한다.
export const navItem = style({
  ...ladderRules().md,
  appearance: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textDecoration: "none", // <a> 로 왔을 때
  display: "inline-flex", // <a> 는 inline 이라 height 가 안 먹는다
  alignItems: "center",
  flexShrink: 0,
  borderRadius: tokens.shape.radius.interaction,
  fontFamily: tokens.text.font.sans,
  color: tokens.color.ink.soft,
  transition: stateTransition("background", "color"),
  selectors: { "&:hover": { color: tokens.color.ink.base, background: tokens.color.interaction.hover } },
});

// 활성은 면이 아니라 **글자**로 표시한다. 면으로 표시하면 nav 하나가 화면에서 가장 눈에
// 띄는 덩어리가 되는데, nav 는 지금 어디인지 알려줄 뿐 주인공이 아니다. 배경은 hover
// 에만 — 그건 포인터에 답하는 것이라 사라질 표시다.
export const navItemActive = style({
  color: tokens.color.ink.base,
  fontWeight: tokens.text.weight.medium,
});
