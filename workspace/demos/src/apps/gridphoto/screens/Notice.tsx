import type { ReactNode } from "react";

import { Paint, Surface, Text } from "@studio-baeks/paper-ui";

export const Notice = ({ tone, children }: { tone: "warning" | "error"; children: ReactNode }) => (
  <Surface radius="md" overflow="hidden">
    <Paint accent={tone} variant="soft" paddingX="md" paddingY="sm" role={tone === "error" ? "alert" : "status"}>
      <Text variant="caption" ink="inherit">{children}</Text>
    </Paint>
  </Surface>
);
