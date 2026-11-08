// Anchor — wraps a screen's main summary (the stats strip, now playing, the printer's state), once per screen.
// It is its children and nothing else: the summary stands on the canvas like the rest.

import type { ReactNode } from "react";

export const Anchor = ({ children }: { children: ReactNode }) => <>{children}</>;
