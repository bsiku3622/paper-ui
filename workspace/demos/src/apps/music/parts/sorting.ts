// 곡 정렬. 제목 · 아티스트 · 앨범은 가나다순(한글과 영문이 섞여도 자연스럽게), 시간과 재생 수는 숫자로.

import { ALBUM_BY_ID, ARTIST_BY_ID, type Track } from "../data/catalog";
import type { Sort } from "./TrackTable";

export const artistOfTrack = (track: Track) => ARTIST_BY_ID.get(track.artistId)!.name;
export const albumTitleOf = (track: Track) => ALBUM_BY_ID.get(track.albumId)!.title;

const collator = new Intl.Collator("ko");

export const sortTracks = (tracks: readonly Track[], sort: Sort): Track[] => {
  const sign = sort.dir === "asc" ? 1 : -1;
  const by = (a: Track, b: Track) => {
    switch (sort.key) {
      case "title": return collator.compare(a.title, b.title);
      case "artist": return collator.compare(artistOfTrack(a), artistOfTrack(b)) || collator.compare(a.title, b.title);
      case "album": return collator.compare(albumTitleOf(a), albumTitleOf(b)) || a.n - b.n;
      case "duration": return a.duration - b.duration;
      case "plays": return a.plays - b.plays;
    }
  };
  return [...tracks].sort((a, b) => sign * by(a, b));
};
