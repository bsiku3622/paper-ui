// The rail of a signed-in account's notes (Account.tsx's `notes-sidebar`), opened from the header's "내 노트": the name of the app,
// who is signed in, a button for a new note, a search, the notes, and a line about where they are kept. On a wide window it
// stands beside the editor; on a phone it lies over it.

import { useState } from "react";

import { Box, Button, Divider, Field, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Avatar, Glyph, formatDate } from "../../../kit";
import { Wordmark } from "../content/Serif";
import { useStore } from "../lib/store";
import type { DocumentData } from "../lib/types";

export const NotesSidebar = ({ activeId, overlay, onOpen, onCreate, onRemove, onClose }: {
  activeId: string;
  overlay: boolean;
  onOpen: (note: DocumentData) => void;
  onCreate: () => void;
  onRemove: (note: DocumentData) => void;
  onClose: () => void;
}) => {
  const { user, notes, signOut } = useStore();
  const [search, setSearch] = useState("");
  const shown = notes.filter((note) => note.title.toLowerCase().includes(search.toLowerCase()));
  const edge = overlay ? { shadow: true as const, width: "lg" as const } : { elevation: "sticky" as const, top: "none" as const };
  return (
    <Surface as="aside" aria-label="내 노트" fill="raised" border="end" height="viewport" {...edge}>
      <Grid rows="auto auto auto auto auto minmax(0, 1fr) auto" gap="lg" height="full" padding="lg">
        <Inline justify="between" align="center" paddingX="sm">
          <Wordmark />
          <IconButton variant="ghost" size="sm" aria-label="노트 목록 닫기" onClick={onClose}>
            <Glyph name="x" />
          </IconButton>
        </Inline>
        <Inline align="center" gap="sm" paddingX="sm">
          <Avatar name={user?.username ?? "?"} tone="primary" square />
          <Stack minWidth={0}>
            <Text as="strong" variant="label" truncate>{user?.username}</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary" truncate>나만의 글을 모아두는 곳</Text>
          </Stack>
          <IconButton variant="ghost" size="xs" aria-label="로그아웃" onClick={signOut}>
            <Glyph name="log-out" />
          </IconButton>
        </Inline>
        <Button variant="hairline" size="sm" fullWidth onClick={onCreate}>
          <Glyph name="file-plus-2" />
          새 노트
        </Button>
        <Field size="sm" aria-label="노트 검색" placeholder="노트 찾기" leading={<Glyph name="search" />} value={search} onChange={(event) => setSearch(event.target.value)} />
        <Inline justify="between" paddingX="sm">
          <Text as="span" variant="label" strong={false} ink="secondary">내 노트</Text>
          <Text as="span" variant="label" strong={false} ink="secondary" numeric>{notes.length}</Text>
        </Inline>
        <Box overflowY="auto">
          <Stack gap="xs" as="ul">
            {shown.map((note) => (
              <Inline as="li" key={note.id} align="center" gap="xs">
                <Box minWidth={0} width="full">
                  <Button variant="ghost" size="md" fullWidth justify="start" selected={note.id === activeId} onClick={() => onOpen(note)}>
                    <Glyph name="file-text" ink="secondary" />
                    <Stack as="span" align="start" minWidth={0}>
                      <Text as="span" variant="label" ink="inherit" truncate>{note.title || "제목 없는 노트"}</Text>
                      <Text as="span" variant="label" strong={false} ink="tertiary">{formatDate(new Date(note.updatedAt), false)}</Text>
                    </Stack>
                  </Button>
                </Box>
                <IconButton variant="ghost" size="xs" aria-label={`${note.title || "노트"} 삭제`} onClick={() => onRemove(note)}>
                  <Glyph name="trash-2" ink="tertiary" />
                </IconButton>
              </Inline>
            ))}
          </Stack>
        </Box>
        <Stack gap="md">
          <Divider />
          <Inline justify="center" align="center" gap="sm">
            <Glyph name="cloud" ink="secondary" />
            <Text as="span" variant="label" strong={false} ink="secondary">계정에 안전하게 보관</Text>
          </Inline>
        </Stack>
      </Grid>
    </Surface>
  );
};
