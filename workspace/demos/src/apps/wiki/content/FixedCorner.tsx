import type { ReactNode } from "react";

import { corner } from "./FixedCorner.css";

export const FixedCorner = ({ children }: { children: ReactNode }) => <div className={corner}>{children}</div>;
