// /demo: three product screens drawn with nothing but Paper. A screen here has no stylesheet, no className and no inline
// style; pure.test.ts holds them to it. What Paper cannot say yet shows on the screen, which is what the page is for.
//
// Each screen places the bar and the main landmark itself (parts.tsx), so the window scrolls and a sticky sidebar can stand
// beside both.

import { Outlet } from "react-router-dom";

export const Demo = () => <Outlet />;
