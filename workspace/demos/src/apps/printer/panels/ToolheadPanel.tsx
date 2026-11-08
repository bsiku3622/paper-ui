import { Link as RouterLink } from "react-router-dom";

import { Badge, Button, Divider, Grid, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, useToast } from "../../../kit";
import { Slider } from "../content/Slider";
import { printing } from "../model";
import { useSettings } from "../settings";
import { useActions, useSim } from "../sim/Provider";
import { NumberField } from "../ui/Controls";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

const sign = (value: number) => (value > 0 ? "+" : "−");
const trim = (value: number) => String(Number(value.toFixed(3)));

const Jog = ({ axis, steps, feed, reverse, disabled }: { axis: "X" | "Y" | "Z"; steps: readonly number[]; feed: number; reverse: boolean; disabled: boolean }) => {
  const { send } = useActions();
  const order = [...steps].sort((a, b) => b - a);
  const columns = `repeat(${order.length * 2 + 1}, minmax(0, 1fr))`;
  const move = (distance: number) => send(["G91", `G1 ${axis}${trim((reverse ? -1 : 1) * distance)} F${feed * 60}`, "G90"]);
  return (
    <Grid columns={columns} gap="xs">
      {order.map((step) => (
        <Button key={`-${step}`} variant="hairline" size="xs" fontSize="label" fullWidth disabled={disabled} aria-label={`${axis} −${trim(step)}`} onClick={() => move(-step)}>{sign(-1)}{trim(step)}</Button>
      ))}
      <Button variant="muted" size="xs" fontSize="label" strong fullWidth disabled={disabled} aria-label={`${axis}축 원점 복귀`} onClick={() => send(`G28 ${axis}`)}>{axis}</Button>
      {[...order].reverse().map((step) => (
        <Button key={`+${step}`} variant="hairline" size="xs" fontSize="label" fullWidth disabled={disabled} aria-label={`${axis} +${trim(step)}`} onClick={() => move(step)}>{sign(1)}{trim(step)}</Button>
      ))}
    </Grid>
  );
};

export const ToolheadPanel = () => {
  const sim = useSim();
  const { send } = useActions();
  const { settings } = useSettings();
  const toast = useToast();
  const [, setSettings] = useQueryState("settings");
  const { control } = settings;
  const busy = printing(sim.print.state);
  const homedAll = sim.homed.x && sim.homed.y && sim.homed.z;
  const axes = [
    { name: "X", gcode: sim.gcode[0], live: sim.live[0], digits: 2 },
    { name: "Y", gcode: sim.gcode[1], live: sim.live[1], digits: 2 },
    { name: "Z", gcode: sim.gcode[2], live: sim.live[2], digits: 3 },
  ] as const;
  const go = (axis: string, value: number) => send(["G90", `G1 ${axis}${trim(value)} F${(axis === "Z" ? control.feedZ : control.feedXY) * 60}`]);
  const speed = Math.round(sim.speedFactor * 100);
  return (
    <Panel
      id="toolhead"
      title="툴헤드"
      glyph="move"
      actions={
        <>
          <Menu
            label="툴헤드 명령"
            items={[
              { id: "screws", label: "베드 나사 기울기 계산", glyph: "ruler", disabled: busy, onSelect: () => send("SCREWS_TILT_CALCULATE") },
              { id: "mesh", label: "베드 메시 보정", glyph: "grid-3x3", disabled: busy, onSelect: () => send("BED_MESH_CALIBRATE") },
              { id: "probe", label: "프로브 Z 오프셋 보정", glyph: "crosshair", disabled: busy, onSelect: () => send("PROBE_CALIBRATE") },
              { id: "d", divider: true },
              { id: "endstops", label: "엔드스톱 읽기", glyph: "arrow-up-to-line", onSelect: () => send("QUERY_ENDSTOPS") },
              { id: "save", label: "Z 오프셋을 설정에 저장", glyph: "save", disabled: busy, onSelect: () => toast("SAVE_CONFIG는 출력이 끝난 뒤에 보내세요") },
            ]}
          />
          <IconButton variant="ghost" size="sm" aria-label="툴헤드 설정" onClick={() => setSettings("control")}><Glyph name="settings" /></IconButton>
        </>
      }
    >
      <Stack gap="lg">
        <Inline justify="between" align="center" gap="md" wrap>
          <Inline gap="sm" align="center">
            <Glyph name="crosshair" ink="secondary" />
            <Text as="span" ink="secondary">위치: {sim.absolute ? "절대" : "상대"} 좌표</Text>
            <Badge accent={homedAll ? "success" : "warning"} variant="soft" size="sm" dot>{homedAll ? "원점 복귀됨" : "원점 복귀 필요"}</Badge>
          </Inline>
          <Button as={RouterLink} to="/printer/heightmap" variant="ghost" size="xs"><Glyph name="grid-3x3" />{sim.meshProfile ?? "메시 없음"}</Button>
        </Inline>
        <Grid columns={3} gap="sm">
          {axes.map((axis) => (
            <Stack key={axis.name} gap="xs">
              <Inline justify="end">
                <Text as="span" variant="label" strong={false} ink="tertiary" numeric>[ {axis.live.toFixed(axis.digits)} ]</Text>
              </Inline>
              <NumberField
                label={`${axis.name} 위치`}
                value={axis.gcode}
                digits={axis.digits}
                step={axis.name === "Z" ? 0.1 : 1}
                disabled={busy || !sim.homed[axis.name.toLowerCase() as "x" | "y" | "z"]}
                leading={<Text as="span" ink="secondary">{axis.name}</Text>}
                onCommit={(value) => go(axis.name, value)}
              />
            </Stack>
          ))}
        </Grid>
        <Inline gap="sm" wrap>
          <Button size="sm" variant="hairline" disabled={busy} onClick={() => send("G28")}><Glyph name="house" />전체 홈</Button>
          {control.axisHome
            ? (["X", "Y", "Z"] as const).map((axis) => <Button key={axis} size="sm" variant="hairline" disabled={busy} onClick={() => send(`G28 ${axis}`)}>{axis}</Button>)
            : null}
          <Button size="sm" variant="hairline" disabled={busy} onClick={() => send("M84")}><Glyph name="power-off" />모터 끄기</Button>
        </Inline>
        <Stack gap="xs">
          <Jog axis="X" steps={control.stepsXY} feed={control.feedXY} reverse={control.reverseX} disabled={busy} />
          <Jog axis="Y" steps={control.stepsXY} feed={control.feedXY} reverse={control.reverseY} disabled={busy} />
          <Jog axis="Z" steps={control.stepsZ} feed={control.feedZ} reverse={control.reverseZ} disabled={busy} />
        </Stack>
        <Divider />
        <Stack gap="sm">
          <Inline gap="sm" align="center">
            <Glyph name="layers-2" ink="secondary" />
            <Text as="span" ink="secondary">Z 오프셋: <Text as="span" numeric>{sim.zOffset.toFixed(3)}</Text></Text>
          </Inline>
          <Grid columns={control.zOffsetSteps.length} gap="xs">
            {control.zOffsetSteps.map((step) => (
              <Button key={`+${step}`} variant="hairline" size="xs" fontSize="label" fullWidth aria-label={`Z 오프셋 +${trim(step)} (위로)`} onClick={() => send(`SET_GCODE_OFFSET Z_ADJUST=${trim(step)} MOVE=1`)}>
                {step === control.zOffsetSteps[0] ? <Glyph name="arrow-up-to-line" /> : null}+{trim(step)}
              </Button>
            ))}
            {control.zOffsetSteps.map((step) => (
              <Button key={`-${step}`} variant="hairline" size="xs" fontSize="label" fullWidth aria-label={`Z 오프셋 −${trim(step)} (아래로)`} onClick={() => send(`SET_GCODE_OFFSET Z_ADJUST=${trim(-step)} MOVE=1`)}>
                {step === control.zOffsetSteps[0] ? <Glyph name="arrow-down-to-line" /> : null}−{trim(step)}
              </Button>
            ))}
          </Grid>
        </Stack>
        <Divider />
        <Stack gap="sm">
          <Inline justify="between" align="center" gap="md">
            <Inline gap="sm" align="center">
              <Glyph name="gauge" ink="secondary" />
              <Text as="span" ink="secondary">속도 배율</Text>
            </Inline>
            <NumberField label="속도 배율" value={speed} min={10} max={300} unit="%" step={5} onCommit={(value) => send(`M220 S${Math.round(value)}`)} width="sm" />
          </Inline>
          <Grid columns="auto minmax(0, 1fr) auto" gap="sm" align="center">
            <IconButton variant="ghost" size="sm" aria-label="속도 배율 5% 낮추기" onClick={() => send(`M220 S${Math.max(10, speed - 5)}`)}><Glyph name="minus" /></IconButton>
            <Slider label="속도 배율" value={speed} min={10} max={250} step={5} onCommit={(value) => send(`M220 S${value}`)} />
            <IconButton variant="ghost" size="sm" aria-label="속도 배율 5% 높이기" onClick={() => send(`M220 S${Math.min(300, speed + 5)}`)}><Glyph name="plus" /></IconButton>
          </Grid>
        </Stack>
      </Stack>
    </Panel>
  );
};
