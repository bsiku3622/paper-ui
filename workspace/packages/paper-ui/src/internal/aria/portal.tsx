import { Overlay } from "@react-aria/overlays";
import type { ReactNode } from "react";

// Renders its children into the container (document.body by default). Focus management stays with the caller.
export function PortalHost({ container, children }: { container?: Element; children: ReactNode }) {
  return <Overlay portalContainer={container} disableFocusManagement>{children}</Overlay>;
}
