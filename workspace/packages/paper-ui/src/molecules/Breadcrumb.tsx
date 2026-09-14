// Breadcrumb — JSX 계층이 실제 location 계층과 같은 compound API.

import { createContext, useContext, type ComponentPropsWithoutRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { Box, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { breadcrumbCurrent, breadcrumbItem, breadcrumbLink, breadcrumbList, breadcrumbSeparator } from "./Breadcrumb.css";

const BreadcrumbContext = createContext<ReactNode>("/");

export type BreadcrumbProps = Omit<BoxProps<"nav">, "as"> & { separator?: ReactNode };
const BreadcrumbRoot = ({ separator = "/", "aria-label": ariaLabel = "현재 위치", className, children, ...rest }: BreadcrumbProps) => (
  <BreadcrumbContext.Provider value={separator}>
    <Box as="nav" aria-label={ariaLabel} className={className} {...rest}>
      <Box as="ol" className={breadcrumbList}>{children}</Box>
    </Box>
  </BreadcrumbContext.Provider>
);

type BreadcrumbItemOwn<As extends ElementType> = { as?: As; current?: boolean; children: ReactNode; className?: string };
export type BreadcrumbItemProps<As extends ElementType = "span"> = BreadcrumbItemOwn<As> & Omit<ComponentPropsWithoutRef<As>, keyof BreadcrumbItemOwn<As>>;
const BreadcrumbItemImpl = <As extends ElementType = "span">({ as, current, children, className, ...rest }: BreadcrumbItemProps<As>) => {
  const separator = useContext(BreadcrumbContext);
  const Tag = current ? "span" : (as ?? "span");
  return (
    <Box as="li" className={breadcrumbItem}>
      <Box
        as={Tag as ElementType}
        {...(current ? {} : (rest as object))}
        aria-current={current ? "page" : undefined}
        className={joinClass("pui-text-caption", current ? breadcrumbCurrent : breadcrumbLink, className)}
      >{children}</Box>
      <Box as="span" aria-hidden className={joinClass("pui-text-caption", breadcrumbSeparator)}>{separator}</Box>
    </Box>
  );
};
export const BreadcrumbItem = BreadcrumbItemImpl as <As extends ElementType = "span">(props: BreadcrumbItemProps<As>) => ReactElement;

export const Breadcrumb = Object.assign(BreadcrumbRoot, { Item: BreadcrumbItem });
