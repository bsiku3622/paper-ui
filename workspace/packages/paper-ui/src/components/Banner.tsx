// Banner — full-width notice의 content와 action slot을 드러낸다.

import type { ReactNode } from "react";

import { Inline, Box } from "../primitives";
import { joinClass } from "../internal/joinClass";
import type { StatusName } from "../tokens";
import { bannerRoot, bannerTone } from "./Banner.css";

export type BannerProps = {
  tone?: "solid" | StatusName;
  children: ReactNode;
  className?: string;
};

const BannerRoot = ({ tone = "solid", children, className }: BannerProps) => {
  const live = tone === "error" || tone === "warning" ? "alert" : tone === "info" || tone === "success" ? "status" : undefined;
  return (
    <Inline as="header" role={live} justify="between" align="center" gap="md" className={joinClass(bannerRoot, bannerTone[tone], className)}>
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
