// PaperProvider — 스타일을 보장하고 앱을 감싼다.
//
// 고를 것이 없다. 이 시스템엔 primaryColor 가 없다 — 색이 3 개뿐이고 셋 다
// 의미를 갖는다(info·success·error). 브랜드가 고를 색이 없다는 게 이 시스템의
// 주장이다: 정체성은 색이 아니라 순백·검정·여백에서 나온다.
//
// DOM wrapper 를 만들지 않는다 — layout 에 영향 0.

import type { ReactNode } from "react";

import "../styles/theme.css";
import "../styles/utility.css";

export type PaperProviderProps = {
  children?: ReactNode;
};

export const PaperProvider = ({ children }: PaperProviderProps) => <>{children}</>;
