import { forwardRef, type SVGProps } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveInk } from "../resolvers";
import type { IconSize, Ink } from "../tokens";
import { iconRoot, iconSize } from "./Icon.css";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "size"> & {
  size?: IconSize;
  ink?: Ink;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size, ink, children, className, ...rest }, ref) {
  const labelled = Boolean(rest["aria-label"] || rest["aria-labelledby"]);
  return (
  <svg
    ref={ref}
    focusable="false"
    viewBox="0 0 24 24"
    className={joinClass(iconRoot, size && iconSize[size], resolveInk(ink), className)}
    role={labelled ? "img" : undefined}
    aria-hidden={labelled ? undefined : true}
    {...rest}
  >
    {children}
  </svg>
);
});
