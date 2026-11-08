import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Box, Button, Divider, Grid, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Menu, SurfaceLink, Tabs, formatDate, formatDuration, formatNumber } from "../../../kit";
import { Slider } from "../content/Slider";
import { ALBUM_BY_ID, ARTIST_BY_ID, formatTrackCount, genreName } from "../data/catalog";
import { AlbumArt } from "../parts/pictures";
import { LyricsView } from "../parts/LyricsView";
import { QueueList } from "../parts/QueueList";
import { useDialogs } from "../state/dialogs";
import { useLibrary } from "../state/library";
import { usePlayer, usePosition } from "../state/player";

const Seek = () => {
  const player = usePlayer();
  const position = usePosition();
  const track = player.current!;
  return (
    <Stack gap="xs">
      <Slider label="재생 위치" value={position} max={track.duration} step="any" onChange={player.seek} valueText={`${formatDuration(position)} / ${formatDuration(track.duration)}`} />
      <Inline justify="between">
        <Text as="span" variant="caption" ink="tertiary" numeric>{formatDuration(position)}</Text>
        <Text as="span" variant="caption" ink="tertiary" numeric>-{formatDuration(track.duration - position)}</Text>
      </Inline>
    </Stack>
  );
};

const Info = () => {
  const player = usePlayer();
  const track = player.current!;
  const album = ALBUM_BY_ID.get(track.albumId)!;
  const artist = ARTIST_BY_ID.get(track.artistId)!;
  const rows: [string, string][] = [
    ["아티스트", artist.name],
    ["앨범", `${album.title}${album.kind === "EP" ? " (EP)" : ""}`],
    ["장르", genreName(album.genre)],
    ["발매", formatDate(album.date, true)],
    ["수록", `${track.n} / ${formatTrackCount(album.trackIds.length)}`],
    ["길이", formatDuration(track.duration)],
    ["재생 수", `${formatNumber(track.plays)}회`],
    ["언어", track.instrumental ? "연주곡" : track.lang === "ko" ? "한국어" : "영어"],
  ];
  return (
    <Stack as="ul" aria-label="곡 정보" maxWidth="measure.xs">
      {rows.map(([label, value], index) => (
        <Stack as="li" key={label}>
          {index > 0 ? <Divider aria-hidden /> : null}
          <Inline justify="between" gap="lg" paddingY="md">
            <Text as="span" ink="tertiary">{label}</Text>
            <Text as="span" truncate>{value}</Text>
          </Inline>
        </Stack>
      ))}
    </Stack>
  );
};

export const NowPlayingPage = () => {
  const player = usePlayer();
  const library = useLibrary();
  const dialogs = useDialogs();
  const navigate = useNavigate();
  const [tab, setTab] = useState("lyrics");
  const track = player.current;

  if (!track) {
    return <Empty glyph="music" title="재생 중인 곡이 없습니다" description="노래를 재생하면 여기에 크게 나옵니다." action={<Button as={RouterLink} to="/music" variant="hairline" size="sm">지금 듣기로</Button>} />;
  }

  const album = ALBUM_BY_ID.get(track.albumId)!;
  const artist = ARTIST_BY_ID.get(track.artistId)!;
  const liked = library.isLiked(track.id);
  const level = player.muted ? 0 : player.volume;

  return (
    <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 6fr)" }} gap="3xl" align="start">
      <Stack gap="xl" minWidth={0}>
        <Inline justify="between">
          <Button as={RouterLink} to="/music" variant="ghost" size="sm"><Glyph name="chevron-down" />닫기</Button>
          <Menu
            label="더 보기"
            items={[
              { id: "add", label: "플레이리스트에 추가", glyph: "list-plus", onSelect: () => dialogs.addToPlaylist([track.id]) },
              { id: "album", label: "앨범으로 이동", glyph: "disc-3", onSelect: () => navigate(`/music/album/${album.id}`) },
              { id: "artist", label: "아티스트로 이동", glyph: "mic-vocal", onSelect: () => navigate(`/music/artist/${artist.id}`) },
            ]}
          />
        </Inline>
        <Stack maxWidth="measure.xs" gap="xl">
          <AlbumArt album={album} label={`${album.title} 표지`} />
          <Inline justify="between" gap="md" align="start">
            <Stack minWidth={0}>
              <Text as="h1" variant="display" truncate>{track.title}</Text>
              <Stack><SurfaceLink to={`/music/artist/${artist.id}`} radius="sm" aria-label={`${artist.name} 아티스트`}><Text as="span" variant="lead" ink="secondary" truncate>{artist.name}</Text></SurfaceLink></Stack>
            </Stack>
            <IconButton variant={liked ? "soft" : "ghost"} aria-label={liked ? "좋아요 취소" : "좋아요"} aria-pressed={liked} onClick={() => library.toggleLike(track.id)}><Glyph name="heart" /></IconButton>
          </Inline>
          <Seek />
          <Inline justify="between">
            <IconButton variant={player.shuffle ? "soft" : "ghost"} aria-label="셔플" aria-pressed={player.shuffle} onClick={player.toggleShuffle}><Glyph name="shuffle" /></IconButton>
            <IconButton variant="ghost" size="lg" aria-label="이전 곡" onClick={player.previous}><Glyph name="skip-back" /></IconButton>
            <IconButton size="lg" shape="pill" aria-label={player.playing ? "일시정지" : "재생"} onClick={player.toggle}><Glyph name={player.playing ? "pause" : "play"} /></IconButton>
            <IconButton variant="ghost" size="lg" aria-label="다음 곡" onClick={player.next}><Glyph name="skip-forward" /></IconButton>
            <IconButton variant={player.repeat === "off" ? "ghost" : "soft"} aria-label={player.repeat === "one" ? "반복: 한 곡" : player.repeat === "all" ? "반복: 전체" : "반복 끔"} aria-pressed={player.repeat !== "off"} onClick={player.cycleRepeat}><Glyph name={player.repeat === "one" ? "repeat-1" : "repeat"} /></IconButton>
          </Inline>
          <Inline gap="md">
            <IconButton variant="ghost" size="sm" aria-label={player.muted ? "음소거 해제" : "음소거"} onClick={player.toggleMute}><Glyph name={level === 0 ? "volume-x" : level < 0.4 ? "volume-1" : "volume-2"} /></IconButton>
            <Box width="full"><Slider label="볼륨" value={Math.round(level * 100)} max={100} onChange={(value) => player.setVolume(value / 100)} valueText={`${Math.round(level * 100)}%`} /></Box>
          </Inline>
        </Stack>
      </Stack>
      <Stack gap="lg" minWidth={0}>
        <Tabs label="재생 화면" value={tab} onChange={setTab} items={[{ id: "lyrics", label: "가사" }, { id: "queue", label: "다음 곡", count: Math.max(0, player.queue.length - player.index - 1) }, { id: "info", label: "곡 정보" }]} />
        {tab === "lyrics" ? <LyricsView height="viewport" /> : null}
        {tab === "queue" ? <QueueList /> : null}
        {tab === "info" ? <Info /> : null}
      </Stack>
    </Grid>
  );
};
