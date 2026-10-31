import { createContext, useContext, type ReactNode } from "react";

import { PortalHost } from "../../internal/aria/portal";
import { usePortalScope } from "../../theme/scope";
import { useSourceCarry } from "../../theme/source-carry";
import { portalRoot } from "./Portal.css";

export type PortalProps = {
  /** Where the children land; document.body by default. */
  container?: Element;
  /** The element the portal was opened from; the focused element when it is not given. Its source overrides are carried to the root. */
  opener?: () => Element | null | undefined;
  children: ReactNode;
};

const PortalDepthContext = createContext(0);

/** How many portals lie between the page and here. A relationship that must not cross a portal compares it. */
export const usePortalDepth = (): number => useContext(PortalDepthContext);

// Carries its children to the container. The one root re-establishes the opener's mode there, so the subtree reads
// the theme it was opened in and not the one of the element it lands under, and carries the opener's source overrides
// for the same reason.
export function Portal({ container, opener, children }: PortalProps) {
  const scope = usePortalScope();
  const carry = useSourceCarry(opener, container);
  const depth = usePortalDepth();
  return (
    <PortalHost container={container}>
      <PortalDepthContext.Provider value={depth + 1}>
        <div className={portalRoot} {...scope} style={carry}>{children}</div>
      </PortalDepthContext.Provider>
    </PortalHost>
  );
}
