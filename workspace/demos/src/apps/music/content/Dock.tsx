import type { ReactNode } from "react";

import { elevation } from "@studio-baeks/paper-ui";

import { bar, dock, withAside } from "./Dock.css";

export const Dock = ({ aside, children }: { aside: boolean; children: ReactNode }) => (
  <div className={[elevation.sticky, dock, aside ? withAside : ""].join(" ")}>
    <div className={bar}>{children}</div>
  </div>
);
