// Alert — 상태 한 줄을 옅은 색 면으로 알린다. status 시스템의 표시 자리.
// Molecule 이라 raw 태그 없이 Box(면) + Inline + Icon + Stack + Text 조합만.

import type { ReactNode } from "react";

import { Box, Inline, Stack, Text } from "../primitives";
import { Icon } from "../atoms";
import { joinClass } from "../internal/joinClass";
import { resolveColor, type Accent } from "../resolvers";
import { alertRoot, srOnly } from "./Alert.css";

export type AlertProps = {
  // 의미 색 — info·success·warning·error. 언제나 옅은 면(soft).
  color?: Accent;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

// 상태의 의미를 색뿐 아니라 텍스트로도 — 스크린리더가 색을 못 보므로 접두어로 심는다.
const STATUS_WORD: Record<Accent, string> = { info: "정보", success: "성공", warning: "경고", error: "오류" };

// 색 영역이라 잉크색 클래스(pui-c-{color}-soft)를 면(Box)에 얹는다 — Box 자체는 색을
// 갖지 않으므로 className 으로 매트릭스 셀을 붙인다(Badge 와 같은 방식).
// role: 긴급(error·warning)은 alert(assertive), 정보성(info·success)은 status(polite).
export const Alert = ({ color = "info", title, children, className }: AlertProps) => (
  <Box
    radius="md"
    padding="md"
    role={color === "error" || color === "warning" ? "alert" : "status"}
    className={joinClass(resolveColor(color, "soft"), alertRoot, className)}
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
          <Text variant="label" ink="base" as="span">
            {title}
          </Text>
        ) : null}
        {children ? (
          <Text variant="caption" as="span">
            {children}
          </Text>
        ) : null}
      </Stack>
    </Inline>
  </Box>
);
