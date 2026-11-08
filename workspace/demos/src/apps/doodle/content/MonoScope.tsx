import type { ReactNode } from "react";

import * as css from "./mono.css";

export const MonoScope = ({ children }: { children: ReactNode }) => <div className={css.mono}>{children}</div>;
