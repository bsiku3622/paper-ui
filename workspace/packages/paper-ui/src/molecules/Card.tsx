// Card — 괘선으로 두른 칸.
//
// 그림자로 뜨지 않는다. 종이에 그은 네모다.

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
  radius = "base",
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
