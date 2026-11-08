// 미니 플레이어: 페이지 아래에 떠 있는 알약. 셔플 · 이전 · 재생 · 다음 · 반복, 지금 곡과 진행 막대, 가사 · 다음 곡 · 볼륨.
// 표지와 제목을 누르면 재생 화면이 열립니다. 좁은 화면에서는 재생과 다음만 남습니다.

import { Link as RouterLink } from "react-router-dom";

import { Box, Divider, Floating, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, SurfaceLink, formatDuration } from "../../../kit";
import { Dock } from "../content/Dock";
import { Slider } from "../content/Slider";
import { ALBUM_BY_ID, ARTIST_BY_ID } from "../data/catalog";
import { TrackThumb } from "../parts/pictures";
import { useLibrary } from "../state/library";
import { usePlayer, usePosition } from "../state/player";
import { useSettings } from "../state/settings";

const Volume = () => {
  const player = usePlayer();
  const level = player.muted ? 0 : player.volume;
  const glyph = level === 0 ? "volume-x" : level < 0.4 ? "volume-1" : "volume-2";
  return (
    <Floating>
      <IconButton as={Floating.Trigger} variant="ghost" size="sm" aria-label="볼륨"><Glyph name={glyph} /></IconButton>
      <Floating.Content as={Surface} fill="raised" border radius="md" padding="md" placement="top" aria-label="볼륨 조절">
        <Inline gap="md">
          <IconButton variant="ghost" size="xs" aria-label={player.muted ? "음소거 해제" : "음소거"} onClick={player.toggleMute}><Glyph name={glyph} /></IconButton>
          <Box width="md"><Slider label="볼륨" value={Math.round(level * 100)} max={100} onChange={(value) => player.setVolume(value / 100)} valueText={`${Math.round(level * 100)}%`} /></Box>
        </Inline>
      </Floating.Content>
    </Floating>
  );
};

export const MiniPlayer = ({ aside }: { aside: boolean }) => {
  const player = usePlayer();
  const position = usePosition();
  const library = useLibrary();
  const { settings, set } = useSettings();
  const track = player.current;

  if (!track) {
    return (
      <Dock aside={aside}>
        <Surface as="section" aria-label="재생기" fill="raised" border radius="full" elevation="overlay" paddingX="xl" paddingY="md">
          <Text ink="tertiary">재생 중인 곡이 없습니다. 노래를 눌러 시작하세요.</Text>
        </Surface>
      </Dock>
    );
  }

  const album = ALBUM_BY_ID.get(track.albumId)!;
  const artist = ARTIST_BY_ID.get(track.artistId)!;
  const liked = library.isLiked(track.id);
  const pane = (next: "lyrics" | "queue") => set({ pane: settings.pane === next ? "none" : next });

  return (
    <Dock aside={aside}>
      <Surface as="section" aria-label="재생기" fill="raised" border radius="full" elevation="overlay" paddingX="md" paddingY="sm">
        <Grid columns="auto minmax(0, 1fr) auto" gap="md" align="center">
          <Inline gap="xs">
            <Box hideBelow="md">
              <IconButton variant={player.shuffle ? "soft" : "ghost"} size="sm" aria-label="셔플" aria-pressed={player.shuffle} onClick={player.toggleShuffle}><Glyph name="shuffle" /></IconButton>
            </Box>
            <Box hideBelow="sm"><IconButton variant="ghost" size="sm" aria-label="이전 곡" onClick={player.previous}><Glyph name="skip-back" /></IconButton></Box>
            <IconButton shape="pill" aria-label={player.playing ? "일시정지" : "재생"} onClick={player.toggle}><Glyph name={player.playing ? "pause" : "play"} /></IconButton>
            <IconButton variant="ghost" size="sm" aria-label="다음 곡" onClick={player.next}><Glyph name="skip-forward" /></IconButton>
            <Box hideBelow="md">
              <IconButton variant={player.repeat === "off" ? "ghost" : "soft"} size="sm" aria-label={player.repeat === "one" ? "반복: 한 곡" : player.repeat === "all" ? "반복: 전체" : "반복 끔"} aria-pressed={player.repeat !== "off"} onClick={player.cycleRepeat}>
                <Glyph name={player.repeat === "one" ? "repeat-1" : "repeat"} />
              </IconButton>
            </Box>
          </Inline>
          <Stack gap="xs" minWidth={0}>
            <SurfaceLink to="/music/now-playing" radius="md" paddingX="xs" aria-label={`${track.title}, ${artist.name}. 재생 화면 열기`}>
              <Inline gap="md" minWidth={0}>
                <TrackThumb track={track} />
                <Stack minWidth={0}>
                  <Text as="span" strong truncate>{track.title}</Text>
                  <Text as="span" variant="caption" ink="tertiary" truncate>{artist.name} — {album.title}</Text>
                </Stack>
              </Inline>
            </SurfaceLink>
            <Grid columns="auto minmax(0, 1fr) auto" gap="sm" align="center">
              <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{formatDuration(position)}</Text>
              <Slider bare label="재생 위치" value={position} max={track.duration} step="any" onChange={player.seek} valueText={`${formatDuration(position)} / ${formatDuration(track.duration)}`} />
              <Text as="span" variant="label" strong={false} ink="tertiary" numeric>-{formatDuration(track.duration - position)}</Text>
            </Grid>
          </Stack>
          <Inline gap="xs">
            <IconButton variant={liked ? "soft" : "ghost"} size="sm" aria-label={liked ? "좋아요 취소" : "좋아요"} aria-pressed={liked} onClick={() => library.toggleLike(track.id)}><Glyph name="heart" /></IconButton>
            <Box hideBelow="lg">
              <Inline gap="xs">
                <Divider orientation="vertical" aria-hidden />
                <IconButton variant={settings.pane === "lyrics" ? "soft" : "ghost"} size="sm" aria-label="가사" aria-pressed={settings.pane === "lyrics"} onClick={() => pane("lyrics")}><Glyph name="message-square-quote" /></IconButton>
                <IconButton variant={settings.pane === "queue" ? "soft" : "ghost"} size="sm" aria-label="다음 곡" aria-pressed={settings.pane === "queue"} onClick={() => pane("queue")}><Glyph name="list-music" /></IconButton>
              </Inline>
            </Box>
            <Box hideBelow="md"><Volume /></Box>
            <Box hideBelow="md"><IconButton as={RouterLink} to="/music/now-playing" variant="ghost" size="sm" aria-label="재생 화면"><Glyph name="maximize-2" /></IconButton></Box>
          </Inline>
        </Grid>
      </Surface>
    </Dock>
  );
};
