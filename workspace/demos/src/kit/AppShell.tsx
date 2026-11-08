// AppShell — the frame every app stands in: a sidebar, the main column, an optional right pane and a top bar.
//
// kind says what the page is made of. A board is cards floating on the canvas (a console, a dashboard, a library);
// a page is content lying on it (an article, a document, an editor). Both stand on the same canvas, so the word is only
// the app saying which it is.
//
// The window scrolls; the sidebar and the pane stand still beside it. Below md the sidebar folds into a menu button.

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
  // What the page is made of; both kinds stand on the same canvas.
  kind?: ShellKind;
  // The name of the app, read by the phone's menu.
  name: string;
  sidebar?: ReactNode;
  aside?: ReactNode;
  // Above the main column, or across the whole window with topSpan="full" (a wiki's bar).
  top?: ReactNode;
  topSpan?: "main" | "full";
  // Over the bottom of the window, outside the columns (a player bar).
  bottom?: ReactNode;
  sidebarWidth?: string;
  asideWidth?: string;
  children: ReactNode;
};

// The first face on the ground: a raised face lifted by its shadow.
const FACE = { fill: "raised", shadow: true } as const;
export const useFace = () => FACE;

const MobileMenu = ({ name, sidebar }: { name: string; sidebar: ReactNode }) => {
  const [open, setOpen] = useState(false);
  // Going somewhere closes the sheet. A Paper button's press does not hand its click up to the sheet, so the sheet
  // listens to the route instead of to the links.
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
            {/* Without a sidebar there is no sidebar track. */}
            {sidebar}
            <Stack gap="lg" minWidth={0}>
              {sidebar ? <MobileMenu name={name} sidebar={sidebar} /> : null}
              {topSpan === "main" && top ? top : null}
              <Stack as="main" id="main" tabIndex={-1} minWidth={0} gap="xl">{children}</Stack>
            </Stack>
            {/* The pane's cell runs the height of the row, so a sticky part inside it has room to stand still. */}
            {aside ? <Box hideBelow="lg" minWidth={0} height="full">{aside}</Box> : null}
          </Grid>
        </Stack>
        {bottom}
      </Surface>
    </ShellCtx.Provider>
  );
};

// A top bar: what is on the left (a title, a breadcrumb, filters) and what is on the right (search, actions, account).
// With nothing on the left, what is on the right still stands at the right, and no empty cell takes a row when it wraps.
export const TopBar = ({ start, end }: { start?: ReactNode; end?: ReactNode }) => (
  <Inline as="header" justify={start ? "between" : "end"} align="center" gap="md" wrap>
    {start ? <Inline gap="sm" align="center" wrap minWidth={0}>{start}</Inline> : null}
    {end ? <Inline gap="sm" align="center" wrap>{end}</Inline> : null}
  </Inline>
);
