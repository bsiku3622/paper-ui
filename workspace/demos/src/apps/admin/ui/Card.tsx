// Card — the first face on the ground: a raised card with its shadow (or its line, on a white page). What is inside it
// is flat; a block that needs setting apart (a key, a config) is a sunken Surface of its own.

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
