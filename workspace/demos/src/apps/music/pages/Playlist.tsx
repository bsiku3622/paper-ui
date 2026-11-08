import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Box, Button, Field, IconButton, Inline, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Menu, TopBar, relative, useToast } from "../../../kit";
import { TRACK_BY_ID, formatTrackCount, spoken, totalDuration, type Track } from "../data/catalog";
import { josa } from "../data/josa";
import { score } from "../data/search";
import { EntityHeader, PlayButtons } from "../parts/header";
import { NotFound } from "../parts/NotFound";
import { PlaylistArt } from "../parts/pictures";
import { TrackTable, type Sort, type SortKey } from "../parts/TrackTable";
import { artistOfTrack, albumTitleOf, sortTracks } from "../parts/sorting";
import { useDialogs } from "../state/dialogs";
import { LIKED_ID, useLibrary } from "../state/library";
import { usePlayer } from "../state/player";

const KIND_LABEL = { user: "플레이리스트", editorial: "에디터 추천", mix: "믹스" } as const;

export const PlaylistPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const library = useLibrary();
  const dialogs = useDialogs();
  const player = usePlayer();
  const playlist = library.playlistById(id);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<Sort | undefined>(undefined);

  const all = useMemo(() => (playlist ? playlist.trackIds.map((value) => TRACK_BY_ID.get(value)).filter((track): track is Track => track !== undefined) : []), [playlist]);
  const shown = useMemo(() => {
    const filtered = filter.trim() ? all.filter((track) => Math.max(score(track.title, filter), score(artistOfTrack(track), filter), score(albumTitleOf(track), filter)) > 0) : all;
    return sort ? sortTracks(filtered, sort) : filtered;
  }, [all, filter, sort]);

  if (!playlist) return <NotFound what="플레이리스트" />;

  const editable = playlist.kind === "user" && playlist.id !== LIKED_ID;
  const ids = shown.map((track) => track.id);

  const onSort = (key: SortKey) =>
    setSort((now) => (now?.key !== key ? { key, dir: "asc" } : now.dir === "asc" ? { key, dir: "desc" } : undefined));

  const copy = () => {
    const created = library.createPlaylist({ name: playlist.name, description: playlist.description, trackIds: playlist.trackIds });
    toast(`'${playlist.name}'${josa(playlist.name, "을/를")} 내 플레이리스트에 복사했습니다`);
    navigate(`/music/playlist/${created}`);
  };

  return (
    <>
      <TopBar
        end={
          <>
            <Box width="lg" maxWidth="full">
              <Field size="sm" shape="pill" fill="sunken" aria-label="플레이리스트에서 찾기" placeholder="플레이리스트에서 찾기" value={filter} onChange={(event) => setFilter(event.target.value)} leading={<Glyph name="search" />} clearable />
            </Box>
            <Menu
              label="정렬"
              glyph="arrow-up-down"
              items={[
                { id: "heading", heading: "정렬" },
                { id: "own", label: "플레이리스트 순서", checked: !sort, onSelect: () => setSort(undefined) },
                { id: "title", label: "제목", checked: sort?.key === "title", onSelect: () => setSort({ key: "title", dir: "asc" }) },
                { id: "artist", label: "아티스트", checked: sort?.key === "artist", onSelect: () => setSort({ key: "artist", dir: "asc" }) },
                { id: "album", label: "앨범", checked: sort?.key === "album", onSelect: () => setSort({ key: "album", dir: "asc" }) },
                { id: "duration", label: "시간", checked: sort?.key === "duration", onSelect: () => setSort({ key: "duration", dir: "asc" }) },
              ]}
            />
            <Menu
              label="더 보기"
              items={[
                { id: "next", label: "다음에 재생", glyph: "list-start", onSelect: () => player.playNext(ids) },
                { id: "later", label: "나중에 재생", glyph: "list-end", onSelect: () => player.playLater(ids) },
                { id: "d", divider: true },
                ...(editable ? [{ id: "edit", label: "편집", glyph: "pencil" as const, onSelect: () => dialogs.editPlaylist(playlist.id) }] : [{ id: "copy", label: "내 플레이리스트로 복사", glyph: "copy" as const, onSelect: copy }]),
                { id: "new", label: "새 플레이리스트", glyph: "plus", onSelect: () => dialogs.editPlaylist() },
              ]}
            />
            {editable ? <Box hideBelow="md"><IconButton variant="muted" shape="pill" aria-label="편집" onClick={() => dialogs.editPlaylist(playlist.id)}><Glyph name="pencil" /></IconButton></Box> : null}
          </>
        }
      />
      <EntityHeader
        art={<PlaylistArt playlist={playlist} label={`${playlist.name} 표지`} />}
        eyebrow={playlist.id === LIKED_ID ? "자동 플레이리스트" : KIND_LABEL[playlist.kind]}
        title={playlist.name}
        description={playlist.description || undefined}
        meta={
          <Text as="span" ink="tertiary">
            {formatTrackCount(all.length)}{all.length > 0 ? `, ${spoken(totalDuration(all))}` : ""}{playlist.id === LIKED_ID ? "" : ` · ${relative(new Date(playlist.updatedAt))} 업데이트`}
          </Text>
        }
        actions={
          <Inline gap="sm" wrap>
            <PlayButtons ids={ids} />
            {editable ? <Button variant="hairline" onClick={() => dialogs.editPlaylist(playlist.id)}><Glyph name="pencil" />편집</Button> : playlist.id !== LIKED_ID ? <Button variant="hairline" onClick={copy}><Glyph name="copy" />내 것으로 복사</Button> : null}
          </Inline>
        }
      />
      <TrackTable
        label={`${playlist.name}의 곡`}
        tracks={shown}
        context={ids}
        playlist={playlist}
        sort={sort}
        onSort={onSort}
        empty={
          all.length === 0 ? (
            <Empty
              glyph="list-music"
              title="아직 곡이 없습니다"
              description={playlist.id === LIKED_ID ? "곡의 하트를 누르면 여기에 모입니다." : "곡을 담아 시작해 보세요."}
              action={editable ? <Button size="sm" variant="hairline" onClick={() => dialogs.editPlaylist(playlist.id)}>곡 추가</Button> : undefined}
            />
          ) : (
            <Empty glyph="search-x" title="찾는 곡이 없습니다" description={`'${filter}'${josa(filter, "과/와")} 맞는 곡이 이 플레이리스트에 없습니다.`} action={<Button size="sm" variant="hairline" onClick={() => setFilter("")}>찾기 지우기</Button>} />
          )
        }
      />
    </>
  );
};
