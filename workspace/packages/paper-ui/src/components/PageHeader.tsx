// PageHeader — 페이지가 무엇인지와 지금 할 행동을 한 줄에 놓는다.
//
// 제품마다 다른 hero나 card를 강요하지 않는다. 제목·설명·actions만 정렬해, 데이터 화면의
// 첫 줄을 매번 손으로 맞추지 않게 한다.

import type { ReactNode } from "react";

import { Box, Inline, Stack, Text } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { pageHeaderActions, pageHeaderCopy, pageHeaderRoot, pageHeaderRow } from "./PageHeader.css";

export type PageHeaderProps = {
  title: ReactNode;
  location?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, location, description, actions, className }: PageHeaderProps) => (
  <Box className={joinClass(pageHeaderRoot, className)}>
    {location}
    <Box className={pageHeaderRow}>
      <Stack gap="sm" className={pageHeaderCopy}>
        <Text variant="display">{title}</Text>
        {description ? <Text variant="body" ink="soft">{description}</Text> : null}
      </Stack>
      {actions ? <Inline className={pageHeaderActions}>{actions}</Inline> : null}
    </Box>
  </Box>
);
