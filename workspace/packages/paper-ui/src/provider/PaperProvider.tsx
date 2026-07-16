// PaperProvider — 앱 단위 설정.
//
// 여기서 고를 수 있는 건 종이 결(grain) 하나뿐이다.
//
// 왜 이것뿐인가 — 이 시스템엔 primaryColor 가 없다. 색이 3 개뿐이고 그 셋은
// 전부 *의미* 를 갖는다 (error·success·danger). 브랜드가 고를 색이 없다는 게
// paper-ui 의 주장이다: 정체성은 색이 아니라 종이와 괘선에서 나온다.
//
// DOM wrapper 를 만들지 않는다 — layout 에 영향 0.

import { useEffect, type ReactNode } from "react";

import "../styles/theme.css";
import "../styles/utility.css";

export type PaperProviderProps = {
  // 종이 결 noise. 기본 켜짐 — 이게 있어야 #fbf9f5 가 종이로 읽힌다.
  grain?: boolean;
  children?: ReactNode;
};

export const PaperProvider = ({ grain = true, children }: PaperProviderProps) => {
  useEffect(() => {
    document.body.classList.toggle("paper-grain", grain);
    return () => document.body.classList.remove("paper-grain");
  }, [grain]);

  return <>{children}</>;
};
