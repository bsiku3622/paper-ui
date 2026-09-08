// Alert — 상태 한 줄을 색이 깔린 면으로 알린다. status 시스템의 표시 자리.
// Molecule 이라 raw 태그 없이 Box(면) + Inline + Icon + Stack + Text 조합만.
//
// 색은 Button·Badge 와 **같은 매트릭스**(color × variant)를 그대로 문다. 면을 위한 별도
// 축을 새로 만들지 않았는데, 이 시스템의 variant 가 이미 *면의 무게* 축이기 때문이다 —
// solid(채운 면) · soft(옅은 면) · outline(테두리만) · quiet(면 없음)은 글자 스타일이
// 아니라 면의 종류다. Alert 만을 위한 surface 축을 세우면 같은 뜻을 두 이름으로 부르게 된다.
//
//   variant  soft(옅은 면, 기본) · solid(채운 면 — 가장 강한 공지) · outline(테두리) · quiet(면 없음)
//   color    primary(중립 안내) + info · success · warning · error
//
// ⚠ 안쪽 글자는 `ink="inherit"` 이다. Text 는 variant 마다 자기 잉크를 못 박는데
// (caption = ink.soft), 그건 흰 지면 위 규칙이라 색이 깔린 면 안에서는 면이 정해 둔
// 글자색을 덮어써 버린다. 실제로 예전 Alert 는 옅은 빨강 면 위에 **회색** 본문이 있었다.

import type { ReactNode } from "react";

import { Box, Inline, Stack, Text } from "../primitives";
import { Icon } from "../atoms";
import { joinClass } from "../internal/joinClass";
import { resolveColor, type Color, type Variant } from "../resolvers";
import { alertRoot, srOnly } from "./Alert.css";

export type AlertProps = {
  // 의미 색 — primary(중립) + info·success·warning·error.
  color?: Color;
  // 면의 무게 — 기본 soft(옅은 면). solid·outline·quiet 도 된다.
  variant?: Variant;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

// 상태의 의미를 색뿐 아니라 텍스트로도 — 스크린리더가 색을 못 보므로 접두어로 심는다.
const STATUS_WORD: Record<Color, string> = {
  primary: "안내",
  info: "정보",
  success: "성공",
  warning: "경고",
  error: "오류",
};

// 긴급(error·warning)은 alert(assertive), 나머지는 status(polite).
const ROLE = (color: Color) => (color === "error" || color === "warning" ? "alert" : "status");

export const Alert = ({ color = "info", variant = "soft", title, children, className }: AlertProps) => (
  <Box
    radius="md"
    padding="md"
    role={ROLE(color)}
    className={joinClass(resolveColor(color, variant), alertRoot, className)}
  >
    <Text as="span" variant="caption" className={srOnly}>
      {STATUS_WORD[color]}:{" "}
    </Text>
    <Inline gap="sm" align="start">
      <Icon aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M12 11v5" />
      </Icon>
      <Stack gap="xs" style={{ minWidth: 0 }}>
        {title ? (
          <Text variant="label" ink="inherit" as="span">
            {title}
          </Text>
        ) : null}
        {children ? (
          <Text variant="caption" ink="inherit" as="span">
            {children}
          </Text>
        ) : null}
      </Stack>
    </Inline>
  </Box>
);
