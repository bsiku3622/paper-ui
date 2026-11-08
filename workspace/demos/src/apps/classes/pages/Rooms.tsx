import { useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Badge, Button, Grid, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, PageHeader, Stat, StatRow } from "../../../kit";
import { DAY_LABEL, DAYS, slotKey } from "../data/periods";
import { termIndex } from "../lib";
import { koreanName } from "../lib/utils";
import { path, useClasses } from "../state";
import { Card, Eyebrow, Hint, SlotGrid, type Slot } from "../ui/parts";
import { termLabel } from "../data/build";

const FLOORS: Record<number, string[]> = {
  34: ["형3401", "형3402", "형3403", "형3404", "형3405", "형3406", "형3407"],
  33: ["형3301", "형3302", "형3303", "형3304", "형3305", "형3306", "형3307"],
  32: ["형3201", "형3202", "형3203", "형3204", "형3205", "형3206", "형3207"],
  31: ["형3101", "형3102", "형3103", "형3104", "형3105", "형3106", "형3107"],
};
const LABEL: Record<string, string> = {
  형3101: "학부사무실", 형3102: "협의회실", 형3103: "교원연구실", 형3104: "교원연구실", 형3105: "교원연구실", 형3106: "보건실", 형3107: "심리상담실",
  형3201: "허브실", 형3301: "교원연구실", 형3401: "교원연구실",
};
const labelOf = (room: string) => LABEL[room] ?? "교실";
const FLOOR_ORDER = [34, 33, 32, 31];

export const RoomsPage = () => {
  const { data, term } = useClasses();
  const [params] = useSearchParams();
  const [times, setTimes] = useState<string[]>(() => (params.get("times") ?? "").split(",").filter(Boolean));
  const [room, setRoom] = useState<string | null>(params.get("room"));

  const index = useMemo(() => termIndex(data), [data]);
  const busy = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const [name, placed] of index.rooms) map.set(name, new Set(placed.map((item) => slotKey(item.day, item.period))));
    return map;
  }, [index]);
  const isFree = (name: string) => times.every((key) => !busy.get(name)?.has(key));
  const classrooms = Object.values(FLOORS).flat().filter((name) => labelOf(name) === "교실");
  const freeNow = times.length === 0 ? classrooms.length : classrooms.filter(isFree).length;

  const toggleTime = (key: string) => {
    if (room) return;
    setTimes((now) => (now.includes(key) ? now.filter((item) => item !== key) : [...now, key]));
  };
  const reset = () => {
    setTimes([]);
    setRoom(null);
  };

  const roomPlaced = room ? (index.rooms.get(room) ?? []) : [];

  return (
    <>
      <PageHeader
        eyebrow={`${termLabel(term)}학기 · 형설관`}
        title="빈 강의실"
        description="비어 있어야 하는 시간을 고르면 그때 비는 교실이 지도에 나타납니다. 교실을 누르면 그 교실의 한 주를 봅니다."
        actions={<Button variant="hairline" onClick={reset} disabled={times.length === 0 && room === null}><Glyph name="refresh-cw" />선택 비우기</Button>}
      />

      <StatRow>
        <Stat label="교실" value={classrooms.length} unit="개" note="형설관 2–4층" />
        <Stat label={times.length ? "그 시간에 비는 교실" : "고른 시간"} value={times.length ? freeNow : 0} unit={times.length ? "개" : "교시"} note={times.length ? `${times.length}교시를 골랐습니다` : "시간표에서 고르세요"} tone={times.length && freeNow === 0 ? "warning" : undefined} />
        <Stat label="선택한 교실" value={room ?? "없음"} note={room ? `주 ${roomPlaced.length}교시 사용` : "지도에서 고르세요"} />
      </StatRow>

      <Grid columns={{ base: 1, lg: "minmax(0, 5fr) minmax(0, 7fr)" }} gap="xl" align="start">
        <Card
          title={room ? `${room}의 한 주` : "시간 고르기"}
          description={room ? "사용 중인 교시에는 과목이 적혀 있습니다." : "눌러서 고르고, 다시 누르면 뺍니다."}
          actions={room ? <Button as={RouterLink} to={path(`/search?q=${encodeURIComponent(`room:${room}`)}`)} variant="hairline" size="sm"><Glyph name="search" />검색에서 보기</Button> : null}
        >
          <SlotGrid
            label={room ? `${room} 주간 시간표` : "빈 시간을 고를 시간표"}
            rowHeight="2.25rem"
            cell={(day, period): Slot | undefined => {
              const key = slotKey(day, period);
              if (room) {
                const used = roomPlaced.find((item) => item.day === day && item.period === period);
                return used ? { text: koreanName(used.subject), tone: "plain" } : { tone: "success" };
              }
              const on = times.includes(key);
              return { tone: on ? "strong" : "plain", selected: on, onPress: () => toggleTime(key), hint: `${DAY_LABEL[day]} ${period}교시 ${on ? "빼기" : "고르기"}` };
            }}
          />
          <Hint>{room ? "초록색 칸이 비어 있는 시간입니다." : "여러 칸을 고르면 그 시간 모두에 비어 있는 교실만 남습니다."}</Hint>
        </Card>

        <Card title="형설관 층별 지도" description={times.length ? `고른 ${times.length}교시에 모두 비어 있는 교실에 점이 찍힙니다.` : "교실을 누르면 그 교실의 시간표를 봅니다."}>
          <Stack gap="lg">
            {FLOOR_ORDER.map((floor) => (
              <Stack key={floor} gap="sm">
                <Eyebrow>{String(floor).slice(1)}층</Eyebrow>
                <Grid columns={{ base: 4, sm: 7 }} gap="sm">
                  {[...FLOORS[floor]!].reverse().map((name) => {
                    const classroom = labelOf(name) === "교실";
                    const free = classroom && times.length > 0 && isFree(name);
                    const selected = room === name;
                    const dim = !classroom || (times.length > 0 && !free) || (room !== null && !selected);
                    return (
                      <Surface
                        key={name}
                        as={Pressable}
                        border
                        radius="md"
                        padding="sm"
                        hoverable={classroom}
                        selected={selected || free}
                        disabled={!classroom || times.length > 0}
                        onPress={() => setRoom((now) => (now === name ? null : name))}
                        aria-pressed={selected}
                        aria-label={`${name} ${labelOf(name)}${free ? ", 비어 있음" : ""}`}
                      >
                        <Stack as="span" gap="xs" align="center">
                          <Inline as="span" gap="xs" align="center">
                            <Text as="span" strong={selected} ink={dim && !selected ? "tertiary" : "primary"} numeric>{name}</Text>
                            {free ? <Badge dot accent="success" variant="soft" size="xs" aria-label="비어 있음" /> : null}
                          </Inline>
                          <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{labelOf(name)}</Text>
                        </Stack>
                      </Surface>
                    );
                  })}
                </Grid>
              </Stack>
            ))}
          </Stack>
          <Inline gap="lg" wrap>
            <Inline gap="xs" align="center"><Badge dot accent="success" variant="soft" size="xs" aria-label="" /><Text as="span" variant="caption" ink="secondary">고른 시간에 비어 있음</Text></Inline>
            <Inline gap="xs" align="center"><Text as="span" variant="caption" ink="tertiary">흐린 칸 — 사용 중이거나 교실이 아님</Text></Inline>
            <Inline gap="xs" align="center"><Text as="span" variant="caption" ink="secondary">{DAYS.length}일 × 11교시 중 {times.length}교시 선택</Text></Inline>
          </Inline>
        </Card>
      </Grid>
    </>
  );
};
