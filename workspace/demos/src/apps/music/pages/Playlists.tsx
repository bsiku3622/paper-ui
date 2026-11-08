// 모든 플레이리스트: 내가 만든 것, 에디터 추천, 믹스를 한곳에. 새 플레이리스트는 여기와 사이드바에서 만듭니다.

import { useState } from "react";

import { Button, Grid } from "@studio-baeks/paper-ui";

import { Glyph, PageHeader, Segmented } from "../../../kit";
import { EDITORIAL, MIXES } from "../data/collections";
import { PlaylistCard } from "../parts/cards";
import { useDialogs } from "../state/dialogs";
import { LIKED_ID, useLibrary } from "../state/library";

const GRID = "repeat(auto-fill, minmax(10rem, 1fr))";

export const PlaylistsPage = () => {
  const library = useLibrary();
  const dialogs = useDialogs();
  const [kind, setKind] = useState("all");
  const liked = library.playlistById(LIKED_ID)!;
  const mine = [liked, ...library.playlists];

  const list = kind === "mine" ? mine : kind === "editorial" ? EDITORIAL : kind === "mix" ? MIXES : [...mine, ...EDITORIAL, ...MIXES];

  return (
    <>
      <PageHeader
        title="플레이리스트"
        description={`내가 만든 플레이리스트 ${library.playlists.length}개`}
        actions={<Button onClick={() => dialogs.editPlaylist()}><Glyph name="plus" />새 플레이리스트</Button>}
      />
      <Segmented
        label="종류"
        value={kind}
        onChange={setKind}
        options={[{ id: "all", label: "전체" }, { id: "mine", label: "내가 만든 것", count: mine.length }, { id: "editorial", label: "에디터 추천", count: EDITORIAL.length }, { id: "mix", label: "믹스", count: MIXES.length }]}
      />
      <Grid columns={GRID} gap="md">
        {list.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} sub={`${playlist.trackIds.length}곡${playlist.kind === "user" ? "" : playlist.kind === "mix" ? " · 믹스" : " · 에디터 추천"}`} />)}
      </Grid>
    </>
  );
};
