// The extruder: the extrusion factor, pressure advance and its smooth time, and a manual extrude or retract of a chosen length
// at a chosen feed. Extruding is refused while a print runs or the nozzle is below the minimum temperature, as Klipper would.

import { useState } from "react";

import { Button, Grid, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu } from "../../../kit";
import { Slider } from "../content/Slider";
import { printing } from "../model";
import { useSettings } from "../settings";
import { FILAMENT_AREA, MIN_EXTRUDE_TEMP } from "../sim/engine";
import { useActions, useSim } from "../sim/Provider";
import { NumberField } from "../ui/Controls";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

const Presets = ({ values, current, unit, onPick, label }: { values: readonly number[]; current: number; unit: string; onPick: (value: number) => void; label: string }) => (
  <Grid columns={values.length} gap="xs" role="group" aria-label={label}>
    {[...values].sort((a, b) => b - a).map((value) => (
      <Button key={value} variant="hairline" size="xs" fontSize="label" fullWidth selected={value === current} aria-label={`${value}${unit}`} onClick={() => onPick(value)}>{value}</Button>
    ))}
  </Grid>
);

export const ExtruderPanel = () => {
  const sim = useSim();
  const { send } = useActions();
  const { settings } = useSettings();
  const [, setSettings] = useQueryState("settings");
  const [length, setLength] = useState(25);
  const [rate, setRate] = useState(5);
  const busy = printing(sim.print.state);
  const cold = sim.extruder.temp < MIN_EXTRUDE_TEMP;
  const refuse = busy || cold;
  const factor = Math.round(sim.extrudeFactor * 100);
  const flow = rate * FILAMENT_AREA;
  const extrude = (sign: 1 | -1) => send(["M83", `G1 E${sign * length} F${rate * 60}`]);
  const note = busy ? "출력 중에는 압출기를 직접 움직일 수 없습니다" : cold ? `노즐이 ${MIN_EXTRUDE_TEMP}°C 이상이어야 합니다 (지금 ${sim.extruder.temp.toFixed(0)}°C)` : `압출 ≈ ${length} mm @ ${flow.toFixed(0)} mm³/s · 노즐 Ø 0.4 mm`;
  return (
    <Panel
      id="extruder"
      title="압출기"
      glyph="flame"
      actions={
        <>
          <Menu
            label="압출기 명령"
            items={[
              { id: "load", label: "필라멘트 넣기 (LOAD_FILAMENT)", glyph: "arrow-down-to-line", disabled: busy, onSelect: () => send("LOAD_FILAMENT") },
              { id: "unload", label: "필라멘트 빼기 (UNLOAD_FILAMENT)", glyph: "arrow-up-to-line", disabled: busy, onSelect: () => send("UNLOAD_FILAMENT") },
              { id: "d", divider: true },
              { id: "zero", label: "압출기 위치를 0으로 (G92 E0)", glyph: "rotate-ccw", onSelect: () => send("G92 E0") },
            ]}
          />
          <IconButton variant="ghost" size="sm" aria-label="압출기 설정" onClick={() => setSettings("control")}><Glyph name="settings" /></IconButton>
        </>
      }
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Inline justify="between" align="center" gap="md">
            <Inline gap="sm" align="center">
              <Glyph name="gauge" ink="secondary" />
              <Text as="span" ink="secondary">압출 배율</Text>
            </Inline>
            <NumberField label="압출 배율" value={factor} min={10} max={200} unit="%" step={1} onCommit={(value) => send(`M221 S${Math.round(value)}`)} width="sm" />
          </Inline>
          <Grid columns="auto minmax(0, 1fr) auto" gap="sm" align="center">
            <IconButton variant="ghost" size="sm" aria-label="압출 배율 1% 낮추기" onClick={() => send(`M221 S${Math.max(10, factor - 1)}`)}><Glyph name="minus" /></IconButton>
            <Slider label="압출 배율" value={factor} min={50} max={150} step={1} onCommit={(value) => send(`M221 S${value}`)} />
            <IconButton variant="ghost" size="sm" aria-label="압출 배율 1% 높이기" onClick={() => send(`M221 S${Math.min(200, factor + 1)}`)}><Glyph name="plus" /></IconButton>
          </Grid>
        </Stack>
        <Grid columns={2} gap="md">
          <Stack gap="xs">
            <Text as="span" variant="label" strong={false} ink="tertiary">프레셔 어드밴스</Text>
            <NumberField label="프레셔 어드밴스" value={sim.pressureAdvance} digits={3} step={0.005} min={0} max={1} unit="s" onCommit={(value) => send(`SET_PRESSURE_ADVANCE ADVANCE=${value}`)} />
          </Stack>
          <Stack gap="xs">
            <Text as="span" variant="label" strong={false} ink="tertiary">스무스 타임</Text>
            <NumberField label="스무스 타임" value={sim.smoothTime} digits={3} step={0.005} min={0} max={0.2} unit="s" onCommit={(value) => send(`SET_PRESSURE_ADVANCE SMOOTH_TIME=${value}`)} />
          </Stack>
        </Grid>
        <Grid columns={{ base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }} gap="md">
          <Stack gap="xs">
            <Text as="span" variant="label" strong={false} ink="tertiary">필라멘트 길이</Text>
            <NumberField label="필라멘트 길이" value={length} min={0} max={500} unit="mm" disabled={busy} onCommit={setLength} />
            <Presets values={settings.control.lengths} current={length} unit="mm" label="길이 바로 고르기" onPick={setLength} />
          </Stack>
          <Stack gap="xs">
            <Text as="span" variant="label" strong={false} ink="tertiary">압출 속도</Text>
            <NumberField label="압출 속도" value={rate} min={1} max={50} unit="mm/s" disabled={busy} onCommit={setRate} />
            <Presets values={settings.control.rates} current={rate} unit="mm/s" label="속도 바로 고르기" onPick={setRate} />
          </Stack>
        </Grid>
        <Stack gap="sm">
          <Inline gap="sm" justify="center" wrap>
            <Button variant="hairline" size="sm" disabled={refuse} onClick={() => extrude(-1)}><Glyph name="arrow-up" />되감기</Button>
            <Button variant="hairline" size="sm" disabled={refuse} onClick={() => extrude(1)}><Glyph name="arrow-down" />압출</Button>
          </Inline>
          <Inline justify="center"><Text as="span" variant="caption" ink="tertiary">{note}</Text></Inline>
        </Stack>
      </Stack>
    </Panel>
  );
};
