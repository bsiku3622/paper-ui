import { useState } from "react";

import { Badge, Box, Button, Divider, Grid, IconButton, Inline, Select, Spinner, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, useToast } from "../../../kit";
import { FilePicker } from "../content/files";
import { LayerView } from "../content/LayerView";
import { buildLayer, partFor, type Quality } from "../content/layers";
import { Slider } from "../content/Slider";
import { makeFile } from "../files";
import { grams, longDuration, metres, millimetres } from "../format";
import type { FileEntry } from "../model";
import { printing } from "../model";
import { useSettings } from "../settings";
import { layersOf } from "../sim/engine";
import { useSim } from "../sim/Provider";
import { KeyValue } from "../ui/Controls";
import { Panel } from "../ui/Panel";
import { useBriefly } from "../ui/useBriefly";
import { useQueryState } from "../ui/useQueryState";

const LEGEND = [
  { key: "outer", label: "바깥 벽", accent: "primary" },
  { key: "inner", label: "안쪽 벽", accent: "info" },
  { key: "infill", label: "채움", accent: "warning" },
  { key: "solid", label: "윗면·아랫면 채움", accent: "success" },
] as const;

export const Viewer = () => {
  const sim = useSim();
  const { settings, patch } = useSettings();
  const toast = useToast();
  const [param, setParam] = useQueryState("file");
  const [local, setLocal] = useState<FileEntry | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const { viewer } = settings;
  const currentPath = sim.print.file ? sim.files.find((file) => file.path === sim.print.file || file.name === sim.print.file)?.path ?? null : null;
  const file = local ?? (param ? sim.files.find((item) => item.path === param) : undefined) ?? (currentPath ? sim.files.find((item) => item.path === currentPath) : undefined) ?? sim.files[0];
  const loading = useBriefly(`${file?.path ?? ""}${local ? ":local" : ""}`, 300);
  if (!file) return <Empty glyph="layers" title="볼 파일이 없습니다" description="G-code 파일 화면에서 파일을 올려 주세요." />;
  const { meta } = file;
  const total = Math.max(1, Math.round(meta.objectHeight / meta.layerHeight));
  const isCurrent = !local && file.path === currentPath && (printing(sim.print.state) || sim.print.state === "complete");
  const printed = isCurrent ? Math.min(total, layersOf(sim).current) : null;
  const layer = Math.min(total, Math.max(1, viewer.follow && printed !== null ? printed : picked ?? printed ?? Math.ceil(total / 2)));
  const part = partFor(file.name);
  const info = buildLayer(part, layer, total, meta.layerHeight, viewer.quality);
  const nozzle = isCurrent && viewer.nozzle && printed === layer ? { x: sim.gcode[0], y: sim.gcode[1] } : null;
  const go = (next: number) => setPicked(Math.min(total, Math.max(1, next)));
  return (
    <>
      <PageHeader
        title="G-code 뷰어"
        description="파일의 한 층을 위에서 본 모습입니다. 모의 데이터라 파일의 실제 경로가 아니라 숫자에서 그린 약식 그림입니다."
        actions={
          <>
            <Button variant="hairline" disabled={!currentPath} onClick={() => { setLocal(null); setParam(null); setPicked(null); }}><Glyph name="printer" />현재 파일</Button>
            <FilePicker accept=".gcode,.gco,.g" onPick={([first]) => { if (first) { setLocal(makeFile(first.name, first.size, Math.round(sim.clock / 1000), "")); setPicked(null); toast(`${first.name}: 이름과 크기만 읽었습니다`); } }}>
              {(open) => <Button variant="hairline" onClick={open}><Glyph name="folder-open" />로컬 파일</Button>}
            </FilePicker>
          </>
        }
      />
      <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 2fr) minmax(0, 1fr)" }} gap="lg" align="start">
        <Panel id="viewer" title={file.name} glyph="layers" collapsible={false}>
          <Stack gap="lg">
            <Inline gap="sm" wrap>
              <Box width="md" maxWidth="full">
                <Select size="sm" aria-label="색상 모드" value={viewer.colorMode} onChange={(event) => patch("viewer", { colorMode: event.target.value as typeof viewer.colorMode })}>
                  <Select.Option value="feature">색상: 특징</Select.Option>
                  <Select.Option value="speed">색상: 속도</Select.Option>
                  <Select.Option value="layer">색상: 높이</Select.Option>
                </Select>
              </Box>
              <Box width="md" maxWidth="full">
                <Select size="sm" aria-label="렌더 품질" value={viewer.quality} onChange={(event) => patch("viewer", { quality: event.target.value as Quality })}>
                  <Select.Option value="low">품질: 낮음</Select.Option>
                  <Select.Option value="medium">품질: 보통</Select.Option>
                  <Select.Option value="high">품질: 높음</Select.Option>
                </Select>
              </Box>
            </Inline>
            {loading ? (
              <Stack align="center" justify="center" gap="sm" height="xl">
                <Spinner label="파일을 읽는 중" />
                <Text as="span" ink="tertiary">파일을 읽는 중입니다</Text>
              </Stack>
            ) : (
              <LayerView name={file.name} layer={layer} total={total} layerHeight={meta.layerHeight} mode={viewer.colorMode} travel={viewer.travel} previous={viewer.previous} grid={viewer.grid} fit={viewer.fit} lineScale={viewer.lineScale} quality={viewer.quality} nozzle={nozzle} />
            )}
            <Stack gap="sm">
              <Inline justify="between" align="center" gap="md" wrap>
                <Text as="span" strong numeric>레이어 {layer} <Text as="span" ink="tertiary">/ {total}</Text> · Z {info.z.toFixed(2)} mm</Text>
                <Inline gap="xs">
                  <IconButton variant="hairline" size="sm" aria-label="이전 레이어" disabled={layer <= 1} onClick={() => go(layer - 1)}><Glyph name="chevron-down" /></IconButton>
                  <IconButton variant="hairline" size="sm" aria-label="다음 레이어" disabled={layer >= total} onClick={() => go(layer + 1)}><Glyph name="chevron-up" /></IconButton>
                  <Button variant="hairline" size="sm" disabled={printed === null} onClick={() => go(printed ?? 1)}><Glyph name="crosshair" />출력 중인 층</Button>
                </Inline>
              </Inline>
              <Slider label="레이어" value={layer} min={1} max={total} step={1} onChange={go} onCommit={go} />
            </Stack>
          </Stack>
        </Panel>
        <Stack gap="lg" minWidth={0}>
          <Panel id="viewer-layer" title="이 층" glyph="info" collapsible={false}>
            <KeyValue
              rows={[
                ["레이어", `${layer} / ${total}`],
                ["높이", `${info.z.toFixed(2)} mm`],
                ["선 길이", `${(info.length / 1000).toFixed(2)} m`],
                ["레이어 높이", millimetres(meta.layerHeight)],
                ["채움", layer <= 4 || layer > total - 5 ? "꽉 채움" : "15%"],
              ]}
            />
          </Panel>
          <Panel id="viewer-file" title="파일" glyph="file-code" collapsible={false}>
            <KeyValue
              rows={[
                ["개체 높이", millimetres(meta.objectHeight)],
                ["슬라이서가 센 층", `${meta.layerCount}`],
                ["예상 시간", longDuration(meta.estimatedTime)],
                ["필라멘트", `${grams(meta.filamentWeight)} · ${metres(meta.filamentTotal)}`],
              ]}
            />
          </Panel>
          <Panel id="viewer-options" title="보기" glyph="sliders-horizontal" collapsible={false}>
            <Stack gap="md">
              {viewer.colorMode === "feature" ? (
                <Inline gap="sm" wrap>
                  {LEGEND.map((item) => <Badge key={item.key} accent={item.accent} variant="soft" size="sm" dot>{item.label}</Badge>)}
                </Inline>
              ) : (
                <Text variant="caption" ink="tertiary">{viewer.colorMode === "speed" ? "진할수록 빠르게 그린 선입니다." : "진할수록 높은 층입니다."}</Text>
              )}
              <Divider />
              {([
                ["travel", "이동 경로"],
                ["previous", "이전 층 흐리게"],
                ["nozzle", "노즐 위치"],
                ["grid", "격자"],
                ["fit", "모델에 맞추기"],
                ["follow", "출력을 따라가기"],
              ] as const).map(([key, label]) => (
                <Inline key={key} as="label" justify="between" align="center" gap="md">
                  <Text as="span" ink="secondary">{label}</Text>
                  <Switch aria-label={label} checked={viewer[key]} onChange={(event) => patch("viewer", { [key]: event.target.checked } as Partial<typeof viewer>)} />
                </Inline>
              ))}
              <Stack gap="xs">
                <Inline justify="between"><Text as="span" ink="secondary">선 굵기</Text><Text as="span" numeric ink="tertiary">×{viewer.lineScale.toFixed(1)}</Text></Inline>
                <Slider label="선 굵기" value={viewer.lineScale} min={0.8} max={3} step={0.1} onChange={(value) => patch("viewer", { lineScale: value })} onCommit={(value) => patch("viewer", { lineScale: value })} />
              </Stack>
            </Stack>
          </Panel>
        </Stack>
      </Grid>
    </>
  );
};
