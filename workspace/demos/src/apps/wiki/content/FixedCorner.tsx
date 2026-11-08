// What Paper lacked: a part that stays in the window's bottom-right corner while the page scrolls (the wiki's “맨 위로” buttons).
// Only the pinning is here; the buttons inside are Paper's.

import type { ReactNode } from "react";

import { corner } from "./FixedCorner.css";

export const FixedCorner = ({ children }: { children: ReactNode }) => <div className={corner}>{children}</div>;
