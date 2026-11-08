// A sentence about a page or a save that someone should read before going on. Paper has no alert: a soft Paint carries the
// meaning, and a Surface around it gives the corners (Paint has no radius).

import type { ReactNode } from "react";

import { Paint, Surface, Text } from "@studio-baeks/paper-ui";

export const Notice = ({ tone, children }: { tone: "warning" | "error"; children: ReactNode }) => (
  <Surface radius="md" overflow="hidden">
    <Paint accent={tone} variant="soft" paddingX="md" paddingY="sm" role={tone === "error" ? "alert" : "status"}>
      <Text variant="caption" ink="inherit">{children}</Text>
    </Paint>
  </Surface>
);
