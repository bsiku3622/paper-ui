// What else the printer has: the part cooling fan (M106), the beeper (an output pin) and the hotend fan, which Klipper runs by
// itself when the nozzle is warm.

import { Divider, Grid, IconButton, Inline, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { Slider } from "../content/Slider";
import { useActions, useSim } from "../sim/Provider";
import { NumberField } from "../ui/Controls";
import { Panel } from "../ui/Panel";

export const MiscPanel = () => {
  const sim = useSim();
  const { send } = useActions();
  const fan = Math.round(sim.fan * 100);
  const set = (percent: number) => send(percent <= 0 ? "M107" : `M106 S${Math.round((percent / 100) * 255)}`);
  return (
    <Panel id="misc" title="기타" glyph="fan">
      <Stack gap="md">
        <Stack gap="sm">
          <Inline justify="between" align="center" gap="md">
            <Inline gap="sm" align="center">
              <Glyph name="fan" ink="secondary" />
              <Text as="span" ink="secondary">출력 팬</Text>
            </Inline>
            <NumberField label="출력 팬 속도" value={fan} min={0} max={100} unit="%" onCommit={set} width="sm" />
          </Inline>
          <Grid columns="auto minmax(0, 1fr) auto" gap="sm" align="center">
            <IconButton variant="ghost" size="sm" aria-label="팬 끄기" onClick={() => set(0)}><Glyph name="minus" /></IconButton>
            <Slider label="출력 팬 속도" value={fan} min={0} max={100} step={1} onCommit={set} />
            <IconButton variant="ghost" size="sm" aria-label="팬 최대" onClick={() => set(100)}><Glyph name="plus" /></IconButton>
          </Grid>
        </Stack>
        <Divider />
        <Inline justify="between" align="center" gap="md" as="label">
          <Text as="span" ink="secondary">비퍼</Text>
          <Switch aria-label="비퍼" checked={sim.beeper} onChange={(event) => send(`SET_PIN PIN=beeper VALUE=${event.target.checked ? 1 : 0}`)} />
        </Inline>
        <Divider />
        <Inline justify="between" align="center" gap="md">
          <Inline gap="sm" align="center">
            <Glyph name="fan" ink="secondary" />
            <Text as="span" ink="secondary">핫엔드 팬</Text>
          </Inline>
          <Text as="span" numeric>{Math.round(sim.hotendFan * 100)} %</Text>
        </Inline>
      </Stack>
    </Panel>
  );
};
