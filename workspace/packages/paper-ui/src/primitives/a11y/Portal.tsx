import { createContext, useContext, useState, type ReactNode } from "react";

import { PortalHost } from "../../internal/aria/portal";
import { directionOf } from "../../internal/direction";
import { usePortalScope } from "../../theme/scope";
import { useSourceCarry } from "../../theme/source-carry";
import { portalRoot } from "./Portal.css";

export type PortalProps = {
  container?: Element;
  opener?: () => Element | null | undefined;
  children: ReactNode;
};

const PortalDepthContext = createContext(0);

export const usePortalDepth = (): number => useContext(PortalDepthContext);

// Written only where it differs: a root with no dir keeps following the page.
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
