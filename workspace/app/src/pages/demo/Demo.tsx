// /demo/arcfield: the product screens of the demo, drawn with nothing but Paper (the studio at /demo shows them, and the owner's
// apps, in a preview). A screen here has no stylesheet, no className and no inline style; pure.test.ts holds them to it. What
// Paper cannot say yet shows on the screen, which is what the page is for.
//
// Each screen places the bar and the main landmark itself (parts.tsx), so the window scrolls and a sticky sidebar can stand
// beside both.
//
// What the dashboard keeps (the scope, what was made on a page, the notice) lives here, above every screen, so it is still there
// after a visit to the settings or the sign-in.

import { Outlet } from "react-router-dom";

import { StoreProvider } from "./parts";

export const Demo = () => <StoreProvider><Outlet /></StoreProvider>;
