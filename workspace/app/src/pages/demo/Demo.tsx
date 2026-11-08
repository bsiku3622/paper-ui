import { Outlet } from "react-router-dom";

import { StoreProvider } from "./parts";

export const Demo = () => <StoreProvider><Outlet /></StoreProvider>;
