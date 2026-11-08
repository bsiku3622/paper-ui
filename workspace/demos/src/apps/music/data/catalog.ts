import { daysAgo, int, random } from "../../../kit";
import { ALBUM_SPECS } from "./albums";
import { ARTIST_SPECS, GENRE_SPECS, type ArtistKind } from "./artists";

export type Lang = "ko" | "en";

export type Track = {
  id: string;
  n: number;
  title: string;
  albumId: string;
  artistId: string;
  duration: number;
  plays: number;
  instrumental: boolean;
  lang: Lang;
};

export type Album = {
  id: string;
  title: string;
  artistId: string;
  genre: string;
  kind: "앨범" | "EP";
  date: Date;
  year: number;
  trackIds: string[];
  duration: number;
  plays: number;
  instrumental: boolean;
  addedAt: Date;
  seed: string;
};

export type Artist = {
  id: string;
  name: string;
  kind: ArtistKind;
  genre: string;
  origin: string;
  since: number;
  bio: string;
  alike: readonly string[];
  listeners: number;
  albumIds: string[];
  seed: string;
};

export type Genre = { id: string; name: string; blurb: string };

const isKorean = (text: string) => /[가-힣]/.test(text);

const albums: Album[] = [];
const tracks: Track[] = [];

const OUTSIDE = new Set(["al08", "al13", "al20", "al25", "al27", "al31", "al34", "al36", "al38"]);
const ADDED_RECENTLY: Record<string, number> = { al14: 2, al24: 5, al06: 11, al10: 38, al32: 52, al22: 90, al12: 120, al18: 150 };

let serial = 1;
for (const spec of ALBUM_SPECS) {
  const artist = ARTIST_SPECS.find((item) => item.id === spec.artist)!;
  const titles = spec.tracks.split(" | ");
  const r = random(spec.id);
  const date = new Date(`${spec.date}T09:00:00+09:00`);
  const trackIds: string[] = [];
  let duration = 0;
  let plays = 0;
  titles.forEach((title, index) => {
    const tr = random(`${spec.id}:${index}`);
    const length = spec.instrumental ? int(tr, 170, 380) : int(tr, 138, 296);
    const count = Math.floor(Math.pow(tr(), 3) * 7_800_000) + 24_000;
    const track: Track = {
      id: `t${String(serial++).padStart(3, "0")}`,
      n: index + 1,
      title,
      albumId: spec.id,
      artistId: spec.artist,
      duration: length,
      plays: count,
      instrumental: spec.instrumental === true,
      lang: isKorean(title) ? "ko" : "en",
    };
    tracks.push(track);
    trackIds.push(track.id);
    duration += length;
    plays += count;
  });
  albums.push({
    id: spec.id,
    title: spec.title,
    artistId: spec.artist,
    genre: artist.genre,
    kind: spec.kind,
    date,
    year: date.getFullYear(),
    trackIds,
    duration,
    plays,
    instrumental: spec.instrumental === true,
    addedAt: daysAgo(spec.id in ADDED_RECENTLY ? ADDED_RECENTLY[spec.id]! : int(r, 170, 720)),
    seed: `${spec.title}·${artist.name}`,
  });
}

const artists: Artist[] = ARTIST_SPECS.map((spec) => {
  const r = random(spec.id);
  return {
    ...spec,
    listeners: int(r, 42_000, 2_400_000),
    albumIds: albums.filter((album) => album.artistId === spec.id).map((album) => album.id),
    seed: `${spec.name}·artist`,
  };
});

export const TRACKS: readonly Track[] = tracks;
export const ALBUMS: readonly Album[] = albums;
export const ARTISTS: readonly Artist[] = artists;
export const GENRES: readonly Genre[] = GENRE_SPECS;

export const TRACK_BY_ID: ReadonlyMap<string, Track> = new Map(tracks.map((track) => [track.id, track]));
export const ALBUM_BY_ID: ReadonlyMap<string, Album> = new Map(albums.map((album) => [album.id, album]));
export const ARTIST_BY_ID: ReadonlyMap<string, Artist> = new Map(artists.map((artist) => [artist.id, artist]));
export const GENRE_BY_ID: ReadonlyMap<string, Genre> = new Map(GENRE_SPECS.map((genre) => [genre.id, genre]));

export const DEFAULT_LIBRARY: readonly string[] = albums.filter((album) => !OUTSIDE.has(album.id)).map((album) => album.id);

export const genreName = (id: string) => GENRE_BY_ID.get(id)?.name ?? id;
export const genreOfTrack = (track: Track) => ALBUM_BY_ID.get(track.albumId)!.genre;

export const tracksOfAlbum = (album: Album): Track[] => album.trackIds.map((id) => TRACK_BY_ID.get(id)!);
export const albumsOfArtist = (artist: Artist): Album[] => artist.albumIds.map((id) => ALBUM_BY_ID.get(id)!).sort((a, b) => b.date.getTime() - a.date.getTime());
export const tracksOfArtist = (artist: Artist): Track[] => tracks.filter((track) => track.artistId === artist.id);
export const topTracksOfArtist = (artist: Artist, count: number): Track[] => tracksOfArtist(artist).sort((a, b) => b.plays - a.plays).slice(0, count);
export const tracksOfGenre = (genre: string): Track[] => tracks.filter((track) => genreOfTrack(track) === genre);

export const totalDuration = (list: readonly Track[]) => list.reduce((sum, track) => sum + track.duration, 0);

export const formatTrackCount = (count: number) => `${count}곡`;

export const spoken = (seconds: number) => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}시간 ${minutes % 60}분` : `${minutes}분`;
};
