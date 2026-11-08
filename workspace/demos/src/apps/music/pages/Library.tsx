import { useMemo, useState } from "react";

import { Box, Button, Field, Grid, Inline, Select, Stack, Text } from "@studio-baeks/paper-ui";

import { Art, Avatar, Empty, Glyph, PageHeader, SectionHeader, Segmented, SurfaceLink, relative } from "../../../kit";
import { ALBUM_BY_ID, ARTIST_BY_ID, TRACK_BY_ID, formatTrackCount, genreName, spoken, tracksOfAlbum, tracksOfArtist, type Album, type Artist, type Track } from "../data/catalog";
import type { Playlist } from "../data/collections";
import { score } from "../data/search";
import { AlbumCard, ArtistCard, PlaylistCard } from "../parts/cards";
import { PlayButtons } from "../parts/header";
import { artistOfTrack, albumTitleOf, sortTracks } from "../parts/sorting";
import { TrackTable, type Sort, type SortKey } from "../parts/TrackTable";
import { useLibrary } from "../state/library";

const GRID = "repeat(auto-fill, minmax(10rem, 1fr))";
const DAY = 86_400_000;

const useLibraryAlbums = (): Album[] => {
  const library = useLibrary();
  return useMemo(() => library.albums.map((id) => ALBUM_BY_ID.get(id)).filter((album): album is Album => album !== undefined), [library.albums]);
};

type Recent = { key: string; at: number; card: "album" | "playlist"; album?: Album; playlist?: Playlist };

export const RecentPage = () => {
  const library = useLibrary();
  const albums = useLibraryAlbums();
  const items = useMemo<Recent[]>(
    () =>
      [
        ...albums.map((album): Recent => ({ key: album.id, at: album.addedAt.getTime(), card: "album", album })),
        ...library.playlists.map((playlist): Recent => ({ key: playlist.id, at: playlist.updatedAt, card: "playlist", playlist })),
      ]
        .sort((a, b) => b.at - a.at)
        .slice(0, 36),
    [albums, library.playlists],
  );
  const latest = items[0]?.at ?? 0;
  const groups = [
    { title: "이번 주", list: items.filter((item) => latest - item.at < 7 * DAY) },
    { title: "이번 달", list: items.filter((item) => latest - item.at >= 7 * DAY && latest - item.at < 30 * DAY) },
    { title: "이전", list: items.filter((item) => latest - item.at >= 30 * DAY) },
  ].filter((group) => group.list.length > 0);

  return (
    <>
      <PageHeader title="최근 추가" description="최근에 보관함에 넣거나 만든 앨범과 플레이리스트입니다." />
      {groups.map((group) => (
        <Stack key={group.title} gap="md" as="section" aria-label={group.title}>
          <SectionHeader title={group.title} description={`${group.list.length}개`} />
          <Grid columns={GRID} gap="md">
            {group.list.map((item) =>
              item.card === "album" ? (
                <AlbumCard key={item.key} album={item.album!} sub={`${relative(new Date(item.at))} 추가`} />
              ) : (
                <PlaylistCard key={item.key} playlist={item.playlist!} sub={`플레이리스트 · ${relative(new Date(item.at))}`} />
              ),
            )}
          </Grid>
        </Stack>
      ))}
    </>
  );
};

const useLibraryArtists = (): Artist[] => {
  const library = useLibrary();
  const albums = useLibraryAlbums();
  return useMemo(() => {
    const ids = new Set([...albums.map((album) => album.artistId), ...library.following]);
    return [...ids].map((id) => ARTIST_BY_ID.get(id)).filter((artist): artist is Artist => artist !== undefined).sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [albums, library.following]);
};

export const LibraryArtistsPage = () => {
  const artists = useLibraryArtists();
  const [view, setView] = useState("grid");
  return (
    <>
      <PageHeader
        title="아티스트"
        description={`${artists.length}팀`}
        actions={<Segmented label="보기" value={view} onChange={setView} options={[{ id: "grid", label: "격자", glyph: "layout-grid" }, { id: "list", label: "목록", glyph: "list" }]} />}
      />
      {view === "grid" ? (
        <Grid columns={GRID} gap="md">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} sub={`앨범 ${artist.albumIds.length}장`} />)}</Grid>
      ) : (
        <Stack as="ul" aria-label="아티스트 목록">
          {artists.map((artist) => (
            <Stack as="li" key={artist.id}>
              <SurfaceLink to={`/music/artist/${artist.id}`} radius="md" paddingX="md" paddingY="sm" aria-label={artist.name}>
                <Inline justify="between" gap="md">
                  <Inline gap="md" minWidth={0}>
                    <Avatar name={artist.name} size="lg" picture={<Art seed={artist.seed} radius="none" />} />
                    <Stack minWidth={0}>
                      <Text as="span" strong truncate>{artist.name}</Text>
                      <Text as="span" variant="caption" ink="tertiary" truncate>{artist.kind} · {genreName(artist.genre)}</Text>
                    </Stack>
                  </Inline>
                  <Text as="span" variant="caption" ink="tertiary" numeric>앨범 {artist.albumIds.length}장 · {formatTrackCount(tracksOfArtist(artist).length)}</Text>
                </Inline>
              </SurfaceLink>
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
};

type AlbumSort = "added" | "title" | "artist" | "year";

export const LibraryAlbumsPage = () => {
  const albums = useLibraryAlbums();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState<AlbumSort>("added");
  const [filter, setFilter] = useState("");

  const shown = useMemo(() => {
    const list = filter.trim() ? albums.filter((album) => Math.max(score(album.title, filter), score(ARTIST_BY_ID.get(album.artistId)!.name, filter)) > 0) : [...albums];
    const collator = new Intl.Collator("ko");
    switch (sort) {
      case "title": return list.sort((a, b) => collator.compare(a.title, b.title));
      case "artist": return list.sort((a, b) => collator.compare(ARTIST_BY_ID.get(a.artistId)!.name, ARTIST_BY_ID.get(b.artistId)!.name) || a.date.getTime() - b.date.getTime());
      case "year": return list.sort((a, b) => b.date.getTime() - a.date.getTime());
      default: return list.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    }
  }, [albums, sort, filter]);

  return (
    <>
      <PageHeader title="앨범" description={`${albums.length}장`} />
      <Inline justify="between" gap="md" wrap>
        <Inline gap="sm" wrap>
          <Box width="lg" maxWidth="full">
            <Field size="sm" shape="pill" fill="sunken" aria-label="앨범 찾기" placeholder="앨범이나 아티스트 찾기" value={filter} onChange={(event) => setFilter(event.target.value)} leading={<Glyph name="search" />} clearable />
          </Box>
          <Box width="md">
            <Select size="sm" aria-label="정렬" value={sort} onChange={(event) => setSort(event.target.value as AlbumSort)}>
              <Select.Option value="added">최근 추가순</Select.Option>
              <Select.Option value="title">제목순</Select.Option>
              <Select.Option value="artist">아티스트순</Select.Option>
              <Select.Option value="year">발매일순</Select.Option>
            </Select>
          </Box>
        </Inline>
        <Segmented label="보기" value={view} onChange={setView} options={[{ id: "grid", label: "격자", glyph: "layout-grid" }, { id: "list", label: "목록", glyph: "list" }]} />
      </Inline>
      {shown.length === 0 ? (
        <Empty glyph="disc-3" title="찾는 앨범이 없습니다" description="보관함에 있는 앨범 중에서 찾습니다." action={<Button size="sm" variant="hairline" onClick={() => setFilter("")}>찾기 지우기</Button>} />
      ) : view === "grid" ? (
        <Grid columns={GRID} gap="md">{shown.map((album) => <AlbumCard key={album.id} album={album} />)}</Grid>
      ) : (
        <Stack as="ul" aria-label="앨범 목록">
          {shown.map((album) => {
            const artist = ARTIST_BY_ID.get(album.artistId)!;
            return (
              <Stack as="li" key={album.id}>
                <SurfaceLink to={`/music/album/${album.id}`} radius="md" paddingX="md" paddingY="sm" aria-label={`${album.title}, ${artist.name}`}>
                  <Inline justify="between" gap="md">
                    <Inline gap="md" minWidth={0}>
                      <Avatar name={album.title} size="lg" square picture={<Art seed={album.seed} radius="none" />} />
                      <Stack minWidth={0}>
                        <Text as="span" strong truncate>{album.title}</Text>
                        <Text as="span" variant="caption" ink="tertiary" truncate>{artist.name}</Text>
                      </Stack>
                    </Inline>
                    <Text as="span" variant="caption" ink="tertiary" numeric>{album.kind === "EP" ? "EP · " : ""}{album.year} · {formatTrackCount(album.trackIds.length)}, {spoken(album.duration)}</Text>
                  </Inline>
                </SurfaceLink>
              </Stack>
            );
          })}
        </Stack>
      )}
    </>
  );
};

const PAGE = 50;

export const LibrarySongsPage = () => {
  const library = useLibrary();
  const albums = useLibraryAlbums();
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<Sort | undefined>(undefined);
  const [limit, setLimit] = useState(PAGE);

  const all = useMemo(() => {
    const seen = new Set<string>();
    const out: Track[] = [];
    const push = (track: Track | undefined) => {
      if (track && !seen.has(track.id)) {
        seen.add(track.id);
        out.push(track);
      }
    };
    [...albums].sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()).forEach((album) => tracksOfAlbum(album).forEach(push));
    library.likes.forEach((id) => push(TRACK_BY_ID.get(id)));
    return out;
  }, [albums, library.likes]);

  const shown = useMemo(() => {
    const list = filter.trim() ? all.filter((track) => Math.max(score(track.title, filter), score(artistOfTrack(track), filter), score(albumTitleOf(track), filter)) > 0) : all;
    return sort ? sortTracks(list, sort) : list;
  }, [all, filter, sort]);

  const onSort = (key: SortKey) => setSort((now) => (now?.key !== key ? { key, dir: "asc" } : now.dir === "asc" ? { key, dir: "desc" } : undefined));
  const ids = shown.map((track) => track.id);

  return (
    <>
      <PageHeader title="노래" description={`${all.length}곡`} actions={<Inline gap="sm" wrap><PlayButtons ids={ids} /></Inline>} />
      <Inline gap="sm" wrap>
        <Box width="lg" maxWidth="full">
          <Field size="sm" shape="pill" fill="sunken" aria-label="노래 찾기" placeholder="제목, 아티스트, 앨범으로 찾기" value={filter} onChange={(event) => { setFilter(event.target.value); setLimit(PAGE); }} leading={<Glyph name="search" />} clearable />
        </Box>
        {filter ? <Text as="span" ink="tertiary">{shown.length}곡을 찾았습니다</Text> : null}
      </Inline>
      <Stack gap="md">
        <TrackTable
          label="보관함의 노래"
          tracks={shown.slice(0, limit)}
          context={ids}
          columns={["artist", "album"]}
          sort={sort}
          onSort={onSort}
          empty={<Empty glyph="search-x" title="찾는 노래가 없습니다" description="보관함에 있는 노래 중에서 찾습니다." action={<Button size="sm" variant="hairline" onClick={() => setFilter("")}>찾기 지우기</Button>} />}
        />
        {shown.length > limit ? (
          <Inline justify="center"><Button variant="hairline" onClick={() => setLimit((now) => now + PAGE)}>{Math.min(PAGE, shown.length - limit)}곡 더 보기</Button></Inline>
        ) : null}
      </Stack>
    </>
  );
};
