// 앨범 화면: 표지와 제목, 재생 · 셔플 · 보관함에 추가, 곡 번호가 붙은 곡 목록, 발매일, 같은 아티스트의 다른 앨범.

import { useNavigate, useParams } from "react-router-dom";

import { Button, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, SurfaceLink, formatDate, useToast } from "../../../kit";
import { ALBUM_BY_ID, ARTIST_BY_ID, albumsOfArtist, genreName, spoken, tracksOfAlbum, formatTrackCount } from "../data/catalog";
import { AlbumCard, Shelf, Slot } from "../parts/cards";
import { EntityHeader, PlayButtons } from "../parts/header";
import { NotFound } from "../parts/NotFound";
import { AlbumArt } from "../parts/pictures";
import { TrackTable } from "../parts/TrackTable";
import { useDialogs } from "../state/dialogs";
import { useLibrary } from "../state/library";
import { usePlayer } from "../state/player";

export const AlbumPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const library = useLibrary();
  const player = usePlayer();
  const dialogs = useDialogs();
  const album = ALBUM_BY_ID.get(id);
  if (!album) return <NotFound what="앨범" />;

  const artist = ARTIST_BY_ID.get(album.artistId)!;
  const tracks = tracksOfAlbum(album);
  const ids = album.trackIds;
  const inLibrary = library.hasAlbum(album.id);
  const others = albumsOfArtist(artist).filter((item) => item.id !== album.id);

  return (
    <>
      <EntityHeader
        art={<AlbumArt album={album} label={`${album.title} 표지`} />}
        eyebrow={album.kind === "EP" ? "EP" : "앨범"}
        title={album.title}
        description={
          <SurfaceLink to={`/music/artist/${artist.id}`} radius="sm" aria-label={`${artist.name} 아티스트`}>
            <Text as="span" variant="lead" ink="secondary">{artist.name}</Text>
          </SurfaceLink>
        }
        meta={<Text as="span" ink="tertiary">{genreName(album.genre)} · {album.year} · {formatTrackCount(tracks.length)}, {spoken(album.duration)}</Text>}
        actions={
          <Inline gap="sm" wrap>
            <PlayButtons ids={ids} />
            <Button
              variant={inLibrary ? "soft" : "hairline"}
              onClick={() => {
                library.toggleAlbum(album.id);
                toast(inLibrary ? "보관함에서 뺐습니다" : "보관함에 추가했습니다");
              }}
            >
              <Glyph name={inLibrary ? "check" : "plus"} />{inLibrary ? "보관함에 있음" : "보관함에 추가"}
            </Button>
            <Menu
              label="앨범 더 보기"
              size="md"
              items={[
                { id: "next", label: "다음에 재생", glyph: "list-start", onSelect: () => player.playNext(ids) },
                { id: "later", label: "나중에 재생", glyph: "list-end", onSelect: () => player.playLater(ids) },
                { id: "add", label: "플레이리스트에 추가", glyph: "list-plus", onSelect: () => dialogs.addToPlaylist(ids) },
                { id: "d", divider: true },
                { id: "artist", label: "아티스트로 이동", glyph: "mic-vocal", onSelect: () => navigate(`/music/artist/${artist.id}`) },
              ]}
            />
          </Inline>
        }
      />
      <Stack gap="md">
        <TrackTable label={`${album.title}의 곡`} tracks={tracks} layout="number" columns={[]} />
        <Stack gap="xs" paddingX="md">
          <Text as="span" variant="caption" ink="tertiary">{formatDate(album.date, true)} 발매 · {formatTrackCount(tracks.length)}, {spoken(album.duration)}</Text>
          <Text as="span" variant="caption" ink="tertiary">© {album.year} {artist.name}</Text>
        </Stack>
      </Stack>
      {others.length > 0 ? (
        <Shelf title={`${artist.name}의 다른 앨범`} to={`/music/artist/${artist.id}`}>
          {others.map((item) => <Slot key={item.id}><AlbumCard album={item} sub={`${item.kind === "EP" ? "EP · " : ""}${item.year}`} /></Slot>)}
        </Shelf>
      ) : null}
    </>
  );
};
