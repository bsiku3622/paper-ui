// PageHeader — location · copy · actions의 페이지 anatomy를 그대로 드러낸다.

import type { ReactNode } from "react";

import { Box, Inline, Stack, Text } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { pageHeaderActions, pageHeaderContent, pageHeaderLocation, pageHeaderRoot } from "./PageHeader.css";

export type PageHeaderProps = { children: ReactNode; className?: string };
const PageHeaderRoot = ({ children, className }: PageHeaderProps) => (
  <Box className={joinClass(pageHeaderRoot, className)}>{children}</Box>
);

export type PageHeaderPartProps = { children: ReactNode; className?: string };
export const PageHeaderLocation = ({ children, className }: PageHeaderPartProps) => (
  <Box className={joinClass(pageHeaderLocation, className)}>{children}</Box>
);
export const PageHeaderContent = ({ children, className }: PageHeaderPartProps) => (
  <Stack gap="sm" className={joinClass(pageHeaderContent, className)}>{children}</Stack>
);
export const PageHeaderTitle = ({ children, className }: PageHeaderPartProps) => (
  <Text variant="display" className={className}>{children}</Text>
);
export const PageHeaderDescription = ({ children, className }: PageHeaderPartProps) => (
  <Text variant="body" ink="soft" className={className}>{children}</Text>
);
export const PageHeaderActions = ({ children, className }: PageHeaderPartProps) => (
  <Inline className={joinClass(pageHeaderActions, className)}>{children}</Inline>
);

export const PageHeader = Object.assign(PageHeaderRoot, {
  Location: PageHeaderLocation,
  Content: PageHeaderContent,
  Title: PageHeaderTitle,
  Description: PageHeaderDescription,
  Actions: PageHeaderActions,
});
