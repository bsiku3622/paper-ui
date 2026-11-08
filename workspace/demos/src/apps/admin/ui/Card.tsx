import type { ReactNode } from "react";

import { Stack, Surface } from "@studio-baeks/paper-ui";
import type { Space } from "@studio-baeks/paper-ui/tokens";

import { useFace } from "../../../kit";

export const Card = ({ children, padding = "xl", gap = "lg", justify }: { children: ReactNode; padding?: Space; gap?: Space; justify?: "start" | "between" }) => {
  const face = useFace();
  return (
    <Surface as={Stack} {...face} radius="lg" padding={padding} gap={gap} justify={justify}>
      {children}
    </Surface>
  );
};
