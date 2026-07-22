// Alert — 상태 한 줄을 옅은 색 면으로 알린다. status 시스템의 표시 자리.
// Molecule 이라 raw 태그 없이 Box(면) + Inline + Icon + Stack + Text 조합만.

import type { ReactNode } from "react";

import { Box, Inline, Stack, Text } from "../primitives";
import { Icon } from "../atoms";
import { joinClass } from "../internal/joinClass";
import type { StatusName } from "../tokens";
import { alertRoot } from "./Alert.css";

export type AlertProps = {
  status?: StatusName;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export const Alert = ({ status = "info", title, children, className }: AlertProps) => (
  <Box status={status} tone="wash" radius="md" padding="md" role="alert" className={joinClass(alertRoot, className)}>
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
