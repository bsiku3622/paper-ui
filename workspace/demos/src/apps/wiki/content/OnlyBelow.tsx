// What Paper lacked: showing a part only on narrow windows (the counterpart of Box's hideBelow).

import type { ReactNode } from "react";

import { onlyBelowMd } from "./OnlyBelow.css";

export const OnlyBelowMd = ({ children }: { children: ReactNode }) => <div className={onlyBelowMd}>{children}</div>;
