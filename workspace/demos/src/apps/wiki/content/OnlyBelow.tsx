import type { ReactNode } from "react";

import { onlyBelowMd } from "./OnlyBelow.css";

export const OnlyBelowMd = ({ children }: { children: ReactNode }) => <div className={onlyBelowMd}>{children}</div>;
