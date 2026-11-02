// What the demo's screens share, built the way the screens are: Paper's parts and their props, with no stylesheet.

import { useId, useState, type ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Box, Button, Grid, IconButton, Inline, SelectableGroup, Stack, useTheme } from "@studio-baeks/paper-ui";

import { ArrowLeftIcon, MoonIcon, SunIcon } from "../../compositions/icons";

export type TabItem = { id: string; label: ReactNode; panel: ReactNode };

// A tablist is a SelectableGroup of Buttons, and the group itself lays them out. `stretch` gives every tab the same share of
// the width.
export const Tabs = ({ label, tabs, stretch = false }: { label: string; tabs: readonly TabItem[]; stretch?: boolean }) => {
  const base = useId();
  const [value, setValue] = useState(tabs[0]!.id);
  const group = {
    role: "tablist",
    "aria-label": label,
    selectedValues: [value],
    selectionRequired: true,
    onSelectedValuesChange: ([next]: string[]) => { if (next) setValue(next); },
    currentValue: value,
    onCurrentValueChange: setValue,
  };
  const buttons = tabs.map((tab) => (
    <Button key={tab.id} as={SelectableGroup.Item} value={tab.id} role="tab" id={`${base}-tab-${tab.id}`} aria-controls={`${base}-panel-${tab.id}`} variant="ghost" fullWidth={stretch}>
      {tab.label}
    </Button>
  ));
  return (
    <Stack gap="lg">
      {stretch ? <SelectableGroup as={Grid} columns={tabs.length} gap="xs" {...group}>{buttons}</SelectableGroup> : <SelectableGroup as={Inline} gap="xs" {...group}>{buttons}</SelectableGroup>}
      {tabs.map((tab) => (
        <Box key={tab.id} role="tabpanel" id={`${base}-panel-${tab.id}`} aria-labelledby={`${base}-tab-${tab.id}`} hidden={tab.id !== value}>
          {tab.panel}
        </Box>
      ))}
    </Stack>
  );
};

const SCREENS = [
  { to: "/demo", label: "대시보드" },
  { to: "/demo/login", label: "로그인" },
  { to: "/demo/settings", label: "설정 폼" },
] as const;

const ThemeButton = () => {
  const { resolved, setTheme } = useTheme();
  const dark = resolved === "dark";
  return (
    <IconButton size="sm" variant="muted" aria-label={dark ? "라이트 테마로 전환" : "다크 테마로 전환"} onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  );
};

// The bar that names the screens. Each screen places it, because the dashboard's sidebar runs the height of the window beside it.
export const DemoBar = () => {
  const current = useLocation().pathname.replace(/\/$/, "");
  return (
    <Inline as="header" justify="between" gap="md" wrap>
      <Button as={RouterLink} to="/" size="sm" variant="muted"><ArrowLeftIcon /> Paper UI</Button>
      <Inline as="nav" aria-label="데모 화면" gap="xs">
        {SCREENS.map(({ to, label }) => (
          <Button key={to} as={RouterLink} to={to} size="sm" variant="ghost" aria-current={to === current ? "page" : undefined}>{label}</Button>
        ))}
      </Inline>
      <ThemeButton />
    </Inline>
  );
};

// What makes a screen's layout primitive its one main landmark.
export const MAIN = { as: "main", id: "main", tabIndex: -1, minWidth: 0 } as const;
