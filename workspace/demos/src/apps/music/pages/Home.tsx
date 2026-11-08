import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, Glyph, PageHeader, relative } from "../../../kit";
import { ALBUM_BY_ID, ARTIST_BY_ID, TRACK_BY_ID, type Album } from "../data/catalog";
import { EDITORIAL, MIXES, NEW_ALBUMS } from "../data/collections";
import { AlbumCard, ArtistCard, PlaylistCard, Shelf, Slot } from "../parts/cards";
import { AlbumArt } from "../parts/pictures";
import { useLibrary } from "../state/library";
import { usePlayer } from "../state/player";

const Resume = () => {
  const player = usePlayer();
  const track = player.current;
  if (!track) return null;
  const album = ALBUM_BY_ID.get(track.albumId)!;
  const artist = ARTIST_BY_ID.get(track.artistId)!;
  return (
    <Anchor>
      <Grid columns={{ base: "minmax(0, 1fr)", md: "auto minmax(0, 1fr)" }} gap="xl" align="center">
        <Box width="md" maxWidth="full"><AlbumArt album={album} /></Box>
        <Stack gap="md" minWidth={0}>
          <Text as="span" variant="label" strong={false} ink="tertiary">이어서 듣기</Text>
          <Stack>
            <Text as="h2" variant="display" truncate>{track.title}</Text>
            <Text as="p" variant="lead" ink="secondary" truncate>{artist.name} — {album.title}</Text>
          </Stack>
          <Inline gap="sm" wrap>
            <Button onClick={player.toggle}><Glyph name={player.playing ? "pause" : "play"} />{player.playing ? "일시정지" : "이어 듣기"}</Button>
            <Button as={RouterLink} to="/music/now-playing" variant="soft"><Glyph name="message-square-quote" />가사 보기</Button>
          </Inline>
        </Stack>
      </Grid>
    </Anchor>
  );
};

export const HomePage = () => {
  const library = useLibrary();

  const heard = useMemo(() => {
    const seen = new Set<string>();
    const albums: Album[] = [];
    for (const id of library.history) {
      const track = TRACK_BY_ID.get(id);
      if (!track || seen.has(track.albumId)) continue;
      seen.add(track.albumId);
      albums.push(ALBUM_BY_ID.get(track.albumId)!);
    }
    return albums.slice(0, 10);
  }, [library.history]);

  const artists = library.following.map((id) => ARTIST_BY_ID.get(id)).filter((artist) => artist !== undefined);

  return (
    <>
      <PageHeader
        title="지금 듣기"
        description="한지우님이 좋아할 만한 음악을 모았습니다."
        actions={<Button as={RouterLink} to="/music/browse" variant="hairline"><Glyph name="layout-grid" />둘러보기</Button>}
      />
      <Resume />
      {heard.length > 0 ? (
        <Shelf title="다시 듣기" description="최근에 들은 노래의 앨범" to="/music/library/albums">
          {heard.map((album) => <Slot key={album.id}><AlbumCard album={album} /></Slot>)}
        </Shelf>
      ) : null}
      <Shelf title="나를 위한 믹스" description="자주 듣는 노래를 바탕으로 만들었습니다" to="/music/playlists">
        {MIXES.map((mix) => <Slot key={mix.id}><PlaylistCard playlist={mix} sub={`${mix.trackIds.length}곡`} /></Slot>)}
      </Shelf>
      <Shelf title="새로 나온 앨범" to="/music/browse">
        {NEW_ALBUMS.slice(0, 8).map((album) => <Slot key={album.id}><AlbumCard album={album} sub={`${ARTIST_BY_ID.get(album.artistId)!.name} · ${relative(album.date)}`} /></Slot>)}
      </Shelf>
      <Shelf title="내 플레이리스트" to="/music/playlists">
        {library.playlists.slice(0, 10).map((playlist) => <Slot key={playlist.id}><PlaylistCard playlist={playlist} sub={`${playlist.trackIds.length}곡`} /></Slot>)}
      </Shelf>
      <Shelf title="에디터 추천" description="음악 에디터가 골랐습니다" to="/music/playlists">
        {EDITORIAL.map((playlist) => <Slot key={playlist.id} wide><PlaylistCard playlist={playlist} /></Slot>)}
      </Shelf>
      {artists.length > 0 ? (
        <Shelf title="자주 듣는 아티스트" to="/music/library/artists">
          {artists.map((artist) => <Slot key={artist.id}><ArtistCard artist={artist} /></Slot>)}
        </Shelf>
      ) : null}
    </>
  );
};
