// theme-context — 테마 엔진의 두 context.
//
// 다크모드와 inverse 는 같은 엔진이다: [data-theme] 스코프가 색 var 세트를 갈아끼우고,
// React 쪽은 "지금 해석된 테마가 무엇인가" 를 context 로 들고 다닌다. 두 층으로 나눈다:
//   ResolvedTheme — subtree 마다 덮어써진다 (ThemeScope · Box inverse 가 자기 반대를 심음).
//   ThemeControl  — 전역 단일 (PaperProvider 만 제공). 토글 UI 가 setTheme 로 쓴다.
// 최하위(Box) 가 ResolvedTheme 를 읽으므로 context 는 primitives 층에 둔다.

import { createContext, useContext } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

// 해석된 테마 — ThemeScope·Box inverse 가 subtree 마다 반대로 덮어쓴다. Provider 밖에서도
// 기본값(light)으로 동작하므로 inverse 는 Provider 없이도 쓸 수 있다.
export const ResolvedThemeContext = createContext<ResolvedTheme>("light");
export const useResolvedTheme = (): ResolvedTheme => useContext(ResolvedThemeContext);

// 테마 제어 — 전역 단일. PaperProvider 만 제공한다.
export type ThemeControl = {
  theme: Theme; // 사용자의 선택 (system 포함)
  resolved: ResolvedTheme; // 실제 적용값
  setTheme: (theme: Theme) => void;
};
export const ThemeControlContext = createContext<ThemeControl | null>(null);
export const useTheme = (): ThemeControl => {
  const control = useContext(ThemeControlContext);
  if (!control) throw new Error("useTheme 는 <PaperProvider> 안에서만 쓸 수 있습니다.");
  return control;
};
