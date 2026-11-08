// The machine's limits (SET_VELOCITY_LIMIT): velocity, square corner velocity, acceleration and the minimum cruise ratio.
// A limit that differs from printer.cfg has a button beside it that puts the configured value back.

import { Grid, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { CONFIG_LIMITS } from "../sim/engine";
import { useActions, useSim } from "../sim/Provider";
import { NumberField } from "../ui/Controls";
import { Panel } from "../ui/Panel";

const LIMITS = [
  { key: "velocity", label: "최대 속도", unit: "mm/s", param: "VELOCITY", digits: 0, step: 10, min: 10, max: 600, scale: 1 },
  { key: "squareCornerVelocity", label: "코너 속도", unit: "mm/s", param: "SQUARE_CORNER_VELOCITY", digits: 1, step: 1, min: 0, max: 50, scale: 1 },
  { key: "accel", label: "가속도", unit: "mm/s²", param: "ACCEL", digits: 0, step: 100, min: 50, max: 20000, scale: 1 },
  { key: "minCruiseRatio", label: "최소 순항 비율", unit: "%", param: "MINIMUM_CRUISE_RATIO", digits: 0, step: 5, min: 0, max: 99, scale: 100 },
] as const;

export const LimitsPanel = () => {
  const sim = useSim();
  const { send } = useActions();
  return (
    <Panel id="limits" title="장비 한계" glyph="gauge">
      <Grid columns={{ base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }} gap="lg">
        {LIMITS.map((limit) => {
          const value = sim.limits[limit.key];
          const config = CONFIG_LIMITS[limit.key];
          const changed = Math.abs(value - config) > 1e-9;
          return (
            <Stack key={limit.key} gap="xs">
              <Text as="span" variant="label" strong={false} ink="tertiary">{limit.label}</Text>
              <Inline gap="xs" align="center" wrap={false}>
                <NumberField
                  label={limit.label}
                  value={value * limit.scale}
                  digits={limit.digits}
                  step={limit.step}
                  min={limit.min}
                  max={limit.max}
                  unit={limit.unit}
                  onCommit={(next) => send(`SET_VELOCITY_LIMIT ${limit.param}=${next / limit.scale}`)}
                />
                {changed ? (
                  <IconButton variant="ghost" size="sm" aria-label={`${limit.label}를 설정 값 ${config * limit.scale}으로 되돌리기`} onClick={() => send(`SET_VELOCITY_LIMIT ${limit.param}=${config}`)}><Glyph name="rotate-ccw" /></IconButton>
                ) : null}
              </Inline>
            </Stack>
          );
        })}
      </Grid>
    </Panel>
  );
};
