// PaperProvider — 테마를 관장하고 앱을 감싼다. 스타일은 앱이 styles.css 를 한 번 import 해 들인다.
//
// 색·크기 같은 브랜드 선택은 여전히 없다 — primaryColor 가 없고, 정체성은 순백·검정·
// 여백에서 나온다. Provider 가 고르는 단 하나는 *테마* 다: light · dark · system.
// system 은 OS 설정(prefers-color-scheme)을 따라가고, 사용자가 토글하면 그 선택이 이긴다.
//
// DOM wrapper 를 만들지 않는다 — 테마는 <html data-theme> 로 전역 스코프하고(레이아웃
// 영향 0), React 쪽엔 해석된 테마를 context 로 흘린다. 부분 화면 반전은 <ThemeScope>·
// <Box inverse> 가 같은 엔진으로 처리한다.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { isStylesheetLoaded } from "../tokens";
import {
  ResolvedThemeContext,
  ThemeControlContext,
  type Theme,
  type ResolvedTheme,
  type ThemeControl,
} from "../primitives/theme-context";

const STORAGE_KEY = "paper-theme";

const prefersDark = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

const resolve = (theme: Theme): ResolvedTheme =>
  theme === "system" ? (prefersDark() ? "dark" : "light") : theme;

const readStored = (): Theme | null => {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : null;
  } catch {
    return null;
  }
};

// styles.css 를 빠뜨린 앱은 경고 없이 스타일 없는 화면을 본다 — 개발 중 한 번만 알린다.
let stylesheetWarned = false;

export type PaperProviderProps = {
  // 초기 테마. 기본 system(OS 따라감). 저장된 선택이 있으면 그게 이긴다.
  defaultTheme?: Theme;
  children?: ReactNode;
};

export const PaperProvider = ({ defaultTheme = "system", children }: PaperProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => readStored() ?? defaultTheme);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(theme));

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || stylesheetWarned || isStylesheetLoaded(document.documentElement)) return;
    stylesheetWarned = true;
    console.warn('[paper-ui] The stylesheet is not loaded. Import "@studio-baeks/paper-ui/styles.css" once at the app entry.');
  }, []);

  // theme(또는 system 일 때 OS 설정) 변화 → resolved 재계산. system 이면 matchMedia 구독.
  useEffect(() => {
    setResolved(resolve(theme));
    if (theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // 해석된 테마를 <html data-theme> 로 반영 — 전역 색 스코프 교체.
  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage 접근 불가(사생활 모드 등) — 메모리 상태만 유지하고 무시.
    }
  }, []);

  const control = useMemo<ThemeControl>(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return (
    <ThemeControlContext.Provider value={control}>
      <ResolvedThemeContext.Provider value={resolved}>{children}</ResolvedThemeContext.Provider>
    </ThemeControlContext.Provider>
  );
};
