// 그림: 곡 · 앨범 · 아티스트 · 플레이리스트의 표지. 모두 kit의 Art를 시드로 그린 것입니다.

import { Art, Avatar } from "../../../kit";
import { ALBUM_BY_ID, type Album, type Artist, type Track } from "../data/catalog";
import type { Playlist } from "../data/collections";

const trackSeed = (track: Track) => ALBUM_BY_ID.get(track.albumId)!.seed;

export const AlbumArt = ({ album, label }: { album: Album; label?: string }) => <Art seed={album.seed} kind="cover" radius="md" label={label} />;
export const PlaylistArt = ({ playlist, label }: { playlist: Playlist; label?: string }) => <Art seed={playlist.seed} kind="cover" radius="md" label={label} />;
export const ArtistArt = ({ artist, label }: { artist: Artist; label?: string }) => <Art seed={artist.seed} kind="cover" radius="full" label={label} />;

// 목록의 작은 표지 (컨트롤 크기의 네모).
export const TrackThumb = ({ track, size = "md" }: { track: Track; size?: "xs" | "sm" | "md" | "lg" }) => (
  <Avatar name={track.title} size={size} square picture={<Art seed={trackSeed(track)} radius="none" />} />
);

export const SmallArt = ({ seed, name, size = "xs", round = false }: { seed: string; name: string; size?: "xs" | "sm" | "md" | "lg"; round?: boolean }) => (
  <Avatar name={name} size={size} square={!round} picture={<Art seed={seed} radius="none" />} />
);
