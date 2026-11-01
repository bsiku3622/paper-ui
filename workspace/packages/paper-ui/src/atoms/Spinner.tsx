// Spinner — 진행 중 표시. 세 가지로 쓴다.
//   <Spinner />                     혼자 서는 진행 표시 — progressbar 이고 이름(label)을 갖는다
//   <Spinner decorative />          컨트롤 안의 장식 — aria-hidden, 알림은 컨트롤(aria-busy)이 맡는다
//   <Spinner size="inline" ink="inherit" />   글줄 안에서 글자만큼, 글자색을 따라
//
// progressbar 는 이름을 만든 사람의 글에서 받으니 숨은 라벨 요소를 두지 않고 aria-label 로 이름 붙인다. 값(aria-valuenow)이
// 없으니 얼마나 걸릴지 모르는 진행이다. 나머지 속성(...rest)은 span 으로 흘려 보낸다 — Atom 이 span 하나를 그리면서
// span 의 속성을 막으면 쓰는 쪽이 감싸는 div 를 하나 더 만들게 된다.

import { forwardRef, type HTMLAttributes } from "react";

import { joinClass } from "../internal/joinClass";
import { useMessages } from "../internal/locale";
import { Box } from "../primitives/Box";
import { spinnerPaint } from "../primitives/paint/recipes.css";
import type { ControlSize } from "../tokens";
import { spinnerInline, spinnerRoot, spinnerSize } from "./Spinner.css";

export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> & {
  // 크기 3 단 (sm·md·lg)은 Icon 과 같은 아이콘 사다리, inline 은 글줄 안에서 글자만큼(1em).
  size?: ControlSize | "inline";
  // inherit 는 둘러싼 글자색을 따라 도는 호(링은 없다). 안 주면 옅은 링에 잉크색 호.
  ink?: "inherit";
  // 이름. 안 주면 PaperProvider 의 locale 이 고른 문구('불러오는 중' · 'Loading').
  label?: string;
  // 장식이면 aria-hidden 이고 role 도 이름도 없다.
  decorative?: boolean;
  className?: string;
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", ink, label, decorative, className, ...rest },
  ref,
) {
  const messages = useMessages();
  return (
    <Box
      as="span"
      ref={ref}
      {...(decorative ? { "aria-hidden": true } : { role: "progressbar", "aria-label": label ?? messages.loading })}
      className={joinClass(spinnerRoot, size === "inline" ? spinnerInline : spinnerSize[size], spinnerPaint[ink ?? "ink"], className)}
      {...rest}
    />
  );
});
