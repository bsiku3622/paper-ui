import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { Box, Floating, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "./Glyph";
import { onlyBelowMd } from "./kit.css";

export type ShellKind = "board" | "page";

type Shell = { folded: boolean };
const ShellCtx = createContext<Shell>({ folded: false });
export const useShell = () => useContext(ShellCtx);

export type AppShellProps = {
  kind?: ShellKind;
  name: string;
  sidebar?: ReactNode;
  aside?: ReactNode;
  top?: ReactNode;
  topSpan?: "main" | "full";
  bottom?: ReactNode;
  sidebarWidth?: string;
  asideWidth?: string;
  children: ReactNode;
};

const FACE = { fill: "raised", shadow: true } as const;
export const useFace = () => FACE;

const MobileMenu = ({ name, sidebar }: { name: string; sidebar: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  useEffect(() => setOpen(false), [pathname, search]);
  return (
    <Box className={onlyBelowMd}>
      <Floating open={open} onOpenChange={setOpen}>
        <Inline gap="sm" align="center">
          <IconButton as={Floating.Trigger} variant="ghost" aria-label={`${name} 메뉴 열기`}><Glyph name="menu" /></IconButton>
          <Text as="span" variant="subheading">{name}</Text>
        </Inline>
        <Floating.Content as={Surface} fill="raised" radius="lg" padding="md" presentation="modal" aria-label={`${name} 메뉴`}>
          <ShellCtx.Provider value={{ folded: true }}>
            <Box maxHeight="80dvh" overflowY="auto">{sidebar}</Box>
          </ShellCtx.Provider>
        </Floating.Content>
      </Floating>
    </Box>
  );
};

export const AppShell = ({ name, sidebar, aside, top, topSpan = "main", bottom, sidebarWidth = "15.5rem", asideWidth = "20rem", children }: AppShellProps) => {
  const middle = "minmax(0, 1fr)";
  const columns = {
    base: middle,
    md: sidebar ? `${sidebarWidth} ${middle}` : middle,
    lg: [sidebar ? sidebarWidth : null, middle, aside ? asideWidth : null].filter(Boolean).join(" "),
  };
  return (
    <ShellCtx.Provider value={{ folded: false }}>
      <Surface minHeight="viewport">
        <Stack gap="lg" padding="lg" minWidth={0}>
          {topSpan === "full" && top ? top : null}
          <Grid columns={columns} gap="xl" align="start">
            {sidebar}
            <Stack gap="lg" minWidth={0}>
              {sidebar ? <MobileMenu name={name} sidebar={sidebar} /> : null}
              {topSpan === "main" && top ? top : null}
              <Stack as="main" id="main" tabIndex={-1} minWidth={0} gap="xl">{children}</Stack>
            </Stack>
            {aside ? <Box hideBelow="lg" minWidth={0} height="full">{aside}</Box> : null}
          </Grid>
        </Stack>
        {bottom}
      </Surface>
    </ShellCtx.Provider>
  );
};

export const TopBar = ({ start, end }: { start?: ReactNode; end?: ReactNode }) => (
  <Inline as="header" justify={start ? "between" : "end"} align="center" gap="md" wrap>
    {start ? <Inline gap="sm" align="center" wrap minWidth={0}>{start}</Inline> : null}
    {end ? <Inline gap="sm" align="center" wrap>{end}</Inline> : null}
  </Inline>
);
