// 보관함: 좋아요, 내 플레이리스트, 보관함에 넣은 앨범, 팔로우, 들은 기록, 최근 검색. 모두 localStorage에 남습니다.

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { NOW, useStored } from "../../../kit";
import { DEFAULT_LIBRARY } from "../data/catalog";
import { PLAYLISTS_STATIC, SEED_FOLLOWING, SEED_HISTORY, SEED_LIKES, SEED_PLAYLISTS, SEED_SEARCHES, type Playlist } from "../data/collections";
import { useSettings } from "./settings";

export const LIKED_ID = "liked";

export type NewPlaylist = { name: string; description?: string; trackIds?: readonly string[]; pinned?: boolean };
export type PlaylistPatch = Partial<Pick<Playlist, "name" | "description" | "trackIds" | "pinned">>;

type Library = {
  likes: readonly string[];
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => void;

  // 내가 만든 플레이리스트 (최근에 바꾼 순)
  playlists: readonly Playlist[];
  // 내 것, 에디터 추천, 믹스, 즐겨찾는 노래까지 아이디로 찾습니다.
  playlistById: (id: string) => Playlist | undefined;
  createPlaylist: (input: NewPlaylist) => string;
  updatePlaylist: (id: string, patch: PlaylistPatch) => void;
  deletePlaylist: (id: string) => Playlist | undefined;
  restorePlaylist: (playlist: Playlist) => void;
  addToPlaylist: (id: string, trackIds: readonly string[]) => number;
  removeFromPlaylist: (id: string, trackId: string) => void;

  albums: readonly string[];
  hasAlbum: (id: string) => boolean;
  toggleAlbum: (id: string) => void;

  following: readonly string[];
  isFollowing: (id: string) => boolean;
  toggleFollow: (id: string) => void;

  history: readonly string[];
  pushHistory: (id: string) => void;
  clearHistory: () => void;

  searches: readonly string[];
  rememberSearch: (query: string) => void;
  forgetSearch: (query: string) => void;
  clearSearches: () => void;
};

const Ctx = createContext<Library | null>(null);

// 데모의 "지금"(NOW)에서 이어서 흐르는 시각. 실제 시계를 쓰면 가짜 시간(2026년 11월 4일)보다 앞서 버립니다.
const BOOT = Date.now();
const stamp = () => NOW.getTime() + (Date.now() - BOOT);

const toggled = (list: readonly string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [id, ...list]);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const { keepHistory } = useSettings().settings;
  const [likes, setLikes] = useStored<string[]>("music:likes", () => [...SEED_LIKES]);
  const [stored, setStored] = useStored<Playlist[]>("music:playlists", () => [...SEED_PLAYLISTS]);
  const [albums, setAlbums] = useStored<string[]>("music:albums", () => [...DEFAULT_LIBRARY]);
  const [following, setFollowing] = useStored<string[]>("music:following", () => [...SEED_FOLLOWING]);
  const [history, setHistory] = useStored<string[]>("music:history", () => [...SEED_HISTORY]);
  const [searches, setSearches] = useStored<string[]>("music:searches", () => [...SEED_SEARCHES]);

  const playlists = useMemo(() => [...stored].sort((a, b) => b.updatedAt - a.updatedAt), [stored]);

  const liked = useMemo<Playlist>(
    () => ({ id: LIKED_ID, name: "즐겨찾는 노래", description: "하트를 누른 노래가 여기에 모입니다.", kind: "user", trackIds: [...likes], seed: "즐겨찾는 노래", updatedAt: NOW.getTime() }),
    [likes],
  );

  const playlistById = useCallback(
    (id: string) => (id === LIKED_ID ? liked : stored.find((item) => item.id === id) ?? PLAYLISTS_STATIC.find((item) => item.id === id)),
    [liked, stored],
  );

  const createPlaylist = useCallback((input: NewPlaylist) => {
    const id = `pl-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
    const playlist: Playlist = {
      id,
      name: input.name.trim() || "새 플레이리스트",
      description: input.description?.trim() ?? "",
      kind: "user",
      trackIds: [...(input.trackIds ?? [])],
      seed: `${input.name}·${id}`,
      updatedAt: stamp(),
      pinned: input.pinned,
    };
    setStored((now) => [playlist, ...now]);
    return id;
  }, [setStored]);

  const updatePlaylist = useCallback((id: string, patch: PlaylistPatch) => {
    setStored((now) => now.map((item) => (item.id === id ? { ...item, ...patch, name: patch.name?.trim() || item.name, updatedAt: stamp() } : item)));
  }, [setStored]);

  const deletePlaylist = useCallback((id: string) => {
    const target = stored.find((item) => item.id === id);
    if (target) setStored((now) => now.filter((item) => item.id !== id));
    return target;
  }, [stored, setStored]);

  const restorePlaylist = useCallback((playlist: Playlist) => setStored((now) => (now.some((item) => item.id === playlist.id) ? now : [playlist, ...now])), [setStored]);

  // 이미 들어 있는 곡은 건너뛰고, 새로 들어간 곡의 수를 돌려줍니다.
  const addToPlaylist = useCallback((id: string, trackIds: readonly string[]) => {
    const target = stored.find((item) => item.id === id);
    if (!target) return 0;
    const fresh = trackIds.filter((trackId, index) => !target.trackIds.includes(trackId) && trackIds.indexOf(trackId) === index);
    if (fresh.length) setStored((now) => now.map((item) => (item.id === id ? { ...item, trackIds: [...item.trackIds, ...fresh.filter((trackId) => !item.trackIds.includes(trackId))], updatedAt: stamp() } : item)));
    return fresh.length;
  }, [stored, setStored]);

  const removeFromPlaylist = useCallback((id: string, trackId: string) => {
    setStored((now) => now.map((item) => (item.id === id ? { ...item, trackIds: item.trackIds.filter((value) => value !== trackId), updatedAt: stamp() } : item)));
  }, [setStored]);

  // 설정에서 재생 기록을 끄면 남기지 않습니다.
  const pushHistory = useCallback((id: string) => {
    if (keepHistory) setHistory((now) => [id, ...now.filter((item) => item !== id)].slice(0, 60));
  }, [setHistory, keepHistory]);
  const rememberSearch = useCallback((query: string) => {
    const text = query.trim();
    if (text) setSearches((now) => [text, ...now.filter((item) => item !== text)].slice(0, 8));
  }, [setSearches]);

  const value = useMemo<Library>(() => ({
    likes,
    isLiked: (id) => likes.includes(id),
    toggleLike: (id) => setLikes((now) => toggled(now, id)),
    playlists,
    playlistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    restorePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    albums,
    hasAlbum: (id) => albums.includes(id),
    toggleAlbum: (id) => setAlbums((now) => toggled(now, id)),
    following,
    isFollowing: (id) => following.includes(id),
    toggleFollow: (id) => setFollowing((now) => toggled(now, id)),
    history,
    pushHistory,
    clearHistory: () => setHistory([]),
    searches,
    rememberSearch,
    forgetSearch: (query) => setSearches((now) => now.filter((item) => item !== query)),
    clearSearches: () => setSearches([]),
  }), [likes, playlists, playlistById, createPlaylist, updatePlaylist, deletePlaylist, restorePlaylist, addToPlaylist, removeFromPlaylist, albums, following, history, pushHistory, searches, rememberSearch, setLikes, setAlbums, setFollowing, setHistory, setSearches]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useLibrary = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error("useLibrary needs LibraryProvider");
  return value;
};
