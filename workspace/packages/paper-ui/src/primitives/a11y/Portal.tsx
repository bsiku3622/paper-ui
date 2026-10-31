import { createContext, useContext, type ReactNode } from "react";

import { PortalHost } from "../../internal/aria/portal";
import { usePortalScope } from "../../theme/scope";
import { portalRoot } from "./Portal.css";

export type PortalProps = {
  /** Where the children land; document.body by default. */
  container?: Element;
  children: ReactNode;
};

const PortalDepthContext = createContext(0);

/** How many portals lie between the page and here. A relationship that must not cross a portal compares it. */
export const usePortalDepth = (): number => useContext(PortalDepthContext);

// Carries its children to the container. The one root re-establishes the opener's mode there, so the
// subtree reads the theme it was opened in and not the one of the element it lands under.
export function Portal({ container, children }: PortalProps) {
  const scope = usePortalScope();
  const depth = usePortalDepth();
  return (
    <PortalHost container={container}>
      <PortalDepthContext.Provider value={depth + 1}>
        <div className={portalRoot} {...scope}>{children}</div>
      </PortalDepthContext.Provider>
    </PortalHost>
  );
}
