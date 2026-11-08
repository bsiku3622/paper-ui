import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Surface } from "@studio-baeks/paper-ui";
import type { Space, SurfaceRadius } from "@studio-baeks/paper-ui/tokens";

import { useFace } from "./AppShell";
import { plainLink } from "./kit.css";

export type SurfaceLinkProps = {
  to: string;
  children: ReactNode;
  card?: boolean;
  radius?: SurfaceRadius;
  padding?: Space;
  paddingX?: Space;
  paddingY?: Space;
  selected?: boolean;
  "aria-label"?: string;
  "aria-current"?: "page" | "true";
  onClick?: () => void;
};

export const SurfaceLink = ({ to, children, card = false, radius, padding, paddingX, paddingY, selected, onClick, ...aria }: SurfaceLinkProps) => {
  const face = useFace();
  return (
    <Surface
      as={RouterLink}
      to={to}
      className={plainLink}
      hoverable
      selected={selected}
      {...(card ? face : { fill: undefined, shadow: undefined })}
      radius={radius ?? (card ? "lg" : undefined)}
      padding={padding}
      paddingX={paddingX}
      paddingY={paddingY}
      overflow={card ? "hidden" : undefined}
      onClick={onClick}
      {...aria}
    >
      {children}
    </Surface>
  );
};
