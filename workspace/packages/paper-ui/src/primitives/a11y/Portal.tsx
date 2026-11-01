import { createContext, useContext, useState, type ReactNode } from "react";

import { PortalHost } from "../../internal/aria/portal";
import { directionOf } from "../../internal/direction";
import { usePortalScope } from "../../theme/scope";
import { useSourceCarry } from "../../theme/source-carry";
import { portalRoot } from "./Portal.css";

export type PortalProps = {
  /** Where the children land; document.body by default. */
  container?: Element;
  /** The element the portal was opened from; the focused element when it is not given. Its direction and source overrides are carried to the root. */
  opener?: () => Element | null | undefined;
  children: ReactNode;
};

const PortalDepthContext = createContext(0);

/** How many portals lie between the page and here. A relationship that must not cross a portal compares it. */
export const usePortalDepth = (): number => useContext(PortalDepthContext);

// The opener's direction, where it differs from the container's, once for the life of the portal as the carry is.
// Written only then: a root with no dir keeps following the page.
const useOpenerDirection = (opener: PortalProps["opener"], container: Element | undefined) => {
  const [dir] = useState(() => {
    if (typeof document === "undefined") return undefined;
    const from = opener?.() ?? document.activeElement;
    if (!from?.isConnected) return undefined;
    const own = directionOf(from);
    return own === directionOf(container ?? document.body) ? undefined : own;
  });
  return dir;
};

// Carries its children to the container. The one root re-establishes the opener's mode there, so the subtree reads
// the theme it was opened in and not the one of the element it lands under, and carries the opener's direction and
// source overrides for the same reason.
export function Portal({ container, opener, children }: PortalProps) {
  const scope = usePortalScope();
  const carry = useSourceCarry(opener, container);
  const dir = useOpenerDirection(opener, container);
  const depth = usePortalDepth();
  return (
    <PortalHost container={container}>
      <PortalDepthContext.Provider value={depth + 1}>
        <div className={portalRoot} {...scope} dir={dir} style={carry}>{children}</div>
      </PortalDepthContext.Provider>
    </PortalHost>
  );
}
