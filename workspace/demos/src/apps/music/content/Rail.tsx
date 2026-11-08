import type { ReactNode } from "react";

import { elevation } from "@studio-baeks/paper-ui";

import { rail } from "./Rail.css";

export const Rail = ({ children }: { children: ReactNode }) => <div className={`${elevation.sticky} ${rail}`}>{children}</div>;
