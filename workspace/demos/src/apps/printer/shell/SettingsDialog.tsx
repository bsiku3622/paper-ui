// The settings dialog: Mainsail's tabs (general, UI, webcams, macros, presets, control, console, dashboard, G-code viewer,
// editor, navigation) in a list on the left and the chosen tab on the right. Which tab is open is in the address
// (?settings=presets), so any panel's gear opens its own tab and a screenshot can show each.

import { type ReactNode } from "react";

import { Box, Button, Grid, SelectableGroup } from "@studio-baeks/paper-ui";

import { Glyph, type GlyphName } from "../../../kit";
import { Dialog } from "../ui/Dialog";
import { useQueryState } from "../ui/useQueryState";
import { ConsoleTab, ControlTab, DashboardTab, EditorTab, GeneralTab, MacrosTab, NavTab, PresetsTab, UiTab, ViewerTab, WebcamsTab } from "./SettingsTabs";

type Tab = { id: string; label: string; glyph: GlyphName; view: ReactNode };

const TABS: readonly Tab[] = [
  { id: "general", label: "일반", glyph: "settings", view: <GeneralTab /> },
  { id: "ui", label: "화면", glyph: "palette", view: <UiTab /> },
  { id: "webcams", label: "웹캠", glyph: "webcam", view: <WebcamsTab /> },
  { id: "macros", label: "매크로", glyph: "code", view: <MacrosTab /> },
  { id: "presets", label: "프리셋", glyph: "thermometer", view: <PresetsTab /> },
  { id: "control", label: "제어", glyph: "gamepad-2", view: <ControlTab /> },
  { id: "console", label: "콘솔", glyph: "terminal", view: <ConsoleTab /> },
  { id: "dashboard", label: "대시보드", glyph: "layout-dashboard", view: <DashboardTab /> },
  { id: "viewer", label: "G-code 뷰어", glyph: "layers", view: <ViewerTab /> },
  { id: "editor", label: "편집기", glyph: "pencil-line", view: <EditorTab /> },
  { id: "nav", label: "탐색", glyph: "panel-left", view: <NavTab /> },
];

export const SettingsDialog = () => {
  const [value, setValue] = useQueryState("settings");
  const tab = TABS.find((item) => item.id === value) ?? TABS[0]!;
  return (
    <Dialog open={value !== null} onClose={() => setValue(null)} title="설정" description="이 브라우저에만 저장합니다. 프린터에는 아무것도 보내지 않습니다." size="full" steady>
      <Grid columns={{ base: "minmax(0, 1fr)", md: "11rem minmax(0, 1fr)" }} gap="xl" align="start">
        <SelectableGroup
          as={Grid}
          role="tablist"
          aria-label="설정 구역"
          aria-orientation="vertical"
          columns={{ base: "repeat(2, minmax(0, 1fr))", md: "minmax(0, 1fr)" }}
          gap="xs"
          selectedValues={[tab.id]}
          selectionRequired
          onSelectedValuesChange={([next]: string[]) => { if (next) setValue(next); }}
          currentValue={tab.id}
          onCurrentValueChange={setValue}
          orientation="vertical"
        >
          {TABS.map((item) => (
            <Button
              key={item.id}
              as={SelectableGroup.Item}
              value={item.id}
              role="tab"
              id={`settings-tab-${item.id}`}
              aria-controls="settings-panel"
              variant="ghost"
              size="sm"
              fontSize="body"
              fullWidth
              justify="start"
            >
              <Glyph name={item.glyph} />
              {item.label}
            </Button>
          ))}
        </SelectableGroup>
        <Box role="tabpanel" id="settings-panel" aria-labelledby={`settings-tab-${tab.id}`} minWidth={0}>
          {tab.view}
        </Box>
      </Grid>
    </Dialog>
  );
};
