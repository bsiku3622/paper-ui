import { useEffect, useState } from "react";

import { Button, Checkbox, Field, FormField, Grid, Inline, Select, Stack, Text, Textarea } from "@studio-baeks/paper-ui";

import { Segmented } from "../../../../kit";
import { TRACKS, DIVISIONS } from "../../data/majors";
import { CATEGORY_LABEL, type EventCategory, type TimeMode } from "../../lib/calendar";
import { Dialog } from "../../ui/parts";

export type Purpose = "personal" | "shared" | "request";

export type Draft = {
  title: string;
  start: string;
  end: string;
  category: EventCategory;
  mode: TimeMode;
  startTime: string;
  endTime: string;
  startPeriod: number;
  endPeriod: number;
  grades: number[];
  majors: string[];
  note: string;
  weeks: number;
};

const TITLE: Record<Purpose, string> = { personal: "내 일정", shared: "학사일정 추가", request: "일정 제안" };
const DESCRIPTION: Record<Purpose, string> = {
  personal: "나만 보이는 일정입니다. 학교 일정에 넣고 싶으면 매니저에게 제안하세요.",
  shared: "모든 학생의 달력에 들어갑니다.",
  request: "매니저가 허용하면 모두의 달력에 들어갑니다. 거절되면 사유를 알려 드립니다.",
};

const blank = (date: string, purpose: Purpose): Draft => ({
  title: "",
  start: date,
  end: date,
  category: purpose === "personal" ? "event" : "academic",
  mode: "allday",
  startTime: "20:30",
  endTime: "21:20",
  startPeriod: 10,
  endPeriod: 11,
  grades: [],
  majors: [],
  note: "",
  weeks: 1,
});

export const EventForm = ({ purpose, date, open, onClose, onSubmit }: { purpose: Purpose; date: string; open: boolean; onClose: () => void; onSubmit: (draft: Draft) => void }) => {
  const [draft, setDraft] = useState<Draft>(() => blank(date, purpose));
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (open) {
      setDraft(blank(date, purpose));
      setTried(false);
    }
  }, [open, date, purpose]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((now) => ({ ...now, [key]: value }));
  const titleError = tried && draft.title.trim() === "" ? "제목을 적어 주세요." : undefined;
  const dateError = tried && (draft.end < draft.start || !draft.start) ? "끝나는 날이 시작하는 날보다 빠릅니다." : undefined;
  const periodError = tried && draft.mode === "period" && draft.endPeriod < draft.startPeriod ? "끝 교시가 시작 교시보다 빠릅니다." : undefined;
  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const submit = () => {
    setTried(true);
    if (draft.title.trim() === "" || draft.end < draft.start || !draft.start || (draft.mode === "period" && draft.endPeriod < draft.startPeriod)) return;
    onSubmit(draft);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => { if (!next) onClose(); }}
      title={TITLE[purpose]}
      description={DESCRIPTION[purpose]}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button variant="solid" onClick={submit}>{purpose === "request" ? "제안하기" : "저장"}</Button>
        </>
      }
    >
      <Stack gap="lg">
        <FormField label="제목" required error={titleError}>
          <Field value={draft.title} placeholder="예: 정보과학 스터디" onChange={(event) => set("title", event.target.value)} />
        </FormField>

        <Grid columns={{ base: 1, sm: 2 }} gap="md">
          <FormField label="분류">
            <Select value={draft.category} onChange={(event) => set("category", event.target.value as EventCategory)}>
              {(Object.keys(CATEGORY_LABEL) as EventCategory[]).map((key) => <Select.Option key={key} value={key}>{CATEGORY_LABEL[key]}</Select.Option>)}
            </Select>
          </FormField>
          {purpose === "personal" ? (
            <FormField label="반복">
              <Select value={draft.weeks} onChange={(event) => set("weeks", Number(event.target.value))}>
                <Select.Option value={1}>반복 안 함</Select.Option>
                <Select.Option value={4}>매주 4번</Select.Option>
                <Select.Option value={8}>매주 8번</Select.Option>
              </Select>
            </FormField>
          ) : null}
        </Grid>

        <Grid columns={{ base: 1, sm: 2 }} gap="md">
          <FormField label="시작하는 날" required>
            <Field type="date" value={draft.start} onChange={(event) => setDraft((now) => ({ ...now, start: event.target.value, end: now.end < event.target.value ? event.target.value : now.end }))} />
          </FormField>
          <FormField label="끝나는 날" error={dateError}>
            <Field type="date" value={draft.end} onChange={(event) => set("end", event.target.value)} />
          </FormField>
        </Grid>

        {purpose === "personal" ? (
          <Stack gap="sm">
            <Text as="span" variant="label" ink="secondary">시간</Text>
            <Segmented label="시간 방식" value={draft.mode} onChange={(id) => set("mode", id as TimeMode)} options={[{ id: "allday", label: "종일" }, { id: "clock", label: "시각" }, { id: "period", label: "교시" }]} />
            {draft.mode === "clock" ? (
              <Grid columns={2} gap="md">
                <FormField label="시작"><Field type="time" value={draft.startTime} onChange={(event) => set("startTime", event.target.value)} /></FormField>
                <FormField label="끝"><Field type="time" value={draft.endTime} onChange={(event) => set("endTime", event.target.value)} /></FormField>
              </Grid>
            ) : null}
            {draft.mode === "period" ? (
              <Grid columns={2} gap="md">
                <FormField label="시작 교시">
                  <Select value={draft.startPeriod} onChange={(event) => set("startPeriod", Number(event.target.value))}>
                    {Array.from({ length: 11 }, (_, index) => <Select.Option key={index} value={index + 1}>{`${index + 1}교시`}</Select.Option>)}
                  </Select>
                </FormField>
                <FormField label="끝 교시" error={periodError}>
                  <Select value={draft.endPeriod} onChange={(event) => set("endPeriod", Number(event.target.value))}>
                    {Array.from({ length: 11 }, (_, index) => <Select.Option key={index} value={index + 1}>{`${index + 1}교시`}</Select.Option>)}
                  </Select>
                </FormField>
              </Grid>
            ) : null}
          </Stack>
        ) : (
          <Stack gap="sm">
            <Text as="span" variant="label" ink="secondary">대상 — 아무것도 고르지 않으면 모두입니다</Text>
            <Inline gap="md" wrap>
              {[1, 2, 3].map((grade) => (
                <Inline key={grade} as="label" gap="sm" align="center">
                  <Checkbox checked={draft.grades.includes(grade)} onChange={() => set("grades", toggle(draft.grades, grade))} />
                  <Text as="span">{grade}학년</Text>
                </Inline>
              ))}
            </Inline>
            <Inline gap="xs" wrap>
              {DIVISIONS.map((division) => {
                const all = division.tracks.every((track) => draft.majors.includes(track));
                return (
                  <Button key={division.name} variant="hairline" size="xs" selected={all} onClick={() => set("majors", all ? draft.majors.filter((item) => !division.tracks.includes(item)) : [...new Set([...draft.majors, ...division.tracks])])}>{division.name}</Button>
                );
              })}
            </Inline>
            <Inline gap="xs" wrap>
              {TRACKS.map((track) => (
                <Button key={track} variant="hairline" size="xs" selected={draft.majors.includes(track)} onClick={() => set("majors", toggle(draft.majors, track))}>{track}</Button>
              ))}
            </Inline>
          </Stack>
        )}

        <FormField label="메모">
          <Textarea rows={3} value={draft.note} placeholder="장소나 준비물이 있으면 적어 두세요." onChange={(event) => set("note", event.target.value)} />
        </FormField>
      </Stack>
    </Dialog>
  );
};
