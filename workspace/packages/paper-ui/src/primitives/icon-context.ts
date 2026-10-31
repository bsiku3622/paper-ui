import { createContext } from "react";

import type { IconSize } from "../tokens";

// The size an Atom gives the icons inside it: a control icon follows the control, not the text beside it.
// An explicit `size` on the Icon wins, and an Icon outside any Atom is body.
export const IconSizeContext = createContext<IconSize | undefined>(undefined);
