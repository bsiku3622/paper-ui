// BelowMd — what only a phone (narrower than Paper's md breakpoint) should see: the calendar's day cell shows its events as
// dots there and as titles from md up. Paper has `hideBelow` and no way to say the opposite, so this wraps a Box with one
// rule that reads the breakpoint token (content/below.css.ts).

import type { ReactNode } from "react";

import { Box } from "@studio-baeks/paper-ui";

import { belowMd } from "./below.css";

export const BelowMd = ({ children }: { children: ReactNode }) => <Box className={belowMd}>{children}</Box>;
