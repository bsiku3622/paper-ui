// The preview: the page in an iframe at the width chosen, or several side by side. A frame is as wide as its page is told to be and drawn
// smaller by one scale shared by all of them, so a 1440 page fits and a media query still sees 1440. The frames take part in the
// bridge: each registers with the origin it was opened at.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { appById, frameUrl, type StudioApp } from "./apps";
import { registerFrame, sendStateSoon } from "./bridge";
import type { Mode } from "./protocol";
import { ScaledFrame } from "./ScaledFrame";
import { COMPARE_WIDTHS, dropFrame, getStore, useStore, type View } from "./store";
import * as s from "./studio.css";

// The gap between frames and the row above a frame that names it, in px; the layout below counts with them.
const GAP = 16;
const NAME = 28;

type Slot = { id: string; theme: Mode; width: number; name: string };

const THEME_NAMES: Record<Mode, string> = { light: "라이트", dark: "다크" };

export const slotsOf = (view: Pick<View, "compare" | "theme" | "width">): Slot[] => {
  const slot = (index: number, theme: Mode, width: number): Slot => ({ id: `frame-${index}`, theme, width, name: `${THEME_NAMES[theme]} · ${width}` });
  if (view.compare === "theme") return (["light", "dark"] as const).map((theme, index) => slot(index, theme, view.width));
  if (view.compare === "width") return COMPARE_WIDTHS.map((width, index) => slot(index, view.theme, width));
  return [slot(0, view.theme, view.width)];
};

// The padding the measured element keeps around what the frames may fill.
const paddingOf = (node: Element, axis: "x" | "y") => {
  const style = window.getComputedStyle(node);
  return axis === "x" ? Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight) : Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
};

const useSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const measure = () => setSize({ width: node.clientWidth - paddingOf(node, "x"), height: node.clientHeight - paddingOf(node, "y") });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
};

const Frame = ({ slot, app, path, scale, height }: { slot: Slot; app: StudioApp; path: string; scale: number; height: number }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const themeRef = useRef(slot.theme);
  themeRef.current = slot.theme;
  const connected = useStore((store) => store.frames[slot.id]?.connected === true);
  const [loaded, setLoaded] = useState(false);
  const [late, setLate] = useState(false);
  // A frame opens at one address for as long as it lives: the theme and the path in it are the ones it comes up in, and the page
  // inside goes elsewhere by itself.
  const [src] = useState(() => frameUrl(app, path, slot.theme));
  const origin = useMemo(() => new URL(src).origin, [src]);

  useEffect(() => registerFrame({ id: slot.id, window: () => ref.current?.contentWindow ?? null, origin, theme: () => themeRef.current }), [slot.id, origin]);
  useEffect(() => () => dropFrame(slot.id), [slot.id]);
  useEffect(() => sendStateSoon(), [slot.theme]);
  useEffect(() => {
    if (!loaded || connected) {
      setLate(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setLate(true), 2500);
    return () => window.clearTimeout(timer);
  }, [loaded, connected]);

  return (
    <Stack gap="xs">
      <Inline gap="sm" align="center" wrap>
        <Text as="span" variant="label" strong={false} ink="secondary" numeric>{slot.name}</Text>
        {late ? <Text as="span" variant="label" strong={false} ink="warning">연결되지 않았습니다. 이 주소에서 화면이 열리는지 확인하세요.</Text> : null}
      </Inline>
      <ScaledFrame ref={ref} title={`${app.label} · ${slot.name}`} src={src} width={slot.width} height={height} scale={scale} onLoad={() => setLoaded(true)} />
    </Stack>
  );
};

// The frames of one opening. When the bar picks an app, this is drawn anew, and the path the studio has at that moment is the one the
// frames open at.
const Frames = ({ app, slots, scale, height }: { app: StudioApp; slots: Slot[]; scale: number; height: number }) => {
  const [path] = useState(() => getStore().view.path);
  return (
    <Inline gap="lg" align="start" justify="center">
      {slots.map((slot) => <Frame key={slot.id} slot={slot} app={app} path={path} scale={scale} height={height} />)}
    </Inline>
  );
};

export const Stage = () => {
  const view = useStore((store) => store.view);
  const opened = useStore((store) => store.opened);
  const [ref, size] = useSize();
  const app = appById(view.item);
  const slots = slotsOf(view);
  const total = slots.reduce((sum, slot) => sum + slot.width, 0);
  const scale = size.width > 0 ? Math.min(1, Math.max(0.05, (size.width - GAP * (slots.length - 1)) / total)) : 1;
  const height = Math.max(160, (size.height - NAME - GAP) / scale);
  return (
    <Surface fill="sunken" className={s.stage}>
      <div ref={ref} className={s.measure}>
        {app && size.width > 0 ? <Frames key={`${opened}:${app.id}`} app={app} slots={slots} scale={scale} height={height} /> : null}
      </div>
    </Surface>
  );
};
