// EmptyState — 빈 상태의 설명과 다음 행동을 조립하는 compound API.

import type { ReactNode } from "react";

import { Box, Stack, Text } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { emptyStateContent, emptyStateRoot } from "./EmptyState.css";

export type EmptyStateProps = { children: ReactNode; className?: string };
const EmptyStateRoot = ({ children, className }: EmptyStateProps) => (
  <Box className={joinClass(emptyStateRoot, className)}>
    <Stack gap="sm" align="center" className={emptyStateContent}>{children}</Stack>
  </Box>
);

export type EmptyStatePartProps = { children: ReactNode };
export const EmptyStateTitle = ({ children }: EmptyStatePartProps) => <Text variant="subheading">{children}</Text>;
export const EmptyStateDescription = ({ children }: EmptyStatePartProps) => <Text variant="caption">{children}</Text>;
export const EmptyStateAction = ({ children }: EmptyStatePartProps) => <Box paddingY="xs">{children}</Box>;

export const EmptyState = Object.assign(EmptyStateRoot, {
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Action: EmptyStateAction,
});
