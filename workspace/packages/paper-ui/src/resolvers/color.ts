import { fillClass, inkClass } from "../styles/color.css";
import type { Ink, SurfaceFill } from "../tokens";

export const resolveFill = (fill: SurfaceFill | undefined): string => (fill ? fillClass[fill] : "");

export const resolveInk = (ink: Ink | undefined): string => (ink ? inkClass[ink] : "");
