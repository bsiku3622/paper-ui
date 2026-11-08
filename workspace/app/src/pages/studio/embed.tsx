// The site's own end of the bridge. In the studio's frame or window (?studio=1) main.tsx draws the site through this instead of through
// the plain provider: the studio's levers and edits become PaperProvider's props, its theme is the frame's, and the page says hello,
// reports where it is and answers the studio's commands. Anywhere else none of this is loaded.

import { useEffect, useMemo } from "react";
import { RouterProvider, type createBrowserRouter } from "react-router-dom";

import { PaperProvider, useTheme, type PaperProviderProps } from "@studio-baeks/paper-ui";

import { directionsOf, mergeTokens, PAPER_LAB } from "./directions";
import { initialTheme, setState, useStudioState } from "./mark";
import { setPicking, setSelected } from "./pick";
import { allowedOrigin, isEnvelope, send, studioWindow, type Mode, type StudioState, type ToChild } from "./protocol";
import { sanitizeTokens } from "./sanitize";

type Router = ReturnType<typeof createBrowserRouter>;

const apply = (state: StudioState) => {
  setState(state);
  setPicking(state.pick);
  setSelected(state.selected);
};

// The path the studio shows and goes to: the address as the router names it (without the site's base), without the two things the
// studio put in it to open the frame.
export const cleanPath = (pathname: string, search: string, hash: string): string => {
  const query = new URLSearchParams(search);
  query.delete("studio");
  query.delete("theme");
  const rest = query.toString();
  return `${pathname}${rest ? `?${rest}` : ""}${hash}`;
};

const pathOf = (router: Router) => {
  const { pathname, search, hash } = router.state.location;
  return cleanPath(pathname, search, hash);
};

const useBridge = (router: Router) => {
  useEffect(() => {
    let reported = pathOf(router);

    const onMessage = (event: MessageEvent) => {
      if (event.source === null || event.source !== studioWindow() || !allowedOrigin(event.origin) || !isEnvelope(event.data)) return;
      const message = event.data as unknown as ToChild;
      if (message.kind === "state") apply(message.state);
      else if (message.kind === "go") {
        // A path of the site only: one slash and then a name, never a second slash (that is another host's address).
        if (/^\/(?!\/)/.test(message.path)) void router.navigate(message.path);
      }
    };
    window.addEventListener("message", onMessage);

    const stop = router.subscribe((state) => {
      const path = cleanPath(state.location.pathname, state.location.search, state.location.hash);
      if (state.navigation.state !== "idle" || path === reported) return;
      reported = path;
      send({ kind: "route", path, title: document.title });
    });

    send({ kind: "hello", app: "arcfield", path: reported, title: document.title, marks: import.meta.env.DEV, lab: PAPER_LAB });
    return () => {
      window.removeEventListener("message", onMessage);
      stop();
      setPicking(false);
    };
  }, [router]);
};

// The studio sets the theme of the frame from outside; the frame's own choice is not stored.
const ThemeSync = ({ theme }: { theme: Mode }) => {
  const { setTheme } = useTheme();
  useEffect(() => setTheme(theme), [theme, setTheme]);
  return null;
};

export const EmbeddedRoot = ({ router }: { router: Router }) => {
  const studio = useStudioState();
  useBridge(router);
  // Held on "원본": Paper as it is.
  const overrides = useMemo<PaperProviderProps>(
    () => (studio.paused ? {} : (mergeTokens(directionsOf(studio.levers), sanitizeTokens(studio.tokens)) as PaperProviderProps)),
    [studio.paused, studio.levers, studio.tokens],
  );
  return (
    <PaperProvider storageKey={null} defaultTheme={initialTheme} {...overrides}>
      <ThemeSync theme={studio.theme} />
      <RouterProvider router={router} />
    </PaperProvider>
  );
};
