import { NOW, daysAgo, random, shuffle } from "../../../kit";
import {
  ALBUMS, ARTISTS, DEFAULT_LIBRARY, TRACKS, tracksOfAlbum, tracksOfArtist, tracksOfGenre, type Album, type Artist, type Track,
} from "./catalog";

export type PlaylistKind = "user" | "editorial" | "mix";

export type Playlist = {
  id: string;
  name: string;
  description: string;
  kind: PlaylistKind;
  trackIds: string[];
  seed: string;
  updatedAt: number;
  pinned?: boolean;
  curator?: string;
};

const inLibrary = new Set(DEFAULT_LIBRARY);
const libraryTracks: Track[] = ALBUMS.filter((album) => inLibrary.has(album.id)).flatMap(tracksOfAlbum);
const newest: Track[] = [...ALBUMS].filter((album) => album.year === 2026).flatMap(tracksOfAlbum);

const from = (seed: string, pool: readonly Track[], count: number) => shuffle(random(seed), pool).slice(0, count).map((track) => track.id);
const ofGenres = (genres: readonly string[]) => genres.flatMap(tracksOfGenre);

const MONTHS: readonly { name: string; count: number; pinned?: true; days: number }[] = [
  { name: "2026.11", count: 24, days: 0 },
  { name: "2026.10", count: 28, days: 6 },
  { name: "2026.09 2nd Ed", count: 16, days: 20, pinned: true },
  { name: "2026.09", count: 22, days: 38 },
  { name: "2026.08", count: 19, days: 66 },
  { name: "2026.07", count: 25, days: 97, pinned: true },
  { name: "2026.06", count: 21, days: 128 },
  { name: "2026.05", count: 18, days: 158 },
  { name: "2026.04", count: 23, days: 190 },
  { name: "2026.03", count: 27, days: 222 },
  { name: "2026.02", count: 20, days: 250 },
  { name: "2026.01", count: 24, days: 282 },
  { name: "2025.12", count: 17, days: 312 },
];

const RAIN = /비|rain|소나기|장마|우산|물웅덩이|처마|umbrella|weather|storm|dew|fog/i;

const THEMED: readonly { name: string; description: string; tracks: readonly string[]; days: number }[] = [
  { name: "새벽에 듣는 노래", description: "잠이 오지 않는 밤, 볼륨을 낮추고.", tracks: from("새벽", ofGenres(["ballad", "rnb", "ambient", "dreampop"]), 22), days: 9 },
  { name: "공부할 때", description: "가사 없이, 조용하게.", tracks: from("공부", TRACKS.filter((track) => track.instrumental), 26), days: 14 },
  { name: "비 오는 날", description: "창문 너머로 빗소리가 들릴 때.", tracks: from("비", TRACKS.filter((track) => RAIN.test(track.title)), 24), days: 31 },
  { name: "드라이브", description: "강변북로, 창문을 조금 열고.", tracks: from("드라이브", ofGenres(["citypop", "synthwave", "pop"]), 20), days: 44 },
  { name: "러닝 BPM 150", description: "발걸음에 박자를 맞춰서.", tracks: from("러닝", ofGenres(["hiphop", "alternative", "indie-rock"]), 21), days: 73 },
  { name: "캠핑", description: "모닥불 앞에서 듣는 기타 소리.", tracks: from("캠핑", ofGenres(["folk"]), 18), days: 105 },
];

export const SEED_PLAYLISTS: readonly Playlist[] = [
  ...MONTHS.map((month, index): Playlist => ({
    id: `pl-${month.name.replace(/[^0-9a-z]/gi, "")}`,
    name: month.name,
    description: `${month.name.slice(0, 4)}년 ${Number(month.name.slice(5, 7))}월에 자주 들은 노래.`,
    kind: "user",
    trackIds: [...new Set([...(index < 3 ? from(`new:${month.name}`, newest, 5) : []), ...from(`month:${month.name}`, libraryTracks, month.count)])].slice(0, month.count),
    seed: `월별 ${month.name}`,
    updatedAt: daysAgo(month.days).getTime(),
    pinned: month.pinned,
  })),
  ...THEMED.map((item, index): Playlist => ({
    id: `pl-theme${index + 1}`,
    name: item.name,
    description: item.description,
    kind: "user",
    trackIds: [...item.tracks],
    seed: `테마 ${item.name}`,
    updatedAt: daysAgo(item.days).getTime(),
  })),
];

const at = (days: number) => daysAgo(days).getTime();

export const EDITORIAL: readonly Playlist[] = [
  { id: "ed01", name: "오늘의 발견", description: "이번 달 새로 나온 음악 중에서 골랐습니다.", trackIds: from("ed01", newest, 26), seed: "에디터 오늘의 발견", curator: "음악 에디터", updatedAt: at(1) },
  { id: "ed02", name: "주말 아침 커피", description: "느지막이 일어난 토요일 오전에 어울리는 노래.", trackIds: from("ed02", ofGenres(["folk", "pop", "soul"]), 24), seed: "에디터 주말 아침 커피", curator: "음악 에디터", updatedAt: at(4) },
  { id: "ed03", name: "이어폰 필수 인디", description: "크게 들을수록 좋은 기타와 드럼.", trackIds: from("ed03", ofGenres(["indie-rock", "alternative", "dreampop"]), 28), seed: "에디터 이어폰 필수 인디", curator: "음악 에디터", updatedAt: at(8) },
  { id: "ed04", name: "비 오는 날 재즈", description: "빗소리와 브러시 드럼이 만나는 시간.", trackIds: from("ed04", ofGenres(["jazz", "ambient", "classical"]), 22), seed: "에디터 비 오는 날 재즈", curator: "음악 에디터", updatedAt: at(13) },
  { id: "ed05", name: "집중이 필요할 때", description: "방해하지 않는 소리만 모았습니다.", trackIds: from("ed05", TRACKS.filter((track) => track.instrumental), 30), seed: "에디터 집중", curator: "음악 에디터", updatedAt: at(20) },
  { id: "ed06", name: "퇴근길 시티 팝", description: "버스 창가 자리에서 듣는 네온과 신시사이저.", trackIds: from("ed06", ofGenres(["citypop", "synthwave", "pop"]), 25), seed: "에디터 퇴근길 시티 팝", curator: "음악 에디터", updatedAt: at(27) },
  { id: "ed07", name: "잠들기 전 10분", description: "천천히 내려앉는 소리로 하루를 닫습니다.", trackIds: from("ed07", ofGenres(["ambient", "ballad", "classical"]), 18), seed: "에디터 잠들기 전", curator: "음악 에디터", updatedAt: at(35) },
  { id: "ed08", name: "여름의 끝", description: "해가 짧아지는 8월 마지막 주의 노래.", trackIds: from("ed08", libraryTracks, 22), seed: "에디터 여름의 끝", curator: "음악 에디터", updatedAt: at(61) },
  { id: "ed09", name: "힙합 신인 노트", description: "골목과 옥상에서 시작한 목소리들.", trackIds: from("ed09", ofGenres(["hiphop"]), 20), seed: "에디터 힙합 신인 노트", curator: "음악 에디터", updatedAt: at(48) },
  { id: "ed10", name: "겨울 감성 포크", description: "목도리를 두르고 듣는 어쿠스틱 기타.", trackIds: from("ed10", ofGenres(["folk", "ballad"]), 24), seed: "에디터 겨울 감성 포크", curator: "음악 에디터", updatedAt: at(80) },
].map((item): Playlist => ({ ...item, kind: "editorial" }));

const artistById = (id: string) => ARTISTS.find((artist) => artist.id === id)!;

export const MIXES: readonly Playlist[] = [
  { id: "mx1", name: "새 음악 믹스", description: "지난 한 달 동안 나온 곡 중에서 취향에 맞을 만한 것들.", trackIds: from("mx1", newest, 24), seed: "믹스 새 음악" },
  { id: "mx2", name: "다시 듣기 믹스", description: "자주 들었던 노래와 닮은 노래.", trackIds: from("mx2", libraryTracks, 28), seed: "믹스 다시 듣기" },
  { id: "mx3", name: "조용한 밤 믹스", description: "늦은 시간에 어울리는 느린 곡.", trackIds: from("mx3", ofGenres(["ballad", "rnb", "ambient", "dreampop", "classical"]), 26), seed: "믹스 조용한 밤" },
  { id: "mx4", name: "활기 믹스", description: "걸음이 빨라지는 곡.", trackIds: from("mx4", ofGenres(["alternative", "indie-rock", "pop", "hiphop"]), 26), seed: "믹스 활기" },
  { id: "mx5", name: "집중 믹스", description: "가사 없이 이어지는 곡.", trackIds: from("mx5", TRACKS.filter((track) => track.instrumental), 28), seed: "믹스 집중" },
  { id: "mx6", name: "윤해솔 믹스", description: "윤해솔과 닮은 목소리들.", trackIds: from("mx6", [...tracksOfArtist(artistById("ar06")), ...tracksOfArtist(artistById("ar13")), ...tracksOfArtist(artistById("ar22"))], 24), seed: "믹스 윤해솔" },
].map((item): Playlist => ({ ...item, kind: "mix", curator: "나를 위한 믹스", updatedAt: NOW.getTime() }));

export const PLAYLISTS_STATIC: readonly Playlist[] = [...EDITORIAL, ...MIXES];

export type Station = {
  id: string;
  name: string;
  tagline: string;
  kind: "live" | "genre" | "artist";
  genres: readonly string[];
  host?: string;
  seed: string;
};

export const STATIONS: readonly Station[] = [
  { id: "st01", name: "새벽 두 시 라디오", tagline: "잠들지 못한 사람들을 위한 느린 노래", kind: "live", genres: ["ballad", "rnb", "dreampop"], host: "강하준", seed: "라디오 새벽" },
  { id: "st02", name: "인디 온 에어", tagline: "합주실에서 막 나온 소리", kind: "live", genres: ["indie-rock", "alternative"], host: "한지우", seed: "라디오 인디" },
  { id: "st03", name: "조용한 피아노 방송", tagline: "일상의 소리가 섞인 연주", kind: "live", genres: ["classical", "ambient"], host: "윤서아", seed: "라디오 피아노" },
  { id: "st04", name: "하루 종일 팝", tagline: "한 번 들으면 따라 부르는 후렴", kind: "live", genres: ["pop", "citypop"], host: "임시우", seed: "라디오 팝" },
  { id: "st05", name: "재즈 라운지 24", tagline: "마지막 세트가 끝나지 않는 클럽", kind: "live", genres: ["jazz", "soul"], host: "송민재", seed: "라디오 재즈" },
  { id: "st06", name: "랩 스테이션", tagline: "골목과 옥상의 이야기", kind: "live", genres: ["hiphop"], host: "류하늘", seed: "라디오 랩" },
  { id: "st07", name: "로파이 스터디", tagline: "책상 앞의 낡은 카세트", kind: "genre", genres: ["electronic", "ambient"], seed: "라디오 로파이" },
  { id: "st08", name: "포크 오두막", tagline: "모닥불과 기타 한 대", kind: "genre", genres: ["folk"], seed: "라디오 포크" },
  { id: "st09", name: "신스웨이브 야간 비행", tagline: "레이저 같은 신시사이저와 80년대의 밤", kind: "genre", genres: ["synthwave", "citypop"], seed: "라디오 신스" },
  { id: "st10", name: "발라드 우체국", tagline: "편지처럼 천천히 도착하는 노래", kind: "genre", genres: ["ballad"], seed: "라디오 발라드" },
];

const stationTracks = (station: Station): Track[] => shuffle(random(`station:${station.id}`), ofGenres(station.genres));

export const artistStationTracks = (artist: Artist): Track[] => {
  const own = tracksOfArtist(artist);
  const like = artist.alike.flatMap((id) => tracksOfArtist(artistById(id)));
  return shuffle(random(`artist-radio:${artist.id}`), [...own, ...like]);
};

export const onAir = (station: Station): Track => {
  const list = stationTracks(station);
  const slot = Math.floor(NOW.getTime() / (4 * 60_000));
  return list[slot % list.length]!;
};

export const radioQueue = (station: Station): Track[] => {
  const now = onAir(station);
  return [now, ...stationTracks(station).filter((track) => track.id !== now.id)];
};

export const TOP_TRACKS: readonly Track[] = [...TRACKS].sort((a, b) => b.plays - a.plays).slice(0, 25);
export const TOP_ALBUMS: readonly Album[] = [...ALBUMS].sort((a, b) => b.plays - a.plays).slice(0, 12);
export const NEW_ALBUMS: readonly Album[] = [...ALBUMS].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 12);

export const NEW_ENTRY = 99;
export const rankMove = (id: string) => {
  const r = random(`move:${id}`);
  const value = Math.floor(r() * 9) - 4;
  return value === 4 ? NEW_ENTRY : Math.max(-3, value);
};

export const SEED_HISTORY: readonly string[] = from("history", libraryTracks, 18);
export const SEED_LIKES: readonly string[] = from("likes", libraryTracks, 26);
export const SEED_FOLLOWING: readonly string[] = ["ar01", "ar03", "ar14", "ar06"];
export const SEED_SEARCHES: readonly string[] = ["비 오는 날", "새벽녘", "lofi", "ㅅㅂㄴ"];
