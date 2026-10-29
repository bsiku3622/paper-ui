// Text — 글자. variant 가 크기·굵기·잉크 농도를 한 번에 정하고, family 가 서체를 정한다.
//
// size/weight/color 를 따로 고르는 prop 은 없다. Text 역할 variant 중 하나를
// 고르는 것이 전부다 — 고를 게 없으면 화면이 저절로 일관된다. 서체만 family 축
// (sans 기본 · mono)으로 교차하고, 숫자 글리프의 자리만 numeric 이 맞춘다. 줄바꿈은 서체가 정한다 —
// sans 는 어절 사이에서, mono 는 어디서든 끊는다.

import { forwardRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveText } from "../resolvers";
import type { Ink, TextFamily, TextVariant } from "../tokens";
import type { PolymorphicProps } from "./polymorphic";

type TextOwnProps<V extends TextVariant> = {
  variant?: V;
  // 잉크 농도만 variant 기본값 위로 덮을 수 있다 (보조 글자를 secondary 로 내릴 때).
  ink?: Ink;
  // 서체 축 — variant 위에 교차한다. mono 는 등폭 + 자간 리셋 + 어디서든 줄바꿈.
  family?: TextFamily;
  // 숫자 글리프만 등폭(tabular-nums) — 표의 숫자 열이나 버전처럼 자리를 맞추는 곳에.
  numeric?: boolean;
  children?: ReactNode;
  className?: string;
};

// 시각 위계(variant)와 의미 태그(as)는 직교한다. 기본만 깔아두고 필요하면 as 로 덮는다. 타입도 같은 표를
// 읽으므로 <Text variant="label" ref={spanRef}> 의 ref 는 span 이다.
const DEFAULT_TEXT_TAG = {
  hero: "h1",
  display: "h1",
  title: "h1",
  heading: "h2",
  subheading: "h3",
  body: "p",
  caption: "p",
  label: "span",
} as const satisfies Record<TextVariant, ElementType>;

export type TextProps<V extends TextVariant = "body", As extends ElementType = (typeof DEFAULT_TEXT_TAG)[V]> = PolymorphicProps<TextOwnProps<V>, As>;

const TextImpl = forwardRef<HTMLElement, Omit<TextProps<TextVariant>, "as" | "ref"> & { as?: ElementType }>(function Text({
  variant = "body",
  ink,
  family,
  numeric,
  as,
  children,
  className,
  ...rest
}, ref) {
  const Tag = (as ?? DEFAULT_TEXT_TAG[variant]) as ElementType;
  return (
    <Tag
      ref={ref}
      className={joinClass(resolveText({ variant, family, ink, numeric }), className)}
      {...(rest as object)}
    >
      {children}
    </Tag>
  );
});

export const Text = TextImpl as <V extends TextVariant = "body", As extends ElementType = (typeof DEFAULT_TEXT_TAG)[V]>(props: TextProps<V, As>) => ReactElement;
