// Card — 옅은 면으로 정의되는 칸.
//
// 선도 그림자도 없다. paper.sunken 이 흰 캔버스 위에서 카드를 조용히 들어올린다.

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
