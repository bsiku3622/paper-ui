import { ALBUMS, ALBUM_BY_ID, ARTISTS, ARTIST_BY_ID, TRACKS, type Album, type Artist, type Track } from "./catalog";
import type { Playlist } from "./collections";

const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

const squash = (text: string) => text.toLowerCase().replace(/\s+/g, "");

const initialsOf = (text: string) =>
  Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0) - 0xac00;
      return code >= 0 && code <= 11171 ? CHOSEONG[Math.floor(code / 588)]! : char;
    })
    .join("");

export const score = (text: string, query: string) => {
  const q = squash(query);
  if (!q) return 0;
  const h = squash(text);
  if (h.startsWith(q)) return 3;
  if (h.includes(q)) return 2;
  if (/^[ㄱ-ㅎ]+$/.test(q) && initialsOf(h).includes(q)) return 1;
  return 0;
};

export type Results = { tracks: Track[]; albums: Album[]; artists: Artist[]; playlists: Playlist[] };

const best = <T,>(items: readonly T[], rate: (item: T) => number, plays: (item: T) => number) =>
  items
    .map((item) => ({ item, rate: rate(item) }))
    .filter((entry) => entry.rate > 0)
    .sort((a, b) => b.rate - a.rate || plays(b.item) - plays(a.item))
    .map((entry) => entry.item);

export const search = (query: string, playlists: readonly Playlist[]): Results => {
  if (!squash(query)) return { tracks: [], albums: [], artists: [], playlists: [] };
  return {
    tracks: best(
      TRACKS,
      (track) => Math.max(score(track.title, query) * 2, score(ARTIST_BY_ID.get(track.artistId)!.name, query), score(ALBUM_BY_ID.get(track.albumId)!.title, query)),
      (track) => track.plays,
    ),
    albums: best(ALBUMS, (album) => Math.max(score(album.title, query) * 2, score(ARTIST_BY_ID.get(album.artistId)!.name, query)), (album) => album.plays),
    artists: best(ARTISTS, (artist) => score(artist.name, query), (artist) => artist.listeners),
    playlists: best(playlists, (playlist) => score(playlist.name, query), () => 0),
  };
};
