// 검색: 곡 · 앨범 · 아티스트 · 플레이리스트로 나눠 보여 줍니다. 한글은 초성으로도 찾아집니다(ㅅㅂㄴ).
// 검색어는 주소의 ?q=에 있어서 되돌아가기와 공유가 됩니다. 비어 있으면 최근 검색과 장르를 보여 줍니다.

import { useEffect, useMemo, useRef } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Box, Button, Field, Grid, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, Empty, Glyph, PageHeader, SectionHeader, Tabs } from "../../../kit";
import { ALBUM_BY_ID, ARTIST_BY_ID, GENRES, genreName, topTracksOfArtist, type Artist, type Track } from "../data/catalog";
import { PLAYLISTS_STATIC } from "../data/collections";
import { josa } from "../data/josa";
import { score, search } from "../data/search";
import { AlbumCard, ArtistCard, PlaylistCard, Shelf, Slot, TileLink } from "../parts/cards";
import { AlbumArt, ArtistArt } from "../parts/pictures";
import { TrackTable } from "../parts/TrackTable";
import { useLibrary } from "../state/library";
import { usePlayer } from "../state/player";

const GRID = "repeat(auto-fill, minmax(10rem, 1fr))";

// 가장 일치하는 결과: 이름이 거의 같은 아티스트가 있으면 그 아티스트, 없으면 맨 위의 곡.
const Top = ({ artist, track, ids }: { artist?: Artist; track?: Track; ids: readonly string[] }) => {
  const player = usePlayer();
  if (artist) {
    return (
      <Anchor>
        <Grid columns={{ base: "minmax(0, 1fr)", md: "auto minmax(0, 1fr)" }} gap="xl" align="center">
          <Box width="md" maxWidth="full"><ArtistArt artist={artist} /></Box>
          <Stack gap="md" minWidth={0}>
            <Text as="span" variant="label" strong={false} ink="tertiary">가장 일치하는 결과 · 아티스트</Text>
            <Stack>
              <Text as="h2" variant="display" truncate>{artist.name}</Text>
              <Text as="p" variant="lead" ink="secondary">{artist.kind} · {genreName(artist.genre)}</Text>
            </Stack>
            <Inline gap="sm" wrap>
              <Button onClick={() => player.play(topTracksOfArtist(artist, 10).map((item) => item.id), 0, { shuffle: false })}><Glyph name="play" />인기 곡 재생</Button>
              <Button as={RouterLink} to={`/music/artist/${artist.id}`} variant="soft">아티스트 보기</Button>
            </Inline>
          </Stack>
        </Grid>
      </Anchor>
    );
  }
  if (!track) return null;
  const album = ALBUM_BY_ID.get(track.albumId)!;
  return (
    <Anchor>
      <Grid columns={{ base: "minmax(0, 1fr)", md: "auto minmax(0, 1fr)" }} gap="xl" align="center">
        <Box width="md" maxWidth="full"><AlbumArt album={album} /></Box>
        <Stack gap="md" minWidth={0}>
          <Text as="span" variant="label" strong={false} ink="tertiary">가장 일치하는 결과 · 노래</Text>
          <Stack>
            <Text as="h2" variant="display" truncate>{track.title}</Text>
            <Text as="p" variant="lead" ink="secondary">{ARTIST_BY_ID.get(track.artistId)!.name} — {album.title}</Text>
          </Stack>
          <Inline gap="sm" wrap>
            <Button onClick={() => player.playTrack(track.id, ids)}><Glyph name="play" />재생</Button>
            <Button as={RouterLink} to={`/music/album/${album.id}`} variant="soft">앨범 보기</Button>
          </Inline>
        </Stack>
      </Grid>
    </Anchor>
  );
};

export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const tab = params.get("tab") ?? "all";
  const library = useLibrary();
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    field.current?.focus();
  }, []);

  const results = useMemo(() => search(q, [...library.playlists, ...PLAYLISTS_STATIC]), [q, library.playlists]);
  const total = results.tracks.length + results.albums.length + results.artists.length + results.playlists.length;

  const update = (next: { q?: string; tab?: string }) =>
    setParams((now) => {
      const out = new URLSearchParams(now);
      if (next.q !== undefined) {
        if (next.q) out.set("q", next.q);
        else out.delete("q");
      }
      if (next.tab !== undefined) {
        if (next.tab === "all") out.delete("tab");
        else out.set("tab", next.tab);
      }
      return out;
    }, { replace: true });

  const typed = q.trim().length > 0;
  const best = results.artists[0];
  const exactArtist = best && score(best.name, q) >= 2 ? best : undefined;
  const ids = results.tracks.map((track) => track.id);

  return (
    <>
      <PageHeader title="검색" description="노래, 앨범, 아티스트, 플레이리스트를 찾습니다." />
      <Box maxWidth="measure.md" width="full">
        <Field
          size="lg"
          shape="pill"
          fill="sunken"
          aria-label="검색"
          placeholder="노래, 앨범, 아티스트 찾기"
          ref={field}
          value={q}
          onChange={(event) => update({ q: event.target.value, tab: "all" })}
          onKeyDown={(event) => { if (event.key === "Enter") library.rememberSearch(q); }}
          leading={<Glyph name="search" />}
          clearable
        />
      </Box>
      {!typed ? (
        <>
          {library.searches.length > 0 ? (
            <Stack gap="md" as="section" aria-label="최근 검색">
              <SectionHeader title="최근 검색" actions={<Button size="sm" variant="ghost" onClick={library.clearSearches}>모두 지우기</Button>} />
              <Inline gap="sm" wrap>
                {library.searches.map((item) => (
                  <Inline key={item} gap="xs">
                    <Button size="sm" shape="pill" variant="hairline" onClick={() => update({ q: item })}><Glyph name="clock" />{item}</Button>
                    <IconButton size="xs" shape="pill" variant="ghost" aria-label={`'${item}' 검색 기록 지우기`} onClick={() => library.forgetSearch(item)}><Glyph name="x" /></IconButton>
                  </Inline>
                ))}
              </Inline>
            </Stack>
          ) : null}
          <Stack gap="md" as="section" aria-label="장르 둘러보기">
            <SectionHeader title="장르 둘러보기" />
            <Grid columns="repeat(auto-fill, minmax(10rem, 1fr))" gap="md">
              {GENRES.map((genre) => <TileLink key={genre.id} to={`/music/genre/${genre.id}`} seed={`장르 ${genre.name}`} title={genre.name} sub={genre.blurb} />)}
            </Grid>
          </Stack>
        </>
      ) : total === 0 ? (
        <Empty glyph="search-x" title={`'${q}'${josa(q, "과/와")} 맞는 결과가 없습니다`} description="철자를 확인하거나 초성(ㅅㅂㄴ)으로 찾아 보세요." action={<Button size="sm" variant="hairline" onClick={() => update({ q: "" })}>검색 지우기</Button>} />
      ) : (
        <>
          <Box overflowX="auto">
            <Tabs
              label="검색 결과 종류"
              value={tab}
              onChange={(next) => update({ tab: next })}
              items={[
                { id: "all", label: "전체" },
                { id: "songs", label: "노래", count: results.tracks.length },
                { id: "albums", label: "앨범", count: results.albums.length },
                { id: "artists", label: "아티스트", count: results.artists.length },
                { id: "playlists", label: "플레이리스트", count: results.playlists.length },
              ]}
            />
          </Box>
          {tab === "all" ? (
            <>
              <Top artist={exactArtist} track={results.tracks[0]} ids={ids} />
              {results.tracks.length > 0 ? (
                <Stack gap="md" as="section" aria-label="노래">
                  <SectionHeader title="노래" actions={results.tracks.length > 5 ? <Button size="sm" variant="ghost" onClick={() => update({ tab: "songs" })}>모두 보기<Glyph name="chevron-right" /></Button> : undefined} />
                  <TrackTable label="노래 검색 결과" tracks={results.tracks.slice(0, 5)} context={ids} columns={["artist", "album"]} />
                </Stack>
              ) : null}
              {results.albums.length > 0 ? (
                <Shelf title="앨범">{results.albums.slice(0, 8).map((album) => <Slot key={album.id}><AlbumCard album={album} sub={`${ARTIST_BY_ID.get(album.artistId)!.name} · ${album.year}`} /></Slot>)}</Shelf>
              ) : null}
              {results.artists.length > 0 ? (
                <Shelf title="아티스트">{results.artists.slice(0, 8).map((artist) => <Slot key={artist.id}><ArtistCard artist={artist} /></Slot>)}</Shelf>
              ) : null}
              {results.playlists.length > 0 ? (
                <Shelf title="플레이리스트">{results.playlists.slice(0, 8).map((playlist) => <Slot key={playlist.id}><PlaylistCard playlist={playlist} sub={`${playlist.trackIds.length}곡`} /></Slot>)}</Shelf>
              ) : null}
            </>
          ) : null}
          {tab === "songs" ? <TrackTable label="노래 검색 결과" tracks={results.tracks.slice(0, 60)} context={ids} columns={["artist", "album"]} empty={<Empty glyph="music" title="맞는 노래가 없습니다" />} /> : null}
          {tab === "albums" ? (
            results.albums.length === 0 ? <Empty glyph="disc-3" title="맞는 앨범이 없습니다" /> : <Grid columns={GRID} gap="md">{results.albums.map((album) => <AlbumCard key={album.id} album={album} />)}</Grid>
          ) : null}
          {tab === "artists" ? (
            results.artists.length === 0 ? <Empty glyph="mic-vocal" title="맞는 아티스트가 없습니다" /> : <Grid columns={GRID} gap="md">{results.artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</Grid>
          ) : null}
          {tab === "playlists" ? (
            results.playlists.length === 0 ? <Empty glyph="list-music" title="맞는 플레이리스트가 없습니다" /> : <Grid columns={GRID} gap="md">{results.playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} sub={`${playlist.trackIds.length}곡`} />)}</Grid>
          ) : null}
        </>
      )}
    </>
  );
};
