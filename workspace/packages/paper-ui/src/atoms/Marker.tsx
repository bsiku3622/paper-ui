// Marker — 형광펜. 문장 속 낱말 뒤에 칠을 깔아 눈길을 끈다. 칠은 장식이라 상태를 말하지 않는다 — 선택 · 오류 같은 신호는
// 잉크가 맡는다. 글자의 크기와 굵기는 둘러싼 글자를 따르고, 줄이 넘어가면 줄마다 칠이 이어진다.
//
// 예) <Text variant="hero">다시 <Marker>이어서</Marker> 만들어 볼까요?</Text>

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { markerPaint } from "../primitives/paint/recipes.css";
import { markerRoot } from "./Marker.css";

export type MarkerProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  children?: ReactNode;
  className?: string;
};

export const Marker = forwardRef<HTMLElement, MarkerProps>(function Marker({ className, ...rest }, ref) {
  return <mark ref={ref} className={joinClass(markerRoot, markerPaint, className)} {...rest} />;
});
