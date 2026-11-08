import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { Route, Routes } from "react-router-dom";

import { Launcher } from "./launcher/Launcher";

const apps: Record<string, LazyExoticComponent<ComponentType>> = {
  admin: lazy(() => import("./apps/admin/App")),
  paperdown: lazy(() => import("./apps/paperdown/App")),
  doodle: lazy(() => import("./apps/doodle/App")),
  gridphoto: lazy(() => import("./apps/gridphoto/App")),
  music: lazy(() => import("./apps/music/App")),
  classes: lazy(() => import("./apps/classes/App")),
  wiki: lazy(() => import("./apps/wiki/App")),
  printer: lazy(() => import("./apps/printer/App")),
};

export const App = () => (
  <Suspense fallback={null}>
    <Routes>
      <Route index element={<Launcher />} />
      {Object.entries(apps).map(([id, Screen]) => <Route key={id} path={`${id}/*`} element={<Screen />} />)}
      <Route path="*" element={<Launcher />} />
    </Routes>
  </Suspense>
);
