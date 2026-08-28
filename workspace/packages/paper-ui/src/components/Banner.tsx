// Banner — 얇은 풀폭 상단 바. 좌측 콘텐츠 + 우측 액션.
//
// 데모 chrome·공지·컨텍스트 바처럼 "화면 맨 위에서 브랜드/상태를 알리고 escape 를
// 주는" 자리. 기본은 검정 면(solid) — 화면을 채우는 색은 검정(primary)뿐이라는 정체성
// 그대로. status 색(info·success·warning·error)은 그 색의 *의미를 짊어질 때*(성공/
// 경고 공지)만. Component 레이어라 raw 태그 없이 Inline 조합만 쓴다.

import type { ReactNode } from "react";

import { Inline, Box } from "../primitives";
import { joinClass } from "../internal/joinClass";
import type { StatusName } from "../tokens";
import { bannerRoot, bannerTone } from "./Banner.css";

export type BannerProps = {
  // solid(검정, 기본) · info · success · warning · error.
  tone?: "solid" | StatusName;
  // 우측에 붙는 액션(링크·버튼 등). 없으면 콘텐츠만.
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export const Banner = ({ tone = "solid", action, children, className }: BannerProps) => {
  // status tone 이 동적으로 뜨면 스크린리더가 알리도록 live 역할을 준다 — 긴급(error·
  // warning)은 assertive(alert), 정보성(info·success)은 polite(status). solid(chrome)엔 안 준다.
  const live =
    tone === "error" || tone === "warning" ? "alert" : tone === "info" || tone === "success" ? "status" : undefined;
  return (
    <Inline
      as="header"
      role={live}
      justify="between"
      align="center"
      gap="md"
      className={joinClass(bannerRoot, bannerTone[tone], className)}
    >
      <Inline gap="sm" align="center" style={{ minWidth: 0 }}>
        {children}
      </Inline>
      {action ? <Box style={{ flexShrink: 0 }}>{action}</Box> : null}
    </Inline>
  );
};
