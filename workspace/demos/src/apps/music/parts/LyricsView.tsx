import { useEffect, useMemo, useRef, useState } from "react";

import { Box, Button, Pressable, Spinner, Stack, Text, type BoxHeight } from "@studio-baeks/paper-ui";

import { Empty } from "../../../kit";
import { lineAt, lyricsOf } from "../data/lyrics";
import { usePlayer, usePosition } from "../state/player";

const PAUSE_AFTER_TOUCH = 3500;
const LOAD_MS = 380;

const failsOnce = (id: string) => Number(id.slice(1)) % 37 === 0;
const retried = new Set<string>();

type Outcome = { id: string; ok: boolean };

export const LyricsView = ({ height = "full", size = "title" }: { height?: BoxHeight; size?: "title" | "heading" }) => {
  const player = usePlayer();
  const position = usePosition();
  const track = player.current;
  const lyrics = useMemo(() => (track ? lyricsOf(track) : null), [track]);

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
  const settled = useRef(false);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [track?.id, status]);

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
