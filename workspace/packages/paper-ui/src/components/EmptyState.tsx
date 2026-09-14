// EmptyState — 빈 결과를 막다른 곳으로 두지 않는다.
//
// "없음"을 보여주는 데서 멈추지 않고, 왜 비었는지와 다음 행동을 짧게 알려준다. 별도
// 색면·아이콘 장식은 두지 않아 Table·Card 어느 맥락에서도 지면을 덮지 않는다.

import type { ReactNode } from "react";

import { Box, Stack, Text } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { emptyStateContent, emptyStateRoot } from "./EmptyState.css";

export type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ title, description, action, className }: EmptyStateProps) => (
  <Box className={joinClass(emptyStateRoot, className)}>
    <Stack gap="sm" align="center" className={emptyStateContent}>
      <Text variant="subheading">{title}</Text>
      {description ? <Text variant="caption">{description}</Text> : null}
      {action ? <Box paddingY="xs">{action}</Box> : null}
    </Stack>
  </Box>
);
