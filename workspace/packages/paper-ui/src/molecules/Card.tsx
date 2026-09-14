// Card — shared surface와 optional header · body · footer anatomy.

import { Children, isValidElement, type ReactNode } from "react";

import { Box, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { resolveColor, type Color, type Variant } from "../resolvers";
import type { Space } from "../tokens";
import { cardBody, cardFooter, cardHeader, cardRoot, cardSolid } from "./Card.css";

export type CardProps = Omit<BoxProps<"div">, "children" | "surface" | "border" | "shadow" | "padding"> & {
  padding?: Space | "none";
  color?: Color;
  variant?: Variant;
  children: ReactNode;
};

export type CardPartProps = Omit<BoxProps<"div">, "as" | "children"> & { children: ReactNode };
export const CardHeader = ({ children, className, ...rest }: CardPartProps) => (
  <Box padding="lg" className={joinClass(cardHeader, className)} {...rest}>{children}</Box>
);
export const CardBody = ({ children, className, ...rest }: CardPartProps) => (
  <Box padding="lg" className={joinClass(cardBody, className)} {...rest}>{children}</Box>
);
export const CardFooter = ({ children, className, ...rest }: CardPartProps) => (
  <Box padding="md" className={joinClass(cardFooter, className)} {...rest}>{children}</Box>
);

const CardRoot = ({
  padding = "lg",
  color = "primary",
  variant = "hairline",
  radius = "md",
  className,
  children,
  ...rest
}: CardProps) => {
  const usesParts = Children.toArray(children).some(
    (child) => isValidElement(child) && (child.type === CardHeader || child.type === CardBody || child.type === CardFooter),
  );
  return (
    <Box
      padding={usesParts || padding === "none" ? undefined : padding}
      radius={radius}
      className={joinClass(cardRoot, resolveColor(color, variant), variant === "solid" && cardSolid, className)}
      {...rest}
    >
      {children}
    </Box>
  );
};

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
