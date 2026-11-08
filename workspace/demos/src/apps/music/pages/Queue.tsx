// 다음 곡: 이미 들은 곡, 지금 곡, 다음 곡. 셔플 · 반복 · 자동 재생과 "플레이리스트로 저장"이 있습니다.

import { Button, Inline, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { Glyph, PageHeader } from "../../../kit";
import { TRACK_BY_ID, spoken, totalDuration, type Track } from "../data/catalog";
import { QueueList } from "../parts/QueueList";
import { useDialogs } from "../state/dialogs";
import { usePlayer } from "../state/player";
import { useSettings } from "../state/settings";

const REPEAT_LABEL = { off: "반복 끔", all: "전체 반복", one: "한 곡 반복" } as const;

export const QueuePage = () => {
  const player = usePlayer();
  const dialogs = useDialogs();
  const { settings, set } = useSettings();
  const upcoming = player.queue.slice(player.index + 1).map((id) => TRACK_BY_ID.get(id)).filter((track): track is Track => track !== undefined);

  return (
    <>
      <PageHeader
        title="다음 곡"
        description={upcoming.length > 0 ? `${upcoming.length}곡 · ${spoken(totalDuration(upcoming))}` : "다음 곡이 없습니다"}
        actions={
          <Inline gap="sm" wrap>
            <Button variant={player.shuffle ? "soft" : "hairline"} aria-pressed={player.shuffle} onClick={player.toggleShuffle}><Glyph name="shuffle" />셔플</Button>
            <Button variant={player.repeat === "off" ? "hairline" : "soft"} aria-pressed={player.repeat !== "off"} onClick={player.cycleRepeat}><Glyph name={player.repeat === "one" ? "repeat-1" : "repeat"} />{REPEAT_LABEL[player.repeat]}</Button>
            <Button variant="hairline" disabled={player.queue.length === 0} onClick={() => dialogs.editPlaylist(undefined, player.queue)}><Glyph name="list-plus" />플레이리스트로 저장</Button>
          </Inline>
        }
      />
      <Stack maxWidth="measure.lg" gap="xl">
        <QueueList history />
        <Stack as="label" gap="xs">
          <Inline gap="lg" justify="between" align="center">
            <Text as="span" strong>자동 재생</Text>
            <Switch checked={settings.autoplay} onChange={(event) => set({ autoplay: event.target.checked })} />
          </Inline>
          <Text as="span" variant="caption" ink="tertiary">다음 곡이 끝나면 비슷한 곡을 이어서 재생합니다.</Text>
        </Stack>
      </Stack>
    </>
  );
};
