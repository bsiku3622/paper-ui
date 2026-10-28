// App — paper-ui 사이트. 네 라우트 그룹.
//   /            홈 (랜딩)
//   /demo        데모 (이슈 트래커, 실사용 검증)
//   /playground  플레이그라운드 (Foundations · Primitives · Atoms)
//   /docs/*      문서 (마크다운)
//
// Site chrome and page-level compositions stay in the app. The package stops at Primitives and Atoms.

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Box, Text } from "@studio-baeks/paper-ui";

const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Demo = lazy(() => import("./pages/Demo").then((m) => ({ default: m.Demo })));
const Overview = lazy(() => import("./playground/Overview").then((m) => ({ default: m.Overview })));
const ComponentDetail = lazy(() => import("./playground/Detail").then((m) => ({ default: m.ComponentDetail })));
const FoundationsPage = lazy(() => import("./playground/foundations").then((m) => ({ default: m.Foundations })));
const Docs = lazy(() => import("./pages/Docs").then((m) => ({ default: m.Docs })));

const Loading = () => (
  <Box paddingX="xl" paddingY="xl">
    <Text variant="caption">불러오는 중…</Text>
  </Box>
);

export const App = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/playground" element={<Overview />} />
      <Route path="/playground/foundations" element={<Navigate to="/playground/foundations/color" replace />} />
      <Route path="/playground/foundations/:section" element={<FoundationsPage />} />
      {/* Former routes: the palette is now the Color source, tokens the Foundations pages, and a slug is the component name in kebab case. */}
      <Route path="/playground/palette" element={<Navigate to="/playground/foundations/color" replace />} />
      <Route path="/playground/tokens" element={<Navigate to="/playground/foundations/color" replace />} />
      <Route path="/playground/iconbutton" element={<Navigate to="/playground/icon-button" replace />} />
      <Route path="/playground/:slug" element={<ComponentDetail />} />
      <Route path="/docs/*" element={<Docs />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
