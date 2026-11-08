// /demo — the studio. One place that shows every demo app in a preview and lets the owner edit what is seen: the levers of the
// directions, every token, and the props of a part picked on the page. The preview is an iframe that talks to this page through the
// bridge (bridge.ts, protocol.ts), and so does the window the toolbar opens; the studio holds what was changed (store.ts) and edits
// no source file.

import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Inline, Link, Surface, Text } from "@studio-baeks/paper-ui";

import { ThemeToggle } from "../../compositions/ThemeToggle";
import { Logo } from "../../site/Logo";
import { SITE_NAV } from "../../site/site-map";
import * as shell from "../../site/shell.css";
import { AppBar } from "./AppBar";
import { appById, belongsTo } from "./apps";
import { frameIds, goTo, listen, sendStateSoon } from "./bridge";
import { Panel } from "./Panel";
import { detectEmbedded, type FromChild } from "./protocol";
import { deselect, getStore, select, setFrame, setView, subscribe, update, useStore } from "./store";
import * as s from "./studio.css";
import { Stage } from "./Stage";
import { PRIMARY, Toolbar } from "./Toolbar";

// A frame whose page has left its app is sent back to the app's first page, and where it went is not kept: the preview shows the app,
// and the studio is never opened inside itself (a frame at /demo would open a frame at /demo …).
const bounced = (id: string, app: string, path: string): boolean => {
  const own = appById(app);
  if (!own || belongsTo(own, path)) return false;
  goTo(id, own.path);
  return true;
};

const hear = (id: string, message: FromChild) => {
  if ((message.kind === "hello" || message.kind === "route") && bounced(id, message.kind === "hello" ? message.app : (getStore().frames[id]?.app ?? ""), message.path)) return;
  if (message.kind === "hello") {
    setFrame(id, { connected: true, app: message.app, path: message.path, title: message.title, marks: message.marks, lab: message.lab, parts: message.parts });
    if (id === PRIMARY) setView({ path: message.path });
  } else if (message.kind === "route") {
    setFrame(id, { path: message.path, title: message.title });
    if (id === PRIMARY) setView({ path: message.path });
    // Frames of the same app follow one another — those side by side, and the window: where one goes, the rest go too. A window left
    // on another app stays where it is.
    const app = getStore().frames[id]?.app;
    for (const other of frameIds()) {
      const there = getStore().frames[other];
      if (other !== id && there?.connected && there.app === app && there.path !== message.path) goTo(other, message.path);
    }
  } else if (message.kind === "pick") {
    select(id, message.pick);
  } else if (message.kind === "escape") {
    update({ pick: false });
  }
};

// What the frames are told is the whole state; it goes when something in it has changed, and not for every route a page reports.
const watch = () => {
  const taken = () => {
    const store = getStore();
    return [store.levers, store.edits, store.parts, store.pick, store.paused, store.selection?.pick.key ?? null, store.view.theme, store.view.compare];
  };
  let last = taken();
  return subscribe(() => {
    const now = taken();
    if (now.some((value, index) => value !== last[index])) sendStateSoon();
    last = now;
  });
};

const useBridge = () => {
  useEffect(() => {
    const stopListening = listen(hear);
    const stopWatching = watch();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (getStore().pick) update({ pick: false });
      else if (getStore().selection) deselect();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      stopListening();
      stopWatching();
      window.removeEventListener("keydown", onKey);
      update({ pick: false, paused: false, selection: null, frames: {} });
    };
  }, []);
};

// The studio opened inside a studio's frame or window draws no preview of its own, so a page that wanders here cannot nest frames.
const Nested = () => (
  <Box className={s.page}>
    <Surface as="header" fill="canvas" border="bottom" paddingX="lg" paddingY="sm">
      <Text as="h1" variant="subheading">데모 스튜디오</Text>
    </Surface>
    <Box as="main" id="main" tabIndex={-1} padding="xl">
      <Text as="p" ink="secondary">미리보기 안에서는 스튜디오를 열지 않습니다. 앱의 첫 화면으로 돌아갑니다.</Text>
    </Box>
  </Box>
);

export const Studio = () => (detectEmbedded() ? <Nested /> : <StudioPage />);

const StudioPage = () => {
  const panel = useStore((store) => store.view.panel);
  useBridge();
  return (
    <Box className={s.page}>
      <Surface as="header" fill="canvas" border="bottom" paddingX="lg" paddingY="sm">
        <Inline justify="between" align="center" gap="lg" wrap>
          <Inline gap="md" align="center">
            <Link as={RouterLink} to="/" underline="hover" className={shell.navLink.plain} aria-label="Paper UI 홈">
              <Logo height={20} />
            </Link>
            <Text as="h1" variant="subheading">데모 스튜디오</Text>
          </Inline>
          <AppBar />
          <Inline gap="lg" align="center">
            <Inline as="nav" aria-label="주요 메뉴" gap="lg">
              {SITE_NAV.filter((entry) => entry.to !== "/demo").map(({ to, label }) => (
                <Link as={RouterLink} key={to} to={to} underline="hover" className={shell.navLink.bar}>{label}</Link>
              ))}
            </Inline>
            <ThemeToggle />
          </Inline>
        </Inline>
      </Surface>
      <div className={s.body[panel ? "open" : "folded"]}>
        <Box as="main" id="main" tabIndex={-1} className={s.middle}>
          <Toolbar />
          <Stage />
        </Box>
        {panel ? <Panel /> : null}
      </div>
    </Box>
  );
};
