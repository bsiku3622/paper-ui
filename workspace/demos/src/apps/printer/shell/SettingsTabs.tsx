// The tabs of the settings dialog. Each reproduces what the same tab of Mainsail sets, and what it sets is read by the rest of
// the console: the time format by every time on every page, the control steps by the jog grid, the console filters by the log,
// the dashboard layout by the dashboard, the navigation by the sidebar, and so on. Nothing leaves the browser.

import { useState, type ReactNode } from "react";

import { Badge, Box, Button, Field, FormField, Grid, IconButton, Inline, Select, Stack, Switch, Text, useTheme } from "@studio-baeks/paper-ui";

import { clearStored, Glyph, Segmented, useToast } from "../../../kit";
import { HIDDEN_MACROS, MACROS } from "../catalog";
import type { DateFormat } from "../format";
import { DEFAULT_PRESETS, DEFAULT_SETTINGS, DEFAULT_WEBCAMS, NAV, PANELS, useSettings, type EstimateMethod, type Preset, type Settings, type Side, type Webcam } from "../settings";
import { initialState } from "../sim/engine";
import { useActions } from "../sim/Provider";
import { NumberField, SettingList, SettingRow } from "../ui/Controls";
import { ConfirmDialog } from "../ui/Dialog";

const Toggle = ({ title, description, checked, onChange }: { title: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <SettingRow title={title} description={description}>
    <Switch aria-label={title} checked={checked} onChange={(event) => onChange(event.target.checked)} />
  </SettingRow>
);

type Option<T extends string> = { value: T; label: string; disabled?: boolean };

const Pick = <T extends string>({ title, description, value, options, onChange }: { title: string; description?: string; value: T; options: readonly Option<T>[]; onChange: (value: T) => void }) => (
  <SettingRow title={title} description={description}>
    <Select size="sm" aria-label={title} value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => <Select.Option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</Select.Option>)}
    </Select>
  </SettingRow>
);

// A list of numbers typed as "1, 10, 100": applied when the field is left or Enter is pressed.
const NumberList = ({ label, value, max, onCommit }: { label: string; value: readonly number[]; max: number; onCommit: (value: number[]) => void }) => {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft === null) return;
    const list = [...new Set(draft.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b).slice(0, max);
    setDraft(null);
    if (list.length > 0) onCommit(list);
  };
  return (
    <Box width="lg" maxWidth="full">
      <Field size="sm" aria-label={label} numeric value={draft ?? value.join(", ")} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") commit(); }} />
    </Box>
  );
};

const Heading = ({ children }: { children: ReactNode }) => <Text as="h3" variant="subheading">{children}</Text>;

// ---- general

const DATES: readonly Option<DateFormat>[] = [
  { value: "ko", label: "11월 4일" },
  { value: "iso", label: "2026-11-04" },
  { value: "dmy", label: "04.11.2026" },
];

const ESTIMATES: readonly Option<EstimateMethod>[] = [
  { value: "file", label: "파일에서 읽은 위치" },
  { value: "filament", label: "쓴 필라멘트" },
  { value: "slicer", label: "슬라이서의 예상 시간" },
  { value: "average", label: "세 가지의 평균" },
];

export const GeneralTab = () => {
  const { settings, patch, reset } = useSettings();
  const { forget, update } = useActions();
  const toast = useToast();
  const [resetting, setResetting] = useState(false);
  const g = settings.general;
  return (
    <Stack gap="lg">
      <SettingList>
        <SettingRow title="프린터 이름" description="사이드바와 모바일 메뉴, 탭 제목에 쓰입니다.">
          <Box width="lg" maxWidth="full"><Field size="sm" aria-label="프린터 이름" value={g.name} onChange={(event) => patch("general", { name: event.target.value })} /></Box>
        </SettingRow>
        <Pick<string> title="언어" description="지금은 한국어만 쓸 수 있습니다." value="ko" options={[{ value: "ko", label: "한국어" }, { value: "en", label: "English (준비 중)", disabled: true }]} onChange={() => undefined} />
        <Pick title="날짜 형식" value={g.dateFormat} options={DATES} onChange={(value) => patch("general", { dateFormat: value })} />
        <SettingRow title="시간 표기">
          <Segmented label="시간 표기" value={g.hour12 ? "12" : "24"} onChange={(value) => patch("general", { hour12: value === "12" })} options={[{ id: "12", label: "12시간" }, { id: "24", label: "24시간" }]} />
        </SettingRow>
        <Pick title="남은 시간 계산" description="대시보드의 남은 시간과 완료 예정 시각을 어느 값으로 셀지 고릅니다." value={g.estimate} options={ESTIMATES} onChange={(value) => patch("general", { estimate: value })} />
        <Toggle title="탭 제목에 진행률 표시" description="출력 중에는 브라우저 탭에 진행률을 보입니다." checked={g.titleProgress} onChange={(titleProgress) => patch("general", { titleProgress })} />
        <Toggle title="긴급 정지 전에 확인" checked={g.confirmEstop} onChange={(confirmEstop) => patch("general", { confirmEstop })} />
        <Toggle title="전원과 재시작 전에 확인" checked={g.confirmPower} onChange={(confirmPower) => patch("general", { confirmPower })} />
        <Pick<string> title="모의 시간 속도" description="이 화면의 모의 프린터가 시간을 몇 배로 쓸지 고릅니다. 10배나 60배로 하면 출력이 끝나는 모습을 볼 수 있습니다." value={String(g.simSpeed)} options={[{ value: "1", label: "1배 (실시간)" }, { value: "10", label: "10배" }, { value: "60", label: "60배" }]} onChange={(value) => patch("general", { simSpeed: Number(value) as 1 | 10 | 60 })} />
        <SettingRow title="모의 프린터 되돌리기" description="캡처한 순간(출력 95%)으로 모의 프린터를 되돌립니다. 설정은 그대로입니다.">
          <Button variant="hairline" size="sm" onClick={() => { update(() => initialState()); toast("모의 프린터를 처음 상태로 되돌렸습니다"); }}>되돌리기</Button>
        </SettingRow>
        <SettingRow title="콘솔 명령 기록" description="화살표 키로 불러오는 이전 명령을 모두 지웁니다.">
          <Button variant="hairline" size="sm" onClick={() => { forget(); toast("명령 기록을 지웠습니다"); }}>지우기</Button>
        </SettingRow>
        <SettingRow title="설정 초기화" description="이 브라우저에 저장한 설정, 프리셋, 웹캠, 편집한 설정 파일을 모두 지웁니다.">
          <Button variant="hairline" size="sm" accent="error" onClick={() => setResetting(true)}>처음 상태로</Button>
        </SettingRow>
      </SettingList>
      <ConfirmDialog
        open={resetting}
        onClose={() => setResetting(false)}
        title="모든 설정을 처음 상태로 돌릴까요?"
        description="프린터 콘솔이 이 브라우저에 저장한 것이 모두 지워집니다. 프린터에는 아무 영향이 없습니다."
        confirmLabel="초기화"
        danger
        onConfirm={() => {
          reset();
          clearStored("printer:");
          toast("설정을 처음 상태로 돌렸습니다");
        }}
      />
    </Stack>
  );
};

// ---- UI

export const UiTab = () => {
  const { settings, patch } = useSettings();
  const { theme, setTheme } = useTheme();
  return (
    <SettingList>
      <SettingRow title="테마" description="밝게, 어둡게, 또는 기기 설정을 따릅니다. 다른 앱에도 같은 테마가 적용됩니다.">
        <Segmented label="테마" value={theme} onChange={(value) => setTheme(value as "light" | "dark" | "system")} options={[{ id: "system", label: "기기", glyph: "monitor" }, { id: "light", label: "밝게", glyph: "sun" }, { id: "dark", label: "어둡게", glyph: "moon" }]} />
      </SettingRow>
      <Toggle title="촘촘한 표" description="파일, 기록, 설정 파일 표의 줄 간격을 줄입니다." checked={settings.ui.compact} onChange={(compact) => patch("ui", { compact })} />
    </SettingList>
  );
};

// ---- webcams

const SERVICES: readonly Option<Webcam["service"]>[] = [
  { value: "mjpeg", label: "MJPEG 스트림" },
  { value: "webrtc", label: "WebRTC (camera-streamer)" },
  { value: "hls", label: "HLS" },
  { value: "ipcamera", label: "IP 카메라" },
];

export const WebcamsTab = () => {
  const { webcams, setWebcams } = useSettings();
  const [open, setOpen] = useState<string | null>(webcams[0]?.id ?? null);
  const change = (id: string, values: Partial<Webcam>) => setWebcams(webcams.map((cam) => (cam.id === id ? { ...cam, ...values } : cam)));
  const add = () => {
    const id = `cam${webcams.length + 1}-${webcams.reduce((top, cam) => Math.max(top, Number(cam.id.split("-")[1] ?? 0)), 0) + 1}`;
    setWebcams([...webcams, { ...DEFAULT_WEBCAMS[0]!, id, name: `Webcam ${webcams.length + 1}`, stream: "/webcam2/?action=stream", snapshot: "/webcam2/?action=snapshot" }]);
    setOpen(id);
  };
  return (
    <Stack gap="lg">
      <Stack gap="md">
        {webcams.map((cam) => (
          <Stack key={cam.id} gap="md">
            <Inline justify="between" align="center" gap="md" wrap>
              <Inline gap="sm" align="center" minWidth={0}>
                <Glyph name="webcam" ink="secondary" />
                <Text as="span" strong truncate>{cam.name}</Text>
                <Badge variant="hairline" size="sm">{SERVICES.find((item) => item.value === cam.service)?.label}</Badge>
              </Inline>
              <Inline gap="sm" align="center">
                <Switch aria-label={`${cam.name} 켜기`} checked={cam.enabled} onChange={(event) => change(cam.id, { enabled: event.target.checked })} />
                <IconButton variant="ghost" size="sm" aria-label={`${cam.name} ${open === cam.id ? "접기" : "고치기"}`} aria-expanded={open === cam.id} onClick={() => setOpen(open === cam.id ? null : cam.id)}><Glyph name={open === cam.id ? "chevron-up" : "pencil"} /></IconButton>
                <IconButton variant="ghost" size="sm" accent="error" aria-label={`${cam.name} 지우기`} disabled={webcams.length <= 1} onClick={() => setWebcams(webcams.filter((item) => item.id !== cam.id))}><Glyph name="trash-2" /></IconButton>
              </Inline>
            </Inline>
            {open === cam.id ? (
              <Grid columns={{ base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }} gap="lg">
                <FormField label="이름"><Field value={cam.name} onChange={(event) => change(cam.id, { name: event.target.value })} /></FormField>
                <FormField label="서비스">
                  <Select value={cam.service} onChange={(event) => change(cam.id, { service: event.target.value as Webcam["service"] })}>
                    {SERVICES.map((item) => <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>)}
                  </Select>
                </FormField>
                <FormField label="스트림 주소"><Field value={cam.stream} onChange={(event) => change(cam.id, { stream: event.target.value })} /></FormField>
                <FormField label="스냅샷 주소"><Field value={cam.snapshot} onChange={(event) => change(cam.id, { snapshot: event.target.value })} /></FormField>
                <FormField label="목표 FPS"><NumberField label="목표 FPS" size="md" value={cam.fps} min={1} max={60} onCommit={(fps) => change(cam.id, { fps })} /></FormField>
                <FormField label="화면 비율">
                  <Select value={cam.ratio} onChange={(event) => change(cam.id, { ratio: event.target.value as Webcam["ratio"] })}>
                    <Select.Option value="4 / 3">4:3</Select.Option>
                    <Select.Option value="16 / 9">16:9</Select.Option>
                    <Select.Option value="1 / 1">1:1</Select.Option>
                  </Select>
                </FormField>
                <FormField label="회전">
                  <Select value={String(cam.rotate)} onChange={(event) => change(cam.id, { rotate: Number(event.target.value) as Webcam["rotate"] })}>
                    {[0, 90, 180, 270].map((degree) => <Select.Option key={degree} value={String(degree)}>{`${degree}°`}</Select.Option>)}
                  </Select>
                </FormField>
                <Inline gap="lg" align="end" wrap>
                  <Inline as="label" gap="sm" align="center"><Switch aria-label="좌우 뒤집기" checked={cam.flipX} onChange={(event) => change(cam.id, { flipX: event.target.checked })} /><Text as="span">좌우 뒤집기</Text></Inline>
                  <Inline as="label" gap="sm" align="center"><Switch aria-label="상하 뒤집기" checked={cam.flipY} onChange={(event) => change(cam.id, { flipY: event.target.checked })} /><Text as="span">상하 뒤집기</Text></Inline>
                </Inline>
              </Grid>
            ) : null}
          </Stack>
        ))}
      </Stack>
      <Inline justify="between" align="center" gap="md" wrap>
        <Button variant="dashed" size="sm" onClick={add}><Glyph name="plus" />웹캠 추가</Button>
        <Text as="span" variant="caption" ink="tertiary">주소는 모의 값입니다. 실제 영상은 오지 않습니다.</Text>
      </Inline>
    </Stack>
  );
};

// ---- macros

export const MacrosTab = () => {
  const { settings, patch } = useSettings();
  const m = settings.macros;
  const [group, setGroup] = useState("");
  const toggle = (name: string, show: boolean) => patch("macros", { hidden: show ? m.hidden.filter((item) => item !== name) : [...m.hidden, name] });
  const assign = (name: string, to: string) => {
    const next = { ...m.assign };
    if (to) next[name] = to;
    else delete next[name];
    patch("macros", { assign: next });
  };
  const addGroup = () => {
    const name = group.trim();
    if (!name || m.groups.includes(name)) return;
    patch("macros", { groups: [...m.groups, name] });
    setGroup("");
  };
  const dropGroup = (name: string) => patch("macros", { groups: m.groups.filter((item) => item !== name), assign: Object.fromEntries(Object.entries(m.assign).filter(([, value]) => value !== name)) });
  return (
    <Stack gap="xl">
      <Stack gap="md">
        <Heading>그룹</Heading>
        <Inline gap="sm" wrap>
          {m.groups.length === 0 ? <Text as="span" ink="tertiary">그룹이 없습니다. 매크로가 한 줄로 늘어섭니다.</Text> : null}
          {m.groups.map((name) => (
            <Inline key={name} gap="xs" align="center">
              <Badge variant="soft" size="md">{name}</Badge>
              <IconButton variant="ghost" size="xs" aria-label={`${name} 그룹 지우기`} onClick={() => dropGroup(name)}><Glyph name="x" /></IconButton>
            </Inline>
          ))}
        </Inline>
        <Inline gap="sm" wrap>
          <Box width="md" maxWidth="full"><Field size="sm" aria-label="새 그룹 이름" placeholder="새 그룹 이름" value={group} onChange={(event) => setGroup(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addGroup(); }} /></Box>
          <Button variant="hairline" size="sm" disabled={group.trim() === ""} onClick={addGroup}>그룹 추가</Button>
        </Inline>
      </Stack>
      <Stack gap="md">
        <Heading>매크로 {MACROS.length}개</Heading>
        <SettingList>
          {MACROS.map((macro) => (
            <Grid key={macro.name} columns={{ base: "minmax(0, 1fr) auto", md: "minmax(0, 1fr) 9rem auto" }} gap="md" align="center">
              <Stack gap="xs" minWidth={0}>
                <Text as="span" family="mono" strong truncate>{macro.name}</Text>
                <Text as="span" variant="label" strong={false} ink="tertiary">{macro.description}</Text>
              </Stack>
              <Box hideBelow="md">
                <Select size="sm" aria-label={`${macro.name} 그룹`} value={m.assign[macro.name] ?? ""} onChange={(event) => assign(macro.name, event.target.value)}>
                  <Select.Option value="">그룹 없음</Select.Option>
                  {m.groups.map((name) => <Select.Option key={name} value={name}>{name}</Select.Option>)}
                </Select>
              </Box>
              <Switch aria-label={`${macro.name} 보이기`} checked={!m.hidden.includes(macro.name)} onChange={(event) => toggle(macro.name, event.target.checked)} />
            </Grid>
          ))}
        </SettingList>
        <Button variant="ghost" size="sm" onClick={() => patch("macros", { hidden: [...HIDDEN_MACROS] })}>기본으로 되돌리기</Button>
      </Stack>
    </Stack>
  );
};

// ---- presets

export const PresetsTab = () => {
  const { presets, setPresets } = useSettings();
  const change = (id: string, values: Partial<Preset>) => setPresets(presets.map((preset) => (preset.id === id ? { ...preset, ...values } : preset)));
  const add = () => setPresets([...presets, { id: `preset-${presets.length + 1}-${presets.reduce((top, preset) => Math.max(top, Number(preset.id.split("-")[2] ?? 0)), 0) + 1}`, name: `프리셋 ${presets.length + 1}`, extruder: 200, bed: 60 }]);
  return (
    <Stack gap="lg">
      <Text ink="secondary">온도 패널의 목표 칸 옆 화살표에 나타나는 목록입니다. 노즐과 베드 온도를 짝지어 두고 한 번에 고릅니다.</Text>
      <Stack gap="md">
        {presets.map((preset) => (
          <Grid key={preset.id} columns={{ base: "repeat(2, minmax(0, 1fr))", md: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) auto" }} gap="md" align="end">
            <FormField label="이름"><Field size="sm" value={preset.name} onChange={(event) => change(preset.id, { name: event.target.value })} /></FormField>
            <Stack gap="xs"><Text as="span" variant="label" strong={false} ink="tertiary">노즐</Text><NumberField label={`${preset.name} 노즐 온도`} value={preset.extruder} min={0} max={270} unit="°C" onCommit={(extruder) => change(preset.id, { extruder })} /></Stack>
            <Stack gap="xs"><Text as="span" variant="label" strong={false} ink="tertiary">베드</Text><NumberField label={`${preset.name} 베드 온도`} value={preset.bed} min={0} max={100} unit="°C" onCommit={(bed) => change(preset.id, { bed })} /></Stack>
            <IconButton variant="ghost" size="sm" accent="error" aria-label={`${preset.name} 프리셋 지우기`} onClick={() => setPresets(presets.filter((item) => item.id !== preset.id))}><Glyph name="trash-2" /></IconButton>
          </Grid>
        ))}
      </Stack>
      <Inline gap="sm" wrap>
        <Button variant="dashed" size="sm" onClick={add}><Glyph name="plus" />프리셋 추가</Button>
        <Button variant="ghost" size="sm" onClick={() => setPresets(DEFAULT_PRESETS)}>기본으로 되돌리기</Button>
      </Inline>
    </Stack>
  );
};

// ---- control

export const ControlTab = () => {
  const { settings, patch } = useSettings();
  const c = settings.control;
  return (
    <SettingList>
      <Toggle title="X 방향 뒤집기" description="마이너스 버튼이 반대로 움직입니다." checked={c.reverseX} onChange={(reverseX) => patch("control", { reverseX })} />
      <Toggle title="Y 방향 뒤집기" checked={c.reverseY} onChange={(reverseY) => patch("control", { reverseY })} />
      <Toggle title="Z 방향 뒤집기" checked={c.reverseZ} onChange={(reverseZ) => patch("control", { reverseZ })} />
      <Toggle title="축마다 홈 버튼 보이기" description="전체 홈 옆에 X, Y, Z 홈 버튼을 더합니다." checked={c.axisHome} onChange={(axisHome) => patch("control", { axisHome })} />
      <SettingRow title="X·Y 이동 속도"><NumberField label="X·Y 이동 속도" value={c.feedXY} min={1} max={600} unit="mm/s" width="sm" onCommit={(feedXY) => patch("control", { feedXY })} /></SettingRow>
      <SettingRow title="Z 이동 속도"><NumberField label="Z 이동 속도" value={c.feedZ} min={1} max={100} unit="mm/s" width="sm" onCommit={(feedZ) => patch("control", { feedZ })} /></SettingRow>
      <SettingRow title="X·Y 이동 거리" description="쉼표로 나눠 적습니다. 최대 4개 (mm)."><NumberList label="X·Y 이동 거리" value={c.stepsXY} max={4} onCommit={(stepsXY) => patch("control", { stepsXY })} /></SettingRow>
      <SettingRow title="Z 이동 거리" description="최대 4개 (mm)."><NumberList label="Z 이동 거리" value={c.stepsZ} max={4} onCommit={(stepsZ) => patch("control", { stepsZ })} /></SettingRow>
      <SettingRow title="Z 오프셋 단계" description="최대 4개 (mm)."><NumberList label="Z 오프셋 단계" value={c.zOffsetSteps} max={4} onCommit={(zOffsetSteps) => patch("control", { zOffsetSteps })} /></SettingRow>
      <SettingRow title="압출 길이 목록" description="압출기 패널의 바로 고르기 (mm)."><NumberList label="압출 길이 목록" value={c.lengths} max={6} onCommit={(lengths) => patch("control", { lengths })} /></SettingRow>
      <SettingRow title="압출 속도 목록" description="압출기 패널의 바로 고르기 (mm/s)."><NumberList label="압출 속도 목록" value={c.rates} max={6} onCommit={(rates) => patch("control", { rates })} /></SettingRow>
    </SettingList>
  );
};

// ---- console

const valid = (pattern: string) => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

export const ConsoleTab = () => {
  const { settings, patch } = useSettings();
  const c = settings.console;
  const change = (id: string, values: Partial<Settings["console"]["filters"][number]>) => patch("console", { filters: c.filters.map((filter) => (filter.id === id ? { ...filter, ...values } : filter)) });
  const add = () => patch("console", { filters: [...c.filters, { id: `filter-${c.filters.length + 1}-${c.filters.reduce((top, filter) => Math.max(top, Number(filter.id.split("-")[1] ?? 0)), 0) + 1}`, name: "새 필터", pattern: "", enabled: true }] });
  return (
    <Stack gap="xl">
      <SettingList>
        <Toggle title="최신 줄을 위에" description="끄면 새 줄이 아래에 쌓입니다." checked={c.newestFirst} onChange={(newestFirst) => patch("console", { newestFirst })} />
        <Toggle title="시각 표시" checked={c.timestamps} onChange={(timestamps) => patch("console", { timestamps })} />
        <Toggle title="온도 줄 숨기기" description="프린터가 스스로 알리는 ok T:210.0 /210.0 B:60.0 /60.0 같은 줄을 감춥니다. 직접 보낸 M105의 답은 보입니다." checked={c.hideTemperature} onChange={(hideTemperature) => patch("console", { hideTemperature })} />
        <Toggle title="ok만 있는 줄 숨기기" checked={c.hideOk} onChange={(hideOk) => patch("console", { hideOk })} />
        <Toggle title="명령 자동 완성" description="입력하면 알려진 명령과 매크로를 제안하고 Tab으로 완성합니다." checked={c.suggest} onChange={(suggest) => patch("console", { suggest })} />
        <SettingRow title="기억할 명령 수" description="화살표 위·아래로 불러올 수 있는 이전 명령의 수입니다."><NumberField label="기억할 명령 수" value={c.historySize} min={5} max={200} width="sm" onCommit={(historySize) => patch("console", { historySize })} /></SettingRow>
        <Pick title="대시보드 콘솔 높이" value={c.dashboardHeight} options={[{ value: "md", label: "낮게" }, { value: "lg", label: "보통" }, { value: "xl", label: "높게" }]} onChange={(dashboardHeight) => patch("console", { dashboardHeight })} />
      </SettingList>
      <Stack gap="md">
        <Heading>필터</Heading>
        <Text ink="secondary">정규식에 걸리는 줄을 콘솔에서 숨깁니다. 대소문자는 가리지 않습니다.</Text>
        <Stack gap="md">
          {c.filters.map((filter) => (
            <Grid key={filter.id} columns={{ base: "auto minmax(0, 1fr) auto", md: "auto minmax(0, 1fr) minmax(0, 1.4fr) auto" }} gap="md" align="center">
              <Switch aria-label={`${filter.name} 켜기`} checked={filter.enabled} onChange={(event) => change(filter.id, { enabled: event.target.checked })} />
              <Field size="sm" aria-label="필터 이름" value={filter.name} onChange={(event) => change(filter.id, { name: event.target.value })} />
              <Box hideBelow="md"><Field size="sm" aria-label="정규식" placeholder="정규식" status={valid(filter.pattern) ? undefined : "error"} value={filter.pattern} onChange={(event) => change(filter.id, { pattern: event.target.value })} /></Box>
              <IconButton variant="ghost" size="sm" accent="error" aria-label={`${filter.name} 필터 지우기`} onClick={() => patch("console", { filters: c.filters.filter((item) => item.id !== filter.id) })}><Glyph name="trash-2" /></IconButton>
            </Grid>
          ))}
        </Stack>
        <Inline><Button variant="dashed" size="sm" onClick={add}><Glyph name="plus" />필터 추가</Button></Inline>
      </Stack>
    </Stack>
  );
};

// ---- dashboard

const SIDES: readonly Option<Side>[] = [
  { value: "left", label: "왼쪽 칸" },
  { value: "right", label: "오른쪽 칸" },
  { value: "hidden", label: "숨김" },
];

export const DashboardTab = () => {
  const { settings, patch } = useSettings();
  const d = settings.dashboard;
  return (
    <Stack gap="xl">
      <Stack gap="md">
        <Heading>패널 배치</Heading>
        <Text ink="secondary">넓은 화면에서는 두 칸으로, 좁은 화면에서는 왼쪽 칸 다음에 오른쪽 칸 순서로 한 줄에 쌓입니다.</Text>
        <SettingList>
          {PANELS.map((panel) => (
            <Pick key={panel.id} title={panel.label} value={d.layout[panel.id]} options={SIDES} onChange={(side) => patch("dashboard", { layout: { ...d.layout, [panel.id]: side } })} />
          ))}
        </SettingList>
        <Inline><Button variant="ghost" size="sm" onClick={() => patch("dashboard", { layout: DEFAULT_SETTINGS.dashboard.layout })}>기본 배치로</Button></Inline>
      </Stack>
      <Stack gap="md">
        <Heading>온도 그래프</Heading>
        <SettingList>
          <Pick title="보여 줄 시간" value={String(d.chartMinutes)} options={[{ value: "5", label: "5분" }, { value: "10", label: "10분" }, { value: "20", label: "20분" }]} onChange={(value) => patch("dashboard", { chartMinutes: Number(value) })} />
          <Toggle title="목표 온도선" description="목표 온도를 점선으로 보입니다." checked={d.showTargets} onChange={(showTargets) => patch("dashboard", { showTargets })} />
          <Toggle title="히터 전력" description="그래프 아래쪽에 전력을 옅은 면으로 보입니다." checked={d.showPower} onChange={(showPower) => patch("dashboard", { showPower })} />
        </SettingList>
      </Stack>
    </Stack>
  );
};

// ---- viewer

export const ViewerTab = () => {
  const { settings, patch } = useSettings();
  const v = settings.viewer;
  return (
    <SettingList>
      <Pick title="색상 모드" value={v.colorMode} options={[{ value: "feature", label: "특징 (벽, 채움)" }, { value: "speed", label: "속도" }, { value: "layer", label: "높이" }]} onChange={(colorMode) => patch("viewer", { colorMode })} />
      <Pick title="렌더 품질" description="낮추면 곡선을 거칠게 그립니다." value={v.quality} options={[{ value: "low", label: "낮음" }, { value: "medium", label: "보통" }, { value: "high", label: "높음" }]} onChange={(quality) => patch("viewer", { quality })} />
      <Toggle title="이동 경로 보이기" description="압출하지 않고 움직인 길을 점선으로 보입니다." checked={v.travel} onChange={(travel) => patch("viewer", { travel })} />
      <Toggle title="이전 층 흐리게 보이기" checked={v.previous} onChange={(previous) => patch("viewer", { previous })} />
      <Toggle title="노즐 위치 보이기" description="지금 출력 중인 층을 볼 때만 보입니다." checked={v.nozzle} onChange={(nozzle) => patch("viewer", { nozzle })} />
      <Toggle title="격자 보이기" checked={v.grid} onChange={(grid) => patch("viewer", { grid })} />
      <Toggle title="모델에 맞추기" description="끄면 베드 전체를 한눈에 봅니다." checked={v.fit} onChange={(fit) => patch("viewer", { fit })} />
      <Toggle title="출력을 따라가기" description="출력 중인 파일을 볼 때 층이 출력과 함께 올라갑니다." checked={v.follow} onChange={(follow) => patch("viewer", { follow })} />
      <SettingRow title="선 굵기 배율"><NumberField label="선 굵기 배율" value={v.lineScale} digits={1} step={0.1} min={0.8} max={3} width="sm" onCommit={(lineScale) => patch("viewer", { lineScale })} /></SettingRow>
    </SettingList>
  );
};

// ---- editor

export const EditorTab = () => {
  const { settings, patch } = useSettings();
  const e = settings.editor;
  return (
    <SettingList>
      <Pick title="글자 크기" value={e.fontSize} options={[{ value: "label", label: "작게 (12)" }, { value: "caption", label: "보통 (13)" }, { value: "body", label: "크게 (14)" }]} onChange={(fontSize) => patch("editor", { fontSize })} />
      <SettingRow title="Tab 키로 넣는 칸 수">
        <Segmented label="Tab 칸 수" value={String(e.tab)} onChange={(value) => patch("editor", { tab: Number(value) as 2 | 4 })} options={[{ id: "2", label: "2칸" }, { id: "4", label: "4칸" }]} />
      </SettingRow>
      <Toggle title="긴 줄 바꾸기" description="끄면 긴 줄은 옆으로 스크롤합니다." checked={e.wrap} onChange={(wrap) => patch("editor", { wrap })} />
      <Toggle title="저장하지 않고 닫을 때 묻기" checked={e.confirmLeave} onChange={(confirmLeave) => patch("editor", { confirmLeave })} />
      <Toggle title="저장하고 다시 시작할 때 묻기" checked={e.confirmRestart} onChange={(confirmRestart) => patch("editor", { confirmRestart })} />
    </SettingList>
  );
};

// ---- navigation

export const NavTab = () => {
  const { settings, patch } = useSettings();
  const order = [...settings.nav.order, ...NAV.map((item) => item.id).filter((id) => !settings.nav.order.includes(id))];
  const move = (index: number, by: -1 | 1) => {
    const next = [...order];
    const target = index + by;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    patch("nav", { order: next });
  };
  return (
    <Stack gap="lg">
      <Text ink="secondary">사이드바에 보일 화면과 순서를 정합니다. 숨긴 화면도 주소로는 열립니다.</Text>
      <SettingList>
        {order.map((id, index) => {
          const item = NAV.find((entry) => entry.id === id);
          if (!item) return null;
          const shown = !settings.nav.hidden.includes(id);
          return (
            <Inline key={id} justify="between" align="center" gap="md">
              <Text as="span" ink={shown ? "primary" : "tertiary"}>{item.label}</Text>
              <Inline gap="xs" align="center">
                <IconButton variant="ghost" size="sm" aria-label={`${item.label} 위로`} disabled={index === 0} onClick={() => move(index, -1)}><Glyph name="arrow-up" /></IconButton>
                <IconButton variant="ghost" size="sm" aria-label={`${item.label} 아래로`} disabled={index === order.length - 1} onClick={() => move(index, 1)}><Glyph name="arrow-down" /></IconButton>
                <Switch aria-label={`${item.label} 보이기`} checked={shown} disabled={id === "dashboard"} onChange={(event) => patch("nav", { hidden: event.target.checked ? settings.nav.hidden.filter((hidden) => hidden !== id) : [...settings.nav.hidden, id] })} />
              </Inline>
            </Inline>
          );
        })}
      </SettingList>
      <Inline><Button variant="ghost" size="sm" onClick={() => patch("nav", { order: NAV.map((item) => item.id), hidden: [] })}>기본으로</Button></Inline>
    </Stack>
  );
};
