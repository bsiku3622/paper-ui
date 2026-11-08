// 둘러보기: 신곡(이번 주 신보와 최근 발매), 차트(곡과 앨범의 순위), 장르.

import { useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Box, Button, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, Glyph, PageHeader, SectionHeader, Segmented, Tabs, formatNumber, relative } from "../../../kit";
import { ARTIST_BY_ID, GENRES, formatTrackCount, genreName, spoken } from "../data/catalog";
import { NEW_ALBUMS, NEW_ENTRY, TOP_ALBUMS, TOP_TRACKS, rankMove } from "../data/collections";
import { AlbumCard, TileLink } from "../parts/cards";
import { PlayButtons } from "../parts/header";
import { AlbumArt } from "../parts/pictures";
import { TrackTable } from "../parts/TrackTable";
import { usePlayer } from "../state/player";

const GRID = "repeat(auto-fill, minmax(10rem, 1fr))";

// 이번 주의 앨범: 가장 새로 나온 앨범 하나를 크게.
const Featured = () => {
  const player = usePlayer();
  const album = NEW_ALBUMS[0]!;
  const artist = ARTIST_BY_ID.get(album.artistId)!;
  return (
    <Anchor>
      <Grid columns={{ base: "minmax(0, 1fr)", md: "auto minmax(0, 1fr)" }} gap="xl" align="center">
        <Box width="md" maxWidth="full"><AlbumArt album={album} /></Box>
        <Stack gap="md" minWidth={0}>
          <Text as="span" variant="label" strong={false} ink="tertiary">이번 주 신보 · {relative(album.date)}</Text>
          <Stack>
            <Text as="h2" variant="display" truncate>{album.title}</Text>
            <Text as="p" variant="lead" ink="secondary">{artist.name} · {genreName(album.genre)} · {formatTrackCount(album.trackIds.length)}, {spoken(album.duration)}</Text>
          </Stack>
          <Inline gap="sm" wrap>
            <Button onClick={() => player.play(album.trackIds, 0, { shuffle: false })}><Glyph name="play" />재생</Button>
            <Button as={RouterLink} to={`/music/album/${album.id}`} variant="soft">앨범 보기</Button>
          </Inline>
        </Stack>
      </Grid>
    </Anchor>
  );
};

const News = () => (
  <>
    <Featured />
    <Stack gap="md" as="section" aria-label="최근 발매">
      <SectionHeader title="최근 발매" description="지난 두 달 안에 나온 앨범" />
      <Grid columns={GRID} gap="md">
        {NEW_ALBUMS.slice(1).map((album) => <AlbumCard key={album.id} album={album} sub={`${ARTIST_BY_ID.get(album.artistId)!.name} · ${relative(album.date)}`} />)}
      </Grid>
    </Stack>
  </>
);

// 어제보다 오른 순위는 성공, 내린 순위는 오류의 잉크로 — 오르내림이 곧 뜻이라서 색을 씁니다.
const Move = ({ id }: { id: string }) => {
  const move = rankMove(id);
  if (move === NEW_ENTRY) return <Text as="span" variant="label" ink="info">NEW</Text>;
  if (move === 0) return <Glyph name="minus" size="label" ink="tertiary" label="변동 없음" />;
  const ink = move > 0 ? "success" : "error";
  return (
    <Inline gap="xs">
      <Glyph name={move > 0 ? "arrow-up" : "arrow-down"} size="label" ink={ink} label={move > 0 ? "상승" : "하락"} />
      <Text as="span" variant="label" ink={ink} numeric>{Math.abs(move)}</Text>
    </Inline>
  );
};

const Charts = () => {
  const [kind, setKind] = useState("tracks");
  return (
    <>
      <Inline justify="between" align="center" gap="md" wrap>
        <SectionHeader title={kind === "tracks" ? "오늘의 Top 25" : "인기 앨범 Top 12"} description="지난 24시간의 재생을 바탕으로 합니다" />
        <Inline gap="sm" wrap>
          {kind === "tracks" ? <PlayButtons ids={TOP_TRACKS.map((track) => track.id)} /> : null}
          <Segmented label="차트 종류" value={kind} onChange={setKind} options={[{ id: "tracks", label: "곡", glyph: "music" }, { id: "albums", label: "앨범", glyph: "disc-3" }]} />
        </Inline>
      </Inline>
      {kind === "tracks" ? (
        <TrackTable
          label="오늘의 Top 25"
          tracks={TOP_TRACKS}
          columns={["artist", "plays"]}
          lead={(track, index) => (
            <Stack align="center">
              <Text as="span" strong numeric>{index + 1}</Text>
              <Move id={track.id} />
            </Stack>
          )}
        />
      ) : (
        <Grid columns={GRID} gap="md">
          {TOP_ALBUMS.map((album, index) => <AlbumCard key={album.id} album={album} sub={`${index + 1}위 · ${formatNumber(album.plays)}회`} />)}
        </Grid>
      )}
    </>
  );
};

const Genres = () => (
  <Stack gap="md" as="section" aria-label="장르">
    <SectionHeader title="장르" description={`${GENRES.length}개`} />
    <Grid columns="repeat(auto-fill, minmax(10rem, 1fr))" gap="md">
      {GENRES.map((genre) => <TileLink key={genre.id} to={`/music/genre/${genre.id}`} seed={`장르 ${genre.name}`} title={genre.name} sub={genre.blurb} />)}
    </Grid>
  </Stack>
);

export const BrowsePage = () => {
  // 탭은 주소의 ?tab=에 있어서 차트나 장르를 바로 가리킬 수 있습니다.
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "new";
  return (
    <>
      <PageHeader title="둘러보기" description="새로 나온 음악과 차트, 장르별로 둘러봅니다." />
      <Tabs
        label="둘러보기"
        value={tab}
        onChange={(next) => setParams(next === "new" ? {} : { tab: next }, { replace: true })}
        items={[{ id: "new", label: "신곡" }, { id: "chart", label: "차트" }, { id: "genre", label: "장르", count: GENRES.length }]}
      />
      {tab === "new" ? <News /> : tab === "chart" ? <Charts /> : <Genres />}
    </>
  );
};
