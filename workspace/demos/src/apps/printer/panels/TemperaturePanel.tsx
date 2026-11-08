import { Box, Button, Divider, Grid, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, type MenuItem } from "../../../kit";
import { TempChart } from "../content/TempChart";
import { MAX_TEMP } from "../sim/engine";
import { useActions, useSim } from "../sim/Provider";
import { useSettings } from "../settings";
import { NumberField } from "../ui/Controls";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

const ROW = { base: "minmax(0, 1fr) 4rem 9.5rem", sm: "minmax(0, 1fr) 3.5rem 4.5rem 9.5rem" } as const;

export const TemperaturePanel = () => {
  const sim = useSim();
  const { send } = useActions();
  const { settings, presets } = useSettings();
  const [, setSettings] = useQueryState("settings");
  const heaters = [
    { id: "extruder", name: "노즐", glyph: "flame", heater: sim.extruder, command: "extruder" },
    { id: "bed", name: "베드", glyph: "bed", heater: sim.bed, command: "heater_bed" },
  ] as const;
  const warm = sim.extruder.target > 0 || sim.bed.target > 0 || sim.extruder.temp > 50 || sim.bed.temp > 40;
  const set = (command: string, target: number) => send(`SET_HEATER_TEMPERATURE HEATER=${command} TARGET=${target}`);
  return (
    <Panel
      id="temperatures"
      title="온도"
      glyph="thermometer"
      actions={
        <>
          <Button variant="ghost" size="xs" disabled={!warm} onClick={() => send("TURN_OFF_HEATERS")}><Glyph name="snowflake" />식히기</Button>
          <IconButton variant="ghost" size="sm" aria-label="온도 설정" onClick={() => setSettings("presets")}><Glyph name="settings" /></IconButton>
        </>
      }
    >
      <Stack gap="lg">
        <Stack role="table" aria-label="히터">
          <Grid role="row" columns={ROW} gap="sm" paddingY="xs">
            <Box role="columnheader"><Text as="span" variant="label" strong={false} ink="tertiary">이름</Text></Box>
            <Box role="columnheader" hideBelow="sm"><Text as="span" variant="label" strong={false} ink="tertiary">전력</Text></Box>
            <Box role="columnheader"><Text as="span" variant="label" strong={false} ink="tertiary">현재</Text></Box>
            <Box role="columnheader"><Text as="span" variant="label" strong={false} ink="tertiary">목표</Text></Box>
          </Grid>
          {heaters.map((row) => {
            const items: MenuItem[] = presets.map((preset) => {
              const value = row.id === "extruder" ? preset.extruder : preset.bed;
              return { id: preset.id, label: preset.name, hint: value === 0 ? "끄기" : `${value}°C`, onSelect: () => set(row.command, value) };
            });
            return (
              <Stack key={row.id}>
                <Divider aria-hidden />
                <Grid role="row" columns={ROW} gap="sm" align="center" paddingY="sm">
                  <Box role="cell" minWidth={0}>
                    <Inline gap="sm" align="center">
                      <Glyph name={row.glyph} ink="secondary" />
                      <Text as="span" truncate>{row.name}</Text>
                    </Inline>
                  </Box>
                  <Box role="cell" hideBelow="sm"><Text as="span" ink="tertiary" numeric>{Math.round(row.heater.power * 100)} %</Text></Box>
                  <Box role="cell"><Text as="span" numeric strong>{row.heater.temp.toFixed(1)}°</Text></Box>
                  <Box role="cell">
                    <Inline gap="xs" align="center" wrap={false}>
                      <NumberField label={`${row.name} 목표 온도`} value={row.heater.target} min={0} max={MAX_TEMP[row.id]} unit="°C" width="sm" onCommit={(value) => set(row.command, value)} />
                      <Menu label={`${row.name} 프리셋`} glyph="chevron-down" items={items} size="sm" />
                    </Inline>
                  </Box>
                </Grid>
              </Stack>
            );
          })}
        </Stack>
        <TempChart
          minutes={settings.dashboard.chartMinutes}
          now={sim.clock}
          hour12={settings.general.hour12}
          showTargets={settings.dashboard.showTargets}
          showPower={settings.dashboard.showPower}
          series={[
            { id: "extruder", label: "노즐", tone: "primary", temp: sim.series.extruder.temp, target: sim.series.extruder.target, power: sim.series.extruder.power },
            { id: "bed", label: "베드", tone: "info", temp: sim.series.bed.temp, target: sim.series.bed.target, power: sim.series.bed.power },
          ]}
        />
      </Stack>
    </Panel>
  );
};
