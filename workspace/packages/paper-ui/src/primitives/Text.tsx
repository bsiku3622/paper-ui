// Text — 글자. variant 가 크기·굵기·서체·잉크 농도를 한 번에 정한다.
//
// size/weight/color 를 따로 고르는 prop 은 없다. 8 개 목소리 중 하나를 고르는
// 것이 전부다 — 고를 게 없으면 화면이 저절로 일관된다.

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveInk, type Ink } from "../resolvers";
import type { TextVariant } from "../tokens";

type OwnProps<As extends ElementType> = {
  variant?: TextVariant;
  // 잉크 농도만 variant 기본값 위로 덮을 수 있다 (muted 처리용).
  ink?: Ink;
  as?: As;
  children?: ReactNode;
  className?: string;
};

export type TextProps<As extends ElementType = "p"> = OwnProps<As> &
  Omit<ComponentPropsWithoutRef<As>, keyof OwnProps<As>>;

// 시각 위계(variant)와 의미 태그(as)는 직교한다. 기본만 깔아두고 필요하면 as 로 덮는다.
const DEFAULT_TAG: Record<TextVariant, ElementType> = {
  display: "h1",
  title: "h1",
  heading: "h2",
  subheading: "h3",
  body: "p",
  caption: "p",
  label: "span",
  mono: "span",
};

export const Text = <As extends ElementType = "p">({
  variant = "body",
  ink,
  as,
  children,
  className,
  ...rest
}: TextProps<As>) => {
  const Tag = (as ?? DEFAULT_TAG[variant]) as ElementType;
  return (
    <Tag
      className={joinClass(`pui-text-${variant}`, resolveInk(ink), className)}
      {...(rest as object)}
    >
      {children}
    </Tag>
  );
};
