// The frame of the console: Mainsail's navigation on the left (eight pages, in the order the user set), a top bar with the
// state of the print and the emergency stop, notifications, settings and power, and the settings dialog over everything.

import { useEffect, type ReactNode } from "react";

import { Badge, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { AppShell, Meter, Sidebar, SidebarBrand, SidebarCard, TopBar, type NavItem } from "../../../kit";
import { printing } from "../model";
import { useSim } from "../sim/Provider";
import { useSettings, NAV } from "../settings";
import { STATE_ACCENT, STATE_LABEL } from "../status";
import { degrees } from "../format";
import { TopActions } from "./TopActions";
import { SettingsDialog } from "./SettingsDialog";

const ROOT = "/printer";

const ITEMS: Record<string, NavItem> = {
  dashboard: { id: "dashboard", label: "대시보드", glyph: "layout-dashboard", to: ROOT, end: true },
  cam: { id: "cam", label: "웹캠", glyph: "webcam", to: `${ROOT}/cam` },
  console: { id: "console", label: "콘솔", glyph: "terminal", to: `${ROOT}/console` },
  heightmap: { id: "heightmap", label: "높이 지도", glyph: "grid-3x3", to: `${ROOT}/heightmap` },
  files: { id: "files", label: "G-code 파일", glyph: "file-code", to: `${ROOT}/files` },
  viewer: { id: "viewer", label: "G-code 뷰어", glyph: "layers", to: `${ROOT}/viewer` },
  history: { id: "history", label: "기록", glyph: "history", to: `${ROOT}/history` },
  machine: { id: "machine", label: "장비", glyph: "wrench", to: `${ROOT}/machine` },
};

const Side = () => {
  const sim = useSim();
  const { settings } = useSettings();
  const order = [...settings.nav.order, ...NAV.map((item) => item.id).filter((id) => !settings.nav.order.includes(id))];
  const items = order.filter((id) => !settings.nav.hidden.includes(id) && ITEMS[id]).map((id) => ({ ...ITEMS[id]!, count: id === "files" ? sim.files.length : undefined }));
  const { print } = sim;
  const active = printing(print.state);
  return (
    <Sidebar
      label="프린터 메뉴"
      brand={<SidebarBrand name={settings.general.name} glyph="printer" to={ROOT} sub="Ender-3 V3 SE · Klipper" />}
      sections={[{ items }]}
      footer={
        <SidebarCard>
          <Stack gap="sm">
            <Inline justify="between" align="center" gap="sm">
              <Badge accent={STATE_ACCENT[print.state]} variant="soft" dot>{STATE_LABEL[print.state]}</Badge>
              <Text as="span" variant="caption" ink="tertiary" numeric>{active || print.state === "complete" ? `${Math.floor(print.progress * 100)}%` : "—"}</Text>
            </Inline>
            {print.file ? <Meter value={print.progress} tone={print.state === "complete" ? "success" : "primary"} weight="thin" label={print.file} /> : <Text as="span" variant="caption" ink="tertiary">선택한 파일 없음</Text>}
            <Inline justify="between" gap="sm">
              <Text as="span" variant="caption" ink="secondary" numeric>노즐 {degrees(sim.extruder.temp)}</Text>
              <Text as="span" variant="caption" ink="secondary" numeric>베드 {degrees(sim.bed.temp)}</Text>
            </Inline>
          </Stack>
        </SidebarCard>
      }
    />
  );
};

const Summary = () => {
  const { print } = useSim();
  const active = printing(print.state);
  return (
    <>
      <Badge accent={STATE_ACCENT[print.state]} variant="soft" dot>{STATE_LABEL[print.state]}</Badge>
      {print.file ? <Text as="span" ink="secondary" truncate>{print.file}</Text> : <Text as="span" ink="tertiary">선택한 파일 없음</Text>}
      {active || print.state === "complete" ? <Text as="span" ink="tertiary" numeric>{(print.progress * 100).toFixed(1)}%</Text> : null}
    </>
  );
};

// With the tab-title setting on, the browser tab says how far the print is.
const useTabTitle = () => {
  const { print } = useSim();
  const { settings } = useSettings();
  const on = settings.general.titleProgress;
  const text = printing(print.state) ? `${Math.floor(print.progress * 100)}% · ${settings.general.name}` : settings.general.name;
  useEffect(() => {
    if (!on) return;
    const before = document.title;
    document.title = text;
    return () => {
      document.title = before;
    };
  }, [on, text]);
};

export const Shell = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  useTabTitle();
  return (
    <AppShell kind="board" name={settings.general.name} sidebar={<Side />} top={<TopBar start={<Summary />} end={<TopActions />} />}>
      {children}
      <SettingsDialog />
    </AppShell>
  );
};
