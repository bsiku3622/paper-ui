import { style } from "@vanilla-extract/css";

// 레이아웃 투명 — 박스를 만들지 않고 자식만 그대로 흘린다. 그럼에도 data-theme 로
// 얹힌 색 var 는 자식에게 상속된다(커스텀 프로퍼티는 box tree 가 아니라 flat tree 로
// 상속되므로 display:contents 여도 스코프가 산다).
export const themeScope = style({ display: "contents" });
