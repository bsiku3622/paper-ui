import type { ReactNode } from "react";

import { Grid, Stack } from "@studio-baeks/paper-ui";

import { PageHeader } from "../../../kit";
import { ConsolePanel } from "../panels/ConsolePanel";
import { ExtruderPanel } from "../panels/ExtruderPanel";
import { LimitsPanel } from "../panels/LimitsPanel";
import { MacrosPanel } from "../panels/MacrosPanel";
import { MiscPanel } from "../panels/MiscPanel";
import { StatusPanel } from "../panels/StatusPanel";
import { TemperaturePanel } from "../panels/TemperaturePanel";
import { ToolheadPanel } from "../panels/ToolheadPanel";
import { WebcamPanel } from "../panels/WebcamPanel";
import { PANELS, useSettings, type PanelId } from "../settings";

const VIEW: Record<PanelId, ReactNode> = {
  status: <StatusPanel />,
  webcam: <WebcamPanel />,
  toolhead: <ToolheadPanel />,
  extruder: <ExtruderPanel />,
  macros: <MacrosPanel />,
  limits: <LimitsPanel />,
  misc: <MiscPanel />,
  temperatures: <TemperaturePanel />,
  console: <ConsolePanel />,
};

export const Dashboard = () => {
  const { settings } = useSettings();
  const { layout } = settings.dashboard;
  const column = (side: "left" | "right") => PANELS.filter((panel) => layout[panel.id] === side);
  return (
    <>
      <PageHeader title="대시보드" description="출력 상태, 툴헤드, 온도와 콘솔을 한 화면에서 다룹니다." />
      <Grid columns={{ base: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }} gap="lg" align="start">
        {(["left", "right"] as const).map((side) => (
          <Stack key={side} gap="lg" minWidth={0}>
            {column(side).map((panel) => <Stack key={panel.id}>{VIEW[panel.id]}</Stack>)}
          </Stack>
        ))}
      </Grid>
    </>
  );
};
