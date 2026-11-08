// Rail — the right pane's place. AppShell puts `aside` in a grid cell that is only as tall as what is in it, so a pane made
// sticky there has nowhere to stay, and lyrics that scroll away with the page are no use. Paper's sticky face needs a
// parent as tall as the page; this is a column fixed to the window instead. What stands in it is Paper in a screen file.

import type { ReactNode } from "react";

import { elevation } from "@studio-baeks/paper-ui";

import { rail } from "./Rail.css";

export const Rail = ({ children }: { children: ReactNode }) => <div className={`${elevation.sticky} ${rail}`}>{children}</div>;
