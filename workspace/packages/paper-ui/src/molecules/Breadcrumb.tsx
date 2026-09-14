// Breadcrumb — 현재 위치의 계층을 짧게 보여주는 location navigation.

import type { ElementType, ReactNode } from "react";

import { Box } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { breadcrumbCurrent, breadcrumbItem, breadcrumbLink, breadcrumbList, breadcrumbSeparator } from "./Breadcrumb.css";

export type BreadcrumbItem = {
  value: string;
  label: ReactNode;
  as?: ElementType;
  current?: boolean;
  [prop: string]: unknown;
};

export type BreadcrumbProps = {
  items: readonly BreadcrumbItem[];
  separator?: ReactNode;
  "aria-label"?: string;
  className?: string;
};

export const Breadcrumb = ({ items, separator = "/", "aria-label": ariaLabel = "현재 위치", className }: BreadcrumbProps) => (
  <Box as="nav" aria-label={ariaLabel} className={className}>
    <Box as="ol" className={breadcrumbList}>
      {items.map(({ value, label, as, current, ...rest }, index) => {
        const isCurrent = current ?? index === items.length - 1;
        return (
          <Box as="li" key={value} className={breadcrumbItem}>
            <Box
              as={isCurrent ? "span" : (as ?? "span")}
              aria-current={isCurrent ? "page" : undefined}
              className={joinClass("pui-text-caption", isCurrent ? breadcrumbCurrent : breadcrumbLink)}
              {...(isCurrent ? {} : rest)}
            >
              {label}
            </Box>
            {index < items.length - 1 ? <Box as="span" aria-hidden className={joinClass("pui-text-caption", breadcrumbSeparator)}>{separator}</Box> : null}
          </Box>
        );
      })}
    </Box>
  </Box>
);
