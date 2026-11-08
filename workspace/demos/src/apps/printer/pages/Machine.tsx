// The machine: the printer's config files (and an editor for them), the loads of its MCU and host, the update manager, the
// endstops and the log files. Mainsail's "Machine" page.

import { Grid, Stack } from "@studio-baeks/paper-ui";

import { PageHeader } from "../../../kit";
import { ConfigFiles } from "../parts/ConfigFiles";
import { EndstopsPanel, LoadsPanel, LogsPanel, UpdatesPanel } from "../parts/SystemPanels";

export const Machine = () => (
  <>
    <PageHeader title="장비" description="설정 파일, 컴퓨터의 부하, 소프트웨어 업데이트와 로그를 다룹니다." />
    <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1.1fr) minmax(0, 1fr)" }} gap="lg" align="start">
      <Stack gap="lg" minWidth={0}>
        <ConfigFiles />
      </Stack>
      <Stack gap="lg" minWidth={0}>
        <LoadsPanel />
        <UpdatesPanel />
        <Grid columns={{ base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }} gap="lg" align="start">
          <EndstopsPanel />
          <LogsPanel />
        </Grid>
      </Stack>
    </Grid>
  </>
);
