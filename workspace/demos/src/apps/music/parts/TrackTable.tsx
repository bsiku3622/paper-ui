// TrackTable — 곡의 표. 플레이리스트 · 앨범 · 보관함의 노래 · 검색 결과 · 아티스트의 인기 곡 · 차트가 모두 이것입니다.
//
//   cover   작은 표지 + 제목과 한 줄, 아티스트 열, 시간 (플레이리스트 화면의 모습)
//   number  곡 번호 + 제목, 시간 (앨범 화면의 모습)
//
// 줄은 grid의 행이라 열이 줄마다 같은 자리에 섭니다. 표지(또는 번호)를 누르면 그 곡부터 재생하고, 줄을 두 번 눌러도 됩니다.
// 지금 곡은 조용한 선택 면과 굵은 제목으로만 표시합니다.

import type { MouseEvent, ReactNode } from "react";

import { Box, Divider, Grid, IconButton, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, SurfaceLink, formatDuration, formatNumber } from "../../../kit";
import { useAtLeast } from "../content/useAtLeast";
import { ALBUM_BY_ID, ARTIST_BY_ID, type Track } from "../data/catalog";
import type { Playlist } from "../data/collections";
import { withJosa } from "../data/josa";
import { useLibrary } from "../state/library";
import { usePlayer } from "../state/player";
import { TrackThumb } from "./pictures";
import { TrackMenu } from "./TrackMenu";

export type SortKey = "title" | "artist" | "album" | "duration" | "plays";
export type Sort = { key: SortKey; dir: "asc" | "desc" };
type Extra = "artist" | "album" | "plays";

type Props = {
  label: string;
  tracks: readonly Track[];
  // 재생할 때 대기열이 될 목록. 기본은 tracks 그대로입니다.
  context?: readonly string[];
  layout?: "cover" | "number";
  // 제목 옆의 열. 기본은 아티스트입니다.
  columns?: readonly Extra[];
  // 제목 아래에 아티스트 이름을 보입니다. 한 아티스트의 곡만 모인 표(앨범, 아티스트 화면)에서는 끕니다.
  artistLine?: boolean;
  // 맨 앞의 좁은 열에 넣을 것(차트의 순위). 번호 모양에서는 곡 번호가 들어갑니다.
  lead?: (track: Track, index: number) => ReactNode;
  playlist?: Playlist;
  sort?: Sort;
  onSort?: (key: SortKey) => void;
  empty?: ReactNode;
};

const EXTRA_LABEL: Record<Extra, string> = { artist: "아티스트", album: "앨범", plays: "재생 수" };

// 열의 폭. 줄마다 같은 트랙을 써서 열이 맞습니다. 좁은 화면에서는 맨 앞 열, 제목, 시간만 남습니다.
const template = (lead: boolean, layout: "cover" | "number", extra: readonly Extra[]) => ({
  base: `${lead ? "2.5rem " : ""}minmax(0, 1fr) 6.5rem`,
  md: [lead ? "2.5rem" : null, layout === "number" ? "minmax(0, 1fr)" : "minmax(0, 5fr)", ...extra.map((item) => (item === "plays" ? "6rem" : "minmax(0, 3fr)")), "9rem"].filter(Boolean).join(" "),
});

const Cell = ({ children, wide = false }: { children: ReactNode; wide?: boolean }) => (
  <Box role="cell" minWidth={0} hideBelow={wide ? "md" : undefined}>{children}</Box>
);

type HeadProps = { label: string; sortKey?: SortKey; sort?: Sort; onSort?: (key: SortKey) => void; rule?: boolean; end?: boolean };

// 머리 칸의 글자는 칸이 시작하는 자리에 서서 줄의 글자와 맞고, 칸 사이의 세로선은 칸의 오른쪽 끝(열 사이의 간격 안)에 놓입니다.
const Head = ({ label, sortKey, sort, onSort, rule = false, end = false }: HeadProps) => {
  const active = sortKey !== undefined && sort?.key === sortKey;
  const text = <Text as="span" variant="label" strong={active} ink={active ? "primary" : "tertiary"}>{label}</Text>;
  return (
    <Inline gap="md" align="stretch" minWidth={0} justify={rule ? "between" : end ? "end" : "start"}>
      {sortKey && onSort ? (
        <Pressable onPress={() => onSort(sortKey)} aria-label={`${withJosa(label, "으로/로")} 정렬`}>
          <Inline gap="xs">{text}{active ? <Glyph name={sort!.dir === "asc" ? "chevron-up" : "chevron-down"} size="label" ink="primary" /> : null}</Inline>
        </Pressable>
      ) : text}
      {rule ? <Divider orientation="vertical" aria-hidden /> : null}
    </Inline>
  );
};

export const TrackTable = ({ label, tracks, context, layout = "cover", columns = ["artist"], artistLine = layout === "cover", lead, playlist, sort, onSort, empty }: Props) => {
  const player = usePlayer();
  const library = useLibrary();
  const wide = useAtLeast("md");
  const ids = context ?? tracks.map((track) => track.id);
  const hasLead = layout === "number" || lead !== undefined;
  const grid = template(hasLead, layout, columns);
  const ariaSort = (key?: SortKey) => (key && sort?.key === key ? (sort.dir === "asc" ? ("ascending" as const) : ("descending" as const)) : undefined);

  if (tracks.length === 0) return <>{empty ?? <Empty glyph="music" title="곡이 없습니다" />}</>;

  return (
    <Box role="table" aria-label={label}>
      <Box role="rowgroup">
        <Grid role="row" columns={grid} gap="md" paddingX="md" paddingY="sm">
          {hasLead ? <Box role="columnheader"><Text as="span" variant="label" strong={false} ink="tertiary">#</Text></Box> : null}
          <Box role="columnheader" minWidth={0} aria-sort={ariaSort("title")}><Head label={layout === "number" ? "곡" : "노래"} sortKey="title" sort={sort} onSort={onSort} rule={wide} /></Box>
          {columns.map((item) => (
            <Box role="columnheader" key={item} minWidth={0} hideBelow="md" aria-sort={ariaSort(item)}><Head label={EXTRA_LABEL[item]} sortKey={item} sort={sort} onSort={onSort} rule /></Box>
          ))}
          <Box role="columnheader" aria-sort={ariaSort("duration")}><Head label="시간" sortKey="duration" sort={sort} onSort={onSort} end /></Box>
        </Grid>
        <Divider aria-hidden />
      </Box>
      <Box role="rowgroup">
        {tracks.map((track, index) => {
          const isCurrent = player.current?.id === track.id;
          const album = ALBUM_BY_ID.get(track.albumId)!;
          const artist = ARTIST_BY_ID.get(track.artistId)!;
          const play = () => player.playTrack(track.id, ids);
          // 제목 아래의 한 줄: 아티스트 열이 없으면 아티스트, 있으면 앨범. 그 열이 따로 있으면 비웁니다.
          const hasArtistColumn = columns.includes("artist");
          const hasAlbumColumn = columns.includes("album");
          const sub = wide
            ? artistLine && !hasArtistColumn ? artist.name : hasAlbumColumn ? "" : hasArtistColumn ? album.title : ""
            : artistLine ? artist.name : album.title;
          const marker = isCurrent ? <Glyph name={player.playing ? "audio-lines" : "pause"} size="label" ink="secondary" label={player.playing ? "재생 중" : "일시정지"} /> : null;
          return (
            <Box key={`${track.id}-${index}`}>
              {index > 0 ? <Divider aria-hidden /> : null}
              <Surface as={Grid} role="row" hoverable selected={isCurrent} radius="md" columns={grid} gap="md" align="center" paddingX="md" paddingY="sm" onDoubleClick={(event: MouseEvent) => { if (!(event.target as HTMLElement).closest("button, a")) play(); }}>
                {layout === "number" ? (
                  <Cell>
                    <Pressable onPress={play} aria-label={`${track.title} 재생`}>
                      <Inline justify="start">{lead ? lead(track, index) : marker ?? <Text as="span" ink="tertiary" numeric>{track.n}</Text>}</Inline>
                    </Pressable>
                  </Cell>
                ) : lead ? <Cell>{lead(track, index)}</Cell> : null}
                <Cell>
                  {layout === "cover" ? (
                    <Inline gap="md" minWidth={0}>
                      <Pressable onPress={play} aria-label={`${track.title} 재생`}><Inline><TrackThumb track={track} /></Inline></Pressable>
                      <Stack minWidth={0}>
                        <Inline gap="xs" minWidth={0}>{marker}<Text as="span" strong={isCurrent} truncate>{track.title}</Text></Inline>
                        {sub ? <Text as="span" variant="caption" ink="tertiary" truncate>{sub}</Text> : null}
                      </Stack>
                    </Inline>
                  ) : (
                    <Stack minWidth={0}>
                      <Text as="span" strong={isCurrent} truncate>{track.title}</Text>
                      {artistLine ? <Text as="span" variant="caption" ink="tertiary" truncate>{artist.name}</Text> : null}
                    </Stack>
                  )}
                </Cell>
                {columns.map((item) => (
                  <Cell key={item} wide>
                    {item === "artist" ? (
                      <Stack><SurfaceLink to={`/music/artist/${artist.id}`} radius="sm" aria-label={`${artist.name} 아티스트`}><Text as="span" ink="secondary" truncate>{artist.name}</Text></SurfaceLink></Stack>
                    ) : item === "album" ? (
                      <Stack><SurfaceLink to={`/music/album/${album.id}`} radius="sm" aria-label={`${album.title} 앨범`}><Text as="span" ink="secondary" truncate>{album.title}</Text></SurfaceLink></Stack>
                    ) : (
                      <Text as="span" ink="secondary" numeric truncate>{formatNumber(track.plays)}</Text>
                    )}
                  </Cell>
                ))}
                <Cell>
                  <Inline gap="xs" justify="end">
                    {library.isLiked(track.id) ? (
                      <Box hideBelow="md"><IconButton size="xs" variant="ghost" aria-label={`${track.title} 좋아요 취소`} onClick={() => library.toggleLike(track.id)}><Glyph name="heart" /></IconButton></Box>
                    ) : null}
                    <Text as="span" ink="secondary" numeric>{formatDuration(track.duration)}</Text>
                    <TrackMenu track={track} context={ids} playlist={playlist} />
                  </Inline>
                </Cell>
              </Surface>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
