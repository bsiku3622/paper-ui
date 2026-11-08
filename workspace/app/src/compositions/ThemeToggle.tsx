// ThemeToggle — the site's light ⇄ dark switch, an IconButton showing the theme on screen.
//
// 라이브러리는 system 모드도 갖고 있고(첫 방문 때 OS 를 따라가는 건 좋은 기본값이다),
// PaperProvider 의 defaultTheme 은 여전히 system 이다. 다만 **버튼이 그 자리를 거치지는
// 않는다** — 3단 순환이면 어느 방향으로 가든 매번 중간에 한 번 더 눌러야 하고, 그 중간
// 상태가 지금 화면과 같은 색이면 눌러도 아무 일이 안 일어난 것처럼 보인다. 그래서
// **해석된 테마(resolved)의 반대로 곧장 간다.**

import { IconButton, useTheme } from "@studio-baeks/paper-ui";
import type { ColorMode } from "@studio-baeks/paper-ui/tokens";

import { useWords } from "../site/locale";
import { MoonIcon, SunIcon } from "./icons";

const LABEL = {
  ko: { name: { light: "라이트 테마로 전환", dark: "다크 테마로 전환" }, title: { light: "라이트로 전환", dark: "다크로 전환" } },
  en: { name: { light: "Switch to the light theme", dark: "Switch to the dark theme" }, title: { light: "Light theme", dark: "Dark theme" } },
} as const;

export const ThemeToggle = () => {
  const { resolved, setTheme } = useTheme();
  const words = useWords(LABEL);
  const next: ColorMode = resolved === "dark" ? "light" : "dark";
  return (
    <IconButton size="sm" shape="pill" variant="muted" aria-label={words.name[next]} title={words.title[next]} onClick={() => setTheme(next)}>
      {resolved === "dark" ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  );
};
