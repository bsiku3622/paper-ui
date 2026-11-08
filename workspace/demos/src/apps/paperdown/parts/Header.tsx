import type { ReactNode } from "react";

import { Badge, Box, Button, Divider, Field, Grid, IconButton, Inline, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { useMedia } from "../lib/hooks";
import { useStore } from "../lib/store";
import { Brand } from "./Shell";

export type HeaderProps = {
  title: string;
  onTitle: (title: string) => void;
  saveLabel: string;
  busy: boolean;
  exportMenu: ReactNode;
  onNew: () => void;
  onOpen: () => void;
  onCopy: () => void;
};

export const Header = ({ title, onTitle, saveLabel, busy, exportMenu, onNew, onOpen, onCopy }: HeaderProps) => {
  const { user, auth, notesOpen, setNotesOpen, openAuth } = useStore();
  const phone = useMedia("(max-width: 767px)");
  return (
    <Surface as="header" fill="raised" border="bottom" paddingX={phone ? "md" : "xl"} paddingY="lg">
      <Grid columns={phone ? "auto minmax(0, 1fr) auto" : "auto auto minmax(0, 1fr) auto"} gap={phone ? "sm" : "lg"} align="stretch">
        <Inline align="center">
          <Brand />
        </Inline>
        {phone ? null : <Divider orientation="vertical" />}
        <Inline align="center" gap="md" minWidth={0}>
          <Box width="full" maxWidth="xl" minWidth={0}>
            <Field variant="ghost" size={phone ? "xs" : "sm"} aria-label="문서 이름" placeholder="새로운 문서" value={title} onChange={(event) => onTitle(event.target.value)} />
          </Box>
          <Box hideBelow="lg">
            <Inline gap="xs" align="center" aria-live="polite">
              <Badge dot size="xs" variant="ghost" accent="primary" aria-label="" />
              <Text as="span" variant="label" strong={false} ink="tertiary">{saveLabel}</Text>
            </Inline>
          </Box>
        </Inline>
        <Inline align="center" gap={phone ? "xs" : "sm"}>
          <Button variant="hairline" size="sm" aria-label={user ? "내 노트" : "로그인"} aria-expanded={user ? notesOpen : auth.open} onClick={() => (user ? setNotesOpen(!notesOpen) : openAuth())}>
            <Glyph name="panel-left" />
            <Box as="span" hideBelow="md">{user ? "내 노트" : "로그인"}</Box>
          </Button>
          <Box hideBelow="md">
            <IconButton variant="ghost" size="sm" aria-label="새 문서" title="새 문서" onClick={onNew}>
              <Glyph name="file-plus-2" ink="secondary" />
            </IconButton>
          </Box>
          <IconButton variant="ghost" size="sm" aria-label="문서 열기" title="문서 열기" onClick={onOpen}>
            <Glyph name="folder-open" ink="secondary" />
          </IconButton>
          <Inline align="stretch" gap="sm">
            <Box hideBelow="md"><Divider orientation="vertical" /></Box>
            <Box hideBelow="md">
              <Button variant="hairline" size="sm" disabled={busy} onClick={onCopy}>
                <Glyph name="copy" />
                이미지 복사
              </Button>
            </Box>
          </Inline>
          {exportMenu}
        </Inline>
      </Grid>
    </Surface>
  );
};
