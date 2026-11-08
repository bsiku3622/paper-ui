import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Divider, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Menu, formatDuration, type MenuItem } from "../../../kit";
import { ARTIST_BY_ID, TRACK_BY_ID, type Track } from "../data/catalog";
import { useLibrary } from "../state/library";
import { usePlayer } from "../state/player";
import { TrackThumb } from "./pictures";
import { Reorder } from "./Reorder";

type RowProps = { track: Track; at: number; current?: boolean; compact: boolean };

const Row = ({ track, at, current = false, compact }: RowProps) => {
  const player = usePlayer();
  const library = useLibrary();
  const first = player.index + 1;
  const last = player.queue.length - 1;
  const liked = library.isLiked(track.id);

  const items: MenuItem[] = [
    { id: "jump", label: current ? "처음부터 재생" : "지금 재생", glyph: "play", onSelect: () => player.jump(at) },
    { id: "like", label: liked ? "좋아요 취소" : "좋아요", glyph: liked ? "heart-off" : "heart", onSelect: () => library.toggleLike(track.id) },
  ];
  if (!current) {
    items.push(
      { id: "d1", divider: true },
      { id: "top", label: "맨 위로", glyph: "arrow-up", disabled: at <= first, onSelect: () => player.move(at, first) },
      { id: "up", label: "위로", glyph: "chevron-up", disabled: at <= first, onSelect: () => player.move(at, at - 1) },
      { id: "down", label: "아래로", glyph: "chevron-down", disabled: at >= last, onSelect: () => player.move(at, at + 1) },
      { id: "d2", divider: true },
      { id: "remove", label: "대기열에서 빼기", glyph: "x", danger: true, onSelect: () => player.removeAt(at) },
    );
  }

  const body = (
    <Inline gap="md" justify="between">
      <Inline gap="md" minWidth={0}>
        <Pressable onPress={() => player.jump(at)} aria-label={`${track.title} 재생`}><Inline><TrackThumb track={track} size={compact ? "sm" : "md"} /></Inline></Pressable>
        <Stack minWidth={0}>
          <Text as="span" strong={current} truncate>{track.title}</Text>
          <Text as="span" variant="caption" ink="tertiary" truncate>{ARTIST_BY_ID.get(track.artistId)!.name}</Text>
        </Stack>
      </Inline>
      <Inline gap="xs">
        {compact ? null : <Text as="span" ink="secondary" numeric>{formatDuration(track.duration)}</Text>}
        <Menu label={`${track.title} 더 보기`} items={items} size="xs" />
      </Inline>
    </Inline>
  );

  if (current || at < player.index) {
    return <Surface hoverable selected={current} radius="md" paddingX="sm" paddingY="xs">{body}</Surface>;
  }
  return (
    <Reorder list="queue" index={at} label={track.title} onMove={player.move}>
      <Box paddingY="xs">{body}</Box>
    </Reorder>
  );
};

type Props = {
  compact?: boolean;
  history?: boolean;
};

export const QueueList = ({ compact = false, history = false }: Props) => {
  const player = usePlayer();
  const entries = player.queue.flatMap((id, at) => {
    const track = TRACK_BY_ID.get(id);
    return track ? [{ track, at }] : [];
  });
  const now = entries.find((entry) => entry.at === player.index);
  const upcoming = entries.filter((entry) => entry.at > player.index);
  const past = entries.filter((entry) => entry.at < player.index);

  if (!now) return <Empty glyph="list-music" title="대기열이 비어 있습니다" description="곡의 더 보기에서 '다음에 재생'을 고르면 여기에 쌓입니다." />;

  return (
    <Stack gap="lg">
      {history && past.length > 0 ? (
        <Stack gap="xs" as="section" aria-label="이전에 재생한 곡">
          <Text as="h2" variant="label" strong={false} ink="tertiary">이전에 재생한 곡</Text>
          {past.map((entry) => <Row key={`${entry.track.id}-${entry.at}`} track={entry.track} at={entry.at} compact={compact} />)}
        </Stack>
      ) : null}
      <Stack gap="xs" as="section" aria-label="지금 재생 중">
        <Text as="h2" variant="label" strong={false} ink="tertiary">지금 재생 중</Text>
        <Row track={now.track} at={now.at} current compact={compact} />
      </Stack>
      <Stack gap="xs" as="section" aria-label="다음 곡">
        <Inline justify="between" align="center">
          <Text as="h2" variant="label" strong={false} ink="tertiary">다음 곡 {upcoming.length > 0 ? upcoming.length : ""}</Text>
          {upcoming.length > 0 ? <Button size="xs" variant="ghost" onClick={player.clearUpNext}>비우기</Button> : null}
        </Inline>
        {upcoming.length === 0 ? (
          <Box paddingY="lg"><Text ink="tertiary">다음 곡이 없습니다.{player.repeat === "off" ? " 자동 재생이 켜져 있으면 비슷한 곡을 이어서 틉니다." : ""}</Text></Box>
        ) : (
          <Stack>
            {upcoming.map((entry, index) => (
              <Box key={`${entry.track.id}-${entry.at}`}>
                {index > 0 ? <Divider aria-hidden /> : null}
                <Row track={entry.track} at={entry.at} compact={compact} />
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
      {compact ? <Button as={RouterLink} to="/music/queue" variant="ghost" size="sm">대기열 전체 보기<Glyph name="chevron-right" /></Button> : null}
    </Stack>
  );
};
