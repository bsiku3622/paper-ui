// TrackMenu — 곡 하나의 "더 보기". 재생 · 다음에 재생 · 좋아요 · 플레이리스트에 추가 · 앨범과 아티스트로 이동.

import { useNavigate } from "react-router-dom";

import { Menu, useToast, type MenuItem } from "../../../kit";
import type { Track } from "../data/catalog";
import type { Playlist } from "../data/collections";
import { josa } from "../data/josa";
import { useDialogs } from "../state/dialogs";
import { useLibrary } from "../state/library";
import { usePlayer } from "../state/player";

type Props = {
  track: Track;
  // 이 곡을 재생할 때 대기열이 될 목록.
  context: readonly string[];
  // 이 곡이 들어 있는 내 플레이리스트: 있으면 "빼기"가 생깁니다.
  playlist?: Playlist;
  size?: "xs" | "sm";
};

export const TrackMenu = ({ track, context, playlist, size = "sm" }: Props) => {
  const navigate = useNavigate();
  const toast = useToast();
  const player = usePlayer();
  const library = useLibrary();
  const dialogs = useDialogs();
  const liked = library.isLiked(track.id);
  const editable = playlist !== undefined && playlist.kind === "user" && playlist.id !== "liked";

  const items: MenuItem[] = [
    { id: "play", label: "재생", glyph: "play", onSelect: () => player.playTrack(track.id, context) },
    { id: "next", label: "다음에 재생", glyph: "list-start", onSelect: () => player.playNext([track.id]) },
    { id: "later", label: "나중에 재생", glyph: "list-end", onSelect: () => player.playLater([track.id]) },
    { id: "d1", divider: true },
    { id: "like", label: liked ? "좋아요 취소" : "좋아요", glyph: liked ? "heart-off" : "heart", onSelect: () => { library.toggleLike(track.id); toast(liked ? "좋아요를 취소했습니다" : "좋아요를 눌렀습니다"); } },
    { id: "add", label: "플레이리스트에 추가", glyph: "list-plus", onSelect: () => dialogs.addToPlaylist([track.id]) },
    { id: "d2", divider: true },
    { id: "album", label: "앨범으로 이동", glyph: "disc-3", onSelect: () => navigate(`/music/album/${track.albumId}`) },
    { id: "artist", label: "아티스트로 이동", glyph: "mic-vocal", onSelect: () => navigate(`/music/artist/${track.artistId}`) },
  ];
  if (editable) {
    items.push(
      { id: "d3", divider: true },
      {
        id: "remove",
        label: "이 플레이리스트에서 빼기",
        glyph: "trash-2",
        danger: true,
        onSelect: () => {
          const before = playlist.trackIds;
          library.removeFromPlaylist(playlist.id, track.id);
          toast(`'${track.title}'${josa(track.title, "을/를")} 뺐습니다`, { action: { label: "되돌리기", onSelect: () => library.updatePlaylist(playlist.id, { trackIds: before }) } });
        },
      },
    );
  }

  return <Menu label={`${track.title} 더 보기`} items={items} size={size} />;
};
