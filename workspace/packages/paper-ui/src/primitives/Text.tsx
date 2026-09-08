// Text — 글자. variant 가 크기·굵기·잉크 농도를 한 번에 정하고, family 가 서체를 정한다.
//
// size/weight/color 를 따로 고르는 prop 은 없다. 7 개 목소리(variant) 중 하나를
// 고르는 것이 전부다 — 고를 게 없으면 화면이 저절로 일관된다. 서체만 family 축
// (sans 기본 · mono)으로 교차한다.

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveInk, type Ink } from "../resolvers";
import type { TextVariant } from "../tokens";

type OwnProps<As extends ElementType> = {
  variant?: TextVariant;
  // 잉크 농도만 variant 기본값 위로 덮을 수 있다 (보조 글자를 ink.soft 로 내릴 때).
  ink?: Ink;
  // 서체 축 — variant 위에 교차한다. mono 는 .pui-mono 가 등폭 + 자간 리셋.
  family?: "sans" | "mono";
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
};

export const Text = <As extends ElementType = "p">({
  variant = "body",
  ink,
  family,
  as,
  children,
  className,
  ...rest
}: TextProps<As>) => {
  const Tag = (as ?? DEFAULT_TAG[variant]) as ElementType;
  return (
    <Tag
      className={joinClass(`pui-text-${variant}`, family === "mono" && "pui-mono", resolveInk(ink), className)}
      {...(rest as object)}
    >
      {children}
    </Tag>
  );
};
