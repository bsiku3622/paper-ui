// Banner — full-width notice의 content와 action slot을 드러낸다.

import type { ReactNode } from "react";

import { Inline, Box } from "../primitives";
import { joinClass } from "../internal/joinClass";
import type { Accent } from "../resolvers";
import { bannerColor, bannerRoot } from "./Banner.css";

export type BannerProps = {
  accent?: Accent;
  children: ReactNode;
  className?: string;
};

const BannerRoot = ({ accent = "primary", children, className }: BannerProps) => {
  const live = accent === "error" || accent === "warning" ? "alert" : accent === "info" || accent === "success" ? "status" : undefined;
  return (
    <Inline as="header" role={live} justify="between" align="center" gap="md" className={joinClass(bannerRoot, bannerColor[accent], className)}>
      {children}
    </Inline>
  );
};

export type BannerPartProps = { children: ReactNode };
export const BannerContent = ({ children }: BannerPartProps) => (
  <Inline gap="sm" align="center" style={{ minWidth: 0 }}>{children}</Inline>
);
export const BannerAction = ({ children }: BannerPartProps) => <Box style={{ flexShrink: 0 }}>{children}</Box>;

export const Banner = Object.assign(BannerRoot, {
  Content: BannerContent,
  Action: BannerAction,
});
