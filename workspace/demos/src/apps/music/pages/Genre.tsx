// 장르 화면: 그 장르의 인기 곡, 앨범, 아티스트.

import { useParams } from "react-router-dom";

import { Stack } from "@studio-baeks/paper-ui";

import { PageHeader, SectionHeader } from "../../../kit";
import { ALBUMS, ARTISTS, GENRE_BY_ID, tracksOfGenre } from "../data/catalog";
import { AlbumCard, ArtistCard, Shelf, Slot } from "../parts/cards";
import { PlayButtons } from "../parts/header";
import { NotFound } from "../parts/NotFound";
import { TrackTable } from "../parts/TrackTable";

export const GenrePage = () => {
  const { id = "" } = useParams();
  const genre = GENRE_BY_ID.get(id);
  if (!genre) return <NotFound what="장르" />;

  const tracks = tracksOfGenre(id).sort((a, b) => b.plays - a.plays);
  const albums = ALBUMS.filter((album) => album.genre === id);
  const artists = ARTISTS.filter((artist) => artist.genre === id);
  const ids = tracks.map((track) => track.id);

  return (
    <>
      <PageHeader back={{ to: "/music/browse", label: "둘러보기" }} title={genre.name} description={genre.blurb} actions={<PlayButtons ids={ids.slice(0, 30)} />} />
      <Stack gap="md" as="section" aria-label="인기 곡">
        <SectionHeader title="인기 곡" description={`${tracks.length}곡 중 상위 10곡`} />
        <TrackTable label={`${genre.name}의 인기 곡`} tracks={tracks.slice(0, 10)} context={ids} columns={["artist", "album"]} />
      </Stack>
      <Shelf title="앨범">{albums.map((album) => <Slot key={album.id}><AlbumCard album={album} sub={String(album.year)} /></Slot>)}</Shelf>
      <Shelf title="아티스트">{artists.map((artist) => <Slot key={artist.id}><ArtistCard artist={artist} /></Slot>)}</Shelf>
    </>
  );
};
