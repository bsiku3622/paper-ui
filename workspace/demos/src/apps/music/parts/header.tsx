// 앨범 · 플레이리스트 · 아티스트 화면의 머리: 큰 표지 하나, 오른쪽에 제목과 설명, 그 아래에 버튼. Anchor가 이 머리를 감쌉니다.

import type { ReactNode } from "react";

import { Box, Button, Grid, Stack } from "@studio-baeks/paper-ui";

import { Anchor, Glyph, PageHeader } from "../../../kit";
import { usePlayer } from "../state/player";

type Props = {
  art: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
};

export const EntityHeader = ({ art, eyebrow, title, description, meta, actions }: Props) => (
  <Anchor>
    <Grid columns={{ base: "minmax(0, 1fr)", md: "auto minmax(0, 1fr)" }} gap="xl" align="end">
      <Box width="lg" maxWidth="full">{art}</Box>
      <Stack gap="lg" minWidth={0}>
        <PageHeader eyebrow={eyebrow} title={title} description={description} meta={meta} />
        {actions}
      </Stack>
    </Grid>
  </Anchor>
);

// 재생 · 셔플. 목록이 비어 있으면 눌러지지 않습니다.
export const PlayButtons = ({ ids }: { ids: readonly string[] }) => {
  const player = usePlayer();
  return (
    <>
      <Button disabled={ids.length === 0} onClick={() => player.play(ids, 0, { shuffle: false })}><Glyph name="play" />재생</Button>
      <Button variant="soft" disabled={ids.length === 0} onClick={() => player.play(ids, 0, { shuffle: true })}><Glyph name="shuffle" />셔플</Button>
    </>
  );
};
