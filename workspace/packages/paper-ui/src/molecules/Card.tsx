// Card — shared color × variant를 쓰는 정적인 면.
//
// Button·Badge·Alert와 같은 어휘를 쓰되 interactive gate는 붙이지 않는다. 기본 hairline은
// 기존의 흰 카드처럼 조용하고, 의미가 있는 Card만 color를 고른다. 그림자로 뜨지 않는다.

import type { ReactNode } from "react";

import { Box, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { resolveColor, type Color, type Variant } from "../resolvers";
import type { Space } from "../tokens";
import { cardRoot, cardSolid } from "./Card.css";

export type CardProps = Omit<BoxProps<"div">, "children" | "surface" | "border" | "shadow" | "padding"> & {
  // "none" — 자기 여백을 스스로 갖는 것(Table 등) 을 담을 때.
  padding?: Space | "none";
  color?: Color;
  variant?: Variant;
  children?: ReactNode;
};

export const Card = ({
  padding = "lg",
  color = "primary",
  variant = "hairline",
  radius = "md",
  className,
  children,
  ...rest
}: CardProps) => (
  <Box
    padding={padding === "none" ? undefined : padding}
    radius={radius}
    className={joinClass(cardRoot, resolveColor(color, variant), variant === "solid" && cardSolid, className)}
    {...rest}
  >
    {children}
  </Box>
);
