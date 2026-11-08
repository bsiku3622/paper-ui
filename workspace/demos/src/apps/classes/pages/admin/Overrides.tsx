import { useState } from "react";

import { Badge, Button, Field, FormField, Grid, IconButton, Inline, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, useToast } from "../../../../kit";
import type { Override } from "../../data/admin";
import { DAY_FULL, DAYS, type Day } from "../../data/periods";
import { weekdayOf } from "../../lib/utils";
import { useClasses } from "../../state";
import { Card } from "../../ui/parts";
import { Mono, nextId } from "./parts";
import { useAdmin } from "./store";

export const OverridesPanel = () => {
  const { clock } = useClasses();
  const { overrides, setOverrides } = useAdmin();
  const toast = useToast();
  const [date, setDate] = useState("");
  const [day, setDay] = useState<Day>("MON");
  const [title, setTitle] = useState("");

  const taken = date !== "" && overrides.some((item) => item.date === date);
  const ready = date !== "" && title.trim() !== "" && !taken;
  const rows = [...overrides].sort((a, b) => b.date.localeCompare(a.date));

  const add = () => {
    if (!ready) return;
    setOverrides((list) => [...list, { id: nextId(list), date, sourceDay: day, title: title.trim() }]);
    setDate("");
    setTitle("");
    toast("대체 시간표를 등록했습니다");
  };
  const remove = (target: Override) => {
    const before = overrides;
    setOverrides((list) => list.filter((item) => item.id !== target.id));
    toast("대체 시간표를 지웠습니다", { action: { label: "되돌리기", onSelect: () => setOverrides(before) } });
  };

  return (
    <Card
      title="대체 시간표"
      description="정해 둔 날짜에 다른 요일의 정규 시간표를 적용합니다. 보강일이나 토요일 수업이 이런 날입니다. 날짜마다 이벤트는 하나만 등록할 수 있습니다."
      padding="lg"
    >
      <Stack
        as="form"
        gap="xs"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Grid columns={{ base: 1, md: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr) auto" }} gap="md" align="end">
          <FormField label="날짜">
            <Field type="date" value={date} status={taken ? "error" : undefined} onChange={(event) => setDate(event.target.value)} />
          </FormField>
          <FormField label="따를 시간표">
            <Select value={day} onChange={(event) => setDay(event.target.value as Day)}>
              {DAYS.map((item) => <Select.Option key={item} value={item}>{DAY_FULL[item]}</Select.Option>)}
            </Select>
          </FormField>
          <FormField label="이벤트 이름">
            <Field value={title} maxLength={100} placeholder="예: 월요일 시간표 운영" onChange={(event) => setTitle(event.target.value)} />
          </FormField>
          <Button variant="solid" type="submit" disabled={!ready}><Glyph name="plus" />추가</Button>
        </Grid>
        {taken ? <Text variant="caption" ink="error">이미 그 날짜에 등록된 이벤트가 있습니다.</Text> : null}
      </Stack>

      {rows.length === 0 ? (
        <Empty glyph="calendar-days" title="등록된 대체 시간표가 없습니다" description="날짜와 따를 요일을 정해 추가해 보세요." />
      ) : (
        <Stack as="ul" aria-label="대체 시간표 목록">
          {rows.map((item) => {
            const state = item.date > clock.key ? "예정" : item.date === clock.key ? "오늘" : "지남";
            return (
              <Surface as="li" key={item.id} border="top" paddingY="md">
                <Inline justify="between" align="center" gap="md">
                  <Stack gap="xs" minWidth={0}>
                    <Inline gap="sm" align="center" wrap>
                      <Mono strong>{item.date}</Mono>
                      <Text as="span" variant="caption" ink="tertiary">{weekdayOf(item.date)}요일</Text>
                      <Badge size="xs" variant="soft" accent={state === "예정" ? "info" : state === "오늘" ? "success" : "primary"}>{state}</Badge>
                    </Inline>
                    <Text>{item.title}</Text>
                    <Text as="span" variant="caption" ink="tertiary">{DAY_FULL[item.sourceDay]} 시간표를 따릅니다</Text>
                  </Stack>
                  <IconButton variant="ghost" size="sm" aria-label={`${item.date} 대체 시간표 삭제`} onClick={() => remove(item)}><Glyph name="trash-2" /></IconButton>
                </Inline>
              </Surface>
            );
          })}
        </Stack>
      )}
    </Card>
  );
};
