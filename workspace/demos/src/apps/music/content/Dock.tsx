// Dock — the floating player's place. Paper's Surface can stick to the top of the window (elevation="sticky" with `top`)
// but has no face that stays at the bottom, so the position is drawn here; the z comes from Paper's sticky tier.
// What stands in the dock (the player itself) is a Paper Surface in a screen file.

import type { ReactNode } from "react";

import { elevation } from "@studio-baeks/paper-ui";

import { bar, dock, withAside } from "./Dock.css";

export const Dock = ({ aside, children }: { aside: boolean; children: ReactNode }) => (
  <div className={[elevation.sticky, dock, aside ? withAside : ""].join(" ")}>
    <div className={bar}>{children}</div>
  </div>
);
