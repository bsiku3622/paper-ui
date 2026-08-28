// ThemeScope — subtree 하나에 테마를 건다. 다크모드와 같은 엔진(색 var 세트 교체)을
// 부분 화면에 적용하는 자리.
//
// theme="inverse" 는 주변(ambient)의 반대다 — 라이트 화면 위 어두운 판, 다크 화면 위
// 밝은 판. 그래서 문맥에 의존하고, ResolvedTheme context 를 읽어 반대를 계산한다.
// display:contents 라 레이아웃엔 영향이 없다. data-theme 로 색 var 를 갈아끼우고,
// 하위 inverse 가 이 스코프를 기준 삼도록 context 도 함께 덮어쓴다.

import type { ReactNode } from "react";

import { ResolvedThemeContext, useResolvedTheme, type ResolvedTheme } from "./theme-context";
import { themeScope } from "./ThemeScope.css";

export type ThemeScopeProps = {
  theme: "light" | "dark" | "inverse";
  children?: ReactNode;
  className?: string;
};

export const ThemeScope = ({ theme, children, className }: ThemeScopeProps) => {
  const ambient = useResolvedTheme();
  const resolved: ResolvedTheme =
    theme === "inverse" ? (ambient === "dark" ? "light" : "dark") : theme;
  return (
    <div className={className ? `${themeScope} ${className}` : themeScope} data-theme={resolved}>
      <ResolvedThemeContext.Provider value={resolved}>{children}</ResolvedThemeContext.Provider>
    </div>
  );
};
