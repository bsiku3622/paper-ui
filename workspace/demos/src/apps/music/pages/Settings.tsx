// 설정: 재생(자동 재생 · 크로스페이드 · 오른쪽 창), 오디오(음질 · 돌비 · 이퀄라이저), 보관함(동기화 · 저장 공간),
// 개인정보(재생 기록). 바꾸는 즉시 저장되고, 맨 아래의 "처음 상태로"가 이 앱이 남긴 것을 모두 지웁니다.

import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import { Box, Button, Divider, Floating, Inline, Radio, Select, Stack, Surface, Switch, Text } from "@studio-baeks/paper-ui";

import { Meter, PageHeader, Tabs, clearStored, formatBytes, useToast } from "../../../kit";
import { Slider } from "../content/Slider";
import { useLibrary } from "../state/library";
import { useSettings, type Equalizer, type Pane, type Quality } from "../state/settings";

const QUALITY: readonly { id: Quality; label: string; note: string }[] = [
  { id: "standard", label: "표준", note: "AAC 128kbps · 데이터를 가장 적게 씁니다" },
  { id: "high", label: "높음", note: "AAC 256kbps · 대부분의 이어폰에 충분합니다" },
  { id: "lossless", label: "무손실", note: "ALAC 최대 24비트/48kHz · 저장 공간을 많이 씁니다" },
  { id: "hires", label: "고해상도 무손실", note: "ALAC 최대 24비트/192kHz · 외장 DAC가 필요합니다" },
];

const EQUALIZERS: readonly { id: Equalizer; label: string }[] = [
  { id: "flat", label: "끔" },
  { id: "bass", label: "저음 강조" },
  { id: "vocal", label: "보컬 강조" },
  { id: "treble", label: "고음 강조" },
  { id: "late", label: "늦은 밤" },
];

// 이름과 설명이 왼쪽, 조절하는 것이 오른쪽인 한 줄. 줄 사이는 가는 선입니다. 줄 전체가 label이라서 이름을 눌러도
// 스위치가 켜지고 꺼집니다. 단추가 든 줄(plain)은 label이 아닙니다: label은 안의 첫 단추를 대신 눌러 버립니다.
const Row = ({ title, note, children, first = false, plain = false }: { title: string; note?: string; children: ReactNode; first?: boolean; plain?: boolean }) => (
  <Stack>
    {first ? null : <Divider aria-hidden />}
    <Inline as={plain ? "div" : "label"} justify="between" align="center" gap="xl" paddingY="md">
      <Stack minWidth={0}>
        <Text as="span" strong>{title}</Text>
        {note ? <Text as="span" variant="caption" ink="tertiary">{note}</Text> : null}
      </Stack>
      {children}
    </Inline>
  </Stack>
);

// 선택 상자는 폭을 정해 줍니다. 안 그러면 줄의 남은 폭을 다 차지합니다.
const Pick = ({ children }: { children: ReactNode }) => <Box width="md">{children}</Box>;

const Choices = ({ name, value, options, onChange }: { name: string; value: string; options: readonly { id: string; label: string; note?: string }[]; onChange: (id: string) => void }) => (
  <Stack role="radiogroup" aria-label={name} gap="md" paddingY="md">
    {options.map((option) => (
      <Inline as="label" key={option.id} gap="md" align="start">
        <Radio name={name} checked={value === option.id} onChange={() => onChange(option.id)} />
        <Stack>
          <Text as="span" strong={value === option.id}>{option.label}</Text>
          {option.note ? <Text as="span" variant="caption" ink="tertiary">{option.note}</Text> : null}
        </Stack>
      </Inline>
    ))}
  </Stack>
);

const Reset = () => {
  const [open, setOpen] = useState(false);
  return (
    <Floating open={open} onOpenChange={setOpen}>
      <Button as={Floating.Trigger} variant="hairline" accent="error">처음 상태로 되돌리기</Button>
      <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" presentation="modal" role="alertdialog" aria-label="처음 상태로 되돌리기" width="measure.xs">
        <Stack gap="lg">
          <Stack gap="xs">
            <Text as="h2" variant="heading">처음 상태로 되돌릴까요?</Text>
            <Text ink="secondary">좋아요, 내가 만든 플레이리스트, 대기열, 설정이 모두 처음으로 돌아갑니다. 되돌릴 수 없습니다.</Text>
          </Stack>
          <Inline justify="end" gap="sm">
            <Button as={Floating.Close} variant="ghost">취소</Button>
            <Button accent="error" onClick={() => { clearStored("music:"); window.location.reload(); }}>되돌리기</Button>
          </Inline>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

const Playback = () => {
  const { settings, set } = useSettings();
  return (
    <>
      <Row first title="자동 재생" note="대기열이 끝나면 비슷한 곡을 이어서 재생합니다."><Switch checked={settings.autoplay} onChange={(event) => set({ autoplay: event.target.checked })} /></Row>
      <Row title="크로스페이드" note="곡이 끝날 때 다음 곡과 겹쳐서 부드럽게 넘어갑니다."><Switch checked={settings.crossfade} onChange={(event) => set({ crossfade: event.target.checked })} /></Row>
      <Row title="크로스페이드 길이" note={`${settings.crossfadeSeconds}초`}>
        <Box width="md"><Slider label="크로스페이드 길이" min={1} max={12} value={settings.crossfadeSeconds} onChange={(value) => set({ crossfadeSeconds: value })} valueText={`${settings.crossfadeSeconds}초`} disabled={!settings.crossfade} /></Box>
      </Row>
      <Row title="볼륨 평준화" note="곡마다 다른 소리 크기를 비슷하게 맞춥니다."><Switch checked={settings.soundCheck} onChange={(event) => set({ soundCheck: event.target.checked })} /></Row>
      <Row title="오른쪽 창" note="미니 플레이어의 버튼으로도 바꿀 수 있습니다.">
        <Pick>
          <Select size="sm" aria-label="오른쪽 창" value={settings.pane} onChange={(event) => set({ pane: event.target.value as Pane })}>
            <Select.Option value="lyrics">가사</Select.Option>
            <Select.Option value="queue">다음 곡</Select.Option>
            <Select.Option value="none">숨김</Select.Option>
          </Select>
        </Pick>
      </Row>
    </>
  );
};

const Audio = () => {
  const { settings, set } = useSettings();
  return (
    <>
      <Stack gap="xs" paddingY="md"><Text as="h2" variant="subheading">스트리밍 음질</Text><Text variant="caption" ink="tertiary">인터넷으로 들을 때의 음질입니다.</Text></Stack>
      <Choices name="스트리밍 음질" value={settings.quality} options={QUALITY} onChange={(id) => set({ quality: id as Quality })} />
      <Divider aria-hidden />
      <Row title="다운로드 음질" note="오프라인으로 저장할 때의 음질입니다.">
        <Pick>
          <Select size="sm" aria-label="다운로드 음질" value={settings.downloadQuality} onChange={(event) => set({ downloadQuality: event.target.value as Quality })}>
            {QUALITY.map((item) => <Select.Option key={item.id} value={item.id}>{item.label}</Select.Option>)}
          </Select>
        </Pick>
      </Row>
      <Row title="돌비 애트모스" note="지원하는 곡을 입체 음향으로 재생합니다.">
        <Pick>
          <Select size="sm" aria-label="돌비 애트모스" value={settings.dolby} onChange={(event) => set({ dolby: event.target.value as "auto" | "on" | "off" })}>
            <Select.Option value="auto">자동</Select.Option>
            <Select.Option value="on">항상 켬</Select.Option>
            <Select.Option value="off">끔</Select.Option>
          </Select>
        </Pick>
      </Row>
      <Row title="이퀄라이저">
        <Pick>
          <Select size="sm" aria-label="이퀄라이저" value={settings.equalizer} onChange={(event) => set({ equalizer: event.target.value as Equalizer })}>
            {EQUALIZERS.map((item) => <Select.Option key={item.id} value={item.id}>{item.label}</Select.Option>)}
          </Select>
        </Pick>
      </Row>
      <Row title="모바일 데이터로 재생" note="Wi-Fi가 아닐 때도 스트리밍합니다."><Switch checked={settings.cellular} onChange={(event) => set({ cellular: event.target.checked })} /></Row>
    </>
  );
};

const LibrarySettings = () => {
  const { settings, set } = useSettings();
  const library = useLibrary();
  const toast = useToast();
  // 저장 공간 사용량은 보관함의 앨범 수에서 가늠한 가짜 숫자입니다.
  const used = library.albums.length * 71_000_000 + library.playlists.length * 3_400_000;
  const limit = settings.storageLimit === "none" ? 16 : Number(settings.storageLimit);
  return (
    <>
      <Row first title="보관함 동기화" note="내 모든 기기에서 같은 보관함을 봅니다."><Switch checked={settings.sync} onChange={(event) => set({ sync: event.target.checked })} /></Row>
      <Row title="저장 공간 최적화" note="한동안 듣지 않은 다운로드를 자동으로 지웁니다."><Switch checked={settings.optimizeStorage} onChange={(event) => set({ optimizeStorage: event.target.checked })} /></Row>
      <Row title="모바일 데이터로 다운로드"><Switch checked={settings.downloadOverCellular} onChange={(event) => set({ downloadOverCellular: event.target.checked })} /></Row>
      <Row title="최대 저장 용량" note="이 용량을 넘으면 오래된 다운로드부터 지웁니다.">
        <Pick>
          <Select size="sm" aria-label="최대 저장 용량" value={settings.storageLimit} onChange={(event) => set({ storageLimit: event.target.value as "none" | "4" | "8" | "16" })}>
            <Select.Option value="none">제한 없음</Select.Option>
            <Select.Option value="4">4GB</Select.Option>
            <Select.Option value="8">8GB</Select.Option>
            <Select.Option value="16">16GB</Select.Option>
          </Select>
        </Pick>
      </Row>
      <Divider aria-hidden />
      <Stack gap="md" paddingY="md">
        <Meter label="다운로드 저장 공간" valueText={`${formatBytes(used)} / ${limit}GB`} value={used / (limit * 1024 ** 3)} />
        <Inline><Button size="sm" variant="hairline" onClick={() => toast("캐시를 지웠습니다")}>캐시 지우기</Button></Inline>
      </Stack>
    </>
  );
};

const Privacy = () => {
  const { settings, set } = useSettings();
  const library = useLibrary();
  const toast = useToast();
  return (
    <>
      <Row first title="재생 기록 남기기" note="들은 곡을 바탕으로 믹스와 추천을 만듭니다."><Switch checked={settings.keepHistory} onChange={(event) => set({ keepHistory: event.target.checked })} /></Row>
      <Row title="듣는 곡 공개" note="친구에게 지금 듣는 곡을 보여 줍니다."><Switch checked={settings.showListening} onChange={(event) => set({ showListening: event.target.checked })} /></Row>
      <Row plain title="재생 기록 지우기" note={`${library.history.length}곡이 남아 있습니다.`}>
        <Button size="sm" variant="hairline" disabled={library.history.length === 0} onClick={() => { library.clearHistory(); toast("재생 기록을 지웠습니다"); }}>지우기</Button>
      </Row>
      <Row plain title="검색 기록 지우기" note={`${library.searches.length}개가 남아 있습니다.`}>
        <Button size="sm" variant="hairline" disabled={library.searches.length === 0} onClick={() => { library.clearSearches(); toast("검색 기록을 지웠습니다"); }}>지우기</Button>
      </Row>
      <Divider aria-hidden />
      <Stack gap="md" paddingY="lg"><Inline><Reset /></Inline></Stack>
    </>
  );
};

export const SettingsPage = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "playback";
  return (
    <>
      <PageHeader title="설정" description="재생과 음질, 보관함을 조절합니다. 바꾸면 바로 저장됩니다." />
      <Tabs
        label="설정"
        value={tab}
        onChange={(next) => setParams(next === "playback" ? {} : { tab: next }, { replace: true })}
        items={[{ id: "playback", label: "재생" }, { id: "audio", label: "오디오" }, { id: "library", label: "보관함" }, { id: "privacy", label: "개인정보" }]}
      />
      <Stack maxWidth="measure.lg">
        {tab === "playback" ? <Playback /> : null}
        {tab === "audio" ? <Audio /> : null}
        {tab === "library" ? <LibrarySettings /> : null}
        {tab === "privacy" ? <Privacy /> : null}
      </Stack>
    </>
  );
};
