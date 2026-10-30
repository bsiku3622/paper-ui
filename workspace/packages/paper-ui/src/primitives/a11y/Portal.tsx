import type { ReactNode } from "react";

import { PortalHost } from "../../internal/aria/portal";
import { usePortalScope } from "../../theme/scope";
import { portalRoot } from "./Portal.css";

export type PortalProps = {
  /** Where the children land; document.body by default. */
  container?: Element;
  children: ReactNode;
};

// Carries its children to the container. The one root re-establishes the opener's mode there, so the
// subtree reads the theme it was opened in and not the one of the element it lands under.
export function Portal({ container, children }: PortalProps) {
  const scope = usePortalScope();
  return (
    <PortalHost container={container}>
      <div className={portalRoot} {...scope}>{children}</div>
    </PortalHost>
  );
}
