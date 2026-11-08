// Paper's Textarea has no family="mono". Markdown source is code-like (its marks line up in a fixed pitch), so the editor's
// textarea is set in Paper's mono face from out here; the field itself, its line, its ring and its sizes stay Paper's.

import type { ReactNode } from "react";

import * as css from "./mono.css";

export const MonoScope = ({ children }: { children: ReactNode }) => <div className={css.mono}>{children}</div>;
