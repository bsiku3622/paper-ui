// App — 두 화면 사이의 최소 라우터.
//   #/           → Demo (이슈 트래커, 실사용 검증)
//   #/playground → Playground (컴포넌트 전수, 사람 리뷰 + Playwright 테스트 표면)
//
// react-router 를 넣지 않는다 — 화면이 둘뿐인데 dependency 를 늘리는 건 이
// 시스템의 "최소 선택" 정신에 어긋난다. hash 로 충분하다.

import { useEffect, useState } from "react";

import { Box, Inline, Link, tokens } from "@studio-baeks/paper-ui";

import { Demo } from "./pages/Demo";
import { Playground } from "./pages/Playground";

const useHashRoute = () => {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const on = () => setRoute(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
};

// 두 화면을 오가는 작은 개발용 토글 (우하단 고정). 제품 chrome 이 아니라 dev 도구.
const DevSwitch = ({ route }: { route: string }) => (
  <Box
    paper="base"
    radius="pill"
    shadow="overlay"
    paddingX="md"
    paddingY="xs"
    style={{ position: "fixed", right: "16px", bottom: "16px", zIndex: 60, border: `1px solid ${tokens.color.border.base}` }}
  >
    <Inline gap="md">
      <Link href="#/" aria-current={route === "/" ? "page" : undefined}>데모</Link>
      <Link href="#/playground" aria-current={route.startsWith("/playground") ? "page" : undefined}>플레이그라운드</Link>
    </Inline>
  </Box>
);

export const App = () => {
  const route = useHashRoute();
  return (
    <>
      {route.startsWith("/playground") ? <Playground /> : <Demo />}
      <DevSwitch route={route} />
    </>
  );
};
