// 아티스트 화면: 큰 둥근 표지와 이름, 재생 · 팔로우 · 라디오, 인기 곡, 앨범과 EP, 소개, 비슷한 아티스트.

import { useState } from "react";
import { useParams } from "react-router-dom";

import { Button, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, SectionHeader, formatNumber, useToast } from "../../../kit";
import { ARTIST_BY_ID, albumsOfArtist, genreName, topTracksOfArtist, tracksOfArtist } from "../data/catalog";
import { artistStationTracks } from "../data/collections";
import { withJosa } from "../data/josa";
import { AlbumCard, ArtistCard, Shelf, Slot } from "../parts/cards";
import { EntityHeader, PlayButtons } from "../parts/header";
import { NotFound } from "../parts/NotFound";
import { ArtistArt } from "../parts/pictures";
import { TrackTable } from "../parts/TrackTable";
import { useLibrary } from "../state/library";
import { usePlayer } from "../state/player";

export const ArtistPage = () => {
  const { id = "" } = useParams();
  const toast = useToast();
  const library = useLibrary();
  const player = usePlayer();
  const [more, setMore] = useState(false);
  const artist = ARTIST_BY_ID.get(id);
  if (!artist) return <NotFound what="아티스트" />;

  const albums = albumsOfArtist(artist);
  const full = albums.filter((album) => album.kind === "앨범");
  const eps = albums.filter((album) => album.kind === "EP");
  const top = topTracksOfArtist(artist, more ? 10 : 5);
  const all = tracksOfArtist(artist);
  const following = library.isFollowing(artist.id);
  const alike = artist.alike.map((value) => ARTIST_BY_ID.get(value)).filter((item) => item !== undefined);

  return (
    <>
      <EntityHeader
        art={<ArtistArt artist={artist} label={`${artist.name} 사진`} />}
        eyebrow={`${artist.kind} · ${genreName(artist.genre)}`}
        title={artist.name}
        description={`${artist.origin} · ${artist.since}년부터`}
        meta={<Text as="span" ink="tertiary">월간 청취자 {formatNumber(artist.listeners)}명</Text>}
        actions={
          <Inline gap="sm" wrap>
            <PlayButtons ids={top.map((track) => track.id)} />
            <Button
              variant={following ? "soft" : "hairline"}
              onClick={() => {
                library.toggleFollow(artist.id);
                toast(following ? `${artist.name} 팔로우를 취소했습니다` : `${withJosa(artist.name, "을/를")} 팔로우합니다`);
              }}
            >
              <Glyph name={following ? "user-check" : "user-plus"} />{following ? "팔로우 중" : "팔로우"}
            </Button>
            <Button variant="ghost" onClick={() => player.startRadio(`${artist.name} 라디오`, artistStationTracks(artist).map((track) => track.id))}><Glyph name="radio" />라디오</Button>
          </Inline>
        }
      />
      <Stack gap="md" as="section" aria-label="인기 곡">
        <SectionHeader
          title="인기 곡"
          description={`전체 ${all.length}곡`}
          actions={<Button variant="ghost" size="sm" onClick={() => setMore((now) => !now)}>{more ? "접기" : "더 보기"}</Button>}
        />
        <TrackTable label={`${artist.name}의 인기 곡`} tracks={top} columns={["album", "plays"]} artistLine={false} />
      </Stack>
      {full.length > 0 ? <Shelf title="앨범">{full.map((album) => <Slot key={album.id}><AlbumCard album={album} sub={String(album.year)} /></Slot>)}</Shelf> : null}
      {eps.length > 0 ? <Shelf title="EP">{eps.map((album) => <Slot key={album.id}><AlbumCard album={album} sub={`EP · ${album.year}`} /></Slot>)}</Shelf> : null}
      <Stack gap="md" as="section" aria-label="소개">
        <SectionHeader title="소개" />
        <Stack maxWidth="measure.md"><Text variant="lead" ink="secondary">{artist.bio}</Text></Stack>
      </Stack>
      {alike.length > 0 ? <Shelf title="비슷한 아티스트">{alike.map((item) => <Slot key={item.id}><ArtistCard artist={item} /></Slot>)}</Shelf> : null}
    </>
  );
};
