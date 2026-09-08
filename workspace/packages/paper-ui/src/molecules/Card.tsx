// Card — 흰 면 + 헤어라인으로 정의되는 칸.
//
// 회색으로 감싸지 않고, 그림자로 뜨지도 않는다. 회색(paper.sunken)은 카드를 *받치는*
// 바닥에만 오고, 그림자는 떠 있는 것(overlay)의 표식이다. 값은 Card.css.ts 에 있다.

import type { ReactNode } from "react";

import { Box, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import type { Space } from "../tokens";
import { cardRoot } from "./Card.css";

export type CardProps = Omit<BoxProps<"div">, "children" | "shadow" | "padding"> & {
  // "none" — 자기 여백을 스스로 갖는 것(Table 등) 을 담을 때.
  padding?: Space | "none";
  children?: ReactNode;
};

export const Card = ({
  padding = "lg",
  radius = "md",
  className,
  children,
  ...rest
}: CardProps) => (
  <Box
    padding={padding === "none" ? undefined : padding}
    radius={radius}
    className={joinClass(cardRoot, className)}
    {...rest}
  >
    {children}
  </Box>
);
