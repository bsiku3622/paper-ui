import { Overlay } from "@react-aria/overlays";
import type { ReactNode } from "react";

export function PortalHost({ container, children }: { container?: Element; children: ReactNode }) {
  return <Overlay portalContainer={container} disableFocusManagement>{children}</Overlay>;
}
