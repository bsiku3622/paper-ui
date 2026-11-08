import type { ReactNode } from "react";

import { Box } from "@studio-baeks/paper-ui";

import { belowMd } from "./below.css";

export const BelowMd = ({ children }: { children: ReactNode }) => <Box className={belowMd}>{children}</Box>;
