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
