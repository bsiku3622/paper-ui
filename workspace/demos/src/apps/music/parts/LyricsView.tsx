// LyricsView — 재생에 맞춰 흐르는 가사. 지금 줄만 진한 잉크이고 나머지는 옅게 물러나 있습니다. 시간이 가면 지금 줄이 위에서
// 3분의 1쯤으로 올라오고, 줄을 누르면 그 시간으로 건너뜁니다. 사용자가 직접 스크롤하면 잠시 따라가지 않습니다.
//
// 곡이 바뀌면 가사를 "불러오는" 척 잠깐 기다립니다(Spinner). 몇몇 곡은 처음 한 번 불러오지 못해서 다시 시도해야 합니다.

import { useEffect, useMemo, useRef, useState } from "react";

import { Box, Button, Pressable, Spinner, Stack, Text, type BoxHeight } from "@studio-baeks/paper-ui";

import { Empty } from "../../../kit";
import { lineAt, lyricsOf } from "../data/lyrics";
import { usePlayer, usePosition } from "../state/player";

const PAUSE_AFTER_TOUCH = 3500;
const LOAD_MS = 380;

// 이 곡들은 처음에는 가사를 불러오지 못합니다. 다시 시도하면 불러옵니다.
const failsOnce = (id: string) => Number(id.slice(1)) % 37 === 0;
const retried = new Set<string>();

type Outcome = { id: string; ok: boolean };

export const LyricsView = ({ height = "full", size = "title" }: { height?: BoxHeight; size?: "title" | "heading" }) => {
  const player = usePlayer();
  const position = usePosition();
  const track = player.current;
  const lyrics = useMemo(() => (track ? lyricsOf(track) : null), [track]);

  // 처음 곡은 이미 와 있고, 곡이 바뀌면 잠깐 불러옵니다.
  const [outcome, setOutcome] = useState<Outcome | undefined>(track ? { id: track.id, ok: true } : undefined);
  useEffect(() => {
    if (!track || outcome?.id === track.id) return;
    const timer = window.setTimeout(() => setOutcome({ id: track.id, ok: !failsOnce(track.id) || retried.has(track.id) }), LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [track, outcome]);
  const status = !track ? "none" : outcome?.id !== track.id ? "loading" : outcome.ok ? "ready" : "error";

  const active = lyrics && status === "ready" ? lineAt(lyrics, position) : -1;
  const scroller = useRef<HTMLDivElement>(null);
  const lines = useRef<(HTMLElement | null)[]>([]);
  const touched = useRef(0);
  // 처음 자리 잡을 때는 바로, 그다음부터는 부드럽게 따라갑니다(페이지를 옮길 때 가사가 맨 위에서 내려오지 않게).
  const settled = useRef(false);

  // 곡이 바뀌면 맨 위에서 시작합니다.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [track?.id, status]);

  // 지금 줄이 바뀌면 위에서 3분의 1쯤에 오도록 부드럽게 올립니다.
  useEffect(() => {
    const box = scroller.current;
    const line = lines.current[active];
    if (!box || !line || Date.now() - touched.current < PAUSE_AFTER_TOUCH) return;
    const offset = line.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    box.scrollTo({ top: Math.max(0, offset - box.clientHeight / 3), behavior: settled.current ? "smooth" : "auto" });
    settled.current = true;
  }, [active, track?.id]);

  const touch = () => {
    touched.current = Date.now();
  };

  if (!track) return <Empty glyph="quote" title="재생 중인 곡이 없습니다" description="노래를 재생하면 가사가 여기에 나옵니다." />;
  if (status === "loading") return <Stack align="center" padding="3xl"><Spinner label="가사를 불러오는 중" /></Stack>;
  if (status === "error") {
    return (
      <Empty
        glyph="triangle-alert"
        title="가사를 불러오지 못했습니다"
        description="잠시 뒤에 다시 시도해 주세요."
        action={<Button size="sm" variant="hairline" onClick={() => { retried.add(track.id); setOutcome(undefined); }}>다시 시도</Button>}
      />
    );
  }
  if (!lyrics) return <Empty glyph="audio-waveform" title="가사가 없는 곡입니다" description="연주곡이라 부를 노래가 없습니다." />;

  // 단락마다 묶어서, 단락 사이는 줄 사이보다 한 걸음 더 벌어지게 합니다.
  const sections: { start: number; lines: typeof lyrics.lines }[] = [];
  lyrics.lines.forEach((line, index) => {
    if (index === 0 || lyrics.breaks.has(index)) sections.push({ start: index, lines: [] });
    sections[sections.length - 1]!.lines.push(line);
  });

  return (
    <Box ref={scroller} height={height} overflowY="auto" onWheel={touch} onTouchMove={touch} role="group" aria-label={`${track.title} 가사`}>
      <Stack gap="xl" paddingY="xl">
        {sections.map((section) => (
          <Stack key={section.start} gap="md">
            {section.lines.map((line, offset) => {
              const index = section.start + offset;
              return (
                <Pressable
                  key={index}
                  ref={(element: HTMLElement | null) => { lines.current[index] = element; }}
                  onPress={() => player.seek(line.t)}
                  aria-current={index === active ? "true" : undefined}
                >
                  <Text as="span" variant={size} ink={index === active ? "primary" : "tertiary"}>{line.text}</Text>
                </Pressable>
              );
            })}
          </Stack>
        ))}
        <Box height="xl" aria-hidden />
      </Stack>
    </Box>
  );
};
