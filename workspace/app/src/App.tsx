// App — paper-ui 사이트. 네 라우트 그룹.
//   /            홈 (랜딩)
//   /demo        데모 (이슈 트래커, 실사용 검증)
//   /playground  플레이그라운드 (컴포넌트 전수 · 테스트 표면)
//   /docs/*      문서 (마크다운)
//
// site chrome 은 앱에만 산다 — 라이브러리 컴포넌트 집합에 nav 를 더하지 않는다
// (원칙 5: 증거 없이 늘리지 않는다). chrome 은 paper-ui 프리미티브로 조립한다.

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Box, Text } from "@studio-baeks/paper-ui";

// 괘선 강도를 고르는 도구. `?lab=edge` 로 켜면 세션에 남아 사이트를 돌아다니는 동안 유지된다.
// 값을 정하고 나면 이 import 와 lab/ 폴더를 지운다.
import { EdgeLab } from "./lab/EdgeLab";

const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Demo = lazy(() => import("./pages/Demo").then((m) => ({ default: m.Demo })));
const Playground = lazy(() => import("./pages/Playground").then((m) => ({ default: m.Playground })));
const TokensPage = lazy(() => import("./playground/Tokens").then((m) => ({ default: m.Tokens })));
const ComponentDetail = lazy(() => import("./playground/Detail").then((m) => ({ default: m.ComponentDetail })));
const Docs = lazy(() => import("./pages/Docs").then((m) => ({ default: m.Docs })));

const Loading = () => (
  <Box paddingX="xl" paddingY="xl">
    <Text variant="caption">불러오는 중…</Text>
  </Box>
);

export const App = () => (
  <Suspense fallback={<Loading />}>
    <EdgeLab />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/playground" element={<Playground />} />
      <Route path="/playground/tokens" element={<TokensPage />} />
      <Route path="/playground/:slug" element={<ComponentDetail />} />
      <Route path="/docs/*" element={<Docs />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
