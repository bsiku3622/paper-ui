import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { markerPaint } from "../primitives/paint/recipes.css";
import { markerRoot } from "./Marker.css";

export type MarkerProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  children?: ReactNode;
  className?: string;
};

export const Marker = forwardRef<HTMLElement, MarkerProps>(function Marker({ className, ...rest }, ref) {
  return <mark ref={ref} className={joinClass(markerRoot, markerPaint, className)} {...rest} />;
});
