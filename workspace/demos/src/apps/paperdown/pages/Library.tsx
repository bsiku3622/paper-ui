import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Box, Button, Field, Grid, IconButton, Inline, Link, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Avatar, Empty, Glyph } from "../../../kit";
import { Serif } from "../content/Serif";
import { useTitle } from "../lib/hooks";
import { documentPath, useStore } from "../lib/store";
import type { DocumentData } from "../lib/types";
import { Confirm } from "../parts/Confirm";
import { DocumentCard } from "../parts/DocumentCard";
import { HomeFrame } from "../parts/Shell";

type Order = "recent" | "title";

export const Library = () => {
  const { user, notes, signOut, createNote, removeNote } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<Order>("recent");
  const [removing, setRemoving] = useState<DocumentData | null>(null);
  useTitle("Paperdown — 내 문서");

  const needle = search.trim().toLocaleLowerCase();
  const shown = notes
    .filter((note) => note.title.toLocaleLowerCase().includes(needle))
    .sort((a, b) => (order === "title" ? a.title.localeCompare(b.title, "ko") : b.updatedAt - a.updatedAt));
  const create = () => navigate(documentPath(createNote().id));

  return (
    <HomeFrame
      end={
        <Inline gap="sm" align="center">
          <Avatar name={user?.username ?? "?"} tone="primary" square />
          <Text as="span">{user?.username}</Text>
          <IconButton variant="ghost" size="sm" aria-label="로그아웃" onClick={signOut}>
            <Glyph name="log-out" />
          </IconButton>
        </Inline>
      }
    >
      <Stack gap="3xl">
        <Inline justify="between" align="center" gap="xl" wrap>
          <Stack gap="xs" minWidth={0}>
            <Serif as="h1" variant="display" strong>생각을 담아두는 곳.</Serif>
            <Text as="p" ink="secondary">한 장의 메모부터 긴 문서까지, 쓰던 자리에서 이어가세요.</Text>
          </Stack>
          <Button onClick={create}>
            <Glyph name="plus" />
            새 문서
          </Button>
        </Inline>
        <Stack gap="xl">
          <Inline justify="between" align="center" gap="lg" wrap>
            <Inline gap="md" align="baseline">
              <Text as="h2" variant="subheading">내 문서</Text>
              <Text as="span" ink="tertiary" numeric>{notes.length}</Text>
            </Inline>
            <Inline gap="sm" align="center">
              <Box width="lg">
                <Field aria-label="문서 검색" placeholder="문서 찾기" leading={<Glyph name="search" />} value={search} onChange={(event) => setSearch(event.target.value)} />
              </Box>
              <Select aria-label="문서 정렬" value={order} onChange={(event) => setOrder(event.target.value as Order)}>
                <Select.Option value="recent">최근 수정순</Select.Option>
                <Select.Option value="title">이름순</Select.Option>
              </Select>
            </Inline>
          </Inline>
          {shown.length > 0 ? (
            <Grid columns={{ base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }} gap="xl">
              {shown.map((note) => <DocumentCard key={note.id} note={note} onRemove={() => setRemoving(note)} />)}
            </Grid>
          ) : (
            <Surface border radius="md" padding="2xl">
              <Empty
                glyph="file-text"
                title={search ? "찾는 문서가 없습니다" : "첫 문서를 만들어보세요"}
                description={search ? "다른 이름으로 검색해보세요." : "문서 이름과 내용은 쓰는 동안 자동으로 저장됩니다."}
                action={search ? null : <Button variant="hairline" onClick={create}><Glyph name="plus" />새 문서 만들기</Button>}
              />
            </Surface>
          )}
        </Stack>
        <Inline>
          <Link as={RouterLink} to={documentPath("local")} underline="hover">이 기기에 저장된 문서 열기</Link>
        </Inline>
      </Stack>
      <Confirm
        title={removing ? `“${removing.title || "제목 없는 노트"}”를 삭제할까요?` : null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) removeNote(removing.id);
          setRemoving(null);
        }}
      />
    </HomeFrame>
  );
};
